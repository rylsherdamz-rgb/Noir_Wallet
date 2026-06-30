use actix_web::{web, App, HttpServer};
use log::info;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;
use std::time::Duration;
use tokio::task;

mod api;
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
mod queue;
mod rate_limiter;
mod state;
mod stellar;
mod sync;
mod transaction_builder;
mod transaction_signer;
mod validation;
mod workers;

use config::Config;
use db::DeviceRepository;
use channels::ChannelManager;
use state::AppState;
use workers::{ConfirmationPoller, ContractSyncWorker, ChannelMonitor};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");
    config.validate().expect("Invalid configuration");

    info!("Starting Noir Wallet payment gateway");
    info!("Environment: {} | Network: {}", config.environment, config.stellar_network);

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

    info!("Database ready ({} max connections)", config.db_max_connections);

    let stellar_client = stellar::StellarClient::new(
        config.stellar_rpc_url.clone(),
        config.stellar_network.clone(),
    );

    let db = Arc::new(DeviceRepository::new(pool.clone()));
    let stellar_arc = Arc::new(stellar_client.clone());

    let channel_manager = Arc::new(ChannelManager::new(
        db.clone(),
        stellar_arc.clone(),
        config.channel_min_balance_stroops,
    ));

    // Build app state with config-driven rate limiter
    let app_state = {
        let mut state = AppState::new(pool.clone(), stellar_client, vec![]);
        state.rate_limiter = Arc::new(rate_limiter::RateLimiter::new(
            config.rate_limit_window_secs,
            config.rate_limit_max_requests,
        ));
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

    let channel_manager_data = web::Data::new(channel_manager.clone());
    let max_body = config.max_request_body_bytes;
    let bind_addr = format!("{}:{}", config.api_host, config.api_port);

    info!("Listening on {}", bind_addr);

    HttpServer::new(move || {
        App::new()
            .app_data(web::JsonConfig::default().limit(max_body))
            .app_data(app_state.clone())
            .app_data(channel_manager_data.clone())
            .route("/health",  web::get().to(api::health_check))
            .route("/metrics", web::get().to(api::get_metrics))
            .route("/payment", web::post().to(api::process_payment))
            .route("/payment/{transaction_id}", web::get().to(api::get_transaction_status))
            .route("/device/{device_serial}/transactions", web::get().to(api::get_device_transactions))
            .route("/channels", web::get().to(api::list_fee_channels))
            .route("/channels/{channel_address}", web::get().to(api::get_channel_details))
    })
    .bind(&bind_addr)?
    .shutdown_timeout(30) // seconds to drain in-flight requests on SIGTERM
    .run()
    .await
}
