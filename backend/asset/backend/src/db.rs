use crate::errors::{PaymentError, Result};
use crate::models::{
    AppUser, DailySpend, Device, FeeChannel, Merchant, PaymentTransaction, TransactionNotification,
};
use sqlx::PgPool;

#[derive(Clone)]
pub struct DeviceRepository {
    pool: PgPool,
}

impl DeviceRepository {
    pub fn new(pool: PgPool) -> Self {
        DeviceRepository { pool }
    }

    pub async fn ping(&self) -> Result<()> {
        sqlx::query("SELECT 1")
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
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

    /// Insert or re-activate a device row mapping a device hash to a wallet.
    /// Used by `/devices/register` (the on-chain contract sync is not yet
    /// implemented, so this is how a device becomes payable in the backend).
    pub async fn upsert_device(
        &self,
        device_hash: &str,
        wallet_address: &str,
        daily_limit_stroops: i64,
    ) -> Result<()> {
        sqlx::query(
            "INSERT INTO devices (device_hash, wallet_address, status, daily_limit_stroops)
             VALUES ($1, $2, 'active', $3)
             ON CONFLICT (device_hash)
             DO UPDATE SET wallet_address = EXCLUDED.wallet_address, status = 'active', daily_limit_stroops = EXCLUDED.daily_limit_stroops",
        )
        .bind(device_hash)
        .bind(wallet_address)
        .bind(daily_limit_stroops)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    /// Provision (or re-provision) a custodial card: map the device hash to a
    /// wallet and store its envelope-encrypted secret + key version.
    pub async fn upsert_custodial_device(
        &self,
        device_hash: &str,
        wallet_address: &str,
        wallet_secret_encrypted: &[u8],
        seed_key_version: i32,
        daily_limit_stroops: i64,
    ) -> Result<()> {
        sqlx::query(
            "INSERT INTO devices (device_hash, wallet_address, status, daily_limit_stroops, wallet_secret_encrypted, seed_key_version)
             VALUES ($1, $2, 'active', $3, $4, $5)
             ON CONFLICT (device_hash)
             DO UPDATE SET wallet_address = EXCLUDED.wallet_address, status = 'active',
                           daily_limit_stroops = EXCLUDED.daily_limit_stroops,
                           wallet_secret_encrypted = EXCLUDED.wallet_secret_encrypted,
                           seed_key_version = EXCLUDED.seed_key_version",
        )
        .bind(device_hash)
        .bind(wallet_address)
        .bind(daily_limit_stroops)
        .bind(wallet_secret_encrypted)
        .bind(seed_key_version)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    /// Set a device's status (e.g. 'active', 'revoked'). Revocation makes all
    /// subsequent tap payments fail device validation.
    pub async fn update_device_status(&self, device_hash: &str, status: &str) -> Result<u64> {
        let res = sqlx::query("UPDATE devices SET status = $1 WHERE device_hash = $2")
            .bind(status)
            .bind(device_hash)
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(res.rows_affected())
    }

    /// Store (or clear) a card's PIN hash.
    pub async fn set_device_pin(&self, device_hash: &str, pin_hash: Option<&str>) -> Result<()> {
        sqlx::query("UPDATE devices SET pin_hash = $1 WHERE device_hash = $2")
            .bind(pin_hash)
            .bind(device_hash)
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    /// Fetch a device's PIN hash, if any.
    pub async fn get_device_pin_hash(&self, device_hash: &str) -> Result<Option<String>> {
        let row: Option<(Option<String>,)> =
            sqlx::query_as("SELECT pin_hash FROM devices WHERE device_hash = $1")
                .bind(device_hash)
                .fetch_optional(&self.pool)
                .await
                .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(row.and_then(|r| r.0))
    }

    /// Fetch a custodial device's wallet address + encrypted secret + key version.
    pub async fn get_device_custody(
        &self,
        device_hash: &str,
    ) -> Result<(String, Vec<u8>, i32)> {
        let row: Option<(String, Option<Vec<u8>>, i32)> = sqlx::query_as(
            "SELECT wallet_address, wallet_secret_encrypted, seed_key_version FROM devices WHERE device_hash = $1",
        )
        .bind(device_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        match row {
            Some((wallet, Some(enc), ver)) => Ok((wallet, enc, ver)),
            Some((_, None, _)) => Err(PaymentError::InvalidPayload(
                "Device is not a custodial card (no stored key)".to_string(),
            )),
            None => Err(PaymentError::DeviceNotFound),
        }
    }

    pub async fn check_daily_limit(&self, hash: &str, amount: i64) -> Result<bool> {
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
             DO UPDATE SET total_spent_stroops = daily_spends.total_spent_stroops + $3, transaction_count = daily_spends.transaction_count + 1"
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

    /// Store the user-signed inner transaction envelope (base64 XDR) for a
    /// pending payment. Set by the API in the non-custodial flow.
    pub async fn store_signed_envelope(&self, tx_id: &str, xdr: &str) -> Result<()> {
        sqlx::query(
            "UPDATE payment_transactions SET signed_envelope_xdr = $1 WHERE transaction_id = $2",
        )
        .bind(xdr)
        .bind(tx_id)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    /// Fetch the user-signed inner envelope for a payment, if present.
    pub async fn get_signed_envelope(&self, tx_id: &str) -> Result<Option<String>> {
        let row: Option<(Option<String>,)> = sqlx::query_as(
            "SELECT signed_envelope_xdr FROM payment_transactions WHERE transaction_id = $1",
        )
        .bind(tx_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(row.and_then(|r| r.0))
    }

    pub async fn get_pending_payment_transactions(&self) -> Result<Vec<PaymentTransaction>> {
        sqlx::query_as::<_, PaymentTransaction>(
            "SELECT id, transaction_id, device_hash, source_wallet, destination_wallet, amount_stroops, fee_stroops, status, stellar_tx_hash, created_at, submitted_at, confirmed_at, error_message, fee_channel_used FROM payment_transactions WHERE status = 'pending' ORDER BY created_at ASC LIMIT 100"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    pub async fn update_transaction_status(
        &self,
        tx_id: &str,
        status: &str,
        error: Option<String>,
    ) -> Result<()> {
        sqlx::query(
            "UPDATE payment_transactions SET status = $1, error_message = $2 WHERE transaction_id = $3"
        )
        .bind(status)
        .bind(error)
        .bind(tx_id)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn update_transaction_hash(&self, tx_id: &str, hash: &str) -> Result<()> {
        sqlx::query(
            "UPDATE payment_transactions SET stellar_tx_hash = $1 WHERE transaction_id = $2",
        )
        .bind(hash)
        .bind(tx_id)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn update_transaction_submitted_time(
        &self,
        tx_id: &str,
        time: chrono::DateTime<chrono::Utc>,
    ) -> Result<()> {
        sqlx::query("UPDATE payment_transactions SET submitted_at = $1 WHERE transaction_id = $2")
            .bind(time)
            .bind(tx_id)
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn update_transaction_confirmed_time(
        &self,
        tx_id: &str,
        time: chrono::DateTime<chrono::Utc>,
    ) -> Result<()> {
        sqlx::query("UPDATE payment_transactions SET confirmed_at = $1 WHERE transaction_id = $2")
            .bind(time)
            .bind(tx_id)
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_submitted_payment_transactions(&self) -> Result<Vec<PaymentTransaction>> {
        sqlx::query_as::<_, PaymentTransaction>(
            "SELECT id, transaction_id, device_hash, source_wallet, destination_wallet, amount_stroops, fee_stroops, status, stellar_tx_hash, created_at, submitted_at, confirmed_at, error_message, fee_channel_used FROM payment_transactions WHERE status = 'submitted' AND stellar_tx_hash IS NOT NULL ORDER BY submitted_at ASC LIMIT 100"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    /// Insert or refresh the fee channel row for `address`.
    ///
    /// The signing key itself is NOT stored here — it lives in Secret Manager
    /// (`CHANNEL_SECRET_KEY`) and is only ever loaded into memory. We satisfy
    /// the NOT NULL `private_key_encrypted` column with an empty blob; this row
    /// exists for channel selection, balance tracking, and health reporting.
    pub async fn upsert_fee_channel(&self, address: &str, balance_stroops: i64) -> Result<()> {
        let empty: &[u8] = &[];
        sqlx::query(
            "INSERT INTO fee_channels (channel_address, private_key_encrypted, balance_stroops, status)
             VALUES ($1, $2, $3, 'active')
             ON CONFLICT (channel_address)
             DO UPDATE SET balance_stroops = EXCLUDED.balance_stroops, status = 'active', last_balance_check = NOW()"
        )
        .bind(address)
        .bind(empty)
        .bind(balance_stroops)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    pub async fn get_all_active_fee_channels(&self) -> Result<Vec<FeeChannel>> {
        sqlx::query_as::<_, FeeChannel>(
            "SELECT id, channel_address, balance_stroops, last_balance_check, status, created_at FROM fee_channels WHERE status = 'active' ORDER BY balance_stroops DESC"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    pub async fn update_fee_channel_status(&self, address: &str, status: &str) -> Result<()> {
        sqlx::query(
            "UPDATE fee_channels SET status = $1, last_balance_check = $2 WHERE channel_address = $3"
        )
        .bind(status)
        .bind(chrono::Utc::now())
        .bind(address)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn record_channel_fee_usage(
        &self,
        channel_address: &str,
        fee_stroops: i64,
    ) -> Result<()> {
        sqlx::query(
            "UPDATE fee_channels SET balance_stroops = balance_stroops - $1, last_balance_check = $2 WHERE channel_address = $3"
        )
        .bind(fee_stroops)
        .bind(chrono::Utc::now())
        .bind(channel_address)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn update_transaction_channel(
        &self,
        tx_id: &str,
        channel_address: &str,
    ) -> Result<()> {
        sqlx::query(
            "UPDATE payment_transactions SET fee_channel_used = $1 WHERE transaction_id = $2",
        )
        .bind(channel_address)
        .bind(tx_id)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_transaction_by_idempotency_key(
        &self,
        key: &str,
    ) -> Result<Option<PaymentTransaction>> {
        sqlx::query_as::<_, PaymentTransaction>(
            "SELECT id, transaction_id, device_hash, source_wallet, destination_wallet, amount_stroops, fee_stroops, status, stellar_tx_hash, created_at, submitted_at, confirmed_at, error_message, fee_channel_used FROM payment_transactions WHERE idempotency_key = $1 LIMIT 1"
        )
        .bind(key)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    pub async fn store_payment_transaction_with_key(
        &self,
        tx: &PaymentTransaction,
        idempotency_key: &str,
    ) -> Result<()> {
        sqlx::query(
            "INSERT INTO payment_transactions (transaction_id, device_hash, source_wallet, destination_wallet, amount_stroops, fee_stroops, status, created_at, fee_channel_used, idempotency_key)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
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
        .bind(idempotency_key)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_transactions_by_device(
        &self,
        device_hash: &str,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<PaymentTransaction>> {
        sqlx::query_as::<_, PaymentTransaction>(
            "SELECT id, transaction_id, device_hash, source_wallet, destination_wallet, amount_stroops, fee_stroops, status, stellar_tx_hash, created_at, submitted_at, confirmed_at, error_message, fee_channel_used FROM payment_transactions WHERE device_hash = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        )
        .bind(device_hash)
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    // ── Merchant queries ──────────────────────────────────────────────────
    // `config_encrypted` is bound as raw bytes here and never selected back
    // into the Merchant model — decrypt it explicitly via crypto::decrypt_at_rest
    // when a caller actually needs the plaintext config.

    pub async fn create_merchant(
        &self,
        merchant_uuid: &str,
        business_name: &str,
        settlement_wallet: &str,
        config_encrypted: Option<&[u8]>,
        config_key_version: i32,
    ) -> Result<i64> {
        let row: (i64,) = sqlx::query_as(
            "INSERT INTO merchants (merchant_uuid, business_name, settlement_wallet, config_encrypted, config_key_version)
             VALUES ($1, $2, $3, $4, $5) RETURNING id"
        )
        .bind(merchant_uuid)
        .bind(business_name)
        .bind(settlement_wallet)
        .bind(config_encrypted)
        .bind(config_key_version)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(row.0)
    }

    pub async fn get_merchant_by_uuid(&self, merchant_uuid: &str) -> Result<Merchant> {
        sqlx::query_as::<_, Merchant>(
            "SELECT id, merchant_uuid, business_name, settlement_wallet, status, config_key_version, created_at, updated_at
             FROM merchants WHERE merchant_uuid = $1"
        )
        .bind(merchant_uuid)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
        .ok_or(PaymentError::DatabaseError("Merchant not found".to_string()))
    }

    // ── App user queries ─────────────────────────────────────────────────
    // `entropy_seed_encrypted` is bound as raw bytes here and never selected
    // back into the AppUser model, matching the merchant config pattern above.

    pub async fn create_app_user(
        &self,
        user_uuid: &str,
        wallet_address: &str,
        identity_hash: &str,
        entropy_seed_encrypted: &[u8],
        seed_key_version: i32,
    ) -> Result<i64> {
        let row: (i64,) = sqlx::query_as(
            "INSERT INTO app_users (user_uuid, wallet_address, identity_hash, entropy_seed_encrypted, seed_key_version)
             VALUES ($1, $2, $3, $4, $5) RETURNING id"
        )
        .bind(user_uuid)
        .bind(wallet_address)
        .bind(identity_hash)
        .bind(entropy_seed_encrypted)
        .bind(seed_key_version)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(row.0)
    }

    pub async fn get_app_user_by_wallet(&self, wallet_address: &str) -> Result<AppUser> {
        sqlx::query_as::<_, AppUser>(
            "SELECT id, user_uuid, wallet_address, identity_hash, seed_key_version, status, created_at
             FROM app_users WHERE wallet_address = $1"
        )
        .bind(wallet_address)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?
        .ok_or(PaymentError::DatabaseError("App user not found".to_string()))
    }

    // ── Transaction notification (ephemeral UI cache) queries ───────────
    // Distinct from payment_transactions (the permanent audit log): these
    // rows exist only to power real-time client notifications and are
    // pruned continuously by workers::NotificationPruner.

    pub async fn insert_transaction_notification(
        &self,
        device_hash: &str,
        payment_transaction_id: Option<i64>,
        status: &str,
        amount_stroops: i64,
        payload: serde_json::Value,
        ttl_secs: i64,
    ) -> Result<()> {
        sqlx::query(
            "INSERT INTO transaction_notifications (device_hash, payment_transaction_id, status, amount_stroops, payload, expires_at)
             VALUES ($1, $2, $3, $4, $5, NOW() + make_interval(secs => $6))"
        )
        .bind(device_hash)
        .bind(payment_transaction_id)
        .bind(status)
        .bind(amount_stroops)
        .bind(payload)
        .bind(ttl_secs as f64)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub async fn get_active_notifications_for_device(
        &self,
        device_hash: &str,
        limit: i64,
    ) -> Result<Vec<TransactionNotification>> {
        sqlx::query_as::<_, TransactionNotification>(
            "SELECT id, device_hash, payment_transaction_id, status, amount_stroops, payload, created_at, expires_at
             FROM transaction_notifications
             WHERE device_hash = $1 AND expires_at > NOW()
             ORDER BY created_at DESC
             LIMIT $2"
        )
        .bind(device_hash)
        .bind(limit)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    pub async fn prune_expired_notifications(&self) -> Result<u64> {
        let result = sqlx::query("DELETE FROM transaction_notifications WHERE expires_at < NOW()")
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(result.rows_affected())
    }
}
