use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for GET /pdax-institution/v1/crypto/deposit — returns
/// the wallet address to deposit a given currency into this PDAX account.
///
/// Run with: cargo run --example pdax_crypto_deposit [currency]
/// Defaults to USDCXLM (the doc's sample: USDC on the Stellar network).
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let currency = args.get(1).map(String::as_str).unwrap_or("USDCXLM");

    if config.pdax_username.is_empty() {
        eprintln!("PDAX_USERNAME is not set in .env — nothing to test.");
        std::process::exit(1);
    }

    let client = PdaxClient::new(
        config.pdax_base_url().to_string(),
        config.pdax_username.clone(),
        config.pdax_password.clone(),
    );

    if !config.pdax_refresh_token.is_empty() {
        client.seed_refresh_token(config.pdax_refresh_token.clone());
    } else {
        println!("No cached session — logging in to PDAX ({}) at {}...", config.pdax_environment, config.pdax_base_url());
        match client.login().await {
            Ok(PdaxLoginOutcome::Authenticated(_)) => {}
            Ok(PdaxLoginOutcome::MfaRequired(_)) => {
                eprintln!("MFA required — run `cargo run --example pdax_login` first to complete it interactively.");
                std::process::exit(1);
            }
            Err(e) => {
                eprintln!("Login failed: {}", e);
                std::process::exit(1);
            }
        }
    }

    println!("Fetching crypto deposit address for currency={}...\n", currency);

    match client.crypto_deposit_address(currency).await {
        Ok(address) => {
            println!("{}", serde_json::to_string_pretty(&address).expect("Value always serializes"));
        }
        Err(e) => {
            eprintln!("Crypto deposit address request failed: {}", e);
            std::process::exit(1);
        }
    }

    if let Ok(session) = client.current_session().await {
        pdax_env_cache::save_session(
            &session.access_token,
            &session.refresh_token,
            &session.expires_at.to_rfc3339(),
        );
    }
}
