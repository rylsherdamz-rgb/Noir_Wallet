use crate::channels::ChannelManager;
use crate::db::DeviceRepository;
use crate::errors::{PaymentError, Result};
use crate::stellar::StellarClient;
use crate::transaction_builder::TransactionBuilder;
use crate::transaction_signer::TransactionSigner;
use chrono::Utc;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

const MAX_CHANNEL_RETRIES: usize = 3;

pub struct SubmissionProcessor {
    db: Arc<DeviceRepository>,
    stellar: Arc<StellarClient>,
    channel_manager: Arc<ChannelManager>,
    builder: TransactionBuilder,
    signer: Option<TransactionSigner>,
    process_interval: Duration,
}

impl SubmissionProcessor {
    pub fn new(
        db: Arc<DeviceRepository>,
        stellar: Arc<StellarClient>,
        channel_manager: Arc<ChannelManager>,
        network: String,
        process_interval_secs: u64,
    ) -> Self {
        SubmissionProcessor {
            db,
            stellar,
            channel_manager,
            builder: TransactionBuilder::new(network),
            signer: None,
            process_interval: Duration::from_secs(process_interval_secs),
        }
    }

    pub async fn run(&self) {
        loop {
            if let Err(e) = self.process_pending_transactions().await {
                log::error!("Error processing pending transactions: {}", e);
            }
            sleep(self.process_interval).await;
        }
    }

    async fn process_pending_transactions(&self) -> Result<()> {
        let pending_txs = self.db.get_pending_payment_transactions().await?;

        for mut tx in pending_txs {
            if let Err(e) = self.process_transaction(&mut tx).await {
                log::error!(
                    "Error processing transaction {}: {}",
                    tx.transaction_id, e
                );
                self.db
                    .update_transaction_status(
                        &tx.transaction_id,
                        "failed",
                        Some(e.to_string()),
                    )
                    .await
                    .ok();
            }
        }

        Ok(())
    }

    async fn process_transaction(&self, tx: &mut crate::models::PaymentTransaction) -> Result<()> {
        let fee_stroops = tx.fee_stroops;
        let mut last_error: Option<PaymentError> = None;

        for attempt in 0..MAX_CHANNEL_RETRIES {
            let channel = match self.channel_manager.get_channel_for_amount(fee_stroops).await {
                Ok(ch) => ch,
                Err(e) => {
                    log::warn!("No suitable channel on attempt {}: {}", attempt + 1, e);
                    last_error = Some(e);
                    break;
                }
            };

            let sequence = match self.stellar.get_account_sequence(&channel.channel_address).await {
                Ok(seq) => seq,
                Err(e) => {
                    log::warn!("Failed to get sequence for channel {} on attempt {}: {}", channel.channel_address, attempt + 1, e);
                    last_error = Some(e);
                    continue;
                }
            };

            let envelope_xdr = match self.builder.build_payment_envelope(
                &channel.channel_address,
                &tx.destination_wallet,
                tx.amount_stroops,
                sequence,
                None,
                "",
            ) {
                Ok(xdr) => xdr,
                Err(e) => {
                    last_error = Some(e);
                    break;
                }
            };

            match self.stellar.submit_transaction(&envelope_xdr).await {
                Ok(tx_hash) => {
                    self.db.update_transaction_status(&tx.transaction_id, "submitted", None).await?;
                    self.db.update_transaction_hash(&tx.transaction_id, &tx_hash).await?;
                    self.db.update_transaction_submitted_time(&tx.transaction_id, Utc::now()).await?;
                    self.db.update_transaction_channel(&tx.transaction_id, &channel.channel_address).await?;
                    self.channel_manager.record_fee_usage(&channel.channel_address, fee_stroops).await?;

                    if attempt > 0 {
                        log::info!(
                            "Submitted transaction {} via fallback channel {} (attempt {}) hash {}",
                            tx.transaction_id, channel.channel_address, attempt + 1, tx_hash
                        );
                    } else {
                        log::info!(
                            "Submitted transaction {} via channel {} hash {}",
                            tx.transaction_id, channel.channel_address, tx_hash
                        );
                    }
                    return Ok(());
                }
                Err(e) => {
                    log::warn!(
                        "Submission failed for transaction {} on channel {} attempt {}: {}",
                        tx.transaction_id, channel.channel_address, attempt + 1, e
                    );
                    last_error = Some(e);
                }
            }
        }

        Err(last_error.unwrap_or(PaymentError::SubmissionFailed("All channels exhausted".to_string())))
    }
}
