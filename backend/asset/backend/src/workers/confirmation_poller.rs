use crate::db::DeviceRepository;
use crate::errors::Result;
use crate::stellar::StellarClient;
use chrono::Utc;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

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
        let submitted_txs = self.db.get_submitted_payment_transactions().await?;

        for mut tx in submitted_txs {
            if let Some(ref tx_hash) = tx.stellar_tx_hash {
                match self.stellar.get_transaction_status(tx_hash).await {
                    Ok(status) => {
                        if status == "confirmed" {
                            self.db
                                .update_transaction_status(&tx.transaction_id, "confirmed", None)
                                .await?;

                            self.db
                                .update_transaction_confirmed_time(&tx.transaction_id, Utc::now())
                                .await?;

                            log::info!(
                                "Transaction {} confirmed on Stellar",
                                tx.transaction_id
                            );
                        } else if status == "failed" {
                            self.db
                                .update_transaction_status(
                                    &tx.transaction_id,
                                    "failed",
                                    Some("Transaction failed on Stellar".to_string()),
                                )
                                .await?;

                            log::warn!(
                                "Transaction {} failed on Stellar",
                                tx.transaction_id
                            );
                        }
                    }
                    Err(e) => {
                        log::debug!(
                            "Error checking status for {}: {}",
                            tx.transaction_id, e
                        );
                    }
                }
            }
        }

        Ok(())
    }
}
