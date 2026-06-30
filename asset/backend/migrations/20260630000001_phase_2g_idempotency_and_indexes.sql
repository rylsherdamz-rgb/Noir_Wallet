-- Add idempotency key to payment_transactions (required for Phase 2f deduplication)
ALTER TABLE payment_transactions
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_tx_idempotency_key
    ON payment_transactions(idempotency_key)
    WHERE idempotency_key IS NOT NULL;

-- Composite index for SubmissionProcessor: pending txs ordered by creation time
CREATE INDEX IF NOT EXISTS idx_payment_tx_status_created
    ON payment_transactions(status, created_at ASC)
    WHERE status = 'pending';

-- Composite index for ConfirmationPoller: submitted txs with a hash
CREATE INDEX IF NOT EXISTS idx_payment_tx_status_submitted
    ON payment_transactions(status, submitted_at ASC)
    WHERE status = 'submitted' AND stellar_tx_hash IS NOT NULL;

-- Index for device transaction history endpoint
CREATE INDEX IF NOT EXISTS idx_payment_tx_device_created
    ON payment_transactions(device_hash, created_at DESC);

-- Index for channel selection: active channels ordered by balance
CREATE INDEX IF NOT EXISTS idx_fee_channels_status_balance
    ON fee_channels(status, balance_stroops DESC)
    WHERE status = 'active';

-- Add min_balance_stroops to fee_channels for per-channel topup threshold
ALTER TABLE fee_channels
    ADD COLUMN IF NOT EXISTS min_balance_stroops BIGINT NOT NULL DEFAULT 1000000;

-- Add topup_target_stroops to fee_channels for per-channel topup target
ALTER TABLE fee_channels
    ADD COLUMN IF NOT EXISTS topup_target_stroops BIGINT NOT NULL DEFAULT 10000000;

-- Add total_fees_paid to fee_channels for lifetime usage tracking
ALTER TABLE fee_channels
    ADD COLUMN IF NOT EXISTS total_fees_paid BIGINT NOT NULL DEFAULT 0;

-- Track submission retry count on transactions
ALTER TABLE payment_transactions
    ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;

-- Add index on daily_spends for faster balance checks (already exists but ensure)
CREATE INDEX IF NOT EXISTS idx_daily_spends_device_date
    ON daily_spends(device_hash, transaction_date);
