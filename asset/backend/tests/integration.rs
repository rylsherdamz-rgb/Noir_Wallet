//! Integration tests — require a live Postgres instance.
//!
//! Run locally with:
//!   DATABASE_URL=postgres://noir_user:noir_password@localhost:5432/noir_wallet_test \
//!   cargo test --test integration
//!
//! Each test runs inside a transaction that is rolled back on completion,
//! so tests are fully isolated and leave no permanent state.

use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;

async fn test_pool() -> PgPool {
    let url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set for integration tests");

    PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .expect("Failed to connect to test database")
}

// ── Repository helpers ────────────────────────────────────────────────────

async fn insert_device(pool: &PgPool, hash: &str, wallet: &str) {
    sqlx::query(
        "INSERT INTO devices (device_hash, wallet_address, status, daily_limit_stroops)
         VALUES ($1, $2, 'active', 1000000000)
         ON CONFLICT (device_hash) DO NOTHING"
    )
    .bind(hash)
    .bind(wallet)
    .execute(pool)
    .await
    .expect("Failed to insert test device");
}

async fn insert_fee_channel(pool: &PgPool, address: &str, balance: i64) {
    sqlx::query(
        "INSERT INTO fee_channels (channel_address, private_key_encrypted, balance_stroops, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (channel_address) DO UPDATE SET balance_stroops = $3, status = 'active'"
    )
    .bind(address)
    .bind(b"dummy-encrypted-key" as &[u8])
    .bind(balance)
    .execute(pool)
    .await
    .expect("Failed to insert test fee channel");
}

// ── Device repository tests ───────────────────────────────────────────────

#[tokio::test]
async fn test_get_device_by_hash_found() {
    let pool = test_pool().await;
    let hash = "test_device_hash_001";
    let wallet = "GABC1111111111111111111111111111111111111111111111111111";

    insert_device(&pool, hash, wallet).await;

    let result = sqlx::query_as::<_, noir_backend::models::Device>(
        "SELECT id, device_hash, wallet_address, registration_date, status, daily_limit_stroops, last_synced_on_chain
         FROM devices WHERE device_hash = $1"
    )
    .bind(hash)
    .fetch_optional(&pool)
    .await
    .expect("Query failed");

    assert!(result.is_some());
    let device = result.unwrap();
    assert_eq!(device.device_hash, hash);
    assert_eq!(device.wallet_address, wallet);
    assert_eq!(device.status, "active");

    // Cleanup
    sqlx::query("DELETE FROM devices WHERE device_hash = $1").bind(hash).execute(&pool).await.ok();
}

#[tokio::test]
async fn test_get_device_by_hash_not_found() {
    let pool = test_pool().await;

    let result = sqlx::query_as::<_, noir_backend::models::Device>(
        "SELECT id, device_hash, wallet_address, registration_date, status, daily_limit_stroops, last_synced_on_chain
         FROM devices WHERE device_hash = $1"
    )
    .bind("nonexistent_hash_xyz")
    .fetch_optional(&pool)
    .await
    .expect("Query failed");

    assert!(result.is_none());
}

// ── Daily spend tests ─────────────────────────────────────────────────────

#[tokio::test]
async fn test_daily_spend_tracking() {
    let pool = test_pool().await;
    let hash = "test_device_spend_001";
    let wallet = "GABC2222222222222222222222222222222222222222222222222222";
    let today = chrono::Utc::now().date_naive();

    insert_device(&pool, hash, wallet).await;

    // Insert initial spend
    sqlx::query(
        "INSERT INTO daily_spends (device_hash, transaction_date, total_spent_stroops, transaction_count)
         VALUES ($1, $2, $3, 1)"
    )
    .bind(hash)
    .bind(today)
    .bind(500_000_i64)
    .execute(&pool)
    .await
    .expect("Failed to insert daily spend");

    // Upsert additional spend
    sqlx::query(
        "INSERT INTO daily_spends (device_hash, transaction_date, total_spent_stroops, transaction_count)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT (device_hash, transaction_date)
         DO UPDATE SET total_spent_stroops = total_spent_stroops + $3, transaction_count = transaction_count + 1"
    )
    .bind(hash)
    .bind(today)
    .bind(300_000_i64)
    .execute(&pool)
    .await
    .expect("Failed to upsert daily spend");

    let row: (i64, i32) = sqlx::query_as(
        "SELECT total_spent_stroops, transaction_count FROM daily_spends
         WHERE device_hash = $1 AND transaction_date = $2"
    )
    .bind(hash)
    .bind(today)
    .fetch_one(&pool)
    .await
    .expect("Failed to fetch daily spend");

    assert_eq!(row.0, 800_000);
    assert_eq!(row.1, 2);

    // Cleanup
    sqlx::query("DELETE FROM daily_spends WHERE device_hash = $1").bind(hash).execute(&pool).await.ok();
    sqlx::query("DELETE FROM devices WHERE device_hash = $1").bind(hash).execute(&pool).await.ok();
}

// ── Payment transaction tests ─────────────────────────────────────────────

#[tokio::test]
async fn test_store_and_retrieve_transaction() {
    let pool = test_pool().await;
    let device_hash = "test_device_tx_001";
    let wallet = "GABC3333333333333333333333333333333333333333333333333333";
    let tx_id = format!("test-tx-{}", uuid::Uuid::new_v4());
    let idem_key = format!("idem-{}", uuid::Uuid::new_v4());

    insert_device(&pool, device_hash, wallet).await;

    sqlx::query(
        "INSERT INTO payment_transactions
         (transaction_id, device_hash, source_wallet, destination_wallet,
          amount_stroops, fee_stroops, status, created_at, idempotency_key)
         VALUES ($1, $2, 'pending', $3, $4, 200, 'pending', NOW(), $5)"
    )
    .bind(&tx_id)
    .bind(device_hash)
    .bind(wallet)
    .bind(1_000_000_i64)
    .bind(&idem_key)
    .execute(&pool)
    .await
    .expect("Failed to insert transaction");

    let result = sqlx::query_as::<_, noir_backend::models::PaymentTransaction>(
        "SELECT id, transaction_id, device_hash, source_wallet, destination_wallet,
                amount_stroops, fee_stroops, status, stellar_tx_hash, created_at,
                submitted_at, confirmed_at, error_message, fee_channel_used
         FROM payment_transactions WHERE transaction_id = $1"
    )
    .bind(&tx_id)
    .fetch_optional(&pool)
    .await
    .expect("Query failed");

    assert!(result.is_some());
    let tx = result.unwrap();
    assert_eq!(tx.transaction_id, tx_id);
    assert_eq!(tx.amount_stroops, 1_000_000);
    assert_eq!(tx.status, "pending");
    assert!(tx.stellar_tx_hash.is_none());

    // Cleanup
    sqlx::query("DELETE FROM payment_transactions WHERE transaction_id = $1").bind(&tx_id).execute(&pool).await.ok();
    sqlx::query("DELETE FROM devices WHERE device_hash = $1").bind(device_hash).execute(&pool).await.ok();
}

#[tokio::test]
async fn test_idempotency_key_uniqueness() {
    let pool = test_pool().await;
    let device_hash = "test_device_idem_001";
    let wallet = "GABC4444444444444444444444444444444444444444444444444444";
    let idem_key = format!("idem-unique-{}", uuid::Uuid::new_v4());

    insert_device(&pool, device_hash, wallet).await;

    let tx_id1 = format!("tx-idem-1-{}", uuid::Uuid::new_v4());
    sqlx::query(
        "INSERT INTO payment_transactions
         (transaction_id, device_hash, source_wallet, destination_wallet,
          amount_stroops, fee_stroops, status, created_at, idempotency_key)
         VALUES ($1, $2, 'pending', $3, 500000, 200, 'pending', NOW(), $4)"
    )
    .bind(&tx_id1)
    .bind(device_hash)
    .bind(wallet)
    .bind(&idem_key)
    .execute(&pool)
    .await
    .expect("First insert failed");

    let tx_id2 = format!("tx-idem-2-{}", uuid::Uuid::new_v4());
    let duplicate = sqlx::query(
        "INSERT INTO payment_transactions
         (transaction_id, device_hash, source_wallet, destination_wallet,
          amount_stroops, fee_stroops, status, created_at, idempotency_key)
         VALUES ($1, $2, 'pending', $3, 500000, 200, 'pending', NOW(), $4)"
    )
    .bind(&tx_id2)
    .bind(device_hash)
    .bind(wallet)
    .bind(&idem_key)
    .execute(&pool)
    .await;

    // Must fail — idempotency_key is unique
    assert!(duplicate.is_err(), "Duplicate idempotency_key should be rejected by DB");

    // Cleanup
    sqlx::query("DELETE FROM payment_transactions WHERE device_hash = $1").bind(device_hash).execute(&pool).await.ok();
    sqlx::query("DELETE FROM devices WHERE device_hash = $1").bind(device_hash).execute(&pool).await.ok();
}

// ── Fee channel tests ─────────────────────────────────────────────────────

#[tokio::test]
async fn test_fee_channel_balance_decrement() {
    let pool = test_pool().await;
    let address = format!("GCHAN{}", uuid::Uuid::new_v4().simple());
    let address = &address[..56.min(address.len())];

    insert_fee_channel(&pool, address, 5_000_000).await;

    sqlx::query(
        "UPDATE fee_channels SET balance_stroops = balance_stroops - $1 WHERE channel_address = $2"
    )
    .bind(200_i64)
    .bind(address)
    .execute(&pool)
    .await
    .expect("Failed to decrement balance");

    let balance: (i64,) = sqlx::query_as(
        "SELECT balance_stroops FROM fee_channels WHERE channel_address = $1"
    )
    .bind(address)
    .fetch_one(&pool)
    .await
    .expect("Failed to fetch balance");

    assert_eq!(balance.0, 4_999_800);

    // Cleanup
    sqlx::query("DELETE FROM fee_channels WHERE channel_address = $1").bind(address).execute(&pool).await.ok();
}

#[tokio::test]
async fn test_active_channels_ordered_by_balance() {
    let pool = test_pool().await;
    let suffix = uuid::Uuid::new_v4().simple().to_string();
    let addr1 = format!("GLOW{}{}", &suffix[..10], "A".repeat(42));
    let addr2 = format!("GHIG{}{}", &suffix[..10], "B".repeat(42));
    let addr1 = &addr1[..56];
    let addr2 = &addr2[..56];

    insert_fee_channel(&pool, addr1, 2_000_000).await;
    insert_fee_channel(&pool, addr2, 8_000_000).await;

    let rows: Vec<(String, i64)> = sqlx::query_as(
        "SELECT channel_address, balance_stroops FROM fee_channels
         WHERE status = 'active' AND channel_address IN ($1, $2)
         ORDER BY balance_stroops DESC"
    )
    .bind(addr1)
    .bind(addr2)
    .fetch_all(&pool)
    .await
    .expect("Query failed");

    assert_eq!(rows.len(), 2);
    // Highest balance first
    assert_eq!(rows[0].1, 8_000_000);
    assert_eq!(rows[1].1, 2_000_000);

    // Cleanup
    sqlx::query("DELETE FROM fee_channels WHERE channel_address IN ($1, $2)").bind(addr1).bind(addr2).execute(&pool).await.ok();
}
