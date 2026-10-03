//! Integration tests against a live Postgres.
//!
//! Run with:
//!   DATABASE_URL=postgres://noir_user:noir_password@localhost:5432/noir_wallet_test \
//!   cargo test --test integration
//!
//! `docker-compose.yml` in `backend/asset/` brings up a suitable instance.
//!
//! Every test starts with `let Some(pool) = test_pool().await else { return };`
//! so the suite is a no-op without a database instead of failing. The previous
//! version of this file did not compile at all — `test_pool()` returned
//! `Option<PgPool>` and all thirteen tests passed `&pool` into functions taking
//! `&PgPool` — so none of it had ever run.

use noir_backend::db::Repository;
use noir_backend::money::{self, CRYPTO_SCALE, PHP_SCALE};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::env;

async fn test_pool() -> Option<PgPool> {
    let url = env::var("DATABASE_URL").ok()?;

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .ok()?;

    sqlx::migrate!("./migrations").run(&pool).await.ok()?;
    Some(pool)
}

/// Unique per test run so parallel tests never collide on a wallet address.
/// Not a real Stellar address — no signature is verified at this layer.
fn test_wallet(tag: &str) -> String {
    let unique = uuid::Uuid::new_v4().simple().to_string();
    format!("G{}{}", tag.to_uppercase(), unique)
        .chars()
        .take(56)
        .collect()
}

async fn cleanup(pool: &PgPool, wallet: &str) {
    let _ = sqlx::query("DELETE FROM pdax_orders WHERE wallet_address = $1")
        .bind(wallet)
        .execute(pool)
        .await;
    let _ = sqlx::query("DELETE FROM sessions WHERE wallet_address = $1")
        .bind(wallet)
        .execute(pool)
        .await;
    let _ = sqlx::query("DELETE FROM auth_challenges WHERE wallet_address = $1")
        .bind(wallet)
        .execute(pool)
        .await;
    let _ = sqlx::query("DELETE FROM app_users WHERE wallet_address = $1")
        .bind(wallet)
        .execute(pool)
        .await;
}

// ── Challenges ───────────────────────────────────────────────────────────────

#[tokio::test]
async fn challenge_can_only_be_consumed_once() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("chal");
    let nonce = uuid::Uuid::new_v4().simple().to_string();

    repo.create_challenge(&wallet, &nonce, 300).await.unwrap();

    assert!(repo.consume_challenge(&wallet, &nonce).await.unwrap());
    // Replaying a nonce must fail, or a captured challenge would be reusable.
    assert!(!repo.consume_challenge(&wallet, &nonce).await.unwrap());

    cleanup(&pool, &wallet).await;
}

#[tokio::test]
async fn challenge_is_bound_to_its_wallet() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let owner = test_wallet("owner");
    let attacker = test_wallet("attack");
    let nonce = uuid::Uuid::new_v4().simple().to_string();

    repo.create_challenge(&owner, &nonce, 300).await.unwrap();

    // Someone else's nonce is not a credential.
    assert!(!repo.consume_challenge(&attacker, &nonce).await.unwrap());
    assert!(repo.consume_challenge(&owner, &nonce).await.unwrap());

    cleanup(&pool, &owner).await;
    cleanup(&pool, &attacker).await;
}

#[tokio::test]
async fn expired_challenge_is_rejected() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("expch");
    let nonce = uuid::Uuid::new_v4().simple().to_string();

    // Negative TTL puts expiry in the past.
    repo.create_challenge(&wallet, &nonce, -1).await.unwrap();
    assert!(!repo.consume_challenge(&wallet, &nonce).await.unwrap());

    cleanup(&pool, &wallet).await;
}

// ── Sessions ─────────────────────────────────────────────────────────────────

#[tokio::test]
async fn session_resolves_to_its_wallet_until_revoked() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("sess");
    let token_hash = noir_backend::auth::hash_token(&uuid::Uuid::new_v4().to_string());

    repo.create_session(&token_hash, &wallet, 3600)
        .await
        .unwrap();
    assert_eq!(
        repo.wallet_for_session(&token_hash)
            .await
            .unwrap()
            .as_deref(),
        Some(wallet.as_str())
    );

    repo.revoke_session(&token_hash).await.unwrap();
    assert!(repo
        .wallet_for_session(&token_hash)
        .await
        .unwrap()
        .is_none());

    cleanup(&pool, &wallet).await;
}

#[tokio::test]
async fn expired_session_does_not_resolve() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("expsess");
    let token_hash = noir_backend::auth::hash_token(&uuid::Uuid::new_v4().to_string());

    repo.create_session(&token_hash, &wallet, -1).await.unwrap();
    assert!(repo
        .wallet_for_session(&token_hash)
        .await
        .unwrap()
        .is_none());

    cleanup(&pool, &wallet).await;
}

// ── Orders: the isolation that matters most ──────────────────────────────────

#[tokio::test]
async fn one_wallet_cannot_read_another_wallets_orders() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let alice = test_wallet("alice");
    let bob = test_wallet("bob");
    let key = uuid::Uuid::new_v4().to_string();

    repo.claim_order(&key, &alice, "cash_in", "USDC", 150_000)
        .await
        .unwrap()
        .expect("alice claims the key");

    // Bob's listing must not contain Alice's order. This is the regression that
    // matters: the old service returned every device and transaction in the
    // system to any caller holding the shared API key.
    let bobs = repo.list_orders_for_wallet(&bob, 100, 0).await.unwrap();
    assert!(bobs.is_empty());

    let alices = repo.list_orders_for_wallet(&alice, 100, 0).await.unwrap();
    assert_eq!(alices.len(), 1);
    assert_eq!(alices[0].wallet_address, alice);

    // The handler additionally rejects a cross-wallet fetch by key; the row
    // itself carries the owner so that check cannot be bypassed.
    let fetched = repo.get_order_by_key(&key).await.unwrap().unwrap();
    assert_eq!(fetched.wallet_address, alice);
    assert_ne!(fetched.wallet_address, bob);

    cleanup(&pool, &alice).await;
    cleanup(&pool, &bob).await;
}

#[tokio::test]
async fn idempotency_key_can_only_be_claimed_once() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("idem");
    let key = uuid::Uuid::new_v4().to_string();

    let first = repo
        .claim_order(&key, &wallet, "cash_in", "USDC", 150_000)
        .await
        .unwrap();
    assert!(first.is_some(), "first claim wins");

    // A retry must not place a second order — this is the whole point of
    // claiming before any side effect.
    let second = repo
        .claim_order(&key, &wallet, "cash_in", "USDC", 150_000)
        .await
        .unwrap();
    assert!(second.is_none(), "replay must not create a second order");

    let all = repo.list_orders_for_wallet(&wallet, 100, 0).await.unwrap();
    assert_eq!(all.len(), 1, "exactly one order exists for the key");

    cleanup(&pool, &wallet).await;
}

#[tokio::test]
async fn concurrent_claims_of_one_key_produce_exactly_one_order() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let wallet = test_wallet("race");
    let key = uuid::Uuid::new_v4().to_string();

    // Fire several claims at once. The unique index is what makes this safe;
    // a read-then-write would let more than one through.
    let mut handles = Vec::new();
    for _ in 0..8 {
        let repo = Repository::new(pool.clone());
        let key = key.clone();
        let wallet = wallet.clone();
        handles.push(tokio::spawn(async move {
            repo.claim_order(&key, &wallet, "cash_in", "XLM", 50_000)
                .await
                .unwrap()
                .is_some()
        }));
    }

    let mut winners = 0;
    for h in handles {
        if h.await.unwrap() {
            winners += 1;
        }
    }

    assert_eq!(winners, 1, "exactly one concurrent claim may win");

    let repo = Repository::new(pool.clone());
    let all = repo.list_orders_for_wallet(&wallet, 100, 0).await.unwrap();
    assert_eq!(all.len(), 1);

    cleanup(&pool, &wallet).await;
}

#[tokio::test]
async fn order_lifecycle_records_amounts_as_integer_minor_units() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("life");
    let key = uuid::Uuid::new_v4().to_string();

    // PHP 1,500.00 -> 150000 centavos.
    let php_minor = money::parse_decimal("1500.00", PHP_SCALE).unwrap();
    repo.claim_order(&key, &wallet, "cash_in", "USDC", php_minor)
        .await
        .unwrap()
        .unwrap();

    // 25.5 USDC -> 255000000 at scale 7.
    let crypto_minor = money::parse_decimal("25.5", CRYPTO_SCALE).unwrap();
    repo.record_quote(&key, "quote-abc", crypto_minor)
        .await
        .unwrap();
    repo.record_order_placed(&key, "order-123").await.unwrap();
    repo.record_withdrawal(&key, "withdraw-xyz").await.unwrap();

    let order = repo.get_order_by_key(&key).await.unwrap().unwrap();
    assert_eq!(order.php_minor, 150_000);
    assert_eq!(order.crypto_minor, Some(255_000_000));
    assert_eq!(order.status, "withdrawing");
    assert_eq!(order.pdax_order_id.as_deref(), Some("order-123"));

    cleanup(&pool, &wallet).await;
}

#[tokio::test]
async fn non_positive_amounts_are_rejected_by_the_database() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("neg");

    // The handler validates too, but the CHECK constraint is the backstop.
    let result = repo
        .claim_order(
            &uuid::Uuid::new_v4().to_string(),
            &wallet,
            "cash_in",
            "USDC",
            0,
        )
        .await;
    assert!(result.is_err());

    let result = repo
        .claim_order(
            &uuid::Uuid::new_v4().to_string(),
            &wallet,
            "cash_in",
            "USDC",
            -100,
        )
        .await;
    assert!(result.is_err());

    cleanup(&pool, &wallet).await;
}

#[tokio::test]
async fn unknown_asset_is_rejected_by_the_database() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("asset");

    let result = repo
        .claim_order(
            &uuid::Uuid::new_v4().to_string(),
            &wallet,
            "cash_in",
            "DOGE",
            1000,
        )
        .await;
    assert!(result.is_err(), "asset CHECK constraint must reject DOGE");

    cleanup(&pool, &wallet).await;
}

// ── Webhook application ──────────────────────────────────────────────────────

#[tokio::test]
async fn webhook_redelivery_is_idempotent() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("hook");
    let key = uuid::Uuid::new_v4().to_string();
    let pdax_order_id = format!("ord-{}", uuid::Uuid::new_v4().simple());

    repo.claim_order(&key, &wallet, "cash_in", "USDC", 10_000)
        .await
        .unwrap()
        .unwrap();
    repo.record_order_placed(&key, &pdax_order_id)
        .await
        .unwrap();

    let event = "evt-1";
    assert!(repo
        .apply_webhook_event(&pdax_order_id, event, "settled")
        .await
        .unwrap());

    // The same event arriving twice must not transition the order again.
    assert!(!repo
        .apply_webhook_event(&pdax_order_id, event, "settled")
        .await
        .unwrap());

    let order = repo.get_order_by_key(&key).await.unwrap().unwrap();
    assert_eq!(order.status, "settled");
    assert_eq!(order.last_event_id.as_deref(), Some(event));

    cleanup(&pool, &wallet).await;
}

#[tokio::test]
async fn webhook_for_unknown_order_changes_nothing() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());

    let applied = repo
        .apply_webhook_event("no-such-order", "evt-x", "settled")
        .await
        .unwrap();
    assert!(!applied);
}

// ── Rate limiting ────────────────────────────────────────────────────────────

#[tokio::test]
async fn rate_limit_counter_is_shared_and_atomic() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let bucket = format!("test:{}", uuid::Uuid::new_v4().simple());
    let window = chrono::Utc::now();

    // Separate Repository instances stand in for separate service instances.
    // A process-local limiter would count each of these from zero.
    let mut handles = Vec::new();
    for _ in 0..10 {
        let repo = Repository::new(pool.clone());
        let bucket = bucket.clone();
        handles.push(tokio::spawn(async move {
            repo.increment_rate_limit(&bucket, window).await.unwrap()
        }));
    }

    let mut counts: Vec<i32> = Vec::new();
    for h in handles {
        counts.push(h.await.unwrap());
    }
    counts.sort_unstable();

    // Ten increments must yield exactly 1..=10 with no duplicates, which is
    // only true if the upsert is atomic.
    assert_eq!(counts, (1..=10).collect::<Vec<i32>>());

    let _ = sqlx::query("DELETE FROM rate_limits WHERE bucket_key = $1")
        .bind(&bucket)
        .execute(&pool)
        .await;
}

// ── Users ────────────────────────────────────────────────────────────────────

#[tokio::test]
async fn account_deletion_is_scoped_to_one_wallet() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let leaving = test_wallet("leave");
    let staying = test_wallet("stay");

    repo.upsert_user(&leaving).await.unwrap();
    repo.upsert_user(&staying).await.unwrap();

    let affected = repo.mark_user_deleted(&leaving).await.unwrap();
    assert_eq!(affected, 1, "exactly one account closes");

    // The old implementation deleted by the literal wallet "pending", which was
    // every placeholder user at once.
    let other = repo.get_user_by_wallet(&staying).await.unwrap().unwrap();
    assert_eq!(other.status, "active");

    cleanup(&pool, &leaving).await;
    cleanup(&pool, &staying).await;
}

#[tokio::test]
async fn upsert_user_is_idempotent() {
    let Some(pool) = test_pool().await else {
        return;
    };
    let repo = Repository::new(pool.clone());
    let wallet = test_wallet("upsert");

    repo.upsert_user(&wallet).await.unwrap();
    let first = repo.get_user_by_wallet(&wallet).await.unwrap().unwrap();

    repo.upsert_user(&wallet).await.unwrap();
    let second = repo.get_user_by_wallet(&wallet).await.unwrap().unwrap();

    // Re-authenticating must not mint a new identity.
    assert_eq!(first.user_uuid, second.user_uuid);

    cleanup(&pool, &wallet).await;
}
