use noir_backend::config::Config;
use noir_backend::pdax::{PdaxClient, PdaxLoginOutcome};

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for the PDAX login flow (plus OTP if MFA is configured
/// on the account). Reads PDAX_USERNAME/PDAX_PASSWORD from .env, and caches
/// the resulting access/refresh token back into .env for
/// `cargo run --example pdax_refresh_token` to pick up.
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
            println!("Authenticated. Token expires at {}\n", session.expires_at);
            print_session(&session);
            pdax_env_cache::save_session(
                &session.access_token,
                &session.refresh_token,
                &session.expires_at.to_rfc3339(),
            );
        }
        Ok(PdaxLoginOutcome::MfaRequired(challenge)) => {
            println!(
                "MFA required ({}). Enter the OTP code: ",
                challenge.challenge_name
            );
            let mut code = String::new();
            std::io::stdin()
                .read_line(&mut code)
                .expect("Failed to read OTP code from stdin");

            match client.verify_otp(&challenge, code.trim()).await {
                Ok(session) => {
                    println!("OTP verified. Token expires at {}\n", session.expires_at);
                    print_session(&session);
                    pdax_env_cache::save_session(
                        &session.access_token,
                        &session.refresh_token,
                        &session.expires_at.to_rfc3339(),
                    );
                }
                Err(e) => {
                    eprintln!("OTP verification failed: {}", e);
                    std::process::exit(1);
                }
            }
        }
        Err(e) => {
            eprintln!("Login failed: {}", e);
            std::process::exit(1);
        }
    }
}

/// Prints the session in the same shape as PDAX's documented `/login`
/// response payload, with full token values.
fn print_session(session: &noir_backend::pdax::PdaxSession) {
    println!("{}", serde_json::to_string_pretty(session).expect("PdaxSession always serializes"));
}
