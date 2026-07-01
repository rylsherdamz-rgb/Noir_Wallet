use crate::models::PaymentTransaction;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct TransactionCache {
    cache: Arc<RwLock<HashMap<String, CachedTransaction>>>,
    ttl_secs: u64,
}

#[derive(Clone, Debug)]
pub struct CachedTransaction {
    pub tx: PaymentTransaction,
    pub cached_at: chrono::DateTime<chrono::Utc>,
}

impl TransactionCache {
    pub fn new(ttl_secs: u64) -> Self {
        TransactionCache {
            cache: Arc::new(RwLock::new(HashMap::new())),
            ttl_secs,
        }
    }

    pub async fn get(&self, tx_id: &str) -> Option<PaymentTransaction> {
        let cache = self.cache.read().await;
        if let Some(cached) = cache.get(tx_id) {
            let age = chrono::Utc::now()
                .signed_duration_since(cached.cached_at)
                .num_seconds() as u64;

            if age < self.ttl_secs {
                return Some(cached.tx.clone());
            }
        }
        None
    }

    pub async fn set(&self, tx_id: String, tx: PaymentTransaction) {
        let mut cache = self.cache.write().await;
        cache.insert(
            tx_id,
            CachedTransaction {
                tx,
                cached_at: chrono::Utc::now(),
            },
        );
    }

    pub async fn invalidate(&self, tx_id: &str) {
        let mut cache = self.cache.write().await;
        cache.remove(tx_id);
    }

    pub async fn clear_expired(&self) {
        let mut cache = self.cache.write().await;
        let now = chrono::Utc::now();

        cache.retain(|_, cached| {
            let age = now
                .signed_duration_since(cached.cached_at)
                .num_seconds() as u64;
            age < self.ttl_secs
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn create_test_tx(id: &str) -> PaymentTransaction {
        PaymentTransaction {
            id: 1,
            transaction_id: id.to_string(),
            device_hash: "hash".to_string(),
            source_wallet: "source".to_string(),
            destination_wallet: "dest".to_string(),
            amount_stroops: 1000,
            fee_stroops: 200,
            status: "pending".to_string(),
            stellar_tx_hash: None,
            created_at: Utc::now(),
            submitted_at: None,
            confirmed_at: None,
            error_message: None,
            fee_channel_used: None,
        }
    }

    #[tokio::test]
    async fn test_cache_set_and_get() {
        let cache = TransactionCache::new(60);
        let tx = create_test_tx("tx1");

        cache.set("tx1".to_string(), tx.clone()).await;
        let retrieved = cache.get("tx1").await;

        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().transaction_id, "tx1");
    }

    #[tokio::test]
    async fn test_cache_invalidate() {
        let cache = TransactionCache::new(60);
        let tx = create_test_tx("tx1");

        cache.set("tx1".to_string(), tx).await;
        cache.invalidate("tx1").await;

        assert!(cache.get("tx1").await.is_none());
    }

    #[tokio::test]
    async fn test_cache_miss_on_expired() {
        let cache = TransactionCache::new(1);
        let tx = create_test_tx("tx1");

        cache.set("tx1".to_string(), tx).await;
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

        assert!(cache.get("tx1").await.is_none());
    }
}
