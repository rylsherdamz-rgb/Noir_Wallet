# Phase 1 → Phase 2: Action Items

## Critical Fixes (Must Do)

### 1. ✅ Fix Database Schema - PostgreSQL Syntax
**File:** `asset/backend/migrations/20260629000001_initial_schema.sql`

**Changes needed:**
```sql
# ❌ REMOVE MySQL-style syntax:
INDEX idx_name (column)
UNIQUE KEY uk_name (columns)

# ✅ ADD PostgreSQL-style:
CREATE INDEX idx_name ON table_name(column);
CREATE UNIQUE INDEX uk_name ON table_name(columns);
```

**Specific items:**
- [ ] Remove all `INDEX idx_*` lines from table definitions
- [ ] Convert `UNIQUE KEY uk_*` to `UNIQUE (column)` constraints
- [ ] Add `CREATE INDEX` statements after each table
- [ ] Change `TIMESTAMP` to `TIMESTAMP WITH TIME ZONE` for timezone support
- [ ] Change `JSON` to `JSONB` for request_payload and response_envelope
- [ ] Add `CHECK` constraints for status enums:
  - devices.status IN ('active', 'revoked', 'lost')
  - payment_transactions.status IN ('pending', 'submitted', 'confirmed', 'failed')
  - fee_channels.status IN ('active', 'inactive', 'low_balance')
- [ ] Add `ON DELETE CASCADE` to all foreign keys
- [ ] Verify syntax with `sqlx migrate verify` after editing

**Estimated time:** 15-20 minutes

---

### 2. ✅ Fix Compiler Warnings (7 total)

**File:** `src/db.rs`
```rust
# Remove line 2:
use chrono::NaiveDate;
```

**File:** `src/errors.rs`
```rust
# Remove line 3:
use std::fmt;
```

**File:** `src/main.rs`
```rust
# Remove line 4:
use std::sync::Arc;
```

**File:** `src/api.rs`
```rust
# Line 71 - Change:
pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {

# To:
pub async fn health_check(_state: web::Data<AppState>) -> HttpResponse {
```

**File:** `src/queue.rs`
```rust
# Line 18 - Change:
.map_err(|e| crate::errors::PaymentError::InternalError)

# To:
.map_err(|_e| crate::errors::PaymentError::InternalError)
```

**File:** `src/config.rs` (suppress for now - will use in Phase 2)
```rust
# Add #[allow(dead_code)] above unused fields/methods
```

**Estimated time:** 5 minutes

---

## High Priority Fixes (Should Do)

### 3. 📝 Enhance API Handler - Store Transactions
**File:** `src/api.rs` - process_payment function

**After validation passes, add:**
```rust
// Create payment transaction record
let payment_tx = PaymentTransaction {
    transaction_id: transaction_id.clone(),
    device_hash: device_hash.clone(),
    source_wallet: "TBD".to_string(),  // Will come from fee channel in Phase 2
    destination_wallet: req.destination_wallet.clone(),
    amount_stroops: req.amount_stroops as i64,
    fee_stroops: 200,  // Base Stellar fee
    status: "pending".to_string(),
    stellar_tx_hash: None,
    created_at: now,
    submitted_at: None,
    confirmed_at: None,
    error_message: None,
    fee_channel_used: None,
};

// Store to database
state.db.store_payment_transaction(&payment_tx).await?;

// Update daily spend limit
state.db.increment_daily_spend(&device_hash, req.amount_stroops as i64).await?;
```

**Note:** This assumes DeviceRepository methods are ready (they are).

**Estimated time:** 10 minutes

---

### 4. 📝 Add Database Constraints
**File:** migrations SQL file

Add validation constraints for data integrity:
```sql
ALTER TABLE devices ADD CONSTRAINT chk_device_status 
    CHECK (status IN ('active', 'revoked', 'lost'));

ALTER TABLE payment_transactions ADD CONSTRAINT chk_tx_status 
    CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed'));

ALTER TABLE fee_channels ADD CONSTRAINT chk_channel_status 
    CHECK (status IN ('active', 'inactive', 'low_balance'));
```

**Estimated time:** 10 minutes

---

## Optional Improvements (Nice to Have)

### 5. 📝 Add Data Validation Methods
**File:** `src/validation.rs`

Add methods:
```rust
pub fn validate_stellar_address(&self, address: &str) -> Result<()> {
    if address.len() != 56 || !address.starts_with('G') {
        return Err(PaymentError::InvalidPayload(
            "Invalid Stellar address format".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_amount_range(&self, amount: i64) -> Result<()> {
    if amount <= 0 {
        return Err(PaymentError::InvalidPayload(
            "Amount must be positive".to_string(),
        ));
    }
    if amount > 1_000_000_000_000 {  // 10M XLM max
        return Err(PaymentError::InvalidPayload(
            "Amount exceeds maximum".to_string(),
        ));
    }
    Ok(())
}
```

Call these from process_payment validation.

**Estimated time:** 15 minutes

---

### 6. 📝 Add Doc Comments
Add doc comments to public functions for better IDE support:

```rust
/// Hashes a raw hardware device serial number using SHA256
/// 
/// # Arguments
/// * `serial` - The device serial number (non-empty)
///
/// # Returns
/// Hex-encoded SHA256 hash (64 characters)
pub fn hash_device_serial(serial: &str) -> Result<String>
```

**Estimated time:** 20 minutes

---

## Testing the Fixes

After making changes:

```bash
# 1. Check compilation
cd asset/backend
cargo check

# 2. Run crypto tests
cargo test --lib crypto

# 3. Verify migrations
sqlx migrate verify

# 4. Full test run (once Phase 2 tests added)
cargo test
```

---

## Total Effort

| Task | Time | Priority |
|------|------|----------|
| Fix PostgreSQL schema | 20 min | 🔴 CRITICAL |
| Fix compiler warnings | 5 min | 🔴 CRITICAL |
| Enhance API handler | 10 min | 🟠 HIGH |
| Add constraints | 10 min | 🟠 HIGH |
| Add validation methods | 15 min | 🟡 OPTIONAL |
| Add doc comments | 20 min | 🟡 OPTIONAL |
| **TOTAL** | **80 min** | |

**Minimum time to Phase 2:** 35 minutes (critical fixes only)

---

## Verification Checklist

After applying fixes:

- [ ] `cargo check` passes with no warnings
- [ ] `cargo test --lib crypto` passes (4/4 tests)
- [ ] Migration file has valid PostgreSQL syntax
- [ ] All tables have CHECK constraints
- [ ] process_payment stores transactions
- [ ] Database schema can be created
- [ ] Git status clean after changes
- [ ] Ready for Phase 2 implementation

---

**Recommendation:** Apply critical fixes, commit, then proceed to Phase 2
