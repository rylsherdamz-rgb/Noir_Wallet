-- ----------------------------------------------------------------------------
-- Reduce the backend to a PDAX fiat bridge.
-- ----------------------------------------------------------------------------
-- Everything in the payment path moved on-chain (device_registry,
-- agent_registry, payment_escrow). The backend no longer registers devices,
-- builds or submits Stellar transactions, holds wallet secrets, or tracks
-- payments. Its only remaining job is PHP <-> crypto conversion via PDAX.
--
-- Dropped tables are unrecoverable. They held device registrations that are
-- now authoritative on-chain, and transaction history that Horizon serves
-- directly.

DROP TABLE IF EXISTS transaction_notifications;
DROP TABLE IF EXISTS channel_transactions;
DROP TABLE IF EXISTS daily_spends;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS fee_channels;
DROP TABLE IF EXISTS devices;

-- `merchants` backed the merchant-settings endpoints, which returned a
-- hardcoded stub and discarded writes. Both endpoints are gone; nothing else
-- reads this table.
DROP TABLE IF EXISTS merchants;

-- ----------------------------------------------------------------------------
-- app_users: identity is now the Stellar wallet, proven by signature.
-- ----------------------------------------------------------------------------
-- The custodial columns go with the custodial flows. `identity_hash` was a
-- client-supplied opaque string that authenticated nothing; SEP-10 style
-- signature verification replaces it.
ALTER TABLE app_users
    DROP COLUMN IF EXISTS entropy_seed_encrypted,
    DROP COLUMN IF EXISTS seed_key_version,
    DROP COLUMN IF EXISTS identity_hash;

-- ----------------------------------------------------------------------------
-- Auth: challenge -> signature -> session
-- ----------------------------------------------------------------------------
-- A challenge is a server-generated nonce the caller signs with the wallet key
-- it claims to own. Single-use: `consumed_at` is set in the same UPDATE that
-- claims it, so two concurrent verifies cannot both succeed on one nonce.
CREATE TABLE auth_challenges (
    id BIGSERIAL PRIMARY KEY,
    wallet_address VARCHAR(56) NOT NULL,
    nonce VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ
);

CREATE INDEX idx_auth_challenges_wallet ON auth_challenges(wallet_address);
CREATE INDEX idx_auth_challenges_expiry ON auth_challenges(expires_at)
    WHERE consumed_at IS NULL;

-- Only the SHA-256 of the bearer token is stored, so a database dump does not
-- yield usable sessions. A table rather than a JWT because revocation has to
-- actually take effect.
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    wallet_address VARCHAR(56) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_wallet ON sessions(wallet_address);
CREATE INDEX idx_sessions_live ON sessions(expires_at)
    WHERE revoked_at IS NULL;

-- ----------------------------------------------------------------------------
-- pdax_orders: every conversion this service initiates
-- ----------------------------------------------------------------------------
-- `idempotency_key` is supplied by the caller and uniquely constrained, so a
-- retried cash-in returns the original order instead of placing a second one.
-- All amounts are integer minor units: PHP in centavos (scale 2), crypto in
-- stroops-equivalent (scale 7). No floating point anywhere in the money path.
CREATE TABLE pdax_orders (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    wallet_address VARCHAR(56) NOT NULL,
    direction VARCHAR(16) NOT NULL,
    asset VARCHAR(16) NOT NULL,
    php_minor BIGINT NOT NULL,
    crypto_minor BIGINT,
    pdax_order_id VARCHAR(64),
    pdax_quote_id VARCHAR(128),
    withdrawal_identifier VARCHAR(64),
    status VARCHAR(24) NOT NULL DEFAULT 'pending',
    last_event_id VARCHAR(128),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pdax_direction CHECK (direction IN ('cash_in', 'cash_out')),
    CONSTRAINT chk_pdax_asset CHECK (asset IN ('USDC', 'XLM')),
    CONSTRAINT chk_pdax_status CHECK (
        status IN ('pending', 'quoted', 'ordered', 'withdrawing', 'settled', 'failed')
    ),
    CONSTRAINT chk_pdax_php_positive CHECK (php_minor > 0)
);

CREATE INDEX idx_pdax_orders_wallet ON pdax_orders(wallet_address);
CREATE INDEX idx_pdax_orders_pdax_id ON pdax_orders(pdax_order_id)
    WHERE pdax_order_id IS NOT NULL;
CREATE INDEX idx_pdax_orders_open ON pdax_orders(status)
    WHERE status NOT IN ('settled', 'failed');

-- ----------------------------------------------------------------------------
-- rate_limits: shared across instances
-- ----------------------------------------------------------------------------
-- The previous limiter was an in-process HashMap, so on Cloud Run the real
-- limit was (configured limit x instance count). A counter row per
-- (bucket, window) makes the limit hold no matter how many instances run.
CREATE TABLE rate_limits (
    bucket_key VARCHAR(128) NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (bucket_key, window_start)
);

CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);
