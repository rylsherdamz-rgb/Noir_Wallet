use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Device {
    pub id: i32,
    pub device_hash: String,
    pub wallet_address: String,
    pub registration_date: DateTime<Utc>,
    pub status: String,
    pub daily_limit_stroops: i64,
    pub last_synced_on_chain: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct PaymentTransaction {
    pub id: i64,
    pub transaction_id: String,
    pub device_hash: String,
    pub source_wallet: String,
    pub destination_wallet: String,
    pub amount_stroops: i64,
    pub fee_stroops: i64,
    pub status: String,
    pub stellar_tx_hash: Option<String>,
    pub created_at: DateTime<Utc>,
    pub submitted_at: Option<DateTime<Utc>>,
    pub confirmed_at: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
    pub fee_channel_used: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DailySpend {
    pub id: i32,
    pub device_hash: String,
    pub transaction_date: NaiveDate,
    pub total_spent_stroops: i64,
    pub transaction_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct FeeChannel {
    pub id: i32,
    pub channel_address: String,
    pub balance_stroops: i64,
    pub last_balance_check: DateTime<Utc>,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

// NOTE: `config_encrypted` / `entropy_seed_encrypted` are deliberately not
// fields on these structs, mirroring FeeChannel's exclusion of
// `private_key_encrypted` — encrypted at-rest columns are only ever
// touched via raw queries in db.rs, never through a Serialize-able model.

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Merchant {
    pub id: i64,
    pub merchant_uuid: String,
    pub business_name: String,
    pub settlement_wallet: String,
    pub status: String,
    pub config_key_version: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AppUser {
    pub id: i64,
    pub user_uuid: String,
    pub wallet_address: String,
    pub identity_hash: String,
    pub seed_key_version: i32,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TransactionNotification {
    pub id: i64,
    pub device_hash: String,
    pub payment_transaction_id: Option<i64>,
    pub status: String,
    pub amount_stroops: i64,
    pub payload: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentRequest {
    pub device_serial: String,
    pub destination_wallet: String,
    pub amount_stroops: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<String>,
    pub idempotency_key: String,
    /// Base64 XDR of the inner payment transaction, already signed by the
    /// user's wallet (non-custodial). The backend fee-bumps and submits it.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub signed_xdr: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProvisionCardRequest {
    pub device_serial: String,
    #[serde(default)]
    pub daily_limit_stroops: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProvisionCardResponse {
    pub device_hash: String,
    pub wallet_address: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TapPaymentRequest {
    pub device_serial: String,
    pub destination_wallet: String,
    pub amount_stroops: u64,
    #[serde(default)]
    pub memo: Option<String>,
    pub idempotency_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterDeviceRequest {
    pub device_serial: String,
    pub wallet_address: String,
    #[serde(default)]
    pub daily_limit_stroops: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterDeviceResponse {
    pub device_hash: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentResponse {
    pub status: String,
    pub transaction_id: String,
    pub device_hash: String,
    pub submitted_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stellar_tx_hash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StatusQueryResponse {
    pub status: String,
    pub transaction_id: String,
    pub amount_stroops: u64,
    pub destination: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub submitted_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub confirmed_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stellar_tx_hash: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
}

// ── Frontend API DTOs ─────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct InitiatePaymentRequest {
    pub raw_device_uid: String,
    pub merchant_public_key: String,
    pub amount_cents: u64,
    pub asset_code: String,
    pub terminal_id: Option<String>,
    pub nonce: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InitiatePaymentResponse {
    pub status: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none", rename = "txHash")]
    pub tx_hash: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchPaymentRequest {
    pub payments: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchPaymentResponse {
    pub processed: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationsListResponse {
    pub notifications: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterPushTokenRequest {
    pub token: String,
    pub platform: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OkResponse {
    pub ok: bool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiatCashRequest {
    pub amount_cents: u64,
    pub wallet_address: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FiatCashResponse {
    pub reference: String,
}
