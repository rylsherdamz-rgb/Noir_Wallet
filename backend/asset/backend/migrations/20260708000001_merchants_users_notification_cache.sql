-- ============================================================================
-- TSK-204: Merchant accounts, app users, and the ephemeral transaction
-- notification cache that powers real-time client UI updates.
-- ============================================================================

-- Merchant accounts (businesses accepting payments through Noir devices)
CREATE TABLE merchants (
    id BIGSERIAL PRIMARY KEY,
    merchant_uuid VARCHAR(36) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    settlement_wallet VARCHAR(56) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- Envelope-encrypted merchant configuration (fee splits, webhook URLs,
    -- third-party API credentials). Encrypted via crypto::KeyManager;
    -- never selected into the Merchant model — see db::DeviceRepository.
    config_encrypted BYTEA,
    config_key_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_merchant_status CHECK (status IN ('active', 'suspended', 'closed'))
);

CREATE UNIQUE INDEX idx_merchants_settlement_wallet ON merchants(settlement_wallet);
CREATE INDEX idx_merchants_status_active ON merchants(status) WHERE status = 'active';

-- App users (mobile wallet holders)
CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    user_uuid VARCHAR(36) NOT NULL UNIQUE,
    wallet_address VARCHAR(56) NOT NULL UNIQUE,
    identity_hash VARCHAR(64) NOT NULL UNIQUE,
    -- Envelope-encrypted wallet entropy seed. Encrypted via
    -- crypto::KeyManager; never selected into the AppUser model.
    entropy_seed_encrypted BYTEA NOT NULL,
    seed_key_version INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_app_user_status CHECK (status IN ('active', 'locked', 'closed'))
);

CREATE INDEX idx_app_users_status_active ON app_users(status) WHERE status = 'active';

-- Link physical devices to the merchant or app user that owns them.
ALTER TABLE devices
    ADD COLUMN merchant_id BIGINT REFERENCES merchants(id) ON DELETE SET NULL,
    ADD COLUMN owner_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL;

CREATE INDEX idx_devices_merchant_id ON devices(merchant_id) WHERE merchant_id IS NOT NULL;
CREATE INDEX idx_devices_owner_user_id ON devices(owner_user_id) WHERE owner_user_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- Device cryptographic hash index optimization (dense tap workloads)
-- ----------------------------------------------------------------------------
-- `devices.device_hash` already carries a UNIQUE constraint, which Postgres
-- backs with its own btree index — the separate `idx_devices_device_hash`
-- index created in the initial migration duplicates it, doubling write-time
-- index maintenance on the single hottest lookup path (every tap) for no
-- read benefit. Drop the duplicate and replace it with a covering index
-- over the columns the tap-read path actually needs, so a lookup by
-- device_hash is satisfied entirely from the index (index-only scan) for
-- the common case of an active device.
DROP INDEX IF EXISTS idx_devices_device_hash;

CREATE INDEX idx_devices_hash_covering
    ON devices(device_hash)
    INCLUDE (wallet_address, status, daily_limit_stroops)
    WHERE status = 'active';

-- ----------------------------------------------------------------------------
-- Ephemeral transaction notification cache
-- ----------------------------------------------------------------------------
-- Short-lived rows that power real-time client UI notifications (tap ->
-- confirmation push). This is distinct from `payment_transactions`, which
-- remains the permanent audit trail; rows here are pruned continuously by
-- workers::NotificationPruner once past `expires_at`.
CREATE TABLE transaction_notifications (
    id BIGSERIAL PRIMARY KEY,
    device_hash VARCHAR(64) NOT NULL REFERENCES devices(device_hash) ON DELETE CASCADE,
    payment_transaction_id BIGINT REFERENCES payment_transactions(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    amount_stroops BIGINT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_notification_status CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed'))
);

-- Hot path: "give me this device's latest notifications" (client poll/socket)
CREATE INDEX idx_tx_notifications_device_created
    ON transaction_notifications(device_hash, created_at DESC);

-- Pruning sweep: NOW() isn't IMMUTABLE so this can't be a partial index —
-- a plain btree on expires_at keeps `DELETE ... WHERE expires_at < NOW()`
-- an index range scan instead of a sequential scan as the table churns.
CREATE INDEX idx_tx_notifications_expires_at
    ON transaction_notifications(expires_at);

-- Rows are inserted and deleted continuously under tap load; favor
-- aggressive autovacuum here so the table doesn't bloat at default settings.
ALTER TABLE transaction_notifications SET (autovacuum_vacuum_scale_factor = 0.02);
