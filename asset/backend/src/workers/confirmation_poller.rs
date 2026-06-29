use crate::db::DeviceRepository;
use crate::errors::Result;
use crate::stellar::StellarClient;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

#[allow(dead_code)]
pub struct ConfirmationPoller {
    db: Arc<DeviceRepository>,
    stellar: Arc<StellarClient>,
    poll_interval: Duration,
}

impl ConfirmationPoller {
    pub fn new(
        db: Arc<DeviceRepository>,
        stellar: Arc<StellarClient>,
        poll_interval_secs: u64,
    ) -> Self {
        ConfirmationPoller {
            db,
            stellar,
            poll_interval: Duration::from_secs(poll_interval_secs),
        }
    }

    pub async fn run(&self) {
        loop {
            if let Err(e) = self.poll_pending_transactions().await {
                log::error!("Error polling confirmations: {}", e);
            }
            sleep(self.poll_interval).await;
        }
    }

    async fn poll_pending_transactions(&self) -> Result<()> {
        // TODO: Phase 2b - Query pending transactions and poll Stellar
        // 1. Fetch transactions with status = 'submitted'
        // 2. For each transaction, call stellar.get_transaction_status(stellar_tx_hash)
        // 3. Update database with confirmed status and timestamp
        // 4. On confirmation, mark as 'confirmed' and record settlement
        Ok(())
    }
}
