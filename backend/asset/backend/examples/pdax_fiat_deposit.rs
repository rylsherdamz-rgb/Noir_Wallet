use noir_backend::config::Config;
use noir_backend::pdax::{FiatDepositRequest, PdaxClient, PdaxLoginOutcome};
use uuid::Uuid;

#[path = "common/pdax_env_cache.rs"]
mod pdax_env_cache;

/// Manual smoke test for POST /pdax-institution/v1/fiat/deposit. **This
/// submits real sender/beneficiary KYC data and registers an actual deposit
/// transaction** — unlike the other PDAX example CLIs, it is NOT a read-only
/// lookup. Uses PDAX's own documented sample sender/beneficiary (fictional
/// names from their docs) as defaults; refuses to run outside
/// PDAX_ENVIRONMENT=uat.
///
/// Run with: cargo run --example pdax_fiat_deposit [amount]
/// Defaults to amount=48000 (PDAX's sample), method=instapay_upay_cashin.
#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Config::from_env().expect("Failed to load configuration");

    let args: Vec<String> = std::env::args().collect();
    let amount = args.get(1).map(String::as_str).unwrap_or("48000");

    if config.pdax_username.is_empty() {
        eprintln!("PDAX_USERNAME is not set in .env — nothing to test.");
        std::process::exit(1);
    }

    println!(
        "⚠ This will register a REAL fiat deposit on PDAX_ENVIRONMENT={} — amount={} PHP.",
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

    // PDAX's own documented sample sender/beneficiary — fictional data from their docs.
    let request = FiatDepositRequest {
        amount: amount.to_string(),
        method: "instapay_upay_cashin".to_string(),
        identifier: Uuid::new_v4().to_string(),
        sender_first_name: "John".to_string(),
        sender_middle_name: "Doe".to_string(),
        sender_last_name: "Smith".to_string(),
        sender_country_origin: "Philippines".to_string(),
        sender_address_line_one: Some("123 Elm Street".to_string()),
        sender_address_line_two: Some("Ortigas Center".to_string()),
        sender_city: Some("Pasig City".to_string()),
        sender_province: Some("Metro Manila".to_string()),
        sender_country: Some("Philippines".to_string()),
        sender_zip_code: Some("1001".to_string()),
        sender_phone_number: Some("6391712345678".to_string()),
        sender_nationality: Some("Philippines".to_string()),
        sender_national_identity_number: Some("12FKEMT840F".to_string()),
        sender_dob: Some("12-29-1990".to_string()),
        sender_place_of_birth: Some("Quezon City".to_string()),
        source_of_funds: "Others: Sample".to_string(),
        sender_email: Some("johndoesmith@gmail.com".to_string()),
        beneficiary_first_name: "Steve".to_string(),
        beneficiary_middle_name: "Mario".to_string(),
        beneficiary_last_name: "De La Cruz".to_string(),
        beneficiary_sex: Some("Male".to_string()),
        beneficiary_nationality: Some("Philippines".to_string()),
        beneficiary_dob: Some("04-30-1991".to_string()),
        beneficiary_address_line_one: Some("567 32nd Street".to_string()),
        beneficiary_address_line_two: Some("Bonifacio Global City".to_string()),
        beneficiary_barangay: Some("Barangay Culiat".to_string()),
        beneficiary_city: Some("Taguig".to_string()),
        beneficiary_province: Some("Metro Manila".to_string()),
        beneficiary_country: Some("Philippines".to_string()),
        beneficiary_zip_code: Some("2002".to_string()),
        beneficiary_government_issued_id: Some("ID123".to_string()),
        beneficiary_phone_number: Some("6390812345678".to_string()),
        purpose: "Family Support".to_string(),
        relationship_of_sender_to_beneficiary: "Myself".to_string(),
        currency: "PHP".to_string(),
        nature_of_business: Some("Allowances".to_string()),
    };

    println!(
        "Submitting fiat deposit (identifier={})...\n",
        request.identifier
    );

    match client.fiat_deposit(&request).await {
        Ok(response) => {
            println!(
                "{}",
                serde_json::to_string_pretty(&response).expect("Value always serializes")
            );
        }
        Err(e) => {
            eprintln!("Fiat deposit request failed: {}", e);
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
