use noir_backend::config::Config;
use noir_backend::pdax::PdaxClient;

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for PUT /pdax-institution/v1/refresh-token. Reads the
/// refresh token cached in .env by `cargo run --example pdax_login` (the
/// access token is only good for 600s / 10 min, so re-running login every
/// time isn't the point of this endpoint) and exchanges it for a fresh
/// access/id token pair, then re-caches the result.
/// Run with: cargo run --example pdax_refresh_token
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    if config.pdax_username.is_empty() {
        eprintln!("PDAX_USERNAME is not set in .env — nothing to test.");
        std::process::exit(1);
    }
    if config.pdax_refresh_token.is_empty() {
        eprintln!(
            "PDAX_REFRESH_TOKEN is not set in .env — run `cargo run --example pdax_login` first."
        );
        std::process::exit(1);
    }

    println!(
        "Refreshing PDAX session ({}) at {}...",
        config.pdax_environment,
        config.pdax_base_url()
    );

    let client = PdaxClient::new(
        config.pdax_base_url().to_string(),
        config.pdax_username.clone(),
        config.pdax_password.clone(),
    );
    client.seed_refresh_token(config.pdax_refresh_token.clone());

    match client.refresh().await {
        Ok(session) => {
            println!("Refreshed. New token expires at {}\n", session.expires_at);
            println!(
                "{}",
                serde_json::to_string_pretty(&session).expect("PdaxSession always serializes")
            );
            pdax_env_cache::save_session(
                &session.access_token,
                &session.refresh_token,
                &session.expires_at.to_rfc3339(),
            );
        }
        Err(e) => {
            eprintln!("Refresh failed: {}", e);
            std::process::exit(1);
        }
    }
}
