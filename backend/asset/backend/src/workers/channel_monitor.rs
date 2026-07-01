use crate::channels::ChannelManager;
use crate::db::DeviceRepository;
use crate::errors::Result;
use crate::stellar::StellarClient;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;

pub struct ChannelMonitor {
    channel_manager: Arc<ChannelManager>,
    db: Arc<DeviceRepository>,
    stellar: Arc<StellarClient>,
    check_interval: Duration,
    min_balance_stroops: i64,
    topup_target_stroops: i64,
}

impl ChannelMonitor {
    pub fn new(
        channel_manager: Arc<ChannelManager>,
        db: Arc<DeviceRepository>,
        stellar: Arc<StellarClient>,
        check_interval_secs: u64,
        min_balance_stroops: i64,
        topup_target_stroops: i64,
    ) -> Self {
        ChannelMonitor {
            channel_manager,
            db,
            stellar,
            check_interval: Duration::from_secs(check_interval_secs),
            min_balance_stroops,
            topup_target_stroops,
        }
    }

    pub async fn run(&self) {
        loop {
            if let Err(e) = self.monitor_channels().await {
                log::error!("Error monitoring channels: {}", e);
            }
            sleep(self.check_interval).await;
        }
    }

    async fn monitor_channels(&self) -> Result<()> {
        let channels = self.db.get_all_active_fee_channels().await?;

        if channels.is_empty() {
            log::warn!("No active fee channels to monitor");
            return Ok(());
        }

        for mut channel in channels {
            if let Err(e) = self.check_and_topup_channel(&mut channel).await {
                log::error!(
                    "Error checking channel {}: {}",
                    channel.channel_address, e
                );
            }
        }

        Ok(())
    }

    async fn check_and_topup_channel(&self, channel: &mut crate::models::FeeChannel) -> Result<()> {
        let network_balance = self.stellar.get_account_balance(&channel.channel_address).await?;

        log::debug!(
            "Channel {} has {} stroops (DB: {}, Min: {})",
            channel.channel_address,
            network_balance,
            channel.balance_stroops,
            self.min_balance_stroops
        );

        if network_balance < self.min_balance_stroops {
            log::info!(
                "Channel {} balance low ({} stroops), initiating topup",
                channel.channel_address, network_balance
            );

            let topup_amount = self.topup_target_stroops - network_balance;

            self.stellar
                .transfer_to_channel(&channel.channel_address, topup_amount)
                .await?;

            channel.balance_stroops = self.topup_target_stroops;

            self.db
                .update_channel_balance(&channel.channel_address, self.topup_target_stroops)
                .await?;

            log::info!(
                "Channel {} topup completed: {} stroops",
                channel.channel_address, topup_amount
            );
        } else {
            channel.balance_stroops = network_balance;
            self.db
                .update_channel_balance(&channel.channel_address, network_balance)
                .await?;
        }

        Ok(())
    }
}
