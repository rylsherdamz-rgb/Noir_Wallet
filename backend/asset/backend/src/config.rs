use crate::errors::{PaymentError, Result};
use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub environment: String,
    pub database_url: String,
    pub stellar_network: String,
    pub stellar_rpc_url: String,
    pub stellar_horizon_url: String,
    pub api_port: u16,
    pub api_host: String,
    pub log_level: String,
    // Worker intervals
    pub confirmation_poll_interval_secs: u64,
    pub contract_sync_interval_secs: u64,
    pub channel_balance_check_interval_secs: u64,
    pub submission_process_interval_secs: u64,
    pub notification_prune_interval_secs: u64,
    // DB pool
    pub db_max_connections: u32,
    pub db_min_connections: u32,
    pub db_connect_timeout_secs: u64,
    pub db_idle_timeout_secs: u64,
    // Rate limiting
    pub rate_limit_window_secs: u64,
    pub rate_limit_max_requests: usize,
    // Request handling
    pub request_timeout_secs: u64,
    pub max_request_body_bytes: usize,
    // Channel defaults
    pub channel_min_balance_stroops: i64,
    pub channel_topup_target_stroops: i64,
    // PDAX (TSK-203)
    pub pdax_environment: String,
    pub pdax_base_url_production: String,
    pub pdax_base_url_stage: String,
    pub pdax_base_url_uat: String,
    pub pdax_username: String,
    pub pdax_password: String,
    pub pdax_api_key: String,
    pub pdax_api_secret: String,
    pub pdax_webhook_secret: String,
    // PDAX session cache (written by examples/pdax_login.rs and
    // examples/pdax_refresh_token.rs, since the access token expires every
    // 600 seconds and re-logging in every 10 minutes isn't the intended flow).
    pub pdax_access_token: String,
    pub pdax_refresh_token: String,
    pub pdax_token_expires_at: String,
    // API key for frontend authentication
    pub api_key: String,
    // Fee channel signing key (S...) used to fee-bump user-signed transactions.
    pub channel_secret_key: String,

    // Base64 32-byte master key for envelope-encrypting custodied card wallets.
    pub master_key_id: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Config {
            environment: env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            database_url: env::var("DATABASE_URL")
                .map_err(|_| PaymentError::ConfigError("DATABASE_URL not set".to_string()))?,
            stellar_network: env::var("STELLAR_NETWORK").unwrap_or_else(|_| "testnet".to_string()),
            stellar_rpc_url: env::var("STELLAR_RPC_URL")
                .map_err(|_| PaymentError::ConfigError("STELLAR_RPC_URL not set".to_string()))?,
            stellar_horizon_url: env::var("STELLAR_HORIZON_URL")
                .unwrap_or_else(|_| "https://horizon-testnet.stellar.org".to_string()),
            api_port: env::var("API_PORT")
                .unwrap_or_else(|_| "8081".to_string())
                .parse()
                .unwrap_or(8081),
            api_host: env::var("API_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
            confirmation_poll_interval_secs: parse_env("CONFIRMATION_POLL_INTERVAL_SECS", 2),
            contract_sync_interval_secs: parse_env("CONTRACT_SYNC_INTERVAL_SECS", 3600),
            channel_balance_check_interval_secs: parse_env(
                "CHANNEL_BALANCE_CHECK_INTERVAL_SECS",
                300,
            ),
            submission_process_interval_secs: parse_env("SUBMISSION_PROCESS_INTERVAL_SECS", 5),
            notification_prune_interval_secs: parse_env("NOTIFICATION_PRUNE_INTERVAL_SECS", 30),
            db_max_connections: parse_env("DB_MAX_CONNECTIONS", 20),
            db_min_connections: parse_env("DB_MIN_CONNECTIONS", 2),
            db_connect_timeout_secs: parse_env("DB_CONNECT_TIMEOUT_SECS", 10),
            db_idle_timeout_secs: parse_env("DB_IDLE_TIMEOUT_SECS", 600),
            rate_limit_window_secs: parse_env("RATE_LIMIT_WINDOW_SECS", 60),
            rate_limit_max_requests: parse_env("RATE_LIMIT_MAX_REQUESTS", 10),
            request_timeout_secs: parse_env("REQUEST_TIMEOUT_SECS", 30),
            max_request_body_bytes: parse_env("MAX_REQUEST_BODY_BYTES", 65536),
            channel_min_balance_stroops: parse_env("CHANNEL_MIN_BALANCE_STROOPS", 1_000_000),
            channel_topup_target_stroops: parse_env("CHANNEL_TOPUP_TARGET_STROOPS", 10_000_000),
            pdax_environment: env::var("PDAX_ENVIRONMENT").unwrap_or_else(|_| "uat".to_string()),
            pdax_base_url_production: env::var("PDAX_API_BASE_URL_PRODUCTION")
                .unwrap_or_else(|_| "https://services.pdax.ph/api/pdax-api".to_string()),
            pdax_base_url_stage: env::var("PDAX_API_BASE_URL_STAGE").unwrap_or_else(|_| {
                "https://stage.services.sandbox.pdax.ph/api/pdax-api".to_string()
            }),
            pdax_base_url_uat: env::var("PDAX_API_BASE_URL_UAT").unwrap_or_else(|_| {
                "https://uat.services.sandbox.pdax.ph/api/pdax-api".to_string()
            }),
            pdax_username: env::var("PDAX_USERNAME").unwrap_or_default(),
            pdax_password: env::var("PDAX_PASSWORD").unwrap_or_default(),
            pdax_api_key: env::var("PDAX_API_KEY").unwrap_or_default(),
            pdax_api_secret: env::var("PDAX_API_SECRET").unwrap_or_default(),
            pdax_webhook_secret: env::var("PDAX_WEBHOOK_SECRET").unwrap_or_default(),
            pdax_access_token: env::var("PDAX_ACCESS_TOKEN").unwrap_or_default(),
            pdax_refresh_token: env::var("PDAX_REFRESH_TOKEN").unwrap_or_default(),
            pdax_token_expires_at: env::var("PDAX_TOKEN_EXPIRES_AT").unwrap_or_default(),
            api_key: env::var("API_KEY").unwrap_or_default(),
            channel_secret_key: env::var("CHANNEL_SECRET_KEY").unwrap_or_default(),
            master_key_id: env::var("MASTER_KEY_ID").unwrap_or_default(),
        })
    }

    pub fn pdax_base_url(&self) -> &str {
        match self.pdax_environment.as_str() {
            "production" => &self.pdax_base_url_production,
            "stage" => &self.pdax_base_url_stage,
            _ => &self.pdax_base_url_uat,
        }
    }

    pub fn validate(&self) -> Result<()> {
        if self.database_url.is_empty() {
            return Err(PaymentError::ConfigError(
                "DATABASE_URL is empty".to_string(),
            ));
        }
        if self.is_production() && self.is_testnet() {
            return Err(PaymentError::ConfigError(
                "STELLAR_NETWORK must be 'pubnet' in production".to_string(),
            ));
        }
        if self.db_min_connections > self.db_max_connections {
            return Err(PaymentError::ConfigError(
                "DB_MIN_CONNECTIONS cannot exceed DB_MAX_CONNECTIONS".to_string(),
            ));
        }
        if self.channel_min_balance_stroops >= self.channel_topup_target_stroops {
            return Err(PaymentError::ConfigError(
                "CHANNEL_MIN_BALANCE_STROOPS must be less than CHANNEL_TOPUP_TARGET_STROOPS"
                    .to_string(),
            ));
        }
        if self.api_key.is_empty() {
            return Err(PaymentError::ConfigError(
                "API_KEY cannot be empty — required for request authentication".to_string(),
            ));
        }
        if self.pdax_webhook_secret.is_empty() {
            log::warn!("PDAX_WEBHOOK_SECRET is empty — webhook signing verification will reject all webhooks");
        }
        Ok(())
    }

    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }

    pub fn is_testnet(&self) -> bool {
        self.stellar_network == "testnet"
    }
}

fn parse_env<T: std::str::FromStr>(key: &str, default: T) -> T {
    env::var(key)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}
