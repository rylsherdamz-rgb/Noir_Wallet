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

/// Processes pending payments in the non-custodial fee-bump model:
///   1. The client submitted a user-signed inner transaction (stored as
///      `signed_envelope_xdr`).
///   2. This worker wraps it in a fee-bump signed by the channel key and
///      submits the fee-bump to Horizon.
pub struct SubmissionProcessor {
    db: Arc<DeviceRepository>,
    stellar: Arc<StellarClient>,
    channel_manager: Arc<ChannelManager>,
    builder: TransactionBuilder,
    channel_signer: Option<TransactionSigner>,
    channel_address: Option<String>,
    process_interval: Duration,
}

impl SubmissionProcessor {
    pub fn new(
        db: Arc<DeviceRepository>,
        stellar: Arc<StellarClient>,
        channel_manager: Arc<ChannelManager>,
        network: String,
        process_interval_secs: u64,
        channel_secret_key: String,
    ) -> Self {
        // Build the channel signer once. If the key is missing/invalid we log
        // and leave it None; pending payments will fail with a clear message
        // rather than silently producing invalid transactions.
        let (channel_signer, channel_address) = if channel_secret_key.trim().is_empty() {
            log::warn!("CHANNEL_SECRET_KEY not set — payment submission is disabled");
            (None, None)
        } else {
            match TransactionSigner::from_secret(channel_secret_key.trim()) {
                Ok(s) => {
                    let addr = s.public_strkey();
                    log::info!("Fee channel signer loaded: {addr}");
                    (Some(s), Some(addr))
                }
                Err(e) => {
                    log::error!("Invalid CHANNEL_SECRET_KEY: {e}");
                    (None, None)
                }
            }
        };

        SubmissionProcessor {
            db,
            stellar,
            channel_manager,
            builder: TransactionBuilder::new(network),
            channel_signer,
            channel_address,
            process_interval: Duration::from_secs(process_interval_secs),
        }
    }

    pub async fn run(&self) {
        loop {
            if let Err(e) = self.process_pending_transactions().await {
                log::error!("Error processing pending transactions: {e}");
            }
            sleep(self.process_interval).await;
        }
    }

    async fn process_pending_transactions(&self) -> Result<()> {
        let pending_txs = self.db.get_pending_payment_transactions().await?;

        for mut tx in pending_txs {
            if let Err(e) = self.process_transaction(&mut tx).await {
                log::error!("Error processing transaction {}: {e}", tx.transaction_id);
                self.db
                    .update_transaction_status(&tx.transaction_id, "failed", Some(e.to_string()))
                    .await
                    .ok();
            }
        }

        Ok(())
    }

    async fn process_transaction(&self, tx: &mut crate::models::PaymentTransaction) -> Result<()> {
        let channel_signer = self.channel_signer.as_ref().ok_or_else(|| {
            PaymentError::ConfigError("No fee channel key configured".to_string())
        })?;
        let channel_address = self
            .channel_address
            .clone()
            .unwrap_or_else(|| channel_signer.public_strkey());

        // The user-signed inner transaction must be present (non-custodial).
        let signed_inner = self
            .db
            .get_signed_envelope(&tx.transaction_id)
            .await?
            .ok_or_else(|| {
                PaymentError::InvalidPayload("No user-signed envelope stored".to_string())
            })?;

        // Wrap in a channel-signed fee-bump.
        let fee_bump_xdr = self.builder.build_fee_bump(&signed_inner, channel_signer)?;

        // Submit to Horizon.
        let tx_hash = self.stellar.submit_transaction(&fee_bump_xdr).await?;

        self.db
            .update_transaction_status(&tx.transaction_id, "submitted", None)
            .await?;
        self.db
            .update_transaction_hash(&tx.transaction_id, &tx_hash)
            .await?;
        self.db
            .update_transaction_submitted_time(&tx.transaction_id, Utc::now())
            .await?;
        self.db
            .update_transaction_channel(&tx.transaction_id, &channel_address)
            .await?;

        // Best-effort fee accounting against the channel row (if it exists).
        self.channel_manager
            .record_fee_usage(&channel_address, tx.fee_stroops)
            .await
            .ok();

        log::info!(
            "Submitted transaction {} via fee-bump channel {} hash {}",
            tx.transaction_id,
            channel_address,
            tx_hash
        );
        Ok(())
    }
}
