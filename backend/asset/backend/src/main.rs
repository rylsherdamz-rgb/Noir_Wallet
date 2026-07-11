#![allow(dead_code)]

use actix_web::{web, App, HttpServer};
use auth::ApiKeyMiddleware;
use log::{info, warn};
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;
use std::time::Duration;
use tokio::task;

mod api;
mod auth;
mod cache;
mod channel_selector;
mod channels;
mod config;
mod crypto;
mod db;
mod errors;
mod fees;
mod metrics;
mod models;
mod pdax;
mod queue;
mod rate_limiter;
mod state;
mod stellar;
mod sync;
mod transaction_builder;
mod transaction_signer;
mod validation;
mod workers;

use channels::ChannelManager;
use config::Config;
use db::DeviceRepository;
use state::AppState;
use workers::{ChannelMonitor, ConfirmationPoller, ContractSyncWorker, NotificationPruner};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");
    config.validate().expect("Invalid configuration");

    info!("Starting Noir Wallet payment gateway");
    info!(
        "Environment: {} | Network: {}",
        config.environment, config.stellar_network
    );

    // DB pool with tuned settings
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

    let stellar_client = stellar::StellarClient::with_horizon(
        config.stellar_rpc_url.clone(),
        config.horizon_url.clone(),
        config.stellar_network.clone(),
    );

    let db = Arc::new(DeviceRepository::new(pool.clone()));
    let stellar_arc = Arc::new(stellar_client.clone());

    // Seed the fee channel row from CHANNEL_SECRET_KEY so channel selection and
    // health reporting reflect the real, funded channel. The secret stays in
    // memory only; the DB row holds just the public address + balance.
    if !config.channel_secret_key.trim().is_empty() {
        match transaction_signer::TransactionSigner::from_secret(config.channel_secret_key.trim()) {
            Ok(signer) => {
                let addr = signer.public_strkey();
                let balance = stellar_arc.get_account_balance(&addr).await.unwrap_or(0);
                match db.upsert_fee_channel(&addr, balance).await {
                    Ok(_) => info!("Fee channel seeded: {addr} (balance {balance} stroops)"),
                    Err(e) => warn!("Failed to seed fee channel {addr}: {e}"),
                }
            }
            Err(e) => warn!("CHANNEL_SECRET_KEY invalid, cannot seed fee channel: {e}"),
        }
    } else {
        warn!("CHANNEL_SECRET_KEY not set — no fee channel; payments will not submit");
    }

    let channel_manager = Arc::new(ChannelManager::new(
        db.clone(),
        stellar_arc.clone(),
        config.channel_min_balance_stroops,
    ));

    // Build PDAX client
    let pdax_client = crate::pdax::PdaxClient::new(
        config.pdax_base_url().to_string(),
        config.pdax_username.clone(),
        config.pdax_password.clone(),
    );

    // Login to PDAX at startup so the session is ready for cash-in/cash-out
    {
        let pc = pdax_client.clone();
        task::spawn(async move {
            match pc.login().await {
                Ok(outcome) => match outcome {
                    crate::pdax::PdaxLoginOutcome::Authenticated(s) => {
                        info!(
                            "PDAX login OK — user={}, expires_at={:?}",
                            s.username, s.expires_at
                        );
                    }
                    crate::pdax::PdaxLoginOutcome::MfaRequired(_) => {
                        warn!("PDAX login requires MFA — trading endpoints will fail");
                    }
                },
                Err(e) => warn!("PDAX initial login failed: {}", e),
            }
        });
    }

    // Build app state with config-driven rate limiter
    let app_state = {
        let mut state = AppState::new(
            pool.clone(),
            stellar_client,
            pdax_client,
            vec![],
            config.api_key.clone(),
        );
        state.rate_limiter = Arc::new(rate_limiter::RateLimiter::new(
            config.rate_limit_window_secs,
            config.rate_limit_max_requests,
        ));
        state.channel_secret_key = config.channel_secret_key.clone();
        state.network = config.stellar_network.clone();
        if config.master_key_id.trim().is_empty() {
            warn!("MASTER_KEY_ID not set — custodial card provisioning/tap disabled");
        } else {
            match crypto::LocalKeyManager::new(config.master_key_id.trim(), 1) {
                Ok(km) => {
                    state.key_manager = Some(Arc::new(km));
                    info!("Custodial key manager initialized");
                }
                Err(e) => warn!("Invalid MASTER_KEY_ID: {e}"),
            }
        }
        state
    };
    let app_state = web::Data::new(app_state);

    // Spawn submission processor
    let submission_processor = workers::SubmissionProcessor::new(
        db.clone(),
        stellar_arc.clone(),
        channel_manager.clone(),
        config.stellar_network.clone(),
        config.submission_process_interval_secs,
        config.channel_secret_key.clone(),
    );
    task::spawn(async move { submission_processor.run().await });

    // Spawn confirmation poller
    let poller = ConfirmationPoller::new(
        db.clone(),
        stellar_arc.clone(),
        config.confirmation_poll_interval_secs,
    );
    task::spawn(async move { poller.run().await });

    // Spawn contract sync worker
    let sync_worker = ContractSyncWorker::new(
        db.clone(),
        stellar_arc.clone(),
        config.contract_sync_interval_secs,
    );
    task::spawn(async move { sync_worker.run().await });

    // Spawn channel monitor
    let min_bal = config.channel_min_balance_stroops;
    let topup = config.channel_topup_target_stroops;
    let monitor = ChannelMonitor::new(
        channel_manager.clone(),
        db.clone(),
        stellar_arc.clone(),
        config.channel_balance_check_interval_secs,
        min_bal,
        topup,
    );
    task::spawn(async move { monitor.run().await });

    // Spawn notification pruner (keeps the ephemeral UI notification cache ephemeral)
    let pruner = NotificationPruner::new(db.clone(), config.notification_prune_interval_secs);
    task::spawn(async move { pruner.run().await });

    let channel_manager_data = web::Data::new(channel_manager.clone());
    let max_body = config.max_request_body_bytes;
    let bind_addr = format!("{}:{}", config.api_host, config.api_port);
    let api_key = config.api_key.clone();

    info!("Listening on {}", bind_addr);

    HttpServer::new(move || {
        App::new()
            .wrap(ApiKeyMiddleware::new(api_key.clone()))
            .app_data(web::JsonConfig::default().limit(max_body))
            .app_data(app_state.clone())
            .app_data(channel_manager_data.clone())
            .route("/health", web::get().to(api::health_check))
            .route("/metrics", web::get().to(api::get_metrics))
            .route("/payment", web::post().to(api::process_payment))
            .route("/payment/tap", web::post().to(api::tap_payment))
            .route("/cards/provision", web::post().to(api::provision_card))
            .route("/devices/register", web::post().to(api::register_device))
            .route(
                "/payment/{transaction_id}",
                web::get().to(api::get_transaction_status),
            )
            .route(
                "/device/{device_serial}/transactions",
                web::get().to(api::get_device_transactions),
            )
            .route("/channels", web::get().to(api::list_fee_channels))
            .route(
                "/channels/{channel_address}",
                web::get().to(api::get_channel_details),
            )
            // Frontend API endpoints
            .route(
                "/payments/initiate",
                web::post().to(api::initiate_payment_frontend),
            )
            .route("/payments/batch", web::post().to(api::batch_payments))
            .route("/transactions", web::get().to(api::list_transactions))
            .route("/notifications", web::get().to(api::list_notifications))
            .route(
                "/notifications/register",
                web::post().to(api::register_push_token),
            )
            .route("/auth/account", web::delete().to(api::delete_account))
            .route("/pdax/cash-in", web::post().to(api::pdax_cash_in))
            .route("/pdax/cash-out", web::post().to(api::pdax_cash_out))
    })
    .bind(&bind_addr)?
    .shutdown_timeout(30) // seconds to drain in-flight requests on SIGTERM
    .run()
    .await
}
