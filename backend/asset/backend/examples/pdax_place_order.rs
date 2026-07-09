use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};
use uuid::Uuid;

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for POST /pdax-institution/v1/trade — accepts a firm
/// quote and places an order. **THIS EXECUTES A REAL TRADE** (simulated on
/// UAT, real on stage/production — check PDAX_ENVIRONMENT before running).
///
/// Since a firm quote's quote_id expires in ~15 seconds, this fetches the
/// quote via `firm_quote()` and immediately accepts it via `place_order()`
/// in the same run, with a fresh UUIDv4 idempotency_id generated per call —
/// there is no separate "use an existing quote_id" mode.
///
/// Run with: cargo run --example pdax_place_order [quote_currency] [base_currency] [side] [base_quantity]
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

    println!(
        "⚠ This will place a REAL order on PDAX_ENVIRONMENT={} — {} {} {} {}.",
        config.pdax_environment, side, base_quantity, quote_currency, base_currency
    );
    if config.pdax_environment != "uat" {
        eprintln!("Refusing to run automatically outside uat — this environment likely uses real funds. Edit this script if you're certain.");
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

    println!("Requesting firm quote...");
    let quote = match client.firm_quote(quote_currency, base_currency, side, base_quantity).await {
        Ok(q) => q,
        Err(e) => {
            eprintln!("Firm quote request failed: {}", e);
            std::process::exit(1);
        }
    };
    println!("{}", serde_json::to_string_pretty(&quote).expect("Value always serializes"));

    let quote_id = quote
        .get("data")
        .and_then(|d| d.get("quote_id"))
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| {
            eprintln!("Quote response had no data.quote_id — cannot place an order. Raw response printed above.");
            std::process::exit(1);
        });

    let idempotency_id = Uuid::new_v4().to_string();
    println!(
        "\nAccepting quote_id={} with idempotency_id={} (side={})...",
        quote_id, idempotency_id, side
    );

    match client.place_order(quote_id, side, &idempotency_id).await {
        Ok(order) => {
            println!("Order placed:\n{}", serde_json::to_string_pretty(&order).expect("Value always serializes"));
        }
        Err(e) => {
            eprintln!("Place order failed: {}", e);
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
