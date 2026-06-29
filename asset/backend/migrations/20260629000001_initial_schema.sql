-- Devices table (mirrors on-chain registry)
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_hash VARCHAR(64) NOT NULL UNIQUE,
    wallet_address VARCHAR(56) NOT NULL,
    registration_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    daily_limit_stroops BIGINT DEFAULT 1000000000,
    last_synced_on_chain TIMESTAMP,
    INDEX idx_device_hash (device_hash),
    INDEX idx_wallet_address (wallet_address)
);

-- Daily spend tracking (for spend limit enforcement)
CREATE TABLE daily_spends (
    id SERIAL PRIMARY KEY,
    device_hash VARCHAR(64) NOT NULL,
    transaction_date DATE NOT NULL,
    total_spent_stroops BIGINT DEFAULT 0,
    transaction_count INT DEFAULT 0,
    UNIQUE KEY uk_device_date (device_hash, transaction_date),
    FOREIGN KEY (device_hash) REFERENCES devices(device_hash),
    INDEX idx_device_date (device_hash, transaction_date)
);

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
    created_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    error_message TEXT,
    request_payload JSON,
    response_envelope JSON,
    fee_channel_used VARCHAR(56),
    INDEX idx_device_hash (device_hash),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
);

-- Fee channel tracking (cost absorption)
CREATE TABLE fee_channels (
    id SERIAL PRIMARY KEY,
    channel_address VARCHAR(56) NOT NULL UNIQUE,
    private_key_encrypted BYTEA NOT NULL,
    balance_stroops BIGINT NOT NULL DEFAULT 0,
    last_balance_check TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_channel_address (channel_address)
);

-- Channel transaction history (reconciliation)
CREATE TABLE channel_transactions (
    id BIGSERIAL PRIMARY KEY,
    channel_address VARCHAR(56) NOT NULL,
    operation_type VARCHAR(20),
    amount_stroops BIGINT,
    payment_transaction_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (channel_address) REFERENCES fee_channels(channel_address),
    FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id),
    INDEX idx_channel_address (channel_address),
    INDEX idx_created_at (created_at)
);
