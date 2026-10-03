//! Wallet-signature authentication (SEP-10 shaped).
//!
//! The previous model was a single shared API key that shipped inside the
//! mobile bundle as `EXPO_PUBLIC_API_KEY` — extractable from any APK — while
//! `/auth/login` verified nothing and handed out a random UUID that no endpoint
//! ever checked. Anyone with the bundle could withdraw to any address.
//!
//! Now: the caller asks for a nonce, signs it with the wallet key it claims to
//! own, and receives a session token. Every handler that moves money reads the
//! wallet off the session rather than off the request body.
//!
//! The API key survives only as an optional coarse edge filter for internet
//! noise. It is not the security model and nothing sensitive depends on it.

use crate::errors::PaymentError;
use crate::models::AuthenticatedWallet;
use crate::state::AppState;
use actix_web::body::MessageBody;
use actix_web::dev::{ServiceRequest, ServiceResponse, Transform};
use actix_web::{web, Error, HttpMessage};
use base64::{engine::general_purpose::STANDARD, Engine};
use ed25519_dalek::{Signature, VerifyingKey};
use futures::future::{ok, LocalBoxFuture, Ready};
use sha2::{Digest, Sha256};
use std::sync::Arc;
use std::task::{Context, Poll};

/// Endpoints reachable without a session.
///
/// `/pdax/webhook` is here by design — it is authenticated by HMAC signature
/// instead, because PDAX cannot hold a session.
const PUBLIC_PATHS: &[&str] = &[
    "/health",
    "/metrics",
    "/auth/challenge",
    "/auth/verify",
    "/pdax/webhook",
];

/// SHA-256 of a bearer token, hex encoded. Only this is stored, so a database
/// dump does not yield usable sessions.
pub fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    hex::encode(hasher.finalize())
}

/// Compare two secrets without leaking their common prefix length through
/// timing. Folds over the max length so the loop count does not depend on where
/// the first difference lands.
pub fn constant_time_eq(a: &str, b: &str) -> bool {
    let (a, b) = (a.as_bytes(), b.as_bytes());
    let mut diff = (a.len() ^ b.len()) as u8;
    let n = a.len().max(b.len());
    for i in 0..n {
        let x = a.get(i).copied().unwrap_or(0);
        let y = b.get(i).copied().unwrap_or(0);
        diff |= x ^ y;
    }
    diff == 0
}

/// Verify that `signature_b64` is a valid ed25519 signature over `message`,
/// produced by the secret key behind the Stellar address `wallet`.
///
/// Uses `verify_strict`, which rejects small-order and non-canonical public
/// keys as well as malleable signatures — the permissive `verify` would accept
/// signatures a different implementation might reject.
pub fn verify_wallet_signature(
    wallet: &str,
    message: &[u8],
    signature_b64: &str,
) -> crate::errors::Result<()> {
    let pk = stellar_strkey::ed25519::PublicKey::from_string(wallet)
        .map_err(|_| PaymentError::InvalidPayload(format!("Invalid Stellar address: {wallet}")))?;

    let verifying_key = VerifyingKey::from_bytes(&pk.0)
        .map_err(|_| PaymentError::InvalidPayload("Malformed wallet public key".to_string()))?;

    let sig_bytes = STANDARD
        .decode(signature_b64.trim())
        .map_err(|_| PaymentError::InvalidPayload("Signature must be base64".to_string()))?;

    let sig_array: [u8; 64] = sig_bytes
        .as_slice()
        .try_into()
        .map_err(|_| PaymentError::InvalidPayload("Signature must be 64 bytes".to_string()))?;

    verifying_key
        .verify_strict(message, &Signature::from_bytes(&sig_array))
        .map_err(|_| PaymentError::Unauthorized)
}

/// Validate a Stellar public address without any network call.
pub fn is_valid_wallet(wallet: &str) -> bool {
    stellar_strkey::ed25519::PublicKey::from_string(wallet).is_ok()
}

// ── Middleware ───────────────────────────────────────────────────────────────

pub struct SessionAuth {
    api_key: Arc<String>,
}

impl SessionAuth {
    /// `api_key` may be empty, in which case the edge filter is skipped.
    pub fn new(api_key: String) -> Self {
        SessionAuth {
            api_key: Arc::new(api_key),
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for SessionAuth
where
    S: actix_web::dev::Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>
        + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = SessionAuthService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(SessionAuthService {
            service: Arc::new(service),
            api_key: self.api_key.clone(),
        })
    }
}

pub struct SessionAuthService<S> {
    service: Arc<S>,
    api_key: Arc<String>,
}

impl<S, B> actix_web::dev::Service<ServiceRequest> for SessionAuthService<S>
where
    S: actix_web::dev::Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>
        + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = self.service.clone();
        let api_key = self.api_key.clone();

        Box::pin(async move {
            let path = req.path().to_string();

            // Coarse edge filter. Constant-time so it does not leak the key
            // through response timing, though nothing sensitive rests on it.
            if !api_key.is_empty() {
                let presented = req
                    .headers()
                    .get("x-api-key")
                    .and_then(|v| v.to_str().ok())
                    .unwrap_or("")
                    .to_string();
                if !constant_time_eq(&presented, &api_key) {
                    log::warn!("Rejected {path}: bad or missing API key");
                    return Err(PaymentError::Unauthorized.into());
                }
            }

            if PUBLIC_PATHS.contains(&path.as_str()) {
                return service.call(req).await;
            }

            let token = req
                .headers()
                .get("authorization")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.strip_prefix("Bearer "))
                .map(|t| t.trim().to_string())
                .unwrap_or_default();

            if token.is_empty() {
                log::warn!("Rejected {path}: no bearer token");
                return Err(PaymentError::Unauthorized.into());
            }

            let state = req
                .app_data::<web::Data<AppState>>()
                .cloned()
                .ok_or_else(|| {
                    log::error!("AppState missing from request — middleware misconfigured");
                    Error::from(PaymentError::InternalError)
                })?;

            let wallet = state
                .db
                .wallet_for_session(&hash_token(&token))
                .await
                .map_err(Error::from)?;

            match wallet {
                Some(wallet) => {
                    req.extensions_mut().insert(AuthenticatedWallet(wallet));
                    service.call(req).await
                }
                None => {
                    // Unknown, expired, and revoked are deliberately
                    // indistinguishable to the caller.
                    log::warn!("Rejected {path}: invalid or expired session");
                    Err(PaymentError::Unauthorized.into())
                }
            }
        })
    }
}

/// Pull the authenticated wallet out of request extensions.
///
/// Every handler behind `SessionAuth` can rely on this. It returns
/// `Unauthorized` rather than panicking if the middleware was somehow bypassed,
/// so a routing mistake fails closed.
pub fn require_wallet(req: &actix_web::HttpRequest) -> crate::errors::Result<String> {
    req.extensions()
        .get::<AuthenticatedWallet>()
        .map(|w| w.0.clone())
        .ok_or(PaymentError::Unauthorized)
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    fn keypair(seed: [u8; 32]) -> (SigningKey, String) {
        let sk = SigningKey::from_bytes(&seed);
        // strkey's `to_string` yields its own string type, not `String`.
        let address = stellar_strkey::ed25519::PublicKey(sk.verifying_key().to_bytes())
            .to_string()
            .as_str()
            .to_owned();
        (sk, address)
    }

    #[test]
    fn accepts_a_genuine_signature() {
        let (sk, address) = keypair([7u8; 32]);
        let nonce = b"a-server-generated-nonce";
        let sig = STANDARD.encode(sk.sign(nonce).to_bytes());

        assert!(verify_wallet_signature(&address, nonce, &sig).is_ok());
    }

    #[test]
    fn rejects_a_signature_from_a_different_key() {
        let (attacker_sk, _) = keypair([1u8; 32]);
        let (_, victim_address) = keypair([2u8; 32]);
        let nonce = b"a-server-generated-nonce";
        let sig = STANDARD.encode(attacker_sk.sign(nonce).to_bytes());

        // Signing your own nonce does not authenticate you as someone else.
        assert!(verify_wallet_signature(&victim_address, nonce, &sig).is_err());
    }

    #[test]
    fn rejects_a_signature_over_a_different_message() {
        let (sk, address) = keypair([3u8; 32]);
        let sig = STANDARD.encode(sk.sign(b"some other challenge").to_bytes());

        assert!(verify_wallet_signature(&address, b"the real nonce", &sig).is_err());
    }

    #[test]
    fn rejects_malformed_input() {
        let (sk, address) = keypair([4u8; 32]);
        let good = STANDARD.encode(sk.sign(b"n").to_bytes());

        assert!(verify_wallet_signature("not-an-address", b"n", &good).is_err());
        assert!(verify_wallet_signature(&address, b"n", "not-base64!!").is_err());
        assert!(verify_wallet_signature(&address, b"n", &STANDARD.encode([0u8; 10])).is_err());
    }

    #[test]
    fn validates_wallet_addresses() {
        let (_, address) = keypair([5u8; 32]);
        assert!(is_valid_wallet(&address));
        assert!(!is_valid_wallet(""));
        assert!(!is_valid_wallet("GNOTAREALADDRESS"));
    }

    #[test]
    fn token_hashing_is_stable_and_distinct() {
        assert_eq!(hash_token("abc"), hash_token("abc"));
        assert_ne!(hash_token("abc"), hash_token("abd"));
        assert_eq!(hash_token("abc").len(), 64);
    }

    #[test]
    fn constant_time_eq_matches_normal_equality() {
        assert!(constant_time_eq("secret", "secret"));
        assert!(!constant_time_eq("secret", "secrey"));
        assert!(!constant_time_eq("secret", "secret-longer"));
        assert!(!constant_time_eq("", "x"));
        assert!(constant_time_eq("", ""));
    }
}
