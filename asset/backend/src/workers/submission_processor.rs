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
    builder: TransactionBuilder,
    signer: Option<TransactionSigner>,
    process_interval: Duration,
}

impl SubmissionProcessor {
    pub fn new(
        db: Arc<DeviceRepository>,
        stellar: Arc<StellarClient>,
        network: String,
        fee_channel_secret: Option<String>,
        process_interval_secs: u64,
    ) -> Result<Self> {
        let signer = if let Some(secret) = fee_channel_secret {
            Some(TransactionSigner::new(secret)?)
        } else {
            None
        };

        Ok(SubmissionProcessor {
            db,
            stellar,
            builder: TransactionBuilder::new(network),
            signer,
            process_interval: Duration::from_secs(process_interval_secs),
        })
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
        let sequence = self.stellar.get_account_sequence(&self.stellar.master_account).await?;

        let envelope_xdr = self.builder.build_payment_envelope(
            &self.stellar.master_account,
            &tx.destination_wallet,
            tx.amount_stroops,
            sequence,
            None,
            "",
        )?;

        if let Some(ref signer) = self.signer {
            let _signed = signer.sign_transaction_envelope(&envelope_xdr)?;
        }

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

        log::info!("Submitted transaction {} with hash {}", tx.transaction_id, tx_hash);

        Ok(())
    }
}
