use crate::errors::Result;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

pub struct FeeChannelManager {
    channels: Vec<String>,
    current_index: Arc<AtomicUsize>,
}

impl FeeChannelManager {
    pub fn new(channels: Vec<String>) -> Self {
        FeeChannelManager {
            channels,
            current_index: Arc::new(AtomicUsize::new(0)),
        }
    }

    pub async fn get_active_channel(&self) -> Result<String> {
        if self.channels.is_empty() {
            return Err(crate::errors::PaymentError::ConfigError(
                "No fee channels configured".to_string(),
            ));
        }

        let idx = self.current_index.load(Ordering::Relaxed);
        Ok(self.channels[idx % self.channels.len()].clone())
    }

    pub async fn rotate_channel(&self) {
        let len = self.channels.len();
        if len > 0 {
            self.current_index.fetch_add(1, Ordering::Relaxed);
        }
    }

    pub async fn get_channel_balance(&self, _address: &str) -> Result<i64> {
        // TODO: Implement balance checking via Stellar RPC
        Ok(0)
    }
}
