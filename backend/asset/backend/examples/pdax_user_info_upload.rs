use noir_backend::config::Config;
use noir_backend::pdax::{FiatUserInfoUploadRequest, PdaxClient, PdaxLoginOutcome};
use uuid::Uuid;

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for POST /pdax-institution/v1/fiat/user-info-upload.
/// PDAX's own doc describes this the same way as fiat/withdraw ("Withdraw
/// Fiat from your account to a beneficiary"), so treat it as having the
/// same real-money-movement risk until proven otherwise. Uses
/// sender_full_name/beneficiary_full_name per this endpoint's own field
/// table (its sample curl reuses fiat/withdraw's split-name body verbatim —
/// a doc copy-paste artifact, not trusted here). Field values below already
/// have the 5 validation fixes learned from pdax_fiat_withdraw applied
/// (numeric phone, mm-dd-yyyy dob, accepted source_of_funds/purpose values,
/// country-name nationality) — refuses to run outside PDAX_ENVIRONMENT=uat.
///
/// Run with: cargo run --example pdax_user_info_upload [amount]
/// Defaults to amount=55000 (PDAX's sample), method=PAY-TO-ACCOUNT-NON-REAL-TIME.
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let amount: f64 = args
        .get(1)
        .map(|s| s.parse().unwrap_or_else(|_| {
            eprintln!("amount must be a number, got: {}", s);
            std::process::exit(1);
        }))
        .unwrap_or(55000.0);

    if config.pdax_username.is_empty() {
        eprintln!("PDAX_USERNAME is not set in .env — nothing to test.");
        std::process::exit(1);
    }

    println!(
        "⚠ This may send REAL money out of PDAX_ENVIRONMENT={} to a beneficiary bank account — amount={} PHP.",
        config.pdax_environment, amount
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

    let request = FiatUserInfoUploadRequest {
        identifier: Uuid::new_v4().to_string(),
        sender_full_name: "John Doe Smith".to_string(),
        sender_country_origin: "United States".to_string(),
        sender_address_line_one: Some("123 Main Street".to_string()),
        sender_address_line_two: Some("Apt 4B".to_string()),
        sender_city: Some("New York".to_string()),
        sender_province: Some("New York".to_string()),
        sender_country: Some("United States".to_string()),
        sender_zip_code: Some("10001".to_string()),
        sender_phone_number: Some("15551234567".to_string()),
        sender_nationality: Some("United States".to_string()),
        sender_national_identity_number: Some("123456789".to_string()),
        sender_dob: Some("01-01-1980".to_string()),
        sender_place_of_birth: Some("New York".to_string()),
        source_of_funds: "Compensation".to_string(),
        sender_email: Some("johndoe@example.com".to_string()),
        fee_type: "Sender".to_string(),
        beneficiary_full_name: "John Mario De La Cruz".to_string(),
        beneficiary_sex: Some("Female".to_string()),
        beneficiary_nationality: Some("Philippines".to_string()),
        beneficiary_dob: None,
        beneficiary_bank_code: "BAUBPPH".to_string(),
        beneficiary_account_name: "Jane Smith".to_string(),
        beneficiary_account_number: "09190690982".to_string(),
        beneficiary_address_line_one: Some("456 Elm Street".to_string()),
        beneficiary_address_line_two: Some("Unit 2C".to_string()),
        beneficiary_barangay: Some("Poblacion".to_string()),
        beneficiary_city: Some("Manila".to_string()),
        beneficiary_province: Some("Metro Manila".to_string()),
        beneficiary_country: Some("Philippines".to_string()),
        beneficiary_zip_code: Some("1632".to_string()),
        beneficiary_government_issued_id: Some("ID123".to_string()),
        beneficiary_phone_number: Some("63987654321".to_string()),
        purpose: "Family Support".to_string(),
        relationship_of_sender_to_beneficiary: "Family".to_string(),
        currency: "PHP".to_string(),
        amount,
        method: "PAY-TO-ACCOUNT-NON-REAL-TIME".to_string(),
        instructions: Some("instructions".to_string()),
    };

    println!("Submitting fiat user-info-upload (identifier={})...\n", request.identifier);

    match client.fiat_user_info_upload(&request).await {
        Ok(response) => {
            println!("{}", serde_json::to_string_pretty(&response).expect("Value always serializes"));
        }
        Err(e) => {
            eprintln!("Fiat user-info-upload request failed: {}", e);
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
