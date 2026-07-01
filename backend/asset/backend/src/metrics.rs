use serde::Serialize;
use std::sync::atomic::{AtomicU64, Ordering};

#[derive(Default)]
pub struct MetricsCollector {
    payments_received: AtomicU64,
    payments_accepted: AtomicU64,
    payments_rejected: AtomicU64,
    payments_submitted: AtomicU64,
    payments_confirmed: AtomicU64,
    payments_failed: AtomicU64,
    rate_limit_rejections: AtomicU64,
    idempotency_hits: AtomicU64,
    channel_topups: AtomicU64,
    channel_fallbacks: AtomicU64,
}

#[derive(Serialize)]
pub struct MetricsSnapshot {
    pub payments_received: u64,
    pub payments_accepted: u64,
    pub payments_rejected: u64,
    pub payments_submitted: u64,
    pub payments_confirmed: u64,
    pub payments_failed: u64,
    pub rate_limit_rejections: u64,
    pub idempotency_hits: u64,
    pub channel_topups: u64,
    pub channel_fallbacks: u64,
}

impl MetricsCollector {
    pub fn new() -> Self {
        MetricsCollector::default()
    }

    pub fn record_payment_received(&self) {
        self.payments_received.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_payment_accepted(&self) {
        self.payments_accepted.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_payment_rejected(&self, _reason: &str) {
        self.payments_rejected.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_payment_submitted(&self) {
        self.payments_submitted.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_payment_confirmed(&self) {
        self.payments_confirmed.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_payment_failed(&self) {
        self.payments_failed.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_rate_limit_rejection(&self) {
        self.rate_limit_rejections.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_idempotency_hit(&self) {
        self.idempotency_hits.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_channel_topup(&self) {
        self.channel_topups.fetch_add(1, Ordering::Relaxed);
    }

    pub fn record_channel_fallback(&self) {
        self.channel_fallbacks.fetch_add(1, Ordering::Relaxed);
    }

    pub fn snapshot(&self) -> MetricsSnapshot {
        MetricsSnapshot {
            payments_received: self.payments_received.load(Ordering::Relaxed),
            payments_accepted: self.payments_accepted.load(Ordering::Relaxed),
            payments_rejected: self.payments_rejected.load(Ordering::Relaxed),
            payments_submitted: self.payments_submitted.load(Ordering::Relaxed),
            payments_confirmed: self.payments_confirmed.load(Ordering::Relaxed),
            payments_failed: self.payments_failed.load(Ordering::Relaxed),
            rate_limit_rejections: self.rate_limit_rejections.load(Ordering::Relaxed),
            idempotency_hits: self.idempotency_hits.load(Ordering::Relaxed),
            channel_topups: self.channel_topups.load(Ordering::Relaxed),
            channel_fallbacks: self.channel_fallbacks.load(Ordering::Relaxed),
        }
    }
}
