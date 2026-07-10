use sqlx::postgres::PgPoolOptions;

/// Applies all pending migrations against DATABASE_URL and exits — a
/// standalone step for CI/CD (e.g. a Cloud Run job or build step) rather
/// than relying on every server replica racing to auto-migrate on boot.
/// Run with: cargo run --example run_migrations
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .expect("Failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Migration failed");

    println!("Migrations applied successfully");
}
