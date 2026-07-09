use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for GET /pdax-institution/v1/orders (list orders).
///
/// Run with: cargo run --example pdax_orders [page] [pageSize] [startDate] [endDate]
/// Defaults: page=1 pageSize=10, no date filter. Dates are YYYY-MM-DD.
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let page = args.get(1).map(String::as_str).unwrap_or("1");
    let page_size = args.get(2).map(String::as_str).unwrap_or("10");
    let start_date = args.get(3).map(String::as_str);
    let end_date = args.get(4).map(String::as_str);

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

    println!(
        "Fetching orders: page={} pageSize={}{}{}...\n",
        page,
        page_size,
        start_date.map(|d| format!(" startDate={}", d)).unwrap_or_default(),
        end_date.map(|d| format!(" endDate={}", d)).unwrap_or_default(),
    );

    match client.list_orders(page, page_size, start_date, end_date).await {
        Ok(orders) => {
            println!("{}", serde_json::to_string_pretty(&orders).expect("Value always serializes"));
        }
        Err(e) => {
            eprintln!("Orders request failed: {}", e);
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
