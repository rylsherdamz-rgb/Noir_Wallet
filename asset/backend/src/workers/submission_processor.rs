use crate::channels::ChannelManager;
use crate::db::DeviceRepository;
use crate::errors::Result;
use crate::stellar::StellarClient;
use crate::transaction_builder::TransactionBuilder;
use crate::transaction_signer::TransactionSigner;
use chrono::Utc;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

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

        let channel = self.channel_manager
            .get_channel_for_amount(fee_stroops)
            .await?;

        let sequence = self.stellar.get_account_sequence(&channel.channel_address).await?;

        let envelope_xdr = self.builder.build_payment_envelope(
            &channel.channel_address,
            &tx.destination_wallet,
            tx.amount_stroops,
            sequence,
            None,
            "",
        )?;

        let tx_hash = self.stellar.submit_transaction(&envelope_xdr).await?;

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
            .update_transaction_channel(&tx.transaction_id, &channel.channel_address)
            .await?;

        self.channel_manager
            .record_fee_usage(&channel.channel_address, fee_stroops)
            .await?;

        log::info!(
            "Submitted transaction {} via channel {} with hash {}",
            tx.transaction_id, channel.channel_address, tx_hash
        );

        Ok(())
    }
}
