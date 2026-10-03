//! Rate limiting that survives horizontal scaling.
//!
//! The previous limiter kept windows in a process-local `HashMap`, so with N
//! Cloud Run instances the effective limit was N times the configured one, and
//! it reset on every cold start. The counter now lives in Postgres, shared by
//! every instance.

use crate::db::Repository;
use crate::errors::{PaymentError, Result};
use chrono::{DateTime, Duration, TimeZone, Utc};

pub struct RateLimiter {
    window_secs: i64,
    max_requests: i32,
}

impl RateLimiter {
    pub fn new(window_secs: u64, max_requests: usize) -> Self {
        RateLimiter {
            window_secs: (window_secs.max(1)) as i64,
            max_requests: (max_requests.max(1)) as i32,
        }
    }

    /// Snap `now` down to the start of its fixed window, so every instance
    /// agrees on which bucket a request belongs to without coordinating.
    fn window_start(&self, now: DateTime<Utc>) -> DateTime<Utc> {
        let secs = now.timestamp();
        let snapped = secs - secs.rem_euclid(self.window_secs);
        Utc.timestamp_opt(snapped, 0).single().unwrap_or(now)
    }

    /// Record one request against `bucket_key` and fail if it puts the caller
    /// over the limit.
    ///
    /// The increment and the check are one atomic statement, so concurrent
    /// requests cannot both observe the pre-increment count and slip through.
    pub async fn check(&self, db: &Repository, bucket_key: &str) -> Result<()> {
        let window = self.window_start(Utc::now());
        let count = db.increment_rate_limit(bucket_key, window).await?;

        if count > self.max_requests {
            return Err(PaymentError::RateLimited);
        }
        Ok(())
    }

    /// Windows older than this are finished and safe to delete.
    pub fn prune_before(&self, now: DateTime<Utc>) -> DateTime<Utc> {
        self.window_start(now) - Duration::seconds(self.window_secs)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn snaps_to_stable_window_boundaries() {
        let limiter = RateLimiter::new(60, 10);

        // 1_700_000_040 sits exactly on a 60s boundary; the next one is at +60.
        // Picking arbitrary nearby seconds does not work — 1_700_000_005 and
        // 1_700_000_059 straddle this boundary and belong to different windows.
        let start = Utc.timestamp_opt(1_700_000_040, 0).unwrap();
        let same_window = Utc.timestamp_opt(1_700_000_099, 0).unwrap();
        let next_window = Utc.timestamp_opt(1_700_000_100, 0).unwrap();

        // Two instants inside one window must land in the same bucket, or the
        // limit would be per-caller-clock rather than per-window.
        assert_eq!(
            limiter.window_start(start),
            limiter.window_start(same_window)
        );
        assert_ne!(
            limiter.window_start(start),
            limiter.window_start(next_window)
        );
        assert_eq!(limiter.window_start(start).timestamp() % 60, 0);
    }

    #[test]
    fn prune_horizon_is_a_full_window_behind() {
        let limiter = RateLimiter::new(60, 10);
        let now = Utc.timestamp_opt(1_700_000_061, 0).unwrap();

        assert!(limiter.prune_before(now) < limiter.window_start(now));
    }

    #[test]
    fn degenerate_config_does_not_divide_by_zero() {
        let limiter = RateLimiter::new(0, 0);
        // A zero window would panic in rem_euclid; it is clamped to 1s.
        let _ = limiter.window_start(Utc::now());
        assert_eq!(limiter.max_requests, 1);
    }
}
