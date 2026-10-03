//! Noir Wallet PDAX bridge — HTTP entry point.
//!
//! No Stellar client, no signing keys, no background workers. The five workers
//! that used to run here (submission, confirmation, contract sync, channel
//! monitor, notification pruner) all existed to service a payment path that is
//! now entirely on-chain. What remains is one janitor task that deletes expired
//! rows.

use actix_web::{web, App, HttpServer};
use log::{info, warn};
use sqlx::postgres::PgPoolOptions;
use std::time::Duration;
use tokio::task;

// The binary consumes the library rather than re-declaring `mod` for each
// file. Declaring them twice compiles every module a second time, and in that
// copy anything used only by the library's own consumers — the integration
// tests and the `examples/` binaries — looks like dead code.
use noir_backend::api;
use noir_backend::auth::SessionAuth;
use noir_backend::config::Config;
use noir_backend::db::Repository;
use noir_backend::pdax;
use noir_backend::rate_limiter::RateLimiter;
use noir_backend::state::AppState;

/// How often expired challenges and finished rate-limit windows are swept.
const JANITOR_INTERVAL_SECS: u64 = 300;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");
    config.validate().expect("Invalid configuration");

    info!("Starting Noir Wallet PDAX bridge");
    info!(
        "Environment: {} | PDAX: {}",
        config.environment, config.pdax_environment
    );

    let pool = PgPoolOptions::new()
        .max_connections(config.db_max_connections)
        .min_connections(config.db_min_connections)
        .acquire_timeout(Duration::from_secs(config.db_connect_timeout_secs))
        .idle_timeout(Duration::from_secs(config.db_idle_timeout_secs))
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    info!(
        "Database ready ({} max connections)",
        config.db_max_connections
    );

    let pdax_client = pdax::PdaxClient::new(
        config.pdax_base_url().to_string(),
        config.pdax_username.clone(),
        config.pdax_password.clone(),
    );

    // Seed the cached refresh token so the first conversion does not have to
    // log in from scratch.
    if !config.pdax_refresh_token.is_empty() {
        pdax_client.seed_refresh_token(config.pdax_refresh_token.clone());
    }

    // Log in ahead of time so the session is warm. Failure is not fatal —
    // authentication and order history work without PDAX, and each conversion
    // re-attempts login on demand.
    {
        let pc = pdax_client.clone();
        task::spawn(async move {
            match pc.login().await {
                Ok(pdax::PdaxLoginOutcome::Authenticated(s)) => {
                    info!(
                        "PDAX login OK — user={}, expires_at={:?}",
                        s.username, s.expires_at
                    );
                }
                Ok(pdax::PdaxLoginOutcome::MfaRequired(_)) => {
                    warn!("PDAX login requires MFA — conversion endpoints will fail");
                }
                Err(e) => warn!("PDAX initial login failed: {e}"),
            }
        });
    }

    let rate_limiter = RateLimiter::new(
        config.rate_limit_window_secs,
        config.rate_limit_max_requests,
    );

    // Sweep expired challenges and spent rate-limit windows. Unbounded growth
    // in either table is the only way this service leaks resources now.
    {
        let repo = Repository::new(pool.clone());
        let sweeper = RateLimiter::new(
            config.rate_limit_window_secs,
            config.rate_limit_max_requests,
        );
        task::spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_secs(JANITOR_INTERVAL_SECS)).await;

                match repo.prune_expired_challenges().await {
                    Ok(n) if n > 0 => info!("Pruned {n} expired auth challenge(s)"),
                    Err(e) => warn!("Challenge prune failed: {e}"),
                    _ => {}
                }

                let horizon = sweeper.prune_before(chrono::Utc::now());
                match repo.prune_rate_limits(horizon).await {
                    Ok(n) if n > 0 => info!("Pruned {n} finished rate-limit window(s)"),
                    Err(e) => warn!("Rate-limit prune failed: {e}"),
                    _ => {}
                }
            }
        });
    }

    let app_state = web::Data::new(AppState::new(
        pool.clone(),
        pdax_client,
        rate_limiter,
        config.pdax_webhook_secret.clone(),
        config.session_ttl_secs,
        config.challenge_ttl_secs,
    ));

    let max_body = config.max_request_body_bytes;
    let bind_addr = format!("{}:{}", config.api_host, config.api_port);
    let api_key = config.api_key.clone();

    info!("Listening on {bind_addr}");

    HttpServer::new(move || {
        App::new()
            .wrap(SessionAuth::new(api_key.clone()))
            .app_data(web::JsonConfig::default().limit(max_body))
            .app_data(web::PayloadConfig::new(max_body))
            .app_data(app_state.clone())
            // Ops
            .route("/health", web::get().to(api::health_check))
            .route("/metrics", web::get().to(api::get_metrics))
            // Auth — challenge and verify are public; the rest need a session
            .route("/auth/challenge", web::post().to(api::auth_challenge))
            .route("/auth/verify", web::post().to(api::auth_verify))
            .route("/auth/logout", web::post().to(api::auth_logout))
            .route("/auth/account", web::delete().to(api::delete_account))
            // Conversion
            .route("/pdax/quote", web::post().to(api::pdax_quote))
            .route("/pdax/cash-in", web::post().to(api::pdax_cash_in))
            .route("/pdax/cash-out", web::post().to(api::pdax_cash_out))
            .route("/pdax/balance", web::get().to(api::pdax_balance))
            .route("/orders", web::get().to(api::list_orders))
            .route("/orders/{idempotency_key}", web::get().to(api::get_order))
            // Settlement callback — HMAC authenticated, not session
            .route("/pdax/webhook", web::post().to(api::pdax_webhook))
    })
    .bind(&bind_addr)?
    .shutdown_timeout(30)
    .run()
    .await
}
