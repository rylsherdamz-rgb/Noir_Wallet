use noir_backend::config::Config;
use noir_backend::pdax::{CryptoWithdrawRequest, PdaxClient, PdaxLoginOutcome};
use uuid::Uuid;

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for POST /pdax-institution/v1/crypto/withdraw. **Sends
/// crypto out of the PDAX account to an on-chain address — typically
/// irreversible once broadcast**, higher stakes than any fiat endpoint
/// (there's no PENDING/reversal window). PDAX's own sample curl for this
/// endpoint uses an Ethereum-format address ("0xa919...") for currency
/// USDCXLM (Stellar) — a clear mismatch/copy-paste error we're not
/// replicating. Instead this defaults to a safe self-send: the account's
/// own verified deposit address (fetched via crypto_deposit_address in an
/// earlier session — GCK2MUVH6TABTXT4247CIEC5EO24CQQ4MZNW7EGBTP3TPGALLQI7P34G,
/// tag 600649313), send_to_self=true, a tiny default amount, and refuses to
/// run outside PDAX_ENVIRONMENT=uat.
///
/// Run with: cargo run --example pdax_crypto_withdraw [amount] [currency]
/// Defaults: amount=0.1, currency=USDCXLM
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let amount = args.get(1).map(String::as_str).unwrap_or("0.1");
    let currency = args.get(2).map(String::as_str).unwrap_or("USDCXLM");

    if config.pdax_username.is_empty() {
        eprintln!("PDAX_USERNAME is not set in .env — nothing to test.");
        std::process::exit(1);
    }

    println!(
        "⚠ This will attempt to send {} {} out of PDAX_ENVIRONMENT={} on-chain — typically IRREVERSIBLE once broadcast.",
        amount, currency, config.pdax_environment
    );
    println!("Destination: the account's own verified deposit address (self-send), not an external party.");
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

    let request = CryptoWithdrawRequest {
        identifier: Uuid::new_v4().to_string(),
        currency: currency.to_string(),
        address: "GCK2MUVH6TABTXT4247CIEC5EO24CQQ4MZNW7EGBTP3TPGALLQI7P34G".to_string(),
        amount: amount.to_string(),
        tag: Some("600649313".to_string()),
        beneficiary_first_name: None,
        beneficiary_last_name: None,
        beneficiary_exchange: None,
        send_to_self: Some("true".to_string()),
        beneficiary_wallet: Some("true".to_string()),
    };

    println!("Submitting crypto withdrawal (identifier={})...\n", request.identifier);

    match client.crypto_withdraw(&request).await {
        Ok(response) => {
            println!("{}", serde_json::to_string_pretty(&response).expect("Value always serializes"));
        }
        Err(e) => {
            eprintln!("Crypto withdraw request failed: {}", e);
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
