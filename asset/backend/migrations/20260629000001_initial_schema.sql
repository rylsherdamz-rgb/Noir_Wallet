-- Devices table (mirrors on-chain registry)
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_hash VARCHAR(64) NOT NULL UNIQUE,
    wallet_address VARCHAR(56) NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    daily_limit_stroops BIGINT DEFAULT 1000000000,
    last_synced_on_chain TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_device_status CHECK (status IN ('active', 'revoked', 'lost'))
);

CREATE INDEX idx_devices_device_hash ON devices(device_hash);
CREATE INDEX idx_devices_wallet_address ON devices(wallet_address);

-- Daily spend tracking (for spend limit enforcement)
CREATE TABLE daily_spends (
    id SERIAL PRIMARY KEY,
    device_hash VARCHAR(64) NOT NULL,
    transaction_date DATE NOT NULL,
    total_spent_stroops BIGINT DEFAULT 0,
    transaction_count INT DEFAULT 0,
    UNIQUE (device_hash, transaction_date),
    FOREIGN KEY (device_hash) REFERENCES devices(device_hash) ON DELETE CASCADE
);

CREATE INDEX idx_daily_spends_device_date ON daily_spends(device_hash, transaction_date);

-- Transaction log (audit trail + async processing queue)
CREATE TABLE payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    device_hash VARCHAR(64) NOT NULL,
    source_wallet VARCHAR(56) NOT NULL,
    destination_wallet VARCHAR(56) NOT NULL,
    amount_stroops BIGINT NOT NULL,
    fee_stroops BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    stellar_tx_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    request_payload JSONB,
    response_envelope JSONB,
    fee_channel_used VARCHAR(56),
    FOREIGN KEY (device_hash) REFERENCES devices(device_hash) ON DELETE CASCADE,
    CONSTRAINT chk_tx_status CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed'))
);

CREATE INDEX idx_payment_tx_device_hash ON payment_transactions(device_hash);
CREATE INDEX idx_payment_tx_status ON payment_transactions(status);
CREATE INDEX idx_payment_tx_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX idx_payment_tx_created_at ON payment_transactions(created_at);

-- Fee channel tracking (cost absorption)
CREATE TABLE fee_channels (
    id SERIAL PRIMARY KEY,
    channel_address VARCHAR(56) NOT NULL UNIQUE,
    private_key_encrypted BYTEA NOT NULL,
    balance_stroops BIGINT NOT NULL DEFAULT 0,
    last_balance_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_channel_status CHECK (status IN ('active', 'inactive', 'low_balance'))
);

CREATE INDEX idx_fee_channels_channel_address ON fee_channels(channel_address);

-- Channel transaction history (reconciliation)
CREATE TABLE channel_transactions (
    id BIGSERIAL PRIMARY KEY,
    channel_address VARCHAR(56) NOT NULL,
    operation_type VARCHAR(20),
    amount_stroops BIGINT,
    payment_transaction_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (channel_address) REFERENCES fee_channels(channel_address) ON DELETE CASCADE,
    FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL
);

CREATE INDEX idx_channel_tx_channel_address ON channel_transactions(channel_address);
CREATE INDEX idx_channel_tx_created_at ON channel_transactions(created_at);
