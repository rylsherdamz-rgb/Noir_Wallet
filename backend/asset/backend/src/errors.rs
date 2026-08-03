use actix_web::{error::ResponseError, http::StatusCode, HttpResponse};
use serde::Serialize;
use thiserror::Error;

/// Errors this service can return.
///
/// The payment-path variants are gone with the payment path — no device, spend
/// limit, Stellar RPC, sequence number, or submission errors remain, because
/// none of those are this service's concern any more.
#[derive(Error, Debug)]
pub enum PaymentError {
    #[error("Not found")]
    NotFound,

    #[error("Invalid payload: {0}")]
    InvalidPayload(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("PDAX API error: {0}")]
    PdaxApiError(String),

    #[error("Internal server error")]
    InternalError,

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Rate limit exceeded — too many requests")]
    RateLimited,

    #[error("Encryption error: {0}")]
    EncryptionError(String),

    #[error("Unauthorized")]
    Unauthorized,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
    pub error_id: String,
}

impl PaymentError {
    fn error_type(&self) -> &'static str {
        match self {
            PaymentError::NotFound => "NOT_FOUND",
            PaymentError::InvalidPayload(_) => "INVALID_PAYLOAD",
            PaymentError::DatabaseError(_) => "DATABASE_ERROR",
            PaymentError::PdaxApiError(_) => "PDAX_API_ERROR",
            PaymentError::InternalError => "INTERNAL_ERROR",
            PaymentError::ConfigError(_) => "CONFIG_ERROR",
            PaymentError::RateLimited => "RATE_LIMITED",
            PaymentError::EncryptionError(_) => "ENCRYPTION_ERROR",
            PaymentError::Unauthorized => "UNAUTHORIZED",
        }
    }

    /// What the caller is told. Internal detail — database strings, encryption
    /// failures, configuration problems — is logged, never returned, so a probe
    /// cannot map the service's internals through its error messages.
    fn public_message(&self) -> String {
        match self {
            PaymentError::InvalidPayload(msg) => msg.clone(),
            PaymentError::PdaxApiError(msg) => format!("Exchange error: {msg}"),
            PaymentError::NotFound => "Not found".to_string(),
            PaymentError::RateLimited => "Too many requests".to_string(),
            PaymentError::Unauthorized => "Unauthorized".to_string(),
            PaymentError::ConfigError(_)
            | PaymentError::DatabaseError(_)
            | PaymentError::EncryptionError(_)
            | PaymentError::InternalError => "Internal server error".to_string(),
        }
    }
}

impl ResponseError for PaymentError {
    fn error_response(&self) -> HttpResponse {
        let error_id = uuid::Uuid::new_v4().to_string();

        // Log the full error against the id the caller sees, so a support
        // request can be traced without the response carrying the detail.
        match self {
            PaymentError::DatabaseError(_)
            | PaymentError::EncryptionError(_)
            | PaymentError::ConfigError(_)
            | PaymentError::InternalError => {
                log::error!("[{error_id}] {self}");
            }
            _ => log::debug!("[{error_id}] {self}"),
        }

        HttpResponse::build(self.status_code()).json(ErrorResponse {
            error: self.error_type().to_string(),
            message: self.public_message(),
            error_id,
        })
    }

    fn status_code(&self) -> StatusCode {
        match self {
            PaymentError::NotFound => StatusCode::NOT_FOUND,
            PaymentError::InvalidPayload(_) => StatusCode::BAD_REQUEST,
            PaymentError::Unauthorized => StatusCode::UNAUTHORIZED,
            PaymentError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
            PaymentError::PdaxApiError(_) => StatusCode::BAD_GATEWAY,
            PaymentError::DatabaseError(_)
            | PaymentError::EncryptionError(_)
            | PaymentError::ConfigError(_)
            | PaymentError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

pub type Result<T> = std::result::Result<T, PaymentError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal_detail_never_reaches_the_caller() {
        let db = PaymentError::DatabaseError("relation \"sessions\" does not exist".to_string());
        assert_eq!(db.public_message(), "Internal server error");
        assert!(!db.public_message().contains("sessions"));

        // Validation messages are safe and useful, so they pass through.
        let bad = PaymentError::InvalidPayload("amountPhpMinor must be positive".to_string());
        assert!(bad.public_message().contains("amountPhpMinor"));
    }

    #[test]
    fn status_codes_match_the_failure_kind() {
        assert_eq!(PaymentError::NotFound.status_code(), StatusCode::NOT_FOUND);
        assert_eq!(
            PaymentError::Unauthorized.status_code(),
            StatusCode::UNAUTHORIZED
        );
        assert_eq!(
            PaymentError::RateLimited.status_code(),
            StatusCode::TOO_MANY_REQUESTS
        );
        // An upstream exchange failure is not our fault — 502, not 500.
        assert_eq!(
            PaymentError::PdaxApiError("timeout".into()).status_code(),
            StatusCode::BAD_GATEWAY
        );
    }
}
