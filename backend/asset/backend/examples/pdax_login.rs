use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};

/// Manual smoke test for the PDAX login flow. Reads PDAX_USERNAME/PDAX_PASSWORD
/// from .env and reports whether login succeeded or requires an MFA challenge.
/// Run with: cargo run --example pdax_login
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    if config.pdax_username.is_empty() || config.pdax_password.is_empty() {
        eprintln!("PDAX_USERNAME / PDAX_PASSWORD are not set in .env — nothing to test.");
        std::process::exit(1);
    }

    println!("Logging in to PDAX ({}) at {}...", config.pdax_environment, config.pdax_base_url());

    let client = PdaxClient::new(
        config.pdax_base_url().to_string(),
        config.pdax_username.clone(),
        config.pdax_password.clone(),
    );

    match client.login().await {
        Ok(PdaxLoginOutcome::Authenticated(session)) => {
            println!("Authenticated. Token expires at {}", session.expires_at);
        }
        Ok(PdaxLoginOutcome::MfaRequired(challenge)) => {
            println!(
                "MFA required ({}). Session token: {}",
                challenge.challenge_name, challenge.session
            );
            println!("Next step: implement POST /otp using this session token.");
        }
        Err(e) => {
            eprintln!("Login failed: {}", e);
            std::process::exit(1);
        }
    }
}
