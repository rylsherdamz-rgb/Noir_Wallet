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
}

impl ChannelManager {
    pub fn new(db: Arc<DeviceRepository>, stellar: Arc<StellarClient>, min_balance_stroops: i64) -> Self {
        ChannelManager {
            db,
            stellar,
            min_balance_stroops,
        }
    }

    pub async fn select_channel(&self) -> Result<FeeChannel> {
        self.db.get_available_fee_channel().await
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

    pub async fn record_fee_usage(&self, channel: &FeeChannel, fee_stroops: i64) -> Result<()> {
        let new_balance = channel.balance_stroops - fee_stroops;
        self.db.update_channel_balance(&channel.channel_address, new_balance).await?;
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
}

#[derive(Debug, Clone)]
pub struct ChannelStatus {
    pub address: String,
    pub db_balance: i64,
    pub network_balance: i64,
    pub in_sync: bool,
    pub last_checked: chrono::DateTime<Utc>,
}
