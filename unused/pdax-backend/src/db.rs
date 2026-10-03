//! Data access for the PDAX bridge: auth challenges, sessions, users,
//! conversion orders, and the shared rate-limit counter.
//!
//! Every query is parameterised. Anything that must not race — claiming a
//! challenge, claiming an idempotency key, incrementing a rate-limit window —
//! is a single atomic statement rather than a read followed by a write.

use crate::errors::{PaymentError, Result};
use crate::models::{AppUser, PdaxOrder};
use chrono::{DateTime, Duration, Utc};
use sqlx::PgPool;

#[derive(Clone)]
pub struct Repository {
    pool: PgPool,
}

impl Repository {
    pub fn new(pool: PgPool) -> Self {
        Repository { pool }
    }

    pub async fn ping(&self) -> Result<()> {
        sqlx::query("SELECT 1")
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    // ── Auth challenges ──────────────────────────────────────────────────────

    pub async fn create_challenge(
        &self,
        wallet: &str,
        nonce: &str,
        ttl_secs: i64,
    ) -> Result<DateTime<Utc>> {
        let expires_at = Utc::now() + Duration::seconds(ttl_secs);
        sqlx::query(
            "INSERT INTO auth_challenges (wallet_address, nonce, expires_at)
             VALUES ($1, $2, $3)",
        )
        .bind(wallet)
        .bind(nonce)
        .bind(expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(expires_at)
    }

    /// Claim a challenge for single use.
    ///
    /// The `consumed_at IS NULL` predicate lives inside the UPDATE, so two
    /// concurrent verifications of the same nonce cannot both see it unclaimed —
    /// exactly one gets a row back. Returns `false` if the nonce is unknown,
    /// expired, already used, or belongs to a different wallet.
    pub async fn consume_challenge(&self, wallet: &str, nonce: &str) -> Result<bool> {
        let result = sqlx::query(
            "UPDATE auth_challenges
                SET consumed_at = NOW()
              WHERE nonce = $1
                AND wallet_address = $2
                AND consumed_at IS NULL
                AND expires_at > NOW()",
        )
        .bind(nonce)
        .bind(wallet)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(result.rows_affected() == 1)
    }

    pub async fn prune_expired_challenges(&self) -> Result<u64> {
        let result = sqlx::query("DELETE FROM auth_challenges WHERE expires_at < NOW()")
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(result.rows_affected())
    }

    // ── Sessions ─────────────────────────────────────────────────────────────

    pub async fn create_session(
        &self,
        token_hash: &str,
        wallet: &str,
        ttl_secs: i64,
    ) -> Result<DateTime<Utc>> {
        let expires_at = Utc::now() + Duration::seconds(ttl_secs);
        sqlx::query(
            "INSERT INTO sessions (token_hash, wallet_address, expires_at)
             VALUES ($1, $2, $3)",
        )
        .bind(token_hash)
        .bind(wallet)
        .bind(expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(expires_at)
    }

    /// Resolve a bearer token hash to the wallet that owns it. Returns `None`
    /// for unknown, expired, or revoked tokens — the caller cannot distinguish
    /// between them, which is deliberate.
    pub async fn wallet_for_session(&self, token_hash: &str) -> Result<Option<String>> {
        let row: Option<(String,)> = sqlx::query_as(
            "SELECT wallet_address FROM sessions
              WHERE token_hash = $1
                AND revoked_at IS NULL
                AND expires_at > NOW()",
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(row.map(|(wallet,)| wallet))
    }

    pub async fn revoke_session(&self, token_hash: &str) -> Result<u64> {
        let result = sqlx::query(
            "UPDATE sessions SET revoked_at = NOW()
              WHERE token_hash = $1 AND revoked_at IS NULL",
        )
        .bind(token_hash)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(result.rows_affected())
    }

    pub async fn revoke_all_sessions_for_wallet(&self, wallet: &str) -> Result<u64> {
        let result = sqlx::query(
            "UPDATE sessions SET revoked_at = NOW()
              WHERE wallet_address = $1 AND revoked_at IS NULL",
        )
        .bind(wallet)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(result.rows_affected())
    }

    // ── Users ────────────────────────────────────────────────────────────────

    /// Register the wallet on first successful authentication. Idempotent.
    pub async fn upsert_user(&self, wallet: &str) -> Result<()> {
        sqlx::query(
            "INSERT INTO app_users (user_uuid, wallet_address, status)
             VALUES ($1, $2, 'active')
             ON CONFLICT (wallet_address) DO NOTHING",
        )
        .bind(uuid::Uuid::new_v4().to_string())
        .bind(wallet)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    pub async fn get_user_by_wallet(&self, wallet: &str) -> Result<Option<AppUser>> {
        sqlx::query_as::<_, AppUser>(
            "SELECT id, user_uuid, wallet_address, status, created_at
               FROM app_users WHERE wallet_address = $1",
        )
        .bind(wallet)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    /// Soft-delete the authenticated wallet's account.
    ///
    /// The previous implementation marked the literal wallet `"pending"`, which
    /// was the placeholder assigned to every user created without an address —
    /// so a single call flagged all of them. This one is scoped to one wallet.
    pub async fn mark_user_deleted(&self, wallet: &str) -> Result<u64> {
        let result = sqlx::query(
            "UPDATE app_users SET status = 'closed'
              WHERE wallet_address = $1 AND status <> 'closed'",
        )
        .bind(wallet)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(result.rows_affected())
    }

    // ── PDAX orders ──────────────────────────────────────────────────────────

    /// Claim an idempotency key before doing anything with side effects.
    ///
    /// Returns `None` when the key is already taken, in which case the caller
    /// should fetch and replay the existing order. The unique index on
    /// `idempotency_key` is what makes this safe under concurrency: two
    /// simultaneous requests race to insert, and exactly one wins.
    pub async fn claim_order(
        &self,
        idempotency_key: &str,
        wallet: &str,
        direction: &str,
        asset: &str,
        php_minor: i64,
    ) -> Result<Option<PdaxOrder>> {
        let row = sqlx::query_as::<_, PdaxOrder>(
            "INSERT INTO pdax_orders
                 (idempotency_key, wallet_address, direction, asset, php_minor, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             ON CONFLICT (idempotency_key) DO NOTHING
             RETURNING id, idempotency_key, wallet_address, direction, asset,
                       php_minor, crypto_minor, pdax_order_id, pdax_quote_id,
                       withdrawal_identifier, status, last_event_id,
                       error_message, created_at, updated_at",
        )
        .bind(idempotency_key)
        .bind(wallet)
        .bind(direction)
        .bind(asset)
        .bind(php_minor)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(row)
    }

    pub async fn get_order_by_key(&self, idempotency_key: &str) -> Result<Option<PdaxOrder>> {
        sqlx::query_as::<_, PdaxOrder>(
            "SELECT id, idempotency_key, wallet_address, direction, asset,
                    php_minor, crypto_minor, pdax_order_id, pdax_quote_id,
                    withdrawal_identifier, status, last_event_id,
                    error_message, created_at, updated_at
               FROM pdax_orders WHERE idempotency_key = $1",
        )
        .bind(idempotency_key)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    pub async fn list_orders_for_wallet(
        &self,
        wallet: &str,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<PdaxOrder>> {
        sqlx::query_as::<_, PdaxOrder>(
            "SELECT id, idempotency_key, wallet_address, direction, asset,
                    php_minor, crypto_minor, pdax_order_id, pdax_quote_id,
                    withdrawal_identifier, status, last_event_id,
                    error_message, created_at, updated_at
               FROM pdax_orders
              WHERE wallet_address = $1
              ORDER BY created_at DESC
              LIMIT $2 OFFSET $3",
        )
        .bind(wallet)
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))
    }

    pub async fn record_quote(
        &self,
        idempotency_key: &str,
        quote_id: &str,
        crypto_minor: i64,
    ) -> Result<()> {
        sqlx::query(
            "UPDATE pdax_orders
                SET pdax_quote_id = $2, crypto_minor = $3,
                    status = 'quoted', updated_at = NOW()
              WHERE idempotency_key = $1",
        )
        .bind(idempotency_key)
        .bind(quote_id)
        .bind(crypto_minor)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    pub async fn record_order_placed(
        &self,
        idempotency_key: &str,
        pdax_order_id: &str,
    ) -> Result<()> {
        sqlx::query(
            "UPDATE pdax_orders
                SET pdax_order_id = $2, status = 'ordered', updated_at = NOW()
              WHERE idempotency_key = $1",
        )
        .bind(idempotency_key)
        .bind(pdax_order_id)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    pub async fn record_withdrawal(
        &self,
        idempotency_key: &str,
        withdrawal_identifier: &str,
    ) -> Result<()> {
        sqlx::query(
            "UPDATE pdax_orders
                SET withdrawal_identifier = $2, status = 'withdrawing',
                    updated_at = NOW()
              WHERE idempotency_key = $1",
        )
        .bind(idempotency_key)
        .bind(withdrawal_identifier)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    pub async fn set_order_status(
        &self,
        idempotency_key: &str,
        status: &str,
        error_message: Option<&str>,
    ) -> Result<()> {
        sqlx::query(
            "UPDATE pdax_orders
                SET status = $2, error_message = $3, updated_at = NOW()
              WHERE idempotency_key = $1",
        )
        .bind(idempotency_key)
        .bind(status)
        .bind(error_message)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(())
    }

    /// Apply a webhook event to an order, keyed on the PDAX order id.
    ///
    /// `last_event_id` is checked in the WHERE clause so redelivery of an event
    /// already applied is a no-op rather than a second state transition.
    /// Returns `false` when nothing was updated.
    pub async fn apply_webhook_event(
        &self,
        pdax_order_id: &str,
        event_id: &str,
        status: &str,
    ) -> Result<bool> {
        let result = sqlx::query(
            "UPDATE pdax_orders
                SET status = $3, last_event_id = $2, updated_at = NOW()
              WHERE pdax_order_id = $1
                AND (last_event_id IS DISTINCT FROM $2)",
        )
        .bind(pdax_order_id)
        .bind(event_id)
        .bind(status)
        .execute(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(result.rows_affected() == 1)
    }

    // ── Rate limiting ────────────────────────────────────────────────────────

    /// Increment the counter for `bucket_key` in the current window and return
    /// the new count.
    ///
    /// A single atomic upsert, so the limit holds across every instance. The
    /// previous in-process HashMap meant the effective limit was the configured
    /// limit multiplied by the number of running instances.
    pub async fn increment_rate_limit(
        &self,
        bucket_key: &str,
        window_start: DateTime<Utc>,
    ) -> Result<i32> {
        let (count,): (i32,) = sqlx::query_as(
            "INSERT INTO rate_limits (bucket_key, window_start, request_count)
             VALUES ($1, $2, 1)
             ON CONFLICT (bucket_key, window_start)
             DO UPDATE SET request_count = rate_limits.request_count + 1
             RETURNING request_count",
        )
        .bind(bucket_key)
        .bind(window_start)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;

        Ok(count)
    }

    pub async fn prune_rate_limits(&self, older_than: DateTime<Utc>) -> Result<u64> {
        let result = sqlx::query("DELETE FROM rate_limits WHERE window_start < $1")
            .bind(older_than)
            .execute(&self.pool)
            .await
            .map_err(|e| PaymentError::DatabaseError(e.to_string()))?;
        Ok(result.rows_affected())
    }
}
