use crate::cache::TransactionCache;
use crate::db::DeviceRepository;
use crate::fees::FeeChannelManager;
use crate::metrics::MetricsCollector;
use crate::pdax::PdaxClient;
use crate::rate_limiter::RateLimiter;
use crate::stellar::StellarClient;
use crate::validation::DeviceValidator;
use sqlx::PgPool;
use std::sync::Arc;

pub struct AppState {
    pub db_pool: PgPool,
    pub db: Arc<DeviceRepository>,
    pub stellar_client: Arc<StellarClient>,
    pub pdax_client: Arc<PdaxClient>,
    pub validator: Arc<DeviceValidator>,
    pub fee_manager: Arc<FeeChannelManager>,
    pub metrics: Arc<MetricsCollector>,
    pub tx_cache: TransactionCache,
    pub rate_limiter: Arc<RateLimiter>,
    pub api_key: String,
}

impl AppState {
    pub fn new(
        db_pool: PgPool,
        stellar_client: StellarClient,
        pdax_client: PdaxClient,
        fee_channels: Vec<String>,
        api_key: String,
    ) -> Self {
        let db = Arc::new(DeviceRepository::new(db_pool.clone()));
        let validator = Arc::new(DeviceValidator::new(db.clone()));

        AppState {
            db_pool,
            db,
            stellar_client: Arc::new(stellar_client),
            pdax_client: Arc::new(pdax_client),
            validator,
            fee_manager: Arc::new(FeeChannelManager::new(fee_channels)),
            metrics: Arc::new(MetricsCollector::new()),
            tx_cache: TransactionCache::new(300),
            rate_limiter: Arc::new(RateLimiter::new(60, 10)),
            api_key,
        }
    }
}
