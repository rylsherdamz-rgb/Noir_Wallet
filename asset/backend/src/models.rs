use chrono::{DateTime, Utc, NaiveDate};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

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

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentRequest {
    pub device_serial: String,
    pub destination_wallet: String,
    pub amount_stroops: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<String>,
    pub idempotency_key: String,
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
