use actix_web::{web, HttpResponse};
use crate::errors::Result;
use crate::models::{PaymentRequest, PaymentResponse, StatusQueryResponse};
use crate::state::AppState;
use crate::crypto::hash_device_serial;
use chrono::Utc;

pub async fn process_payment(
    req: web::Json<PaymentRequest>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    state.metrics.record_payment_received();

    // Validate request payload
    state.validator.validate_request_payload(&req)?;

    // Hash device serial
    let device_hash = hash_device_serial(&req.device_serial)?;

    // Validate device is active
    state.validator.validate_device_active(&device_hash).await?;

    // Check spend limit
    let within_limit = state
        .validator
        .validate_spend_limit(&device_hash, req.amount_stroops as i64)
        .await?;

    if !within_limit {
        state.metrics.record_payment_rejected("spend_limit_exceeded");
        return Err(crate::errors::PaymentError::SpendLimitExceeded);
    }

    let transaction_id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now();

    let response = PaymentResponse {
        status: "accepted".to_string(),
        transaction_id: transaction_id.clone(),
        device_hash: device_hash.clone(),
        submitted_at: now.to_rfc3339(),
        stellar_tx_hash: None,
        error: None,
    };

    state.metrics.record_payment_accepted();

    Ok(HttpResponse::Accepted().json(response))
}

pub async fn get_transaction_status(
    transaction_id: web::Path<String>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let tx = state.db.get_payment_transaction(&transaction_id).await?;

    let response = StatusQueryResponse {
        status: tx.status,
        transaction_id: tx.transaction_id,
        amount_stroops: tx.amount_stroops as u64,
        destination: tx.destination_wallet,
        submitted_at: tx.submitted_at.map(|t| t.to_rfc3339()),
        confirmed_at: tx.confirmed_at.map(|t| t.to_rfc3339()),
        stellar_tx_hash: tx.stellar_tx_hash,
        error_message: tx.error_message,
    };

    Ok(HttpResponse::Ok().json(response))
}

pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    // TODO: Implement full health check (DB, Stellar RPC, fee channels)
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "timestamp": Utc::now().to_rfc3339()
    }))
}
