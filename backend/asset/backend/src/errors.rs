use actix_web::{error::ResponseError, http::StatusCode, HttpResponse};
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
#[allow(dead_code)]
pub enum PaymentError {
    #[error("Device not found")]
    DeviceNotFound,

    #[error("Device is not active")]
    DeviceNotActive,

    #[error("Spend limit exceeded for today")]
    SpendLimitExceeded,

    #[error("Invalid payload: {0}")]
    InvalidPayload(String),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Stellar RPC error: {0}")]
    StellarRpcError(String),

    #[error("PDAX API error: {0}")]
    PdaxApiError(String),

    #[error("Transaction sequence number conflict")]
    SequenceNumberConflict,

    #[error("Failed to submit transaction: {0}")]
    SubmissionFailed(String),

    #[error("Internal server error")]
    InternalError,

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Insufficient funds in fee channels")]
    InsufficientFunds,

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

impl ResponseError for PaymentError {
    fn error_response(&self) -> HttpResponse {
        let error_id = uuid::Uuid::new_v4().to_string();
        let error_response = ErrorResponse {
            error: self.error_type(),
            message: self.to_string(),
            error_id,
        };

        match self {
            PaymentError::DeviceNotFound | PaymentError::InvalidPayload(_) => {
                HttpResponse::BadRequest().json(error_response)
            }
            PaymentError::DeviceNotActive
            | PaymentError::SpendLimitExceeded
            | PaymentError::InsufficientFunds => HttpResponse::Forbidden().json(error_response),
            PaymentError::RateLimited => HttpResponse::TooManyRequests().json(error_response),
            PaymentError::Unauthorized => HttpResponse::Unauthorized().json(error_response),
            PaymentError::DatabaseError(_)
            | PaymentError::StellarRpcError(_)
            | PaymentError::PdaxApiError(_)
            | PaymentError::SequenceNumberConflict
            | PaymentError::SubmissionFailed(_)
            | PaymentError::InternalError
            | PaymentError::ConfigError(_)
            | PaymentError::EncryptionError(_) => {
                HttpResponse::InternalServerError().json(error_response)
            }
        }
    }

    fn status_code(&self) -> StatusCode {
        match self {
            PaymentError::Unauthorized => StatusCode::UNAUTHORIZED,
            PaymentError::DeviceNotFound | PaymentError::InvalidPayload(_) => {
                StatusCode::BAD_REQUEST
            }
            PaymentError::DeviceNotActive
            | PaymentError::SpendLimitExceeded
            | PaymentError::InsufficientFunds => StatusCode::FORBIDDEN,
            PaymentError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl PaymentError {
    fn error_type(&self) -> String {
        match self {
            PaymentError::DeviceNotFound => "DEVICE_NOT_FOUND".to_string(),
            PaymentError::DeviceNotActive => "DEVICE_NOT_ACTIVE".to_string(),
            PaymentError::SpendLimitExceeded => "SPEND_LIMIT_EXCEEDED".to_string(),
            PaymentError::InvalidPayload(_) => "INVALID_PAYLOAD".to_string(),
            PaymentError::DatabaseError(_) => "DATABASE_ERROR".to_string(),
            PaymentError::StellarRpcError(_) => "STELLAR_RPC_ERROR".to_string(),
            PaymentError::PdaxApiError(_) => "PDAX_API_ERROR".to_string(),
            PaymentError::SequenceNumberConflict => "SEQUENCE_CONFLICT".to_string(),
            PaymentError::SubmissionFailed(_) => "SUBMISSION_FAILED".to_string(),
            PaymentError::InternalError => "INTERNAL_ERROR".to_string(),
            PaymentError::ConfigError(_) => "CONFIG_ERROR".to_string(),
            PaymentError::InsufficientFunds => "INSUFFICIENT_FUNDS".to_string(),
            PaymentError::RateLimited => "RATE_LIMITED".to_string(),
            PaymentError::EncryptionError(_) => "ENCRYPTION_ERROR".to_string(),
            PaymentError::Unauthorized => "UNAUTHORIZED".to_string(),
        }
    }
}

pub type Result<T> = std::result::Result<T, PaymentError>;
