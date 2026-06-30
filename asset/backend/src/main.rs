use actix_web::{web, App, HttpServer};
use log::info;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;
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
use state::AppState;
use db::DeviceRepository;
use channels::ChannelManager;
use workers::{ConfirmationPoller, ContractSyncWorker, ChannelMonitor};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    info!("Starting payment gateway API");
    info!("Environment: {}", config.environment);
    info!("Stellar Network: {}", config.stellar_network);

    // Initialize database pool
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to database");

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    info!("Database migrations completed");

    // Initialize Stellar client
    let stellar_client = stellar::StellarClient::new(
        config.stellar_rpc_url.clone(),
        config.stellar_network.clone(),
    );

    // Create app state
    let app_state = AppState::new(
        pool.clone(),
        stellar_client.clone(),
        vec![], // TODO: Load from configuration
    );

    let app_state = web::Data::new(app_state);

    // Initialize background workers
    let db = Arc::new(DeviceRepository::new(pool.clone()));
    let stellar_arc = Arc::new(stellar_client);
    let channel_manager = Arc::new(ChannelManager::new(
        db.clone(),
        stellar_arc.clone(),
        1_000_000,
    ));

    // Spawn submission processor
    let submission_processor = workers::SubmissionProcessor::new(
        db.clone(),
        stellar_arc.clone(),
        channel_manager.clone(),
        config.stellar_network.clone(),
        config.submission_process_interval_secs,
    );
    task::spawn(async move {
        submission_processor.run().await;
    });

    // Spawn confirmation poller
    let poller = ConfirmationPoller::new(
        db.clone(),
        stellar_arc.clone(),
        config.confirmation_poll_interval_secs,
    );
    task::spawn(async move {
        poller.run().await;
    });

    // Spawn contract sync worker
    let sync_worker = ContractSyncWorker::new(
        db.clone(),
        stellar_arc.clone(),
        config.contract_sync_interval_secs,
    );
    task::spawn(async move {
        sync_worker.run().await;
    });

    // Spawn channel monitor
    let monitor = ChannelMonitor::new(
        channel_manager.clone(),
        db.clone(),
        stellar_arc.clone(),
        config.channel_balance_check_interval_secs,
        1_000_000,
        10_000_000,
    );
    task::spawn(async move {
        monitor.run().await;
    });

    let channel_manager_data = web::Data::new(channel_manager.clone());

    info!("Starting server on {}:{}", config.api_host, config.api_port);

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .app_data(channel_manager_data.clone())
            .route("/health", web::get().to(api::health_check))
            .route("/metrics", web::get().to(api::get_metrics))
            .route("/payment", web::post().to(api::process_payment))
            .route("/payment/{transaction_id}", web::get().to(api::get_transaction_status))
            .route("/device/{device_serial}/transactions", web::get().to(api::get_device_transactions))
            .route("/channels", web::get().to(api::list_fee_channels))
            .route("/channels/{channel_address}", web::get().to(api::get_channel_details))
    })
    .bind(&format!("{}:{}", config.api_host, config.api_port))?
    .run()
    .await
}
