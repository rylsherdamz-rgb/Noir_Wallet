//! In-process counters for the PDAX bridge.
//!
//! Process-local and reset on restart, which is fine for a liveness signal but
//! is not billing data — `pdax_orders` is the record of what actually happened.

use serde::Serialize;
use std::sync::atomic::{AtomicU64, Ordering};

#[derive(Default)]
pub struct MetricsCollector {
    conversions_requested: AtomicU64,
    conversions_placed: AtomicU64,
    conversions_failed: AtomicU64,
    withdrawals_initiated: AtomicU64,
    webhooks_accepted: AtomicU64,
    webhooks_rejected: AtomicU64,
    auth_successes: AtomicU64,
    auth_failures: AtomicU64,
    rate_limit_rejections: AtomicU64,
    idempotency_hits: AtomicU64,
}

#[derive(Serialize)]
pub struct MetricsSnapshot {
    pub conversions_requested: u64,
    pub conversions_placed: u64,
    pub conversions_failed: u64,
    pub withdrawals_initiated: u64,
    pub webhooks_accepted: u64,
    pub webhooks_rejected: u64,
    pub auth_successes: u64,
    pub auth_failures: u64,
    pub rate_limit_rejections: u64,
    pub idempotency_hits: u64,
}

impl MetricsCollector {
    pub fn new() -> Self {
        MetricsCollector::default()
    }

    pub fn record_conversion_requested(&self) {
        self.conversions_requested.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_conversion_placed(&self) {
        self.conversions_placed.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_conversion_failed(&self) {
        self.conversions_failed.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_withdrawal_initiated(&self) {
        self.withdrawals_initiated.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_webhook_accepted(&self) {
        self.webhooks_accepted.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_webhook_rejected(&self) {
        self.webhooks_rejected.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_auth_success(&self) {
        self.auth_successes.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_auth_failure(&self) {
        self.auth_failures.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_rate_limit_rejection(&self) {
        self.rate_limit_rejections.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_idempotency_hit(&self) {
        self.idempotency_hits.fetch_add(1, Ordering::Relaxed);
    }

    pub fn snapshot(&self) -> MetricsSnapshot {
        MetricsSnapshot {
            conversions_requested: self.conversions_requested.load(Ordering::Relaxed),
            conversions_placed: self.conversions_placed.load(Ordering::Relaxed),
            conversions_failed: self.conversions_failed.load(Ordering::Relaxed),
            withdrawals_initiated: self.withdrawals_initiated.load(Ordering::Relaxed),
            webhooks_accepted: self.webhooks_accepted.load(Ordering::Relaxed),
            webhooks_rejected: self.webhooks_rejected.load(Ordering::Relaxed),
            auth_successes: self.auth_successes.load(Ordering::Relaxed),
            auth_failures: self.auth_failures.load(Ordering::Relaxed),
            rate_limit_rejections: self.rate_limit_rejections.load(Ordering::Relaxed),
            idempotency_hits: self.idempotency_hits.load(Ordering::Relaxed),
        }
    }
}
