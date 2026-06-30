use actix_web::{web, HttpResponse};
use crate::channels::ChannelManager;
use crate::errors::{PaymentError, Result};
use crate::models::{PaymentRequest, PaymentResponse, StatusQueryResponse};
use crate::state::AppState;
use crate::crypto::hash_device_serial;
use chrono::Utc;
use serde::Serialize;
use std::sync::Arc;

pub async fn process_payment(
    req: web::Json<PaymentRequest>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    state.metrics.record_payment_received();

    // Validate request payload
    state.validator.validate_request_payload(&req)?;

    // Hash device serial
    let device_hash = hash_device_serial(&req.device_serial)?;

    // Idempotency check — return existing result if key already seen
    if let Ok(Some(existing)) = state.db.get_transaction_by_idempotency_key(&req.idempotency_key).await {
        state.metrics.record_idempotency_hit();
        let response = PaymentResponse {
            status: existing.status,
            transaction_id: existing.transaction_id,
            device_hash: existing.device_hash,
            submitted_at: existing.created_at.to_rfc3339(),
            stellar_tx_hash: existing.stellar_tx_hash,
            error: existing.error_message,
        };
        return Ok(HttpResponse::Ok().json(response));
    }

    // Rate limit check (10 requests per 60s per device)
    if !state.rate_limiter.check_and_record(&device_hash).await {
        state.metrics.record_rate_limit_rejection();
        state.metrics.record_payment_rejected("rate_limited");
        return Err(PaymentError::RateLimited);
    }

    // Validate device is active
    state.validator.validate_device_active(&device_hash).await?;

    // Check spend limit
    let within_limit = state
        .validator
        .validate_spend_limit(&device_hash, req.amount_stroops as i64)
        .await?;

    if !within_limit {
        state.metrics.record_payment_rejected("spend_limit_exceeded");
        return Err(PaymentError::SpendLimitExceeded);
    }

    let transaction_id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now();

    let payment_tx = crate::models::PaymentTransaction {
        id: 0,
        transaction_id: transaction_id.clone(),
        device_hash: device_hash.clone(),
        source_wallet: "pending".to_string(),
        destination_wallet: req.destination_wallet.clone(),
        amount_stroops: req.amount_stroops as i64,
        fee_stroops: 200,
        status: "pending".to_string(),
        stellar_tx_hash: None,
        created_at: now,
        submitted_at: None,
        confirmed_at: None,
        error_message: None,
        fee_channel_used: None,
    };

    state.db.store_payment_transaction_with_key(&payment_tx, &req.idempotency_key).await?;
    state.db.increment_daily_spend(&device_hash, req.amount_stroops as i64).await?;

    state.metrics.record_payment_accepted();

    let response = PaymentResponse {
        status: "accepted".to_string(),
        transaction_id: transaction_id.clone(),
        device_hash: device_hash.clone(),
        submitted_at: now.to_rfc3339(),
        stellar_tx_hash: None,
        error: None,
    };

    Ok(HttpResponse::Accepted().json(response))
}

pub async fn get_transaction_status(
    transaction_id: web::Path<String>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let tx_id = transaction_id.into_inner();

    if let Some(cached) = state.tx_cache.get(&tx_id).await {
        return Ok(HttpResponse::Ok().json(StatusQueryResponse {
            status: cached.status,
            transaction_id: cached.transaction_id,
            amount_stroops: cached.amount_stroops as u64,
            destination: cached.destination_wallet,
            submitted_at: cached.submitted_at.map(|t| t.to_rfc3339()),
            confirmed_at: cached.confirmed_at.map(|t| t.to_rfc3339()),
            stellar_tx_hash: cached.stellar_tx_hash,
            error_message: cached.error_message,
        }));
    }

    let tx = state.db.get_payment_transaction(&tx_id).await?;

    // Only cache terminal states — pending/submitted may still change
    if tx.status == "confirmed" || tx.status == "failed" {
        state.tx_cache.set(tx_id, tx.clone()).await;
    }

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

pub async fn get_device_transactions(
    device_serial: web::Path<String>,
    query: web::Query<PaginationQuery>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let device_hash = hash_device_serial(&device_serial)?;
    let limit = query.limit.unwrap_or(20).min(100) as i64;
    let offset = query.offset.unwrap_or(0) as i64;

    let txs = state.db.get_transactions_by_device(&device_hash, limit, offset).await?;

    let response: Vec<_> = txs.into_iter().map(|tx| serde_json::json!({
        "transaction_id": tx.transaction_id,
        "amount_stroops": tx.amount_stroops,
        "destination": tx.destination_wallet,
        "status": tx.status,
        "created_at": tx.created_at.to_rfc3339(),
        "stellar_tx_hash": tx.stellar_tx_hash,
    })).collect();

    Ok(HttpResponse::Ok().json(response))
}

pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    let mut health = serde_json::json!({
        "status": "healthy",
        "timestamp": Utc::now().to_rfc3339(),
        "components": {}
    });

    if let Ok(channels) = state.db.get_all_active_fee_channels().await {
        health["components"]["fee_channels"] = serde_json::json!({
            "status": if channels.is_empty() { "warning" } else { "healthy" },
            "count": channels.len(),
            "total_balance_stroops": channels.iter().map(|c| c.balance_stroops).sum::<i64>(),
        });
        if channels.is_empty() {
            health["status"] = serde_json::json!("degraded");
        }
    } else {
        health["components"]["fee_channels"] = serde_json::json!({
            "status": "error",
            "message": "Failed to fetch channels"
        });
        health["status"] = serde_json::json!("degraded");
    }

    HttpResponse::Ok().json(health)
}

pub async fn get_metrics(state: web::Data<AppState>) -> HttpResponse {
    HttpResponse::Ok().json(state.metrics.snapshot())
}

#[derive(serde::Deserialize)]
pub struct PaginationQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[derive(Serialize)]
pub struct ChannelStatusResponse {
    pub address: String,
    pub db_balance: i64,
    pub network_balance: i64,
    pub in_sync: bool,
    pub last_checked: String,
}

pub async fn list_fee_channels(state: web::Data<AppState>) -> Result<HttpResponse> {
    let channels = state.db.get_all_active_fee_channels().await?;

    let response: Vec<_> = channels
        .into_iter()
        .map(|ch| serde_json::json!({
            "address": ch.channel_address,
            "balance_stroops": ch.balance_stroops,
            "status": ch.status,
            "created_at": ch.created_at.to_rfc3339(),
        }))
        .collect();

    Ok(HttpResponse::Ok().json(response))
}

pub async fn get_channel_details(
    channel_manager: web::Data<Arc<ChannelManager>>,
    channel_address: web::Path<String>,
) -> Result<HttpResponse> {
    let status = channel_manager.get_channel_status(&channel_address).await?;

    let response = ChannelStatusResponse {
        address: status.address,
        db_balance: status.db_balance,
        network_balance: status.network_balance,
        in_sync: status.in_sync,
        last_checked: status.last_checked.to_rfc3339(),
    };

    Ok(HttpResponse::Ok().json(response))
}
