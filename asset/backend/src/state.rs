use sqlx::PgPool;
use std::sync::Arc;
use crate::db::DeviceRepository;
use crate::stellar::StellarClient;
use crate::validation::DeviceValidator;
use crate::fees::FeeChannelManager;
use crate::metrics::MetricsCollector;

pub struct AppState {
    pub db_pool: PgPool,
    pub db: Arc<DeviceRepository>,
    pub stellar_client: Arc<StellarClient>,
    pub validator: Arc<DeviceValidator>,
    pub fee_manager: Arc<FeeChannelManager>,
    pub metrics: Arc<MetricsCollector>,
}

impl AppState {
    pub fn new(
        db_pool: PgPool,
        stellar_client: StellarClient,
        fee_channels: Vec<String>,
    ) -> Self {
        let db = Arc::new(DeviceRepository::new(db_pool.clone()));
        let validator = Arc::new(DeviceValidator::new(db.clone()));

        AppState {
            db_pool,
            db,
            stellar_client: Arc::new(stellar_client),
            validator,
            fee_manager: Arc::new(FeeChannelManager::new(fee_channels)),
            metrics: Arc::new(MetricsCollector::new()),
        }
    }
}
