use crate::db::DeviceRepository;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

/// Keeps `transaction_notifications` ephemeral by sweeping expired rows on
/// an interval — without this, the table backing real-time UI notifications
/// would grow unbounded under tap load.
pub struct NotificationPruner {
    db: Arc<DeviceRepository>,
    prune_interval: Duration,
}

impl NotificationPruner {
    pub fn new(db: Arc<DeviceRepository>, prune_interval_secs: u64) -> Self {
        NotificationPruner {
            db,
            prune_interval: Duration::from_secs(prune_interval_secs),
        }
    }

    pub async fn run(&self) {
        loop {
            match self.db.prune_expired_notifications().await {
                Ok(count) if count > 0 => {
                    log::debug!("Pruned {} expired transaction notifications", count);
                }
                Ok(_) => {}
                Err(e) => log::error!("Error pruning transaction notifications: {}", e),
            }
            sleep(self.prune_interval).await;
        }
    }
}
