use std::fs;
use std::path::PathBuf;

/// Shared by pdax_login.rs / pdax_refresh_token.rs to persist the PDAX
/// session (access/refresh token + expiry) into the crate's local `.env`,
/// since the access token expires every 600s and re-running `login` every
/// 10 minutes isn't the intended flow — `refresh` picks up from here.
fn env_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(".env")
}

/// Replaces the value of each `KEY=` line that already exists in `.env`;
/// keys not found are left untouched (this crate's `.env` always ships all
/// three PDAX_* cache keys as blank placeholders already).
pub fn save_session(access_token: &str, refresh_token: &str, expires_at: &str) {
    let path = env_path();
    let contents = fs::read_to_string(&path).unwrap_or_default();

    let updates: [(&str, &str); 3] = [
        ("PDAX_ACCESS_TOKEN", access_token),
        ("PDAX_REFRESH_TOKEN", refresh_token),
        ("PDAX_TOKEN_EXPIRES_AT", expires_at),
    ];

    let mut lines: Vec<String> = contents.lines().map(|l| l.to_string()).collect();
    for (key, value) in updates {
        let new_line = format!("{}={}", key, value);
        match lines.iter().position(|l| l.starts_with(&format!("{}=", key))) {
            Some(i) => lines[i] = new_line,
            None => lines.push(new_line),
        }
    }

    fs::write(&path, lines.join("\n") + "\n").expect("Failed to write .env session cache");
    println!("Saved session to {} (PDAX_ACCESS_TOKEN / PDAX_REFRESH_TOKEN / PDAX_TOKEN_EXPIRES_AT).", path.display());
}
