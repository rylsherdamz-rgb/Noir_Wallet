use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

struct DeviceWindow {
    requests: Vec<Instant>,
}

impl DeviceWindow {
    fn new() -> Self {
        DeviceWindow { requests: Vec::new() }
    }

    fn prune_expired(&mut self, window: Duration) {
        let cutoff = Instant::now() - window;
        self.requests.retain(|t| *t > cutoff);
    }

    fn count_in_window(&self) -> usize {
        self.requests.len()
    }

    fn record(&mut self) {
        self.requests.push(Instant::now());
    }
}

pub struct RateLimiter {
    windows: Arc<Mutex<HashMap<String, DeviceWindow>>>,
    window_duration: Duration,
    max_requests: usize,
}

impl RateLimiter {
    pub fn new(window_secs: u64, max_requests: usize) -> Self {
        RateLimiter {
            windows: Arc::new(Mutex::new(HashMap::new())),
            window_duration: Duration::from_secs(window_secs),
            max_requests,
        }
    }

    pub async fn check_and_record(&self, device_hash: &str) -> bool {
        let mut map = self.windows.lock().await;
        let window = map.entry(device_hash.to_string()).or_insert_with(DeviceWindow::new);
        window.prune_expired(self.window_duration);

        if window.count_in_window() >= self.max_requests {
            return false;
        }

        window.record();
        true
    }

    pub async fn cleanup_stale(&self) {
        let mut map = self.windows.lock().await;
        let window_dur = self.window_duration;
        map.retain(|_, w| {
            w.prune_expired(window_dur);
            !w.requests.is_empty()
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_allows_within_limit() {
        let limiter = RateLimiter::new(60, 3);
        assert!(limiter.check_and_record("device1").await);
        assert!(limiter.check_and_record("device1").await);
        assert!(limiter.check_and_record("device1").await);
    }

    #[tokio::test]
    async fn test_blocks_over_limit() {
        let limiter = RateLimiter::new(60, 2);
        assert!(limiter.check_and_record("device1").await);
        assert!(limiter.check_and_record("device1").await);
        assert!(!limiter.check_and_record("device1").await);
    }

    #[tokio::test]
    async fn test_independent_devices() {
        let limiter = RateLimiter::new(60, 1);
        assert!(limiter.check_and_record("device1").await);
        assert!(limiter.check_and_record("device2").await);
        assert!(!limiter.check_and_record("device1").await);
        assert!(!limiter.check_and_record("device2").await);
    }

    #[tokio::test]
    async fn test_window_expiry() {
        let limiter = RateLimiter::new(1, 1);
        assert!(limiter.check_and_record("device1").await);
        assert!(!limiter.check_and_record("device1").await);
        tokio::time::sleep(Duration::from_secs(2)).await;
        assert!(limiter.check_and_record("device1").await);
    }
}
