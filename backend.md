# Noir Wallet Backend

## Overview

A **payment gateway backend** for POS terminals, processing payments on the **Stellar (Soroban) blockchain**. Written in Rust (Actix-web, SQLx, Soroban SDK).

The workspace at `backend/asset/Cargo.toml` contains two crates:
- `backend` — the payment gateway HTTP server (`backend/asset/backend/`)
- `contracts/device_registry` — a Soroban WASM smart contract (`backend/asset/contracts/device_registry/`)

---

## Smart Contract: DeviceRegistry

**Location:** `backend/asset/contracts/device_registry/src/lib.rs`

Maps a 32-byte SHA256 device hash (from an NFC tag's hardware UID) to a Stellar wallet address. Deployed on Stellar Testnet at `CC2EBXO3BGFSFCM3DKYI4VFT7DYFFEK7YAGIGFFNLSPFRJ2QKITAQIEC`.

| Function | Auth | Description |
|---|---|---|
| `initialize(admin)` | — | One-time init, stores admin address |
| `register(device_hash, wallet)` | Admin only | Map device hash → wallet address |
| `unregister(device_hash)` | Admin only | Remove device mapping |
| `get_wallet(device_hash)` | None (read-only) | Lookup wallet for device hash |

---

## Payment Gateway Server

**Location:** `backend/asset/backend/`

### Architecture

```
HTTP API (:8080)  ─┬─>  SubmissionProcessor (5s)    ──>  Stellar RPC
                    ├─>  ConfirmationPoller (2s)
                    ├─>  ChannelMonitor (300s)
                    └─>  ContractSyncWorker (3600s, stub)
```

### HTTP API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check (DB + fee channels) |
| GET | `/metrics` | Atomic metrics snapshot |
| POST | `/payment` | Accept payment request (validates device, spend limit, rate limit; returns 202) |
| GET | `/payment/{transaction_id}` | Get transaction status |
| GET | `/device/{device_serial}/transactions` | List device transactions (paginated) |
| GET | `/channels` | List active fee channels |
| GET | `/channels/{channel_address}` | Channel details (on-chain vs DB balance) |

### Payment Flow (POST /payment)

1. **Rate limiting** — 10 req/60s per device hash (sliding window)
2. **Idempotency check** — returns existing result if `idempotency_key` already seen
3. **Payload validation** — non-empty fields, positive amount
4. **Device validation** — device_hash exists + status `active`
5. **Spend limit check** — daily total + amount ≤ `daily_limit_stroops`
6. **Transaction stored** as `pending` in `payment_transactions`
7. **Daily spend incremented** (UPSERT into `daily_spends`)
8. Returns `202 Accepted`

### Background Workers

| Worker | Interval | Role |
|---|---|---|
| **SubmissionProcessor** | 5s | Picks up `pending` txs, selects a fee channel, builds & submits XDR to Stellar |
| **ConfirmationPoller** | 2s | Polls Stellar for `submitted` tx statuses |
| **ChannelMonitor** | 300s | Checks fee channel balances, triggers top-up from master account if below threshold |
| **ContractSyncWorker** | 3600s | Stub (TODO for Phase 2b — syncs on-chain registry with local DB) |

### Key Modules

| Module | Path | Role |
|---|---|---|
| `api.rs` | `src/api.rs` | All 7 HTTP route handlers |
| `config.rs` | `src/config.rs` | Reads 30+ env vars, validates production safety |
| `db.rs` | `src/db.rs` | `DeviceRepository` — 20+ SQLx DB methods |
| `models.rs` | `src/models.rs` | Data structs (Device, PaymentTransaction, etc.) |
| `errors.rs` | `src/errors.rs` | `PaymentError` enum (11 variants), HTTP mapping |
| `state.rs` | `src/state.rs` | `AppState` — shared application state |
| `stellar.rs` | `src/stellar.rs` | `StellarClient` — Stellar RPC calls |
| `channels.rs` | `src/channels.rs` | `ChannelManager` — channel selection, top-ups |
| `validation.rs` | `src/validation.rs` | `DeviceValidator` — payload, device, spend limit checks |
| `rate_limiter.rs` | `src/rate_limiter.rs` | Per-device sliding window rate limiter |
| `transaction_builder.rs` | `src/transaction_builder.rs` | Manual XDR envelope builder |
| `transaction_signer.rs` | `src/transaction_signer.rs` | Stellar key format handling, signing |
| `cache.rs` | `src/cache.rs` | In-memory TTL-based tx state cache |
| `metrics.rs` | `src/metrics.rs` | Atomic counters (payments received/accepted/rejected, etc.) |

### Database Schema (PostgreSQL)

**5 tables** (2 migrations in `backend/asset/backend/migrations/`):

- **`devices`** — device_hash (PK), wallet_address, status, daily_limit_stroops
- **`daily_spends`** — per-device daily total with UNIQUE(device_hash, transaction_date)
- **`payment_transactions`** — transaction_id, device_hash, amounts, status (pending/submitted/confirmed/failed), stellar_tx_hash, idempotency_key (unique index)
- **`fee_channels`** — channel_address (PK), encrypted private key, balance, thresholds, status
- **`channel_transactions`** — per-channel operation history

### Configuration (Key Env Vars)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | _(required)_ | PostgreSQL connection string |
| `STELLAR_RPC_URL` | _(required)_ | Stellar RPC endpoint |
| `API_HOST` / `API_PORT` | `0.0.0.0:8080` | HTTP server bind |
| `RATE_LIMIT_MAX_REQUESTS` | 10 | Max payments per window per device |
| `CHANNEL_MIN_BALANCE_STROOPS` | 1,000,000 (1 XLM) | Fee channel low-balance threshold |
| `CHANNEL_TOPUP_TARGET_STROOPS` | 10,000,000 (10 XLM) | Fee channel top-up target |

### CI/CD

**File:** `.github/workflows/backend-ci.yml` — triggers on pushes/PRs to `main` or `backend` branches scoped to `asset/backend/` changes.

Jobs: Check & Lint (fmt, clippy) → Unit Tests → Integration Tests (with Postgres service container) → Docker Build.

### Docker

- **`Dockerfile`** — Multi-stage build (rust:1.96 → debian:bookworm-slim), ~5MB binary, port 8080
- **`docker-compose.yml`** — Postgres 16 Alpine + backend service with pre-configured env vars

---

## x402 Protocol — Not Yet Implemented

The frontend now implements **x402** (zero-confirmation tap-to-pay), but the backend still needs the following changes:

### Critical Changes

| # | Task | Description |
|---|---|---|
| 1 | **TSK-202** | `POST /api/v1/payments/initiate` must NOT require user confirmation. Return `202 Accepted` immediately and process async. |
| 2 | **TSK-201** (contract) | Add `register_terminal` to the Soroban contract so only whitelisted POS terminals can initiate payments. Add `authorized_terminals` mapping. |
| 3 | **TSK-204** (DB) | Add rate limiting per device — 500ms minimum gap between taps (anti-double-tap). |
| 4 | **TSK-202** | Add offline transaction queue + `POST /api/v1/payments/batch` for batch submission. |
| 5 | **TSK-203** | Add `POST /api/v1/webhooks/pdax/settlement` webhook for PDAX auto-liquidation. |

### New Tasks

| Task | Description |
|---|---|
| **TSK-205** | Terminal authentication middleware (API key or signed challenge) |
| **TSK-206** | Nonce-based transaction replay protection |

### Schema Changes Required

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

Full details in `backendtodo.md`.

## Phase Status

- **Phase 1** — Complete
- Documentation: `FIXES_BEFORE_PHASE2.md`, `PHASE1_COMPLETE.md`, `PHASE1_FIXES_COMPLETE.md`, `PHASE1_REVIEW.md`, `PHASE1_SUMMARY.md` in `backend/`
