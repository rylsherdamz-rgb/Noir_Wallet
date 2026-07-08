use noir_backend::config::Config;
use noir_backend::pdax::{FiatWithdrawRequest, PdaxClient, PdaxLoginOutcome};
use uuid::Uuid;

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for POST /pdax-institution/v1/fiat/withdraw. **This
/// sends real money out of the PDAX account to a beneficiary bank
/// account** — higher-stakes than pdax_fiat_deposit, which only registers
/// an incoming transfer. Uses PDAX's own documented sample sender/
/// beneficiary (fictional names + bank code from their docs) as defaults;
/// refuses to run outside PDAX_ENVIRONMENT=uat.
///
/// Run with: cargo run --example pdax_fiat_withdraw [amount]
/// Defaults to amount=55000 (PDAX's sample), method=PAY-TO-ACCOUNT-NON-REAL-TIME.
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let amount = args.get(1).map(String::as_str).unwrap_or("55000");

    if config.pdax_username.is_empty() {
        eprintln!("PDAX_USERNAME is not set in .env — nothing to test.");
        std::process::exit(1);
    }

    println!(
        "⚠ This will send REAL money out of PDAX_ENVIRONMENT={} to a beneficiary bank account — amount={} PHP.",
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

    // PDAX's own documented sample sender/beneficiary — fictional data from their docs.
    let request = FiatWithdrawRequest {
        identifier: Uuid::new_v4().to_string(),
        sender_first_name: "John".to_string(),
        sender_middle_name: "Doe".to_string(),
        sender_last_name: "Smith".to_string(),
        sender_country_origin: "United States".to_string(),
        sender_address_line_one: Some("123 Main Street".to_string()),
        sender_address_line_two: Some("Apt 4B".to_string()),
        sender_city: Some("New York".to_string()),
        sender_province: Some("New York".to_string()),
        sender_country: Some("United States".to_string()),
        sender_zip_code: Some("10001".to_string()),
        // PDAX rejects "+1 (555) 123-4567" (their own doc's sample value) with
        // "sender_phone_number is not valid, accept numeric only, no + symbol
        // allowed or special characters" — stripped to digits only.
        sender_phone_number: Some("15551234567".to_string()),
        sender_nationality: Some("United States".to_string()),
        sender_national_identity_number: Some("123456789".to_string()),
        // Doc's sample used ISO format ("1980-01-01"), but PDAX requires mm-dd-yyyy
        // (matches the schema table, contradicts the doc's own sample curl).
        sender_dob: Some("01-01-1980".to_string()),
        sender_place_of_birth: Some("New York".to_string()),
        // "Employment" (the doc's sample) isn't in PDAX's accepted list — real
        // options are: Compensation, Sale/Income from Property, Business Income,
        // Pension/Benefit from the Government, Gift/Donation, Sale/Income from
        // Investment, Inheritance/Insurance, Others: <Free Text>.
        source_of_funds: "Compensation".to_string(),
        sender_email: Some("johndoe@example.com".to_string()),
        fee_type: "Sender".to_string(),
        beneficiary_first_name: "John".to_string(),
        beneficiary_middle_name: "Mario".to_string(),
        beneficiary_last_name: "De La Cruz".to_string(),
        beneficiary_sex: Some("Female".to_string()),
        // Doc's sample used "Filipino" (a demonym) — PDAX's accepted values are
        // country names, e.g. "Philippines".
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
        // Doc's sample used "Family support" (lowercase s) — PDAX's accepted
        // values are case-sensitive ("Family Support").
        purpose: "Family Support".to_string(),
        relationship_of_sender_to_beneficiary: "Family".to_string(),
        currency: "PHP".to_string(),
        amount: amount.to_string(),
        nature_of_business: None,
        method: "PAY-TO-ACCOUNT-NON-REAL-TIME".to_string(),
        instructions: Some("instructions".to_string()),
    };

    println!("Submitting fiat withdrawal (identifier={})...\n", request.identifier);

    match client.fiat_withdraw(&request).await {
        Ok(response) => {
            println!("{}", serde_json::to_string_pretty(&response).expect("Value always serializes"));
        }
        Err(e) => {
            eprintln!("Fiat withdraw request failed: {}", e);
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
