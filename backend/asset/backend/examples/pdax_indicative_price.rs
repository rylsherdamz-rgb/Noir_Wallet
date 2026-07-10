use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for GET /pdax-institution/v1/trade/price (indicative,
/// non-binding quote). Reuses the refresh token cached in .env by
/// `pdax_login`/`pdax_refresh_token` if present (exercising the transparent
/// auto-refresh path in `current_session()`); otherwise logs in fresh.
///
/// Run with: cargo run --example pdax_indicative_price [quote_currency] [base_currency] [side] [base_quantity]
/// Defaults match PDAX's sample request: USDC PHP sell 100
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let quote_currency = args.get(1).map(String::as_str).unwrap_or("USDC");
    let base_currency = args.get(2).map(String::as_str).unwrap_or("PHP");
    let side = args.get(3).map(String::as_str).unwrap_or("sell");
    let base_quantity = args.get(4).map(String::as_str).unwrap_or("100");

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
        println!("Reusing cached PDAX session from .env...");
        client.seed_refresh_token(config.pdax_refresh_token.clone());
    } else {
        println!(
            "No cached session — logging in to PDAX ({}) at {}...",
            config.pdax_environment,
            config.pdax_base_url()
        );
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

    println!(
        "Fetching indicative price: {} {} {} {}...\n",
        side, base_quantity, quote_currency, base_currency
    );

    match client
        .indicative_price(quote_currency, base_currency, side, base_quantity)
        .await
    {
        Ok(price) => {
            println!(
                "{}",
                serde_json::to_string_pretty(&price).expect("Value always serializes")
            );
        }
        Err(e) => {
            eprintln!("Indicative price request failed: {}", e);
            std::process::exit(1);
        }
    }

    // current_session() may have transparently refreshed the tokens above —
    // re-cache so the next CLI run picks up the latest ones.
    if let Ok(session) = client.current_session().await {
        pdax_env_cache::save_session(
            &session.access_token,
            &session.refresh_token,
            &session.expires_at.to_rfc3339(),
        );
    }
}
