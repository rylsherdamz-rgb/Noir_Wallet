use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for GET /pdax-institution/v1/orders/{order_id}.
///
/// Run with: cargo run --example pdax_order_details <order_id>
/// order_id comes from a previous `pdax_place_order` or `pdax_orders` run.
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let order_id = match args.get(1) {
        Some(id) => id.as_str(),
        None => {
            eprintln!("Usage: cargo run --example pdax_order_details <order_id>");
            eprintln!("Get an order_id from `cargo run --example pdax_orders` first.");
            std::process::exit(1);
        }
    };

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

    println!("Fetching order details for order_id={}...\n", order_id);

    match client.get_order(order_id).await {
        Ok(order) => {
            println!(
                "{}",
                serde_json::to_string_pretty(&order).expect("Value always serializes")
            );
        }
        Err(e) => {
            eprintln!("Order details request failed: {}", e);
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
