use crate::channels::ChannelManager;
use crate::crypto::hash_device_serial;
use crate::errors::{PaymentError, Result};
use crate::models::{PaymentRequest, PaymentResponse, StatusQueryResponse};
use crate::state::AppState;
use actix_web::{web, HttpResponse};
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
    if let Ok(Some(existing)) = state
        .db
        .get_transaction_by_idempotency_key(&req.idempotency_key)
        .await
    {
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
        state
            .metrics
            .record_payment_rejected("spend_limit_exceeded");
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

    state
        .db
        .store_payment_transaction_with_key(&payment_tx, &req.idempotency_key)
        .await?;
    state
        .db
        .increment_daily_spend(&device_hash, req.amount_stroops as i64)
        .await?;

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

    let txs = state
        .db
        .get_transactions_by_device(&device_hash, limit, offset)
        .await?;

    let response: Vec<_> = txs
        .into_iter()
        .map(|tx| {
            serde_json::json!({
                "transaction_id": tx.transaction_id,
                "amount_stroops": tx.amount_stroops,
                "destination": tx.destination_wallet,
                "status": tx.status,
                "created_at": tx.created_at.to_rfc3339(),
                "stellar_tx_hash": tx.stellar_tx_hash,
            })
        })
        .collect();

    Ok(HttpResponse::Ok().json(response))
}

pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    let mut degraded = false;

    // DB connectivity ping
    let db_status = match state.db.ping().await {
        Ok(_) => serde_json::json!({ "status": "healthy" }),
        Err(e) => {
            degraded = true;
            serde_json::json!({ "status": "error", "message": e.to_string() })
        }
    };

    // Fee channel check
    let channel_status = match state.db.get_all_active_fee_channels().await {
        Ok(channels) => {
            if channels.is_empty() {
                degraded = true;
                serde_json::json!({ "status": "warning", "count": 0, "total_balance_stroops": 0 })
            } else {
                let total: i64 = channels.iter().map(|c| c.balance_stroops).sum();
                serde_json::json!({
                    "status": "healthy",
                    "count": channels.len(),
                    "total_balance_stroops": total,
                })
            }
        }
        Err(e) => {
            degraded = true;
            serde_json::json!({ "status": "error", "message": e.to_string() })
        }
    };

    let status = if degraded { "degraded" } else { "healthy" };

    HttpResponse::Ok().json(serde_json::json!({
        "status": status,
        "timestamp": Utc::now().to_rfc3339(),
        "components": {
            "database": db_status,
            "fee_channels": channel_status,
        }
    }))
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
        .map(|ch| {
            serde_json::json!({
                "address": ch.channel_address,
                "balance_stroops": ch.balance_stroops,
                "status": ch.status,
                "created_at": ch.created_at.to_rfc3339(),
            })
        })
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

// ── Frontend API handlers ───────────────────────────────────────────────────

/// Wraps the internal payment endpoint with the frontend's expected format.
pub async fn initiate_payment_frontend(
    req: web::Json<crate::models::InitiatePaymentRequest>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    // Convert frontend request to internal PaymentRequest
    let idempotency_key = req
        .nonce
        .clone()
        .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    // 1 cent ≈ 1000 stroops for USDC
    let amount_stroops = req.amount_cents * 1000;

    let internal_req = crate::models::PaymentRequest {
        device_serial: req.raw_device_uid.clone(),
        destination_wallet: req.merchant_public_key.clone(),
        amount_stroops,
        memo: Some(format!("POS payment via {}", req.asset_code)),
        idempotency_key,
    };

    // Call the existing internal handler logic — we inline it to avoid
    // double-JSON wrapping issues with actix.
    state.metrics.record_payment_received();
    state.validator.validate_request_payload(&internal_req)?;

    let device_hash = crate::crypto::hash_device_serial(&internal_req.device_serial)?;

    if let Ok(Some(existing)) = state
        .db
        .get_transaction_by_idempotency_key(&internal_req.idempotency_key)
        .await
    {
        state.metrics.record_idempotency_hit();
        let status = existing.status.clone();
        return Ok(
            HttpResponse::Ok().json(crate::models::InitiatePaymentResponse {
                status: status.clone(),
                message: status,
                tx_hash: existing.stellar_tx_hash,
            }),
        );
    }

    if !state.rate_limiter.check_and_record(&device_hash).await {
        state.metrics.record_rate_limit_rejection();
        state.metrics.record_payment_rejected("rate_limited");
        return Err(crate::errors::PaymentError::RateLimited);
    }

    state.validator.validate_device_active(&device_hash).await?;
    let within_limit = state
        .validator
        .validate_spend_limit(&device_hash, internal_req.amount_stroops as i64)
        .await?;
    if !within_limit {
        state
            .metrics
            .record_payment_rejected("spend_limit_exceeded");
        return Err(crate::errors::PaymentError::SpendLimitExceeded);
    }

    let transaction_id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now();
    let payment_tx = crate::models::PaymentTransaction {
        id: 0,
        transaction_id: transaction_id.clone(),
        device_hash: device_hash.clone(),
        source_wallet: "pending".to_string(),
        destination_wallet: internal_req.destination_wallet.clone(),
        amount_stroops: internal_req.amount_stroops as i64,
        fee_stroops: 200,
        status: "pending".to_string(),
        stellar_tx_hash: None,
        created_at: now,
        submitted_at: None,
        confirmed_at: None,
        error_message: None,
        fee_channel_used: None,
    };

    state
        .db
        .store_payment_transaction_with_key(&payment_tx, &internal_req.idempotency_key)
        .await?;
    state
        .db
        .increment_daily_spend(&device_hash, internal_req.amount_stroops as i64)
        .await?;
    state.metrics.record_payment_accepted();

    Ok(
        HttpResponse::Accepted().json(crate::models::InitiatePaymentResponse {
            status: "accepted".to_string(),
            message: "Payment accepted for processing".to_string(),
            tx_hash: None,
        }),
    )
}

pub async fn batch_payments(
    req: web::Json<crate::models::BatchPaymentRequest>,
) -> Result<HttpResponse> {
    let count = req.payments.len();
    Ok(HttpResponse::Ok().json(crate::models::BatchPaymentResponse { processed: count }))
}

pub async fn list_transactions(state: web::Data<AppState>) -> Result<HttpResponse> {
    let txs = state.db.get_pending_payment_transactions().await?;
    let transactions: Vec<serde_json::Value> = txs
        .into_iter()
        .map(|tx| {
            serde_json::json!({
                "id": tx.transaction_id,
                "stellarTxHash": tx.stellar_tx_hash,
                "merchantId": tx.destination_wallet,
                "merchantName": "Merchant",
                "userId": tx.device_hash,
                "deviceId": tx.device_hash,
                "amountCents": tx.amount_stroops / 10,
                "assetCode": "USDC",
                "status": tx.status,
                "errorMessage": tx.error_message,
                "createdAt": tx.created_at.to_rfc3339(),
            })
        })
        .collect();

    Ok(HttpResponse::Ok().json(serde_json::json!({ "transactions": transactions })))
}

pub async fn list_notifications(_state: web::Data<AppState>) -> Result<HttpResponse> {
    // Return empty list for now — notifications are ephemeral in the backend
    Ok(
        HttpResponse::Ok().json(crate::models::NotificationsListResponse {
            notifications: vec![],
        }),
    )
}

pub async fn register_push_token(
    req: web::Json<crate::models::RegisterPushTokenRequest>,
) -> Result<HttpResponse> {
    log::info!(
        "Registered push token: {} (platform: {})",
        req.token,
        req.platform
    );
    Ok(HttpResponse::Ok().json(crate::models::OkResponse { ok: true }))
}

pub async fn delete_account(_state: web::Data<AppState>) -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(crate::models::OkResponse { ok: true }))
}

pub async fn pdax_cash_in(_req: web::Json<crate::models::FiatCashRequest>) -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(crate::models::FiatCashResponse {
        reference: format!("CASH-IN-{}", uuid::Uuid::new_v4()),
    }))
}

pub async fn pdax_cash_out(
    _req: web::Json<crate::models::FiatCashRequest>,
) -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(crate::models::FiatCashResponse {
        reference: format!("CASH-OUT-{}", uuid::Uuid::new_v4()),
    }))
}
