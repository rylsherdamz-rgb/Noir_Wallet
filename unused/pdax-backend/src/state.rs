use crate::db::Repository;
use crate::metrics::MetricsCollector;
use crate::pdax::PdaxClient;
use crate::rate_limiter::RateLimiter;
use sqlx::PgPool;
use std::sync::Arc;

/// Shared state for the PDAX bridge.
///
/// Notably absent: any Stellar client, any signing key, any key manager. The
/// backend no longer builds, signs, or submits transactions, and holds no
/// wallet secrets — those moved on-chain with the payment path.
pub struct AppState {
    pub db: Arc<Repository>,
    pub pdax_client: Arc<PdaxClient>,
    pub metrics: Arc<MetricsCollector>,
    pub rate_limiter: Arc<RateLimiter>,
    /// HMAC secret for verifying PDAX settlement webhooks. Read from config at
    /// startup rather than from the environment per request.
    pub pdax_webhook_secret: String,
    /// How long an issued session stays valid.
    pub session_ttl_secs: i64,
    /// How long an auth challenge stays claimable.
    pub challenge_ttl_secs: i64,
}

impl AppState {
    pub fn new(
        db_pool: PgPool,
        pdax_client: PdaxClient,
        rate_limiter: RateLimiter,
        pdax_webhook_secret: String,
        session_ttl_secs: i64,
        challenge_ttl_secs: i64,
    ) -> Self {
        let db = Arc::new(Repository::new(db_pool));

        AppState {
            db,
            pdax_client: Arc::new(pdax_client),
            metrics: Arc::new(MetricsCollector::new()),
            rate_limiter: Arc::new(rate_limiter),
            pdax_webhook_secret,
            session_ttl_secs,
            challenge_ttl_secs,
        }
    }
}
