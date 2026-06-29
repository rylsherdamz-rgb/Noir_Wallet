use sqlx::PgPool;
use crate::errors::{PaymentError, Result};
use crate::models::{Device, DailySpend, PaymentTransaction, FeeChannel};

#[derive(Clone)]
pub struct DeviceRepository {
    pool: PgPool,
}

impl DeviceRepository {
    pub fn new(pool: PgPool) -> Self {
        DeviceRepository { pool }
    }

    pub async fn get_device_by_hash(&self, hash: &str) -> Result<Device> {
        sqlx::query_as::<_, Device>(
            "SELECT id, device_hash, wallet_address, registration_date, status, daily_limit_stroops, last_synced_on_chain FROM devices WHERE device_hash = $1"
        )
        .bind(hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
        .ok_or(PaymentError::DeviceNotFound)
    }

    pub async fn check_daily_limit(
        &self,
        hash: &str,
        amount: i64,
    ) -> Result<bool> {
        let device = self.get_device_by_hash(hash).await?;
        
        let today = chrono::Utc::now().date_naive();
        let daily_spend = sqlx::query_as::<_, DailySpend>(
            "SELECT id, device_hash, transaction_date, total_spent_stroops, transaction_count FROM daily_spends WHERE device_hash = $1 AND transaction_date = $2"
        )
        .bind(hash)
        .bind(today)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match daily_spend {
            Some(spend) => Ok(spend.total_spent_stroops + amount <= device.daily_limit_stroops),
            None => Ok(amount <= device.daily_limit_stroops),
        }
    }

    pub async fn increment_daily_spend(&self, hash: &str, amount: i64) -> Result<()> {
        let today = chrono::Utc::now().date_naive();
        
        sqlx::query(
            "INSERT INTO daily_spends (device_hash, transaction_date, total_spent_stroops, transaction_count) 
             VALUES ($1, $2, $3, 1)
             ON CONFLICT (device_hash, transaction_date) 
             DO UPDATE SET total_spent_stroops = total_spent_stroops + $3, transaction_count = transaction_count + 1"
        )
        .bind(hash)
        .bind(today)
        .bind(amount)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn store_payment_transaction(&self, tx: &PaymentTransaction) -> Result<()> {
        sqlx::query(
            "INSERT INTO payment_transactions (transaction_id, device_hash, source_wallet, destination_wallet, amount_stroops, fee_stroops, status, created_at, fee_channel_used)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
        )
        .bind(&tx.transaction_id)
        .bind(&tx.device_hash)
        .bind(&tx.source_wallet)
        .bind(&tx.destination_wallet)
        .bind(tx.amount_stroops)
        .bind(tx.fee_stroops)
        .bind(&tx.status)
        .bind(tx.created_at)
        .bind(&tx.fee_channel_used)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_payment_transaction(&self, tx_id: &str) -> Result<PaymentTransaction> {
        sqlx::query_as::<_, PaymentTransaction>(
            "SELECT id, transaction_id, device_hash, source_wallet, destination_wallet, amount_stroops, fee_stroops, status, stellar_tx_hash, created_at, submitted_at, confirmed_at, error_message, fee_channel_used FROM payment_transactions WHERE transaction_id = $1"
        )
        .bind(tx_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
        .ok_or(PaymentError::DeviceNotFound)
    }

    pub async fn get_available_fee_channel(&self) -> Result<FeeChannel> {
        sqlx::query_as::<_, FeeChannel>(
            "SELECT id, channel_address, balance_stroops, last_balance_check, status, created_at FROM fee_channels WHERE status = 'active' ORDER BY balance_stroops DESC LIMIT 1"
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
        .ok_or(PaymentError::DatabaseError("No active fee channels available".to_string()))
    }

    pub async fn get_channel_by_address(&self, address: &str) -> Result<FeeChannel> {
        sqlx::query_as::<_, FeeChannel>(
            "SELECT id, channel_address, balance_stroops, last_balance_check, status, created_at FROM fee_channels WHERE channel_address = $1"
        )
        .bind(address)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
        .ok_or(PaymentError::DatabaseError("Fee channel not found".to_string()))
    }

    pub async fn update_channel_balance(&self, address: &str, new_balance: i64) -> Result<()> {
        sqlx::query(
            "UPDATE fee_channels SET balance_stroops = $1, last_balance_check = $2 WHERE channel_address = $3"
        )
        .bind(new_balance)
        .bind(chrono::Utc::now())
        .bind(address)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }
}
