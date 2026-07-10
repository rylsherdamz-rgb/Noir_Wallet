use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for GET /pdax-institution/v1/fiat/transactions.
///
/// Run with: cargo run --example pdax_fiat_transactions [mode] [identifier] [page] [pageSize]
/// All args optional. mode is "CashIn" or "CashOut". Pass "-" to skip a
/// positional arg and still supply a later one, e.g.:
///   cargo run --example pdax_fiat_transactions CashOut - 1 10
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let arg = |i: usize| args.get(i).map(String::as_str).filter(|s| *s != "-");
    let mode = arg(1);
    let identifier = arg(2);
    let page = arg(3);
    let page_size = arg(4);

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
        "Fetching fiat transactions: mode={:?} identifier={:?} page={:?} pageSize={:?}...\n",
        mode, identifier, page, page_size
    );

    match client
        .list_fiat_transactions(mode, identifier, page, page_size)
        .await
    {
        Ok(transactions) => {
            println!(
                "{}",
                serde_json::to_string_pretty(&transactions).expect("Value always serializes")
            );
        }
        Err(e) => {
            eprintln!("Fiat transactions request failed: {}", e);
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
