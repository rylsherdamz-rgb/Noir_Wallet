//! HTTP handlers for the PDAX fiat bridge.
//!
//! Two rules run through everything here:
//!
//! 1. **The crypto destination is the authenticated wallet, always.** It is
//!    never read from a request body. The previous `/pdax/cash-in` took
//!    `wallet_address` as a parameter behind a shared API key that shipped in
//!    the mobile bundle, so anyone with the APK could withdraw to any address.
//! 2. **Nothing with a side effect happens before the idempotency key is
//!    claimed.** The claim is an atomic insert; a retry replays the original
//!    order instead of placing a second one.

use crate::auth::{require_wallet, verify_wallet_signature};
use crate::errors::{PaymentError, Result};
use crate::models::{
    CashRequest, ChallengeRequest, ChallengeResponse, CryptoAsset, OkResponse, OrderResponse,
    PdaxOrder, QuoteRequest, SessionResponse, VerifyRequest, FIAT_CURRENCY,
};
use crate::money::{self, CRYPTO_SCALE, PHP_SCALE};
use crate::pdax::CryptoWithdrawRequest;
use crate::state::AppState;
use actix_web::{web, HttpRequest, HttpResponse};
use chrono::Utc;
use rand::RngCore;

/// Upper bound on a single conversion, as a guard against a fat-fingered or
/// hostile request draining the institutional account in one call.
/// PHP 1,000,000.00 in centavos.
const MAX_PHP_MINOR: i64 = 100_000_000;

fn random_hex(bytes: usize) -> String {
    let mut buf = vec![0u8; bytes];
    rand::rngs::OsRng.fill_bytes(&mut buf);
    hex::encode(buf)
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/// Issue a nonce for the caller to sign. Public.
pub async fn auth_challenge(
    req: web::Json<ChallengeRequest>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let wallet = req.wallet.trim();
    if !crate::auth::is_valid_wallet(wallet) {
        return Err(PaymentError::InvalidPayload(
            "wallet must be a valid Stellar public key (G...)".to_string(),
        ));
    }

    // Rate limited by wallet so a challenge flood cannot be used to fill the
    // table on someone else's behalf.
    state
        .rate_limiter
        .check(&state.db, &format!("challenge:{wallet}"))
        .await
        .inspect_err(|_| {
            state.metrics.record_rate_limit_rejection();
        })?;

    let nonce = random_hex(32);
    let expires_at = state
        .db
        .create_challenge(wallet, &nonce, state.challenge_ttl_secs)
        .await?;

    Ok(HttpResponse::Ok().json(ChallengeResponse {
        nonce,
        expires_at: expires_at.to_rfc3339(),
    }))
}

/// Exchange a signed nonce for a session token. Public.
pub async fn auth_verify(
    req: web::Json<VerifyRequest>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let wallet = req.wallet.trim();
    if !crate::auth::is_valid_wallet(wallet) {
        state.metrics.record_auth_failure();
        return Err(PaymentError::InvalidPayload(
            "wallet must be a valid Stellar public key (G...)".to_string(),
        ));
    }

    state
        .rate_limiter
        .check(&state.db, &format!("verify:{wallet}"))
        .await
        .inspect_err(|_| {
            state.metrics.record_rate_limit_rejection();
        })?;

    // Claim the nonce *before* verifying the signature. A claimed-but-invalid
    // attempt burns the nonce, so one challenge cannot be reused as an oracle
    // for repeated signature guesses.
    if !state.db.consume_challenge(wallet, req.nonce.trim()).await? {
        state.metrics.record_auth_failure();
        return Err(PaymentError::Unauthorized);
    }

    let nonce_bytes = hex::decode(req.nonce.trim())
        .map_err(|_| PaymentError::InvalidPayload("nonce must be hex".to_string()))?;

    if let Err(e) = verify_wallet_signature(wallet, &nonce_bytes, &req.signature) {
        state.metrics.record_auth_failure();
        return Err(e);
    }

    state.db.upsert_user(wallet).await?;

    let token = random_hex(32);
    let expires_at = state
        .db
        .create_session(
            &crate::auth::hash_token(&token),
            wallet,
            state.session_ttl_secs,
        )
        .await?;

    state.metrics.record_auth_success();

    Ok(HttpResponse::Ok().json(SessionResponse {
        token,
        wallet: wallet.to_string(),
        expires_at: expires_at.to_rfc3339(),
    }))
}

/// Revoke the presented session.
pub async fn auth_logout(http: HttpRequest, state: web::Data<AppState>) -> Result<HttpResponse> {
    // Behind SessionAuth, so the header is known to be present and valid.
    let token = http
        .headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .unwrap_or("")
        .trim()
        .to_string();

    state
        .db
        .revoke_session(&crate::auth::hash_token(&token))
        .await?;
    Ok(HttpResponse::Ok().json(OkResponse { ok: true }))
}

/// Soft-delete the authenticated account and revoke its sessions.
///
/// The previous implementation deleted by the literal wallet `"pending"` — the
/// placeholder assigned to every user created without an address — so one call
/// marked all of them deleted.
pub async fn delete_account(http: HttpRequest, state: web::Data<AppState>) -> Result<HttpResponse> {
    let wallet = require_wallet(&http)?;

    let affected = state.db.mark_user_deleted(&wallet).await?;
    state.db.revoke_all_sessions_for_wallet(&wallet).await?;

    log::info!("Account closed for {wallet} ({affected} row(s))");
    Ok(HttpResponse::Ok().json(OkResponse { ok: true }))
}

// ── Conversion ───────────────────────────────────────────────────────────────

/// Reject amounts that are non-positive or implausibly large before any PDAX
/// call. `php_minor > 0` is also enforced by a CHECK constraint, but failing
/// here gives the caller a usable message.
fn validate_php_amount(minor: i64) -> Result<()> {
    if minor <= 0 {
        return Err(PaymentError::InvalidPayload(
            "amountPhpMinor must be greater than zero".to_string(),
        ));
    }
    if minor > MAX_PHP_MINOR {
        return Err(PaymentError::InvalidPayload(format!(
            "amountPhpMinor exceeds the per-conversion maximum of {}",
            money::to_decimal_string(MAX_PHP_MINOR, PHP_SCALE)
        )));
    }
    Ok(())
}

fn parse_direction(raw: &str) -> Result<&'static str> {
    match raw.trim() {
        "cash_in" => Ok("cash_in"),
        "cash_out" => Ok("cash_out"),
        other => Err(PaymentError::InvalidPayload(format!(
            "Unknown direction '{other}' — expected cash_in or cash_out"
        ))),
    }
}

/// PDAX sides, from the perspective of the PHP base currency: selling PHP buys
/// crypto (cash-in); buying PHP spends crypto (cash-out).
fn side_for(direction: &str) -> &'static str {
    match direction {
        "cash_in" => "sell",
        _ => "buy",
    }
}

/// Indicative price. Read-only — no order is placed and nothing is persisted.
pub async fn pdax_quote(
    http: HttpRequest,
    req: web::Json<QuoteRequest>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let wallet = require_wallet(&http)?;
    let asset = CryptoAsset::parse(&req.asset)?;
    let direction = parse_direction(&req.direction)?;
    validate_php_amount(req.amount_php_minor)?;

    state
        .rate_limiter
        .check(&state.db, &format!("quote:{wallet}"))
        .await
        .inspect_err(|_| {
            state.metrics.record_rate_limit_rejection();
        })?;

    ensure_pdax_session(&state.pdax_client).await?;

    let amount = money::to_decimal_string(req.amount_php_minor, PHP_SCALE);
    let quote = state
        .pdax_client
        .indicative_price(
            asset.trade_code(),
            FIAT_CURRENCY,
            side_for(direction),
            &amount,
        )
        .await?;

    Ok(HttpResponse::Ok().json(quote))
}

/// PHP to crypto, withdrawn to the authenticated wallet.
pub async fn pdax_cash_in(
    http: HttpRequest,
    req: web::Json<CashRequest>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    run_conversion(http, req, state, "cash_in").await
}

/// Crypto to PHP. The fiat payout itself is left to PDAX's own settlement
/// process — this service does not hold the beneficiary bank details required
/// to initiate one, and will not invent them.
pub async fn pdax_cash_out(
    http: HttpRequest,
    req: web::Json<CashRequest>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    run_conversion(http, req, state, "cash_out").await
}

async fn run_conversion(
    http: HttpRequest,
    req: web::Json<CashRequest>,
    state: web::Data<AppState>,
    direction: &str,
) -> Result<HttpResponse> {
    let wallet = require_wallet(&http)?;
    let asset = CryptoAsset::parse(&req.asset)?;
    validate_php_amount(req.amount_php_minor)?;

    let key = req.idempotency_key.trim();
    if key.is_empty() || key.len() > 128 {
        return Err(PaymentError::InvalidPayload(
            "idempotencyKey is required and must be at most 128 characters".to_string(),
        ));
    }

    state.metrics.record_conversion_requested();
    state
        .rate_limiter
        .check(&state.db, &format!("convert:{wallet}"))
        .await
        .inspect_err(|_| {
            state.metrics.record_rate_limit_rejection();
        })?;

    // Claim the key before anything with a side effect. `None` means another
    // request already owns it.
    let claimed = state
        .db
        .claim_order(
            key,
            &wallet,
            direction,
            asset.as_str(),
            req.amount_php_minor,
        )
        .await?;

    if claimed.is_none() {
        let existing = state
            .db
            .get_order_by_key(key)
            .await?
            .ok_or(PaymentError::InternalError)?;

        // A key belongs to the wallet that first used it. Replaying someone
        // else's key must not reveal their order.
        if existing.wallet_address != wallet {
            return Err(PaymentError::Unauthorized);
        }

        state.metrics.record_idempotency_hit();
        return Ok(HttpResponse::Ok().json(OrderResponse::from_order(&existing)));
    }

    // From here the order row exists, so every failure is recorded against it
    // rather than swallowed.
    match execute_conversion(&state, key, &wallet, asset, direction, req.amount_php_minor).await {
        Ok(order) => {
            state.metrics.record_conversion_placed();
            Ok(HttpResponse::Ok().json(OrderResponse::from_order(&order)))
        }
        Err(e) => {
            state.metrics.record_conversion_failed();
            // Best effort, but loudly logged if it fails — an order stuck in
            // 'pending' with no recorded reason is the worst outcome here.
            if let Err(persist_err) = state
                .db
                .set_order_status(key, "failed", Some(&e.to_string()))
                .await
            {
                log::error!(
                    "Order {key} failed ({e}) AND its failure could not be recorded: {persist_err}"
                );
            }
            Err(e)
        }
    }
}

async fn execute_conversion(
    state: &web::Data<AppState>,
    key: &str,
    wallet: &str,
    asset: CryptoAsset,
    direction: &str,
    php_minor: i64,
) -> Result<PdaxOrder> {
    ensure_pdax_session(&state.pdax_client).await?;

    let side = side_for(direction);
    let amount_php = money::to_decimal_string(php_minor, PHP_SCALE);

    // A firm quote is only valid for ~15 seconds, so the order follows it
    // immediately.
    let quote = state
        .pdax_client
        .firm_quote(asset.trade_code(), FIAT_CURRENCY, side, &amount_php)
        .await?;

    let quote_id = quote["data"]["quote_id"].as_str().ok_or_else(|| {
        PaymentError::PdaxApiError("Missing quote_id in firm_quote response".to_string())
    })?;

    // `total_amount` is the crypto side of the trade. Parsed as an exact
    // decimal; a malformed or missing value is an error rather than the silent
    // zero the previous `as_f64().unwrap_or(0.0)` produced.
    let crypto_minor = money::parse_json_amount(&quote["data"]["total_amount"], CRYPTO_SCALE)?;
    if crypto_minor <= 0 {
        return Err(PaymentError::PdaxApiError(format!(
            "Quote returned a non-positive crypto amount: {crypto_minor}"
        )));
    }

    state.db.record_quote(key, quote_id, crypto_minor).await?;

    let order = state.pdax_client.place_order(quote_id, side, key).await?;

    let order_id = order["data"]["order_id"]
        .as_str()
        .map(str::to_string)
        .or_else(|| order["data"]["order_id"].as_i64().map(|v| v.to_string()))
        .ok_or_else(|| {
            PaymentError::PdaxApiError("Missing order_id in place_order response".to_string())
        })?;

    state.db.record_order_placed(key, &order_id).await?;

    // Cash-in sends the crypto on-chain. The destination is the authenticated
    // wallet and cannot be influenced by the request.
    if direction == "cash_in" {
        let withdraw_id = uuid::Uuid::new_v4().to_string();
        state
            .pdax_client
            .crypto_withdraw(&CryptoWithdrawRequest {
                identifier: withdraw_id.clone(),
                currency: asset.withdraw_code().to_string(),
                address: wallet.to_string(),
                amount: money::to_decimal_string(crypto_minor, CRYPTO_SCALE),
                tag: None,
                beneficiary_first_name: None,
                beneficiary_last_name: None,
                beneficiary_exchange: None,
                send_to_self: Some("true".to_string()),
                beneficiary_wallet: None,
            })
            .await?;

        state.db.record_withdrawal(key, &withdraw_id).await?;
        state.metrics.record_withdrawal_initiated();
    }

    state
        .db
        .get_order_by_key(key)
        .await?
        .ok_or(PaymentError::InternalError)
}

/// The authenticated wallet's conversion history. Scoped by session — there is
/// no way to ask for another wallet's orders.
pub async fn list_orders(
    http: HttpRequest,
    query: web::Query<PaginationQuery>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let wallet = require_wallet(&http)?;
    let limit = query.limit.unwrap_or(20).clamp(1, 100) as i64;
    let offset = query.offset.unwrap_or(0) as i64;

    let orders = state
        .db
        .list_orders_for_wallet(&wallet, limit, offset)
        .await?;

    let response: Vec<OrderResponse> = orders.iter().map(OrderResponse::from_order).collect();
    Ok(HttpResponse::Ok().json(response))
}

pub async fn get_order(
    http: HttpRequest,
    path: web::Path<String>,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let wallet = require_wallet(&http)?;
    let key = path.into_inner();

    let order = state
        .db
        .get_order_by_key(&key)
        .await?
        .ok_or(PaymentError::NotFound)?;

    // Same response for "not yours" and "does not exist", so order keys cannot
    // be probed for existence.
    if order.wallet_address != wallet {
        return Err(PaymentError::NotFound);
    }

    Ok(HttpResponse::Ok().json(OrderResponse::from_order(&order)))
}

/// Institutional account balances. Behind a session because it exposes the
/// bridge's own liquidity position.
pub async fn pdax_balance(
    http: HttpRequest,
    state: web::Data<AppState>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> Result<HttpResponse> {
    require_wallet(&http)?;
    ensure_pdax_session(&state.pdax_client).await?;

    let currency = query.get("currency").map(|s| s.as_str());
    let balances = state.pdax_client.get_balances(currency).await?;
    Ok(HttpResponse::Ok().json(balances))
}

// ── Webhook ──────────────────────────────────────────────────────────────────

/// Map a PDAX event to one of our order states.
///
/// PDAX's exact event vocabulary is not pinned down in our docs, so unknown
/// values return `None` and leave the order untouched rather than guessing at a
/// transition. Verify against the sandbox before trusting this in production.
fn map_event_status(raw: &str) -> Option<&'static str> {
    match raw.trim().to_ascii_lowercase().as_str() {
        "completed" | "settled" | "success" | "successful" => Some("settled"),
        "failed" | "rejected" | "cancelled" | "canceled" => Some("failed"),
        "processing" | "pending" | "in_progress" => Some("withdrawing"),
        _ => None,
    }
}

/// Settlement webhook. Authenticated by HMAC signature rather than a session,
/// because PDAX cannot hold one.
///
/// Previously this verified the signature correctly and then logged the event
/// and dropped it, so no settlement ever reached the database.
pub async fn pdax_webhook(
    body: String,
    http: HttpRequest,
    state: web::Data<AppState>,
) -> Result<HttpResponse> {
    let signature = http
        .headers()
        .get("X-PDAX-Signature")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let secret = &state.pdax_webhook_secret;
    if secret.is_empty()
        || !crate::pdax::PdaxClient::verify_webhook_signature(&body, signature, secret)
    {
        state.metrics.record_webhook_rejected();
        log::warn!(
            "PDAX webhook rejected (secret {}configured)",
            if secret.is_empty() { "not " } else { "" }
        );
        return Err(PaymentError::Unauthorized);
    }

    let event: serde_json::Value = serde_json::from_str(&body)
        .map_err(|_| PaymentError::InvalidPayload("Invalid webhook JSON".to_string()))?;

    let event_id = event
        .get("event_id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| PaymentError::InvalidPayload("Webhook missing event_id".to_string()))?;

    let order_id = event
        .pointer("/data/order_id")
        .or_else(|| event.get("order_id"))
        .and_then(|v| {
            v.as_str()
                .map(str::to_string)
                .or_else(|| v.as_i64().map(|n| n.to_string()))
        })
        .ok_or_else(|| PaymentError::InvalidPayload("Webhook missing order_id".to_string()))?;

    let raw_status = event
        .pointer("/data/status")
        .or_else(|| event.get("status"))
        .or_else(|| event.get("event_type"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    state.metrics.record_webhook_accepted();

    match map_event_status(raw_status) {
        Some(status) => {
            let applied = state
                .db
                .apply_webhook_event(&order_id, event_id, status)
                .await?;
            if applied {
                log::info!("Order {order_id} -> {status} (event {event_id})");
            } else {
                // Either a redelivery of an event already applied, or an order
                // this service did not create. Neither is worth a retry.
                log::info!("Webhook {event_id} for order {order_id} had no effect");
            }
        }
        None => {
            log::warn!(
                "Unmapped PDAX event status '{raw_status}' for order {order_id} \
                 — order left unchanged"
            );
        }
    }

    // Always 200 once the signature checks out, so PDAX does not retry an event
    // that was understood.
    Ok(HttpResponse::Ok().json(serde_json::json!({ "status": "received" })))
}

// ── Ops ──────────────────────────────────────────────────────────────────────

pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    let (db_status, degraded) = match state.db.ping().await {
        Ok(_) => (serde_json::json!({ "status": "healthy" }), false),
        Err(e) => (
            serde_json::json!({ "status": "error", "message": e.to_string() }),
            true,
        ),
    };

    // PDAX reachability is reported but does not fail the check: the service can
    // still authenticate users and serve order history without it.
    let pdax_status = match state.pdax_client.current_session().await {
        Ok(_) => serde_json::json!({ "status": "healthy" }),
        Err(e) => serde_json::json!({ "status": "degraded", "message": e.to_string() }),
    };

    let body = serde_json::json!({
        "status": if degraded { "degraded" } else { "healthy" },
        "timestamp": Utc::now().to_rfc3339(),
        "components": { "database": db_status, "pdax": pdax_status },
    });

    if degraded {
        HttpResponse::ServiceUnavailable().json(body)
    } else {
        HttpResponse::Ok().json(body)
    }
}

pub async fn get_metrics(state: web::Data<AppState>) -> HttpResponse {
    HttpResponse::Ok().json(state.metrics.snapshot())
}

#[derive(serde::Deserialize)]
pub struct PaginationQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

async fn ensure_pdax_session(client: &crate::pdax::PdaxClient) -> Result<()> {
    match client.current_session().await {
        Ok(_) => Ok(()),
        Err(_) => match client.login().await {
            Ok(crate::pdax::PdaxLoginOutcome::Authenticated(_)) => Ok(()),
            Ok(crate::pdax::PdaxLoginOutcome::MfaRequired(_)) => Err(PaymentError::PdaxApiError(
                "PDAX login requires MFA".to_string(),
            )),
            Err(e) => Err(e),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_non_positive_and_oversized_amounts() {
        assert!(validate_php_amount(0).is_err());
        assert!(validate_php_amount(-1).is_err());
        assert!(validate_php_amount(MAX_PHP_MINOR + 1).is_err());
        assert!(validate_php_amount(1).is_ok());
        assert!(validate_php_amount(MAX_PHP_MINOR).is_ok());
    }

    #[test]
    fn directions_map_to_pdax_sides() {
        assert_eq!(parse_direction("cash_in").unwrap(), "cash_in");
        assert_eq!(parse_direction(" cash_out ").unwrap(), "cash_out");
        assert!(parse_direction("sideways").is_err());

        // Selling PHP acquires crypto; buying PHP spends it.
        assert_eq!(side_for("cash_in"), "sell");
        assert_eq!(side_for("cash_out"), "buy");
    }

    #[test]
    fn asset_codes_differ_between_trading_and_withdrawal() {
        let usdc = CryptoAsset::parse("usdc").unwrap();
        assert_eq!(usdc.trade_code(), "USDC");
        // Stellar-issued USDC withdraws under a network-qualified code.
        assert_eq!(usdc.withdraw_code(), "USDCXLM");

        let xlm = CryptoAsset::parse("XLM").unwrap();
        assert_eq!(xlm.trade_code(), "XLM");
        assert_eq!(xlm.withdraw_code(), "XLM");

        assert!(CryptoAsset::parse("DOGE").is_err());
        assert!(CryptoAsset::parse("").is_err());
    }

    #[test]
    fn webhook_statuses_map_conservatively() {
        assert_eq!(map_event_status("COMPLETED"), Some("settled"));
        assert_eq!(map_event_status("failed"), Some("failed"));
        assert_eq!(map_event_status(" Processing "), Some("withdrawing"));
        // An unrecognised status must not be guessed into a transition.
        assert_eq!(map_event_status("quantum_superposition"), None);
        assert_eq!(map_event_status(""), None);
    }

    #[test]
    fn random_hex_is_the_right_width_and_not_constant() {
        let a = random_hex(32);
        let b = random_hex(32);
        assert_eq!(a.len(), 64);
        assert_ne!(a, b);
    }
}
