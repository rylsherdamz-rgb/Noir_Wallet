use crate::errors::{PaymentError, Result};
use std::env;

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct Config {
    pub environment: String,
    pub database_url: String,
    pub stellar_network: String,
    pub stellar_rpc_url: String,
    pub api_port: u16,
    pub api_host: String,
    pub log_level: String,
    pub confirmation_poll_interval_secs: u64,
    pub contract_sync_interval_secs: u64,
    pub channel_balance_check_interval_secs: u64,
}

impl Config {
    #[allow(dead_code)]
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
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "debug".to_string()),
            confirmation_poll_interval_secs: env::var("CONFIRMATION_POLL_INTERVAL_SECS")
                .unwrap_or_else(|_| "2".to_string())
                .parse()
                .unwrap_or(2),
            contract_sync_interval_secs: env::var("CONTRACT_SYNC_INTERVAL_SECS")
                .unwrap_or_else(|_| "3600".to_string())
                .parse()
                .unwrap_or(3600),
            channel_balance_check_interval_secs: env::var("CHANNEL_BALANCE_CHECK_INTERVAL_SECS")
                .unwrap_or_else(|_| "300".to_string())
                .parse()
                .unwrap_or(300),
        })
    }

    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }

    pub fn is_testnet(&self) -> bool {
        self.stellar_network == "testnet"
    }
}
