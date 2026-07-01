use crate::errors::{PaymentError, Result};
use crate::models::FeeChannel;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

pub enum SelectionStrategy {
    HighestBalance,
    RoundRobin,
    LeastUsed,
}

pub struct ChannelSelector {
    strategy: SelectionStrategy,
    round_robin_index: Arc<AtomicUsize>,
}

impl ChannelSelector {
    pub fn new(strategy: SelectionStrategy) -> Self {
        ChannelSelector {
            strategy,
            round_robin_index: Arc::new(AtomicUsize::new(0)),
        }
    }

    pub fn select_channel(&self, channels: &[FeeChannel]) -> Result<FeeChannel> {
        if channels.is_empty() {
            return Err(PaymentError::ConfigError(
                "No active fee channels available".to_string(),
            ));
        }

        match self.strategy {
            SelectionStrategy::HighestBalance => self.select_highest_balance(channels),
            SelectionStrategy::RoundRobin => self.select_round_robin(channels),
            SelectionStrategy::LeastUsed => self.select_highest_balance(channels),
        }
    }

    fn select_highest_balance(&self, channels: &[FeeChannel]) -> Result<FeeChannel> {
        channels
            .iter()
            .max_by_key(|ch| ch.balance_stroops)
            .cloned()
            .ok_or_else(|| PaymentError::ConfigError("No channels available".to_string()))
    }

    fn select_round_robin(&self, channels: &[FeeChannel]) -> Result<FeeChannel> {
        let idx = self.round_robin_index.fetch_add(1, Ordering::Relaxed);
        Ok(channels[idx % channels.len()].clone())
    }
}

impl Default for ChannelSelector {
    fn default() -> Self {
        ChannelSelector::new(SelectionStrategy::HighestBalance)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn create_test_channel(address: &str, balance: i64) -> FeeChannel {
        FeeChannel {
            id: 1,
            channel_address: address.to_string(),
            balance_stroops: balance,
            last_balance_check: Utc::now(),
            status: "active".to_string(),
            created_at: Utc::now(),
        }
    }

    #[test]
    fn test_select_channel_requires_channels() {
        let selector = ChannelSelector::default();
        let result = selector.select_channel(&[]);
        assert!(result.is_err());
    }

    #[test]
    fn test_select_highest_balance() {
        let selector = ChannelSelector::new(SelectionStrategy::HighestBalance);
        let channels = vec![
            create_test_channel("CH1", 1_000_000),
            create_test_channel("CH2", 5_000_000),
            create_test_channel("CH3", 2_000_000),
        ];

        let selected = selector.select_channel(&channels).unwrap();
        assert_eq!(selected.channel_address, "CH2");
        assert_eq!(selected.balance_stroops, 5_000_000);
    }

    #[test]
    fn test_round_robin_selection() {
        let selector = ChannelSelector::new(SelectionStrategy::RoundRobin);
        let channels = vec![
            create_test_channel("CH1", 1_000_000),
            create_test_channel("CH2", 2_000_000),
            create_test_channel("CH3", 3_000_000),
        ];

        let first = selector.select_channel(&channels).unwrap();
        let second = selector.select_channel(&channels).unwrap();
        let third = selector.select_channel(&channels).unwrap();
        let fourth = selector.select_channel(&channels).unwrap();

        assert_eq!(first.channel_address, "CH1");
        assert_eq!(second.channel_address, "CH2");
        assert_eq!(third.channel_address, "CH3");
        assert_eq!(fourth.channel_address, "CH1");
    }

    #[test]
    fn test_single_channel_selection() {
        let selector = ChannelSelector::default();
        let channels = vec![create_test_channel("CH1", 1_000_000)];

        let selected = selector.select_channel(&channels).unwrap();
        assert_eq!(selected.channel_address, "CH1");
    }
}
