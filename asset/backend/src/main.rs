use actix_web::{web, App, HttpServer};
use log::info;
use sqlx::postgres::PgPoolOptions;

mod api;
mod config;
mod crypto;
mod db;
mod errors;
mod fees;
mod metrics;
mod models;
mod queue;
mod state;
mod stellar;
mod sync;
mod validation;
mod workers;

use config::Config;
use state::AppState;

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
        stellar_client,
        vec![], // TODO: Load from configuration
    );

    let app_state = web::Data::new(app_state);

    info!("Starting server on {}:{}", config.api_host, config.api_port);

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/health", web::get().to(api::health_check))
            .route("/payment", web::post().to(api::process_payment))
            .route("/payment/{transaction_id}", web::get().to(api::get_transaction_status))
    })
    .bind(&format!("{}:{}", config.api_host, config.api_port))?
    .run()
    .await
}
