use crate::channel_selector::{ChannelSelector, SelectionStrategy};
use crate::db::DeviceRepository;
use crate::errors::Result;
use crate::models::FeeChannel;
use crate::stellar::StellarClient;
use chrono::Utc;
use std::sync::Arc;

#[derive(Clone)]
pub struct ChannelManager {
    db: Arc<DeviceRepository>,
    stellar: Arc<StellarClient>,
    min_balance_stroops: i64,
    selector: Arc<ChannelSelector>,
}

impl ChannelManager {
    pub fn new(db: Arc<DeviceRepository>, stellar: Arc<StellarClient>, min_balance_stroops: i64) -> Self {
        ChannelManager {
            db,
            stellar,
            min_balance_stroops,
            selector: Arc::new(ChannelSelector::new(SelectionStrategy::HighestBalance)),
        }
    }

    pub fn with_strategy(
        db: Arc<DeviceRepository>,
        stellar: Arc<StellarClient>,
        min_balance_stroops: i64,
        strategy: SelectionStrategy,
    ) -> Self {
        ChannelManager {
            db,
            stellar,
            min_balance_stroops,
            selector: Arc::new(ChannelSelector::new(strategy)),
        }
    }

    pub async fn select_channel(&self) -> Result<FeeChannel> {
        let channels = self.db.get_all_active_fee_channels().await?;
        let selected = self.selector.select_channel(&channels)?;
        Ok(selected.clone())
    }

    pub async fn get_channel_for_amount(&self, amount_stroops: i64) -> Result<FeeChannel> {
        let channels = self.db.get_all_active_fee_channels().await?;

        let suitable_channels: Vec<FeeChannel> = channels
            .into_iter()
            .filter(|ch| ch.balance_stroops > amount_stroops + self.min_balance_stroops)
            .collect();

        if suitable_channels.is_empty() {
            return Err(crate::errors::PaymentError::InsufficientFunds);
        }

        let selected = self.selector.select_channel(&suitable_channels)?;
        Ok(selected.clone())
    }

    pub async fn check_and_topup_channel(&self, channel: &FeeChannel) -> Result<()> {
        let current_balance = self.stellar
            .get_account_balance(&channel.channel_address)
            .await?;

        if current_balance < self.min_balance_stroops {
            let topup_amount = (10_000_000 - current_balance).max(1_000_000);
            self.stellar
                .transfer_to_channel(&channel.channel_address, topup_amount)
                .await?;

            self.db.update_channel_balance(&channel.channel_address, topup_amount + current_balance)
                .await?;
        }

        Ok(())
    }

    pub async fn record_fee_usage(&self, channel_address: &str, fee_stroops: i64) -> Result<()> {
        self.db.record_channel_fee_usage(channel_address, fee_stroops).await?;
        Ok(())
    }

    pub async fn get_channel_status(&self, channel_address: &str) -> Result<ChannelStatus> {
        let channel = self.db.get_channel_by_address(channel_address).await?;
        let balance = self.stellar.get_account_balance(channel_address).await?;

        Ok(ChannelStatus {
            address: channel_address.to_string(),
            db_balance: channel.balance_stroops,
            network_balance: balance,
            in_sync: (channel.balance_stroops - balance).abs() < 1000,
            last_checked: Utc::now(),
        })
    }

    pub async fn get_all_channel_statuses(&self) -> Result<Vec<ChannelStatus>> {
        let channels = self.db.get_all_active_fee_channels().await?;
        let mut statuses = Vec::new();

        for channel in channels {
            if let Ok(status) = self.get_channel_status(&channel.channel_address).await {
                statuses.push(status);
            }
        }

        Ok(statuses)
    }

    pub async fn mark_channel_inactive(&self, channel_address: &str) -> Result<()> {
        self.db.update_fee_channel_status(channel_address, "inactive").await?;
        log::warn!("Marked channel {} as inactive", channel_address);
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct ChannelStatus {
    pub address: String,
    pub db_balance: i64,
    pub network_balance: i64,
    pub in_sync: bool,
    pub last_checked: chrono::DateTime<Utc>,
}
