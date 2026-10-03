use chrono::Utc;
use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for POST /pdax-institution/v1/trade/quote — a firm,
/// executable quote. UNLIKE the indicative price endpoint, the returned
/// quote_id is only valid for ~15 SECONDS. This CLI only fetches and prints
/// the quote; it does NOT place an order (POST /order is a separate,
/// unimplemented endpoint that would actually execute a trade).
///
/// Run with: cargo run --example pdax_firm_quote [quote_currency] [base_currency] [side] [base_quantity]
/// Defaults: USDC PHP buy 1000 (confirmed working on UAT)
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let quote_currency = args.get(1).map(String::as_str).unwrap_or("USDC");
    let base_currency = args.get(2).map(String::as_str).unwrap_or("PHP");
    let side = args.get(3).map(String::as_str).unwrap_or("buy");
    let base_quantity = args.get(4).map(String::as_str).unwrap_or("1000");

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
        "Requesting FIRM quote: {} {} {} {}...\n",
        side, base_quantity, quote_currency, base_currency
    );

    match client
        .firm_quote(quote_currency, base_currency, side, base_quantity)
        .await
    {
        Ok(quote) => {
            let received_at = Utc::now();
            println!(
                "{}",
                serde_json::to_string_pretty(&quote).expect("Value always serializes")
            );
            println!(
                "\n⚠ Received at {}. This quote (quote_id, if present above) is only valid for ~15 SECONDS.",
                received_at.to_rfc3339()
            );
            println!("This CLI does not place an order — accepting the quote requires a separate POST /order call (not implemented here). By the time you read this, it may already have expired.");
        }
        Err(e) => {
            eprintln!("Firm quote request failed: {}", e);
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
