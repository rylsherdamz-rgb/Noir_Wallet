use crate::errors::{PaymentError, Result};
use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub environment: String,
    pub database_url: String,
    pub stellar_network: String,
    pub stellar_rpc_url: String,
    pub api_port: u16,
    pub api_host: String,
    pub log_level: String,
    // Worker intervals
    pub confirmation_poll_interval_secs: u64,
    pub contract_sync_interval_secs: u64,
    pub channel_balance_check_interval_secs: u64,
    pub submission_process_interval_secs: u64,
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
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Config {
            environment: env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            database_url: env::var("DATABASE_URL")
                .map_err(|_| PaymentError::ConfigError("DATABASE_URL not set".to_string()))?,
            stellar_network: env::var("STELLAR_NETWORK")
                .unwrap_or_else(|_| "testnet".to_string()),
            stellar_rpc_url: env::var("STELLAR_RPC_URL")
                .unwrap_or_else(|_| "https://soroban-testnet.stellar.org".to_string()),
            api_port: env::var("API_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .unwrap_or(8080),
            api_host: env::var("API_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
            confirmation_poll_interval_secs: parse_env("CONFIRMATION_POLL_INTERVAL_SECS", 2),
            contract_sync_interval_secs: parse_env("CONTRACT_SYNC_INTERVAL_SECS", 3600),
            channel_balance_check_interval_secs: parse_env("CHANNEL_BALANCE_CHECK_INTERVAL_SECS", 300),
            submission_process_interval_secs: parse_env("SUBMISSION_PROCESS_INTERVAL_SECS", 5),
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
        })
    }

    pub fn validate(&self) -> Result<()> {
        if self.database_url.is_empty() {
            return Err(PaymentError::ConfigError("DATABASE_URL is empty".to_string()));
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
                "CHANNEL_MIN_BALANCE_STROOPS must be less than CHANNEL_TOPUP_TARGET_STROOPS".to_string(),
            ));
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
