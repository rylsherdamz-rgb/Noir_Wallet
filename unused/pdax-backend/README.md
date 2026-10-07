# Noir Wallet - Payment Gateway Backend

Low-latency payment processing API for POS terminals on the Stellar blockchain.

## Architecture

The payment gateway consists of:

- **HTTP API** (Actix-web) - Accepts payment requests from POS terminals
- **Device Registry** - Validates device authenticity via SHA256 hashing
- **Spend Limit Enforcement** - Tracks daily spend and enforces limits
- **Stellar SDK Integration** - Builds and submits transactions to Stellar network
- **Fee Channels** - Absorbs network costs via dedicated fee accounts
- **Async Processing** - Decouples API response from blockchain confirmation

## Quick Start

### Prerequisites

- Rust 1.70+
- PostgreSQL 12+
- Docker (for containerized deployment)

### Local Development

1. **Clone and setup environment:**
```bash
cd asset/backend
cp .env.example .env
```

2. **Edit .env with your configuration:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/noir_wallet_dev
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

3. **Start PostgreSQL (using Docker Compose):**
```bash
docker-compose up -d postgres
```

4. **Run database migrations:**
```bash
sqlx migrate run
```

5. **Build and run the server:**
```bash
cargo run
```

The API will start on `http://localhost:8080`

## API Endpoints

### POST /payment
Process a payment from a POS terminal.

**Request:**
```json
{
  "device_serial": "DEVICE_SN_12345",
  "destination_wallet": "GCZST3XVCDTUJ76ZAV2AEAOHPBJG4SKU3ZVMLJVMFM6RYJLIHF3YJM52",
  "amount_stroops": 1000000,
  "idempotency_key": "uuid-string"
}
```

**Response (202 Accepted):**
```json
{
  "status": "accepted",
  "transaction_id": "uuid-string",
  "device_hash": "sha256-hash",
  "submitted_at": "2026-06-29T13:45:00Z"
}
```

### GET /payment/{transaction_id}
Query transaction status.

**Response:**
```json
{
  "status": "confirmed",
  "transaction_id": "uuid-string",
  "amount_stroops": 1000000,
  "destination": "GCZST3XVCDTUJ76ZAV2AEAOHPBJG4SKU3ZVMLJVMFM6RYJLIHF3YJM52",
  "confirmed_at": "2026-06-29T13:45:05Z",
  "stellar_tx_hash": "ca..."
}
```

### GET /health
Health check endpoint.

## Testing

### Unit Tests
```bash
cargo test
```

### Integration Tests (requires testnet)
```bash
cargo test --test integration_test -- --test-threads=1
```

### Load Testing
```bash
bash tests/load_test.sh
```

## Database Schema

Key tables:
- `devices` - Registered POS terminals
- `daily_spends` - Per-device spend tracking
- `payment_transactions` - Transaction audit log
- `fee_channels` - Cost-absorption accounts

See `migrations/001_initial_schema.sql` for full schema.

## Configuration

All configuration via environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `STELLAR_NETWORK` - testnet or public
- `STELLAR_RPC_URL` - Soroban RPC endpoint
- `API_PORT` - HTTP server port (default: 8080)
- `LOG_LEVEL` - Logging level (default: debug)
- `CONFIRMATION_POLL_INTERVAL_SECS` - How often to check blockchain (default: 2)

## Performance Targets

- API response time: < 100ms p99
- Throughput: > 500 req/sec
- Device lookup latency: < 20ms

## Deployment

### Docker Build
```bash
docker build -t noir-wallet-backend:latest .
docker run -p 8080:8080 --env-file .env noir-wallet-backend:latest
```

### Production Checklist
- [ ] Database backups configured
- [ ] Fee channels funded
- [ ] Monitoring and alerting setup
- [ ] Log aggregation configured
- [ ] Rate limiting enabled

## Troubleshooting

### Database Connection Errors
Check that PostgreSQL is running and `DATABASE_URL` is correct.

### Stellar RPC Timeouts
Verify `STELLAR_RPC_URL` is accessible and not rate-limited.

### Low Fee Channel Balance
The channel monitoring worker should alert when balance < 5 XLM.

## Development

### Adding a New Endpoint
1. Add handler to `src/api.rs`
2. Add route in `src/main.rs`
3. Add tests in `tests/integration_test.rs`

### Adding a Database Query
1. Add method to `DeviceRepository` in `src/db.rs`
2. Use SQLx prepared statements for type safety
3. Add unit tests

## License

Noir Wallet © 2026
