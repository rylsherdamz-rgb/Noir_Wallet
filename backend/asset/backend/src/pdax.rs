use crate::errors::{PaymentError, Result};
use chrono::{DateTime, Duration, Utc};
use parking_lot::RwLock;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize)]
struct LoginRequest<'a> {
    username: &'a str,
    password: &'a str,
}

/// Response payload when PDAX authenticates the account directly (no MFA configured).
#[derive(Debug, Clone, Deserialize)]
pub struct PdaxLoginTokens {
    pub email: String,
    pub username: String,
    #[serde(default)]
    pub groups: Vec<String>,
    pub token_type: String,
    #[serde(default)]
    pub preferred_mfa: Option<String>,
    pub expiry: i64,
    pub access_token: String,
    pub id_token: String,
    pub refresh_token: String,
}

/// Response payload when PDAX requires a follow-up OTP challenge (MFA enabled).
#[derive(Debug, Clone, Deserialize)]
pub struct PdaxMfaChallenge {
    pub code: String,
    pub message: String,
    pub challenge_name: String,
    pub session: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
enum PdaxLoginResponse {
    Tokens(PdaxLoginTokens),
    Challenge(PdaxMfaChallenge),
}

#[derive(Debug, Clone, Deserialize)]
struct PdaxErrorBody {
    code: String,
    message: String,
}

pub enum PdaxLoginOutcome {
    Authenticated(PdaxSession),
    MfaRequired(PdaxMfaChallenge),
}

/// Live access/id/refresh tokens with the wall-clock expiry they're good until.
#[derive(Debug, Clone)]
pub struct PdaxSession {
    pub access_token: String,
    pub id_token: String,
    pub refresh_token: String,
    pub expires_at: DateTime<Utc>,
}

impl PdaxSession {
    fn from_tokens(tokens: PdaxLoginTokens) -> Self {
        PdaxSession {
            access_token: tokens.access_token,
            id_token: tokens.id_token,
            refresh_token: tokens.refresh_token,
            expires_at: Utc::now() + Duration::seconds(tokens.expiry),
        }
    }

    pub fn is_expired(&self) -> bool {
        Utc::now() >= self.expires_at
    }
}

#[derive(Clone)]
pub struct PdaxClient {
    http_client: Client,
    base_url: String,
    username: String,
    password: String,
    session: Arc<RwLock<Option<PdaxSession>>>,
}

impl PdaxClient {
    pub fn new(base_url: String, username: String, password: String) -> Self {
        PdaxClient {
            http_client: Client::new(),
            base_url,
            username,
            password,
            session: Arc::new(RwLock::new(None)),
        }
    }

    /// Calls POST /pdax-institution/v1/login. Returns either a live session
    /// (account has no MFA configured) or the MFA challenge session token
    /// needed to complete the OTP step.
    pub async fn login(&self) -> Result<PdaxLoginOutcome> {
        let url = format!("{}/pdax-institution/v1/login", self.base_url);

        let response = self
            .http_client
            .post(&url)
            .json(&LoginRequest {
                username: &self.username,
                password: &self.password,
            })
            .send()
            .await
            .map_err(|e| PaymentError::PdaxApiError(format!("Login request failed: {}", e)))?;

        let status = response.status();

        if !status.is_success() {
            let body: PdaxErrorBody = response.json().await.unwrap_or(PdaxErrorBody {
                code: status.to_string(),
                message: "PDAX login failed".to_string(),
            });
            return Err(PaymentError::PdaxApiError(format!(
                "Login rejected ({}): {}",
                body.code, body.message
            )));
        }

        let parsed: PdaxLoginResponse = response
            .json()
            .await
            .map_err(|e| PaymentError::PdaxApiError(format!("Failed to parse login response: {}", e)))?;

        match parsed {
            PdaxLoginResponse::Tokens(tokens) => {
                let session = PdaxSession::from_tokens(tokens);
                *self.session.write() = Some(session.clone());
                Ok(PdaxLoginOutcome::Authenticated(session))
            }
            PdaxLoginResponse::Challenge(challenge) => {
                if challenge.challenge_name.is_empty() {
                    return Err(PaymentError::PdaxApiError(
                        "Unrecognized PDAX login response shape".to_string(),
                    ));
                }
                Ok(PdaxLoginOutcome::MfaRequired(challenge))
            }
        }
    }

    /// The current cached session, if `login` has completed successfully and
    /// the tokens haven't expired yet.
    pub fn current_session(&self) -> Option<PdaxSession> {
        let guard = self.session.read();
        match &*guard {
            Some(session) if !session.is_expired() => Some(session.clone()),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_login_response_without_mfa() {
        let raw = r#"{
            "email": "example@gmail.com",
            "username": "96a8c8b5-8fee-40c9-9242-a5cd172e9a96",
            "groups": ["exchange_user"],
            "token_type": "Bearer",
            "preferred_mfa": "SOFTWARE_TOKEN_MFA",
            "expiry": 600,
            "access_token": "eyJraWQiOiJ4UjJ2U1A2",
            "id_token": "eyJraWQiOiJsQzlPbldQV2ZX",
            "refresh_token": "eyJjdHkiOiJKV1QiLCJ"
        }"#;

        let parsed: PdaxLoginResponse = serde_json::from_str(raw).unwrap();
        match parsed {
            PdaxLoginResponse::Tokens(tokens) => {
                assert_eq!(tokens.access_token, "eyJraWQiOiJ4UjJ2U1A2");
                assert_eq!(tokens.expiry, 600);
            }
            PdaxLoginResponse::Challenge(_) => panic!("expected token response"),
        }
    }

    #[test]
    fn parses_login_response_with_mfa_challenge() {
        let raw = r#"{
            "code": "AuthChallengeRequired",
            "message": "An authentication challenge is configured for this account.",
            "challenge_name": "SOFTWARE_TOKEN_MFA",
            "session": "session-token-value"
        }"#;

        let parsed: PdaxLoginResponse = serde_json::from_str(raw).unwrap();
        match parsed {
            PdaxLoginResponse::Challenge(challenge) => {
                assert_eq!(challenge.challenge_name, "SOFTWARE_TOKEN_MFA");
                assert_eq!(challenge.session, "session-token-value");
            }
            PdaxLoginResponse::Tokens(_) => panic!("expected MFA challenge response"),
        }
    }

    #[test]
    fn session_expiry_tracks_expiry_seconds() {
        let tokens = PdaxLoginTokens {
            email: "example@gmail.com".to_string(),
            username: "user-id".to_string(),
            groups: vec![],
            token_type: "Bearer".to_string(),
            preferred_mfa: None,
            expiry: 600,
            access_token: "access".to_string(),
            id_token: "id".to_string(),
            refresh_token: "refresh".to_string(),
        };

        let session = PdaxSession::from_tokens(tokens);
        assert!(!session.is_expired());
        assert!(session.expires_at > Utc::now());
    }
}
