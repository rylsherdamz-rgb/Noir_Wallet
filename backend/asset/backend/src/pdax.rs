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

#[derive(Debug, Clone, Serialize)]
struct RefreshTokenRequest<'a> {
    username: &'a str,
    #[serde(rename = "refreshToken")]
    refresh_token: &'a str,
}

#[derive(Debug, Clone, Serialize)]
struct OtpRequest<'a> {
    username: &'a str,
    session: &'a str,
    code: &'a str,
    challenge_name: &'a str,
}

#[derive(Debug, Clone, Serialize)]
struct FirmQuoteRequest<'a> {
    quote_currency: &'a str,
    base_currency: &'a str,
    side: &'a str,
    base_quantity: &'a str,
}

#[derive(Debug, Clone, Serialize)]
struct PlaceOrderRequest<'a> {
    quote_id: &'a str,
    side: &'a str,
    idempotency_id: &'a str,
}

/// Body for POST /crypto/withdraw. **Sends crypto out of the PDAX account
/// to an on-chain address — typically irreversible once broadcast**, higher
/// stakes than any fiat endpoint (no PENDING/reversal window). Beneficiary
/// fields are optional under 50k PHP-equivalent, required at/above it.
/// `send_to_self`/`beneficiary_wallet` are the string literals `"true"`/
/// `"false"` per PDAX's sample (not native booleans) — matched as-is rather
/// than guessed, per the amount-type lesson from `fiat_user_info_upload`.
#[derive(Debug, Clone, Serialize)]
pub struct CryptoWithdrawRequest {
    pub identifier: String,
    pub currency: String,
    pub address: String,
    pub amount: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tag: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_first_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_last_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_exchange: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub send_to_self: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_wallet: Option<String>,
}

/// Body for POST /fiat/deposit. Fields marked optional here are optional
/// per PDAX's docs for deposits under 50k PHP — larger deposits require
/// more of the sender's KYC fields to be present (enforced server-side, not
/// by this struct). `identifier` should be a fresh unique value per request
/// (e.g. a UUIDv4), similar in spirit to `place_order`'s idempotency_id.
#[derive(Debug, Clone, Serialize)]
pub struct FiatDepositRequest {
    pub amount: String,
    pub method: String,
    pub identifier: String,
    pub sender_first_name: String,
    pub sender_middle_name: String,
    pub sender_last_name: String,
    pub sender_country_origin: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_address_line_one: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_address_line_two: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_province: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_country: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_zip_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_phone_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_nationality: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_national_identity_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_dob: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_place_of_birth: Option<String>,
    pub source_of_funds: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_email: Option<String>,
    pub beneficiary_first_name: String,
    pub beneficiary_middle_name: String,
    pub beneficiary_last_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_sex: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_nationality: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_dob: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_address_line_one: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_address_line_two: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_barangay: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_province: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_country: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_zip_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_government_issued_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_phone_number: Option<String>,
    pub purpose: String,
    pub relationship_of_sender_to_beneficiary: String,
    pub currency: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nature_of_business: Option<String>,
}

/// Body for POST /fiat/withdraw. **Sends real money out of the PDAX account
/// to a beneficiary bank account** — unlike `FiatDepositRequest`, this is
/// not "register an incoming transfer," it's an outbound payment. Optional
/// fields follow the same <50k-PHP tier as `FiatDepositRequest`.
/// `identifier` should be a fresh unique value per request.
#[derive(Debug, Clone, Serialize)]
pub struct FiatWithdrawRequest {
    pub identifier: String,
    pub sender_first_name: String,
    pub sender_middle_name: String,
    pub sender_last_name: String,
    pub sender_country_origin: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_address_line_one: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_address_line_two: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_province: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_country: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_zip_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_phone_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_nationality: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_national_identity_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_dob: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_place_of_birth: Option<String>,
    pub source_of_funds: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_email: Option<String>,
    pub fee_type: String,
    pub beneficiary_first_name: String,
    pub beneficiary_middle_name: String,
    pub beneficiary_last_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_sex: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_nationality: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_dob: Option<String>,
    pub beneficiary_bank_code: String,
    pub beneficiary_account_name: String,
    pub beneficiary_account_number: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_address_line_one: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_address_line_two: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_barangay: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_province: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_country: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_zip_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_government_issued_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_phone_number: Option<String>,
    pub purpose: String,
    pub relationship_of_sender_to_beneficiary: String,
    pub currency: String,
    pub amount: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nature_of_business: Option<String>,
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instructions: Option<String>,
}

/// Body for POST /fiat/user-info-upload. Schema is nearly identical to
/// `FiatWithdrawRequest`, but this endpoint's own field table uses a single
/// `sender_full_name`/`beneficiary_full_name` instead of split first/middle/
/// last name fields — even though PDAX's sample curl for this endpoint
/// reuses the split-name body from `/fiat/withdraw` verbatim (a copy-paste
/// artifact). Trusting the endpoint-specific table over the reused sample.
#[derive(Debug, Clone, Serialize)]
pub struct FiatUserInfoUploadRequest {
    pub identifier: String,
    pub sender_full_name: String,
    pub sender_country_origin: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_address_line_one: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_address_line_two: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_province: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_country: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_zip_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_phone_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_nationality: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_national_identity_number: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_dob: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_place_of_birth: Option<String>,
    pub source_of_funds: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sender_email: Option<String>,
    pub fee_type: String,
    pub beneficiary_full_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_sex: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_nationality: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_dob: Option<String>,
    pub beneficiary_bank_code: String,
    pub beneficiary_account_name: String,
    pub beneficiary_account_number: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_address_line_one: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_address_line_two: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_barangay: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_province: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_country: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_zip_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_government_issued_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beneficiary_phone_number: Option<String>,
    pub purpose: String,
    pub relationship_of_sender_to_beneficiary: String,
    pub currency: String,
    // Unlike FiatWithdrawRequest, this endpoint rejects amount as a JSON
    // string ("amount is required and must be a number") — confirmed live.
    pub amount: f64,
    pub method: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instructions: Option<String>,
}

/// Response payload for PUT /refresh-token. PDAX (Cognito-backed) does not
/// always rotate the refresh token, so it's optional here — if absent, the
/// existing refresh token is carried over.
#[derive(Debug, Clone, Deserialize)]
struct PdaxRefreshTokens {
    token_type: String,
    expiry: i64,
    access_token: String,
    id_token: String,
    #[serde(default)]
    refresh_token: Option<String>,
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
    // PDAX is inconsistent about whether `code` is a string (e.g.
    // "BadRequestException") or a number (e.g. 400) depending on the
    // endpoint, so accept either and stringify it.
    #[serde(deserialize_with = "code_to_string")]
    code: String,
    message: String,
}

fn code_to_string<'de, D>(deserializer: D) -> std::result::Result<String, D::Error>
where
    D: serde::Deserializer<'de>,
{
    Ok(match serde_json::Value::deserialize(deserializer)? {
        serde_json::Value::String(s) => s,
        other => other.to_string(),
    })
}

#[derive(Debug, Clone, Deserialize)]
struct PdaxSimpleErrorBody {
    error: String,
}

/// PDAX doesn't use one consistent error shape — `/login` and friends
/// return `{"code", "message"}`, but validation errors on write endpoints
/// (seen on `/fiat/withdraw`) return `{"error": "..."}` instead. Try both,
/// and fall back to the raw response body rather than a generic message so
/// real validation errors (e.g. "sender_phone_number is not valid...")
/// aren't silently swallowed.
async fn pdax_error_message(response: reqwest::Response) -> String {
    let body_text = response.text().await.unwrap_or_default();
    if let Ok(body) = serde_json::from_str::<PdaxErrorBody>(&body_text) {
        return format!("{}: {}", body.code, body.message);
    }
    if let Ok(body) = serde_json::from_str::<PdaxSimpleErrorBody>(&body_text) {
        return body.error;
    }
    if body_text.is_empty() {
        "(no response body)".to_string()
    } else {
        body_text
    }
}

pub enum PdaxLoginOutcome {
    Authenticated(PdaxSession),
    MfaRequired(PdaxMfaChallenge),
}

/// Live access/id/refresh tokens with the wall-clock expiry they're good
/// until, plus the account identity fields PDAX returns alongside them.
#[derive(Debug, Clone, Serialize)]
pub struct PdaxSession {
    pub email: String,
    pub username: String,
    pub groups: Vec<String>,
    pub token_type: String,
    pub preferred_mfa: Option<String>,
    /// Token validity period in seconds, as reported by PDAX (not remaining time).
    pub expiry: i64,
    pub access_token: String,
    pub id_token: String,
    pub refresh_token: String,
    #[serde(skip)]
    pub expires_at: DateTime<Utc>,
}

impl PdaxSession {
    fn from_tokens(tokens: PdaxLoginTokens) -> Self {
        PdaxSession {
            email: tokens.email,
            username: tokens.username,
            groups: tokens.groups,
            token_type: tokens.token_type,
            preferred_mfa: tokens.preferred_mfa,
            expiry: tokens.expiry,
            access_token: tokens.access_token,
            id_token: tokens.id_token,
            refresh_token: tokens.refresh_token,
            expires_at: Utc::now() + Duration::seconds(tokens.expiry),
        }
    }

    /// Builds the post-refresh session, carrying over the previous refresh
    /// token and identity fields when the endpoint doesn't return them.
    fn from_refresh(tokens: PdaxRefreshTokens, previous: &PdaxSession) -> Self {
        PdaxSession {
            email: previous.email.clone(),
            username: previous.username.clone(),
            groups: previous.groups.clone(),
            token_type: tokens.token_type,
            preferred_mfa: previous.preferred_mfa.clone(),
            expiry: tokens.expiry,
            access_token: tokens.access_token,
            id_token: tokens.id_token,
            refresh_token: tokens
                .refresh_token
                .unwrap_or_else(|| previous.refresh_token.clone()),
            expires_at: Utc::now() + Duration::seconds(tokens.expiry),
        }
    }

    /// Treats a session as due for refresh slightly before it actually
    /// expires, so a request built with it doesn't get rejected mid-flight.
    pub fn is_expired(&self) -> bool {
        Utc::now() >= self.expires_at - Duration::seconds(30)
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
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Login rejected ({}): {}",
                status, message
            )));
        }

        let parsed: PdaxLoginResponse = response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse login response: {}", e))
        })?;

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

    /// Calls POST /pdax-institution/v1/otp to complete an MFA challenge
    /// returned by `login`. On success the resulting tokens become the
    /// client's active session.
    pub async fn verify_otp(
        &self,
        challenge: &PdaxMfaChallenge,
        code: &str,
    ) -> Result<PdaxSession> {
        let url = format!("{}/pdax-institution/v1/otp", self.base_url);

        let response = self
            .http_client
            .post(&url)
            .json(&OtpRequest {
                username: &self.username,
                session: &challenge.session,
                code,
                challenge_name: &challenge.challenge_name,
            })
            .send()
            .await
            .map_err(|e| PaymentError::PdaxApiError(format!("OTP request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "OTP rejected ({}): {}",
                status, message
            )));
        }

        let tokens: PdaxLoginTokens = response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse OTP response: {}", e))
        })?;

        let session = PdaxSession::from_tokens(tokens);
        *self.session.write() = Some(session.clone());
        Ok(session)
    }

    /// Seeds the client with a refresh token obtained in a previous process
    /// (e.g. cached from `.env`), so `refresh()` can be called without first
    /// running `login()` in this process.
    pub fn seed_refresh_token(&self, refresh_token: String) {
        *self.session.write() = Some(PdaxSession {
            email: String::new(),
            username: self.username.clone(),
            groups: Vec::new(),
            token_type: "Bearer".to_string(),
            preferred_mfa: None,
            expiry: 0,
            access_token: String::new(),
            id_token: String::new(),
            refresh_token,
            expires_at: Utc::now() - Duration::seconds(1),
        });
    }

    /// Calls PUT /pdax-institution/v1/refresh-token using the refresh token
    /// from the current session and replaces it with the renewed one.
    pub async fn refresh(&self) -> Result<PdaxSession> {
        let previous = self.session.read().clone().ok_or_else(|| {
            PaymentError::PdaxApiError(
                "No PDAX session to refresh — call login() first".to_string(),
            )
        })?;

        let url = format!("{}/pdax-institution/v1/refresh-token", self.base_url);

        let response = self
            .http_client
            .put(&url)
            .json(&RefreshTokenRequest {
                username: &self.username,
                refresh_token: &previous.refresh_token,
            })
            .send()
            .await
            .map_err(|e| PaymentError::PdaxApiError(format!("Refresh request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Refresh rejected ({}): {}",
                status, message
            )));
        }

        let tokens: PdaxRefreshTokens = response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse refresh response: {}", e))
        })?;

        let session = PdaxSession::from_refresh(tokens, &previous);
        *self.session.write() = Some(session.clone());
        Ok(session)
    }

    /// The current session, refreshing it transparently if it's missing or
    /// expired but a refresh token is on hand. Errors only when there's
    /// nothing to refresh — i.e. `login`/`verify_otp` was never completed.
    pub async fn current_session(&self) -> Result<PdaxSession> {
        let cached = self.session.read().clone();
        match cached {
            Some(session) if !session.is_expired() => Ok(session),
            Some(_) => self.refresh().await,
            None => Err(PaymentError::PdaxApiError(
                "No active PDAX session; call login() first".to_string(),
            )),
        }
    }

    /// Calls GET /pdax-institution/v1/trade/price for a non-binding
    /// indicative quote. `side` is `"buy"` or `"sell"`; `base_quantity` is
    /// the quantity of `base_currency` to trade, as a decimal string
    /// (quantity-step rules are enforced server-side). Response schema is
    /// undocumented on our end, so it's returned as raw JSON.
    ///
    /// Auth uses the session's raw `access_token`/`id_token` as header
    /// values (not an `Authorization: Bearer` header) — that's what PDAX's
    /// sample curl for this endpoint specifies. Refreshes the session
    /// transparently via `current_session()` if it's expired.
    pub async fn indicative_price(
        &self,
        quote_currency: &str,
        base_currency: &str,
        side: &str,
        base_quantity: &str,
    ) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/trade/price", self.base_url);

        let response = self
            .http_client
            .get(&url)
            .query(&[
                ("quote_currency", quote_currency),
                ("base_currency", base_currency),
                ("side", side),
                ("base_quantity", base_quantity),
            ])
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Indicative price request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Indicative price rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse indicative price response: {}", e))
        })
    }

    /// Calls POST /pdax-institution/v1/trade/quote for a firm, executable
    /// quote. Unlike `indicative_price`, the `quote_id` this returns is only
    /// valid for ~15 seconds — accept it via a separate order-placement call
    /// immediately, or let it lapse. This method only fetches the quote; it
    /// does not place an order and has no execution side effects on its own.
    pub async fn firm_quote(
        &self,
        quote_currency: &str,
        base_currency: &str,
        side: &str,
        base_quantity: &str,
    ) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/trade/quote", self.base_url);

        let response = self
            .http_client
            .post(&url)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .json(&FirmQuoteRequest {
                quote_currency,
                base_currency,
                side,
                base_quantity,
            })
            .send()
            .await
            .map_err(|e| PaymentError::PdaxApiError(format!("Firm quote request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Firm quote rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse firm quote response: {}", e))
        })
    }

    /// Calls GET /pdax-institution/v1/orders to list this account's orders.
    /// `page`/`page_size` are required by PDAX; `start_date`/`end_date` are
    /// optional `YYYY-MM-DD` filters.
    pub async fn list_orders(
        &self,
        page: &str,
        page_size: &str,
        start_date: Option<&str>,
        end_date: Option<&str>,
    ) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/orders", self.base_url);

        let mut query: Vec<(&str, &str)> = vec![("page", page), ("pageSize", page_size)];
        if let Some(sd) = start_date {
            query.push(("startDate", sd));
        }
        if let Some(ed) = end_date {
            query.push(("endDate", ed));
        }

        let response = self
            .http_client
            .get(&url)
            .query(&query)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .send()
            .await
            .map_err(|e| PaymentError::PdaxApiError(format!("Orders request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Orders request rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse orders response: {}", e))
        })
    }

    /// Calls GET /pdax-institution/v1/orders/{order_id} for the details of a
    /// single order (the id returned by `place_order()`).
    pub async fn get_order(&self, order_id: &str) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/orders/{}", self.base_url, order_id);

        let response = self
            .http_client
            .get(&url)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Order details request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Order details rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse order details response: {}", e))
        })
    }

    /// Calls GET /pdax-institution/v1/crypto/deposit for the wallet address
    /// to deposit `currency` into this PDAX account. `currency` includes the
    /// network suffix (e.g. `USDCXLM` for USDC on the Stellar network).
    pub async fn crypto_deposit_address(&self, currency: &str) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/crypto/deposit", self.base_url);

        let response = self
            .http_client
            .get(&url)
            .query(&[("currency", currency)])
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Crypto deposit address request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Crypto deposit address rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!(
                "Failed to parse crypto deposit address response: {}",
                e
            ))
        })
    }

    /// Calls POST /pdax-institution/v1/crypto/withdraw. **Sends crypto out
    /// of the PDAX account to an on-chain address — typically irreversible
    /// once broadcast.** Verify `request.address`/`request.tag` independently
    /// before calling this; there is no confirmation step.
    pub async fn crypto_withdraw(
        &self,
        request: &CryptoWithdrawRequest,
    ) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/crypto/withdraw", self.base_url);

        let response = self
            .http_client
            .post(&url)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .json(request)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Crypto withdraw request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Crypto withdraw rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse crypto withdraw response: {}", e))
        })
    }

    /// Calls GET /pdax-institution/v1/fiat/transactions to list/track fiat
    /// deposits and withdrawals. All filters are optional per PDAX's docs.
    pub async fn list_fiat_transactions(
        &self,
        mode: Option<&str>,
        identifier: Option<&str>,
        page: Option<&str>,
        page_size: Option<&str>,
    ) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/fiat/transactions", self.base_url);

        let mut query: Vec<(&str, &str)> = Vec::new();
        if let Some(m) = mode {
            query.push(("mode", m));
        }
        if let Some(id) = identifier {
            query.push(("identifier", id));
        }
        if let Some(p) = page {
            query.push(("page", p));
        }
        if let Some(ps) = page_size {
            query.push(("pageSize", ps));
        }

        let response = self
            .http_client
            .get(&url)
            .query(&query)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Fiat transactions request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Fiat transactions rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse fiat transactions response: {}", e))
        })
    }

    /// Calls GET /pdax-institution/v1/crypto/transactions to list/track
    /// crypto deposits and withdrawals. All filters are optional per PDAX's
    /// docs.
    pub async fn list_crypto_transactions(
        &self,
        identifier: Option<&str>,
        txn_hash: Option<&str>,
        transaction_type: Option<&str>,
        page: Option<&str>,
        page_size: Option<&str>,
    ) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/crypto/transactions", self.base_url);

        let mut query: Vec<(&str, &str)> = Vec::new();
        if let Some(id) = identifier {
            query.push(("identifier", id));
        }
        if let Some(h) = txn_hash {
            query.push(("txn_hash", h));
        }
        if let Some(t) = transaction_type {
            query.push(("type", t));
        }
        if let Some(p) = page {
            query.push(("page", p));
        }
        if let Some(ps) = page_size {
            query.push(("pageSize", ps));
        }

        let response = self
            .http_client
            .get(&url)
            .query(&query)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Crypto transactions request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Crypto transactions rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!(
                "Failed to parse crypto transactions response: {}",
                e
            ))
        })
    }

    /// Calls GET /pdax-institution/v1/balances to view balances for all
    /// assets, or a single asset if `currency` is given.
    pub async fn get_balances(&self, currency: Option<&str>) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/balances", self.base_url);

        let mut query: Vec<(&str, &str)> = Vec::new();
        if let Some(c) = currency {
            query.push(("currency", c));
        }

        let response = self
            .http_client
            .get(&url)
            .query(&query)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .send()
            .await
            .map_err(|e| PaymentError::PdaxApiError(format!("Balances request failed: {}", e)))?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Balances rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse balances response: {}", e))
        })
    }

    /// Calls POST /pdax-institution/v1/fiat/deposit to register a fiat
    /// deposit into this PDAX account. **This submits real sender/
    /// beneficiary KYC data and registers an actual deposit transaction** —
    /// not a read-only lookup like the other endpoints in this client.
    pub async fn fiat_deposit(&self, request: &FiatDepositRequest) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/fiat/deposit", self.base_url);

        let response = self
            .http_client
            .post(&url)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .json(request)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Fiat deposit request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Fiat deposit rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse fiat deposit response: {}", e))
        })
    }

    /// Calls POST /pdax-institution/v1/fiat/withdraw. **This sends real
    /// money out of the PDAX account to the beneficiary bank account** —
    /// higher-stakes than `fiat_deposit`, which only registers an incoming
    /// transfer. PDAX picks the settlement channel (real-time vs. batch)
    /// based on `amount` and current channel availability.
    pub async fn fiat_withdraw(&self, request: &FiatWithdrawRequest) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/fiat/withdraw", self.base_url);

        let response = self
            .http_client
            .post(&url)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .json(request)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Fiat withdraw request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Fiat withdraw rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse fiat withdraw response: {}", e))
        })
    }

    /// Calls POST /pdax-institution/v1/fiat/user-info-upload. Despite
    /// sharing most of `fiat_withdraw`'s schema, PDAX's own doc labels this
    /// "Withdraw Fiat from your account to a beneficiary" too — treat it as
    /// having the same real-money-movement risk until proven otherwise.
    pub async fn fiat_user_info_upload(
        &self,
        request: &FiatUserInfoUploadRequest,
    ) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!(
            "{}/pdax-institution/v1/fiat/user-info-upload",
            self.base_url
        );

        let response = self
            .http_client
            .post(&url)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .json(request)
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Fiat user-info-upload request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Fiat user-info-upload rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!(
                "Failed to parse fiat user-info-upload response: {}",
                e
            ))
        })
    }

    /// Calls POST /pdax-institution/v1/trade to accept a firm quote and
    /// place an order. **This executes a real trade** — `quote_id` must come
    /// from a `firm_quote()` call made within the last ~15 seconds, and
    /// `side` must match the side used to obtain that quote. `idempotency_id`
    /// should be a fresh UUIDv4 per order — reusing one is how PDAX
    /// deduplicates retried requests, so don't reuse an id across distinct
    /// orders.
    pub async fn place_order(
        &self,
        quote_id: &str,
        side: &str,
        idempotency_id: &str,
    ) -> Result<serde_json::Value> {
        let session = self.current_session().await?;
        let url = format!("{}/pdax-institution/v1/trade", self.base_url);

        let response = self
            .http_client
            .post(&url)
            .header("access_token", &session.access_token)
            .header("id_token", &session.id_token)
            .json(&PlaceOrderRequest {
                quote_id,
                side,
                idempotency_id,
            })
            .send()
            .await
            .map_err(|e| {
                PaymentError::PdaxApiError(format!("Place order request failed: {}", e))
            })?;

        let status = response.status();
        if !status.is_success() {
            let message = pdax_error_message(response).await;
            return Err(PaymentError::PdaxApiError(format!(
                "Place order rejected ({}): {}",
                status, message
            )));
        }

        response.json().await.map_err(|e| {
            PaymentError::PdaxApiError(format!("Failed to parse place order response: {}", e))
        })
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
