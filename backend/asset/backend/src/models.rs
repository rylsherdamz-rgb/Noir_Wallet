use crate::errors::{PaymentError, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// ── Users and sessions ───────────────────────────────────────────────────────

/// A wallet that has proven ownership of its key at least once. Identity is the
/// Stellar address; there is no password, no email, and no stored entropy.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AppUser {
    pub id: i64,
    pub user_uuid: String,
    pub wallet_address: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

/// The authenticated caller, injected into request extensions by
/// `auth::SessionAuth` and extracted by handlers that act on a wallet.
#[derive(Debug, Clone)]
pub struct AuthenticatedWallet(pub String);

// ── Auth DTOs ────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChallengeRequest {
    /// Stellar public key (`G...`) the caller claims to control.
    pub wallet: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChallengeResponse {
    /// Hex-encoded random nonce. Sign the **decoded bytes**, not the hex text.
    pub nonce: String,
    pub expires_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyRequest {
    pub wallet: String,
    pub nonce: String,
    /// Base64 ed25519 signature over the decoded nonce bytes.
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionResponse {
    pub token: String,
    pub wallet: String,
    pub expires_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OkResponse {
    pub ok: bool,
}

// ── Assets ───────────────────────────────────────────────────────────────────

/// The crypto side of a conversion. PHP is always the fiat side.
///
/// Previously `USDC` and the `USDCXLM` withdrawal code were hardcoded in three
/// handlers; the caller now picks, and anything unrecognised is rejected before
/// a quote is requested rather than failing deep inside PDAX.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CryptoAsset {
    #[serde(rename = "USDC")]
    Usdc,
    #[serde(rename = "XLM")]
    Xlm,
}

impl CryptoAsset {
    pub fn parse(raw: &str) -> Result<Self> {
        match raw.trim().to_ascii_uppercase().as_str() {
            "USDC" => Ok(CryptoAsset::Usdc),
            "XLM" => Ok(CryptoAsset::Xlm),
            other => Err(PaymentError::InvalidPayload(format!(
                "Unsupported asset '{other}' — supported: USDC, XLM"
            ))),
        }
    }

    /// Currency code used in trade quote and order calls.
    pub fn trade_code(&self) -> &'static str {
        match self {
            CryptoAsset::Usdc => "USDC",
            CryptoAsset::Xlm => "XLM",
        }
    }

    /// Currency code used for on-chain withdrawal, which identifies the network
    /// as well as the asset. Stellar-issued USDC withdraws as `USDCXLM`; native
    /// lumens withdraw as `XLM`.
    pub fn withdraw_code(&self) -> &'static str {
        match self {
            CryptoAsset::Usdc => "USDCXLM",
            CryptoAsset::Xlm => "XLM",
        }
    }

    pub fn as_str(&self) -> &'static str {
        self.trade_code()
    }
}

/// PHP is the base currency on both sides; only the quote currency changes.
/// Cash-in sells PHP for crypto, cash-out buys PHP with crypto.
pub const FIAT_CURRENCY: &str = "PHP";

// ── PDAX conversion DTOs ─────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteRequest {
    /// PHP amount in centavos.
    pub amount_php_minor: i64,
    pub asset: String,
    /// `cash_in` (PHP to crypto) or `cash_out` (crypto to PHP).
    pub direction: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CashRequest {
    /// PHP amount in centavos. Must be positive.
    pub amount_php_minor: i64,
    pub asset: String,
    /// Caller-supplied key. Retrying with the same key returns the original
    /// order instead of placing a second one.
    pub idempotency_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PdaxOrder {
    pub id: i64,
    pub idempotency_key: String,
    pub wallet_address: String,
    pub direction: String,
    pub asset: String,
    pub php_minor: i64,
    pub crypto_minor: Option<i64>,
    pub pdax_order_id: Option<String>,
    pub pdax_quote_id: Option<String>,
    pub withdrawal_identifier: Option<String>,
    pub status: String,
    pub last_event_id: Option<String>,
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderResponse {
    pub reference: String,
    pub status: String,
    pub direction: String,
    pub asset: String,
    pub amount_php_minor: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub amount_crypto_minor: Option<i64>,
    /// The wallet the crypto was sent to. Always the authenticated wallet — it
    /// is never accepted as a request parameter.
    pub destination_wallet: String,
    pub created_at: String,
}

impl OrderResponse {
    pub fn from_order(order: &PdaxOrder) -> Self {
        OrderResponse {
            reference: order.idempotency_key.clone(),
            status: order.status.clone(),
            direction: order.direction.clone(),
            asset: order.asset.clone(),
            amount_php_minor: order.php_minor,
            amount_crypto_minor: order.crypto_minor,
            destination_wallet: order.wallet_address.clone(),
            created_at: order.created_at.to_rfc3339(),
        }
    }
}
