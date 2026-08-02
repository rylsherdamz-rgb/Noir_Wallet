use crate::errors::{PaymentError, Result};
use std::env;

/// Configuration for the PDAX bridge.
///
/// Every Stellar, fee-channel, worker, and custody setting is gone — the
/// backend no longer talks to Stellar or holds keys. What remains is the
/// database, the HTTP server, PDAX credentials, and session policy.
#[derive(Debug, Clone)]
pub struct Config {
    pub environment: String,
    pub database_url: String,
    pub api_port: u16,
    pub api_host: String,
    pub log_level: String,
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
    // Sessions
    pub session_ttl_secs: i64,
    pub challenge_ttl_secs: i64,
    // PDAX
    pub pdax_environment: String,
    pub pdax_base_url_production: String,
    pub pdax_base_url_stage: String,
    pub pdax_base_url_uat: String,
    pub pdax_username: String,
    pub pdax_password: String,
    pub pdax_api_key: String,
    pub pdax_api_secret: String,
    pub pdax_webhook_secret: String,
    // PDAX session cache, written by examples/pdax_login.rs and
    // examples/pdax_refresh_token.rs since the access token expires every 600s.
    pub pdax_access_token: String,
    pub pdax_refresh_token: String,
    pub pdax_token_expires_at: String,
    /// Optional coarse edge filter. Not the security model — wallet-signature
    /// sessions are (see `auth.rs`). Empty disables the check entirely.
    pub api_key: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Config {
            environment: env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            database_url: env::var("DATABASE_URL")
                .map_err(|_| PaymentError::ConfigError("DATABASE_URL not set".to_string()))?,
            api_port: parse_env("API_PORT", 8081),
            api_host: env::var("API_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
            db_max_connections: parse_env("DB_MAX_CONNECTIONS", 20),
            db_min_connections: parse_env("DB_MIN_CONNECTIONS", 2),
            db_connect_timeout_secs: parse_env("DB_CONNECT_TIMEOUT_SECS", 10),
            db_idle_timeout_secs: parse_env("DB_IDLE_TIMEOUT_SECS", 600),
            rate_limit_window_secs: parse_env("RATE_LIMIT_WINDOW_SECS", 60),
            rate_limit_max_requests: parse_env("RATE_LIMIT_MAX_REQUESTS", 10),
            request_timeout_secs: parse_env("REQUEST_TIMEOUT_SECS", 30),
            max_request_body_bytes: parse_env("MAX_REQUEST_BODY_BYTES", 65536),
            session_ttl_secs: parse_env("SESSION_TTL_SECS", 86_400),
            challenge_ttl_secs: parse_env("CHALLENGE_TTL_SECS", 300),
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
        if self.db_min_connections > self.db_max_connections {
            return Err(PaymentError::ConfigError(
                "DB_MIN_CONNECTIONS cannot exceed DB_MAX_CONNECTIONS".to_string(),
            ));
        }
        if self.session_ttl_secs <= 0 || self.challenge_ttl_secs <= 0 {
            return Err(PaymentError::ConfigError(
                "SESSION_TTL_SECS and CHALLENGE_TTL_SECS must be positive".to_string(),
            ));
        }

        // Without the webhook secret, settlement events cannot be verified and
        // are all rejected — orders would sit in 'ordered' forever. Fatal in
        // production; a warning elsewhere so local development still runs.
        if self.pdax_webhook_secret.is_empty() {
            if self.is_production() {
                return Err(PaymentError::ConfigError(
                    "PDAX_WEBHOOK_SECRET is required in production — without it every \
                     settlement webhook is rejected"
                        .to_string(),
                ));
            }
            log::warn!("PDAX_WEBHOOK_SECRET is empty — all webhooks will be rejected");
        }

        if self.is_production() && self.pdax_environment != "production" {
            log::warn!(
                "ENVIRONMENT=production but PDAX_ENVIRONMENT={} — trading against a sandbox",
                self.pdax_environment
            );
        }

        // The API key is no longer load-bearing, so an empty one is allowed;
        // say so plainly rather than implying the service is unprotected.
        if self.api_key.is_empty() {
            log::info!("API_KEY not set — edge filter disabled; sessions still required");
        }

        Ok(())
    }

    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }
}

fn parse_env<T: std::str::FromStr>(key: &str, default: T) -> T {
    env::var(key)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}
