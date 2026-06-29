use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Not found")]
    NotFound,

    #[error("Internal server error")]
    InternalError,

    #[error("{0}")]
    Custom(String),
}

pub type Result<T> = std::result::Result<T, AppError>;
