# Backend TODO — x402 Protocol Changes

The frontend now implements **x402** (zero-confirmation tap-to-pay). The existing backend task matrix (TSK-201 through TSK-204) needs the following updates:

## Critical Changes

### 1. Payment Gateway — Remove Confirmation Step
- **TSK-202**: `POST /api/v1/payments/initiate` must NOT require user confirmation.
- The flow is: tap → hash UID → resolve wallet → deduct → settle.
- The user never approves on-device. The terminal itself authorizes the tap.
- Return `202 Accepted` immediately and process async (already drafted, good).

### 2. device_registry Contract — Add Terminal Auth
- **TSK-201**: The Soroban contract needs a `register_terminal` function so only whitelisted POS terminals can initiate payments.
- Add `authorized_terminals` mapping — a terminal must be registered before it can trigger a `resolve_device` call for payment.
- Add `last_tx_at` to device mapping for replay protection.

### 3. Rate Limiting per Device
- **TSK-204** (DB schema): Add `tx_count_today` and `last_tx_timestamp` to `devices` table.
- Enforce minimum 500ms gap between taps from the same device (anti-double-tap).

### 4. Offline Queue
- **TSK-202**: Add an offline transaction queue on the terminal side.
- If the Stellar network is unreachable, queue the tx locally and submit when online.
- Add `POST /api/v1/payments/batch` for batch submission after reconnect.

### 5. PDAX Settlement — Auto-Liquidation
- **TSK-203**: Add a webhook endpoint `POST /api/v1/webhooks/pdax/settlement` that PDAX calls after fiat conversion.
- Add configurable auto-liquidation threshold (e.g., auto-convert USDC > $50 to PHP).

## New Tasks

### TSK-205: Terminal Authentication Middleware
Middleware that validates POS terminal identity via API key or signed challenge before processing any payment.

### TSK-206: Transaction Replay Protection
Nonce-based system where each tap includes a timestamp nonce signed by the terminal to prevent replay attacks.

## Schema Changes Required

```sql
ALTER TABLE devices ADD COLUMN tx_count_today INT DEFAULT 0;
ALTER TABLE devices ADD COLUMN last_tx_timestamp TIMESTAMP WITH TIME ZONE;

CREATE TABLE authorized_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    terminal_public_key CHAR(56) NOT NULL UNIQUE,
    api_key_hash CHAR(64) NOT NULL,
    label VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transactions_cache ADD COLUMN terminal_id UUID REFERENCES authorized_terminals(id);
ALTER TABLE transactions_cache ADD COLUMN nonce VARCHAR(64);
CREATE UNIQUE INDEX idx_tx_nonce ON transactions_cache(nonce);
```
