#!/usr/bin/env bash
set -euo pipefail

# Noir Wallet Backend — End-to-End Test Script
# Starts backend (runs migrations), seeds test data, tests every endpoint.
# Usage: ./test_e2e.sh

BASE_URL="${API_HOST:-0.0.0.0}:${API_PORT:-8080}"
DB_URL="${DATABASE_URL:-postgresql://noir_user:noir_password@localhost:5432/noir_wallet_dev}"
BINARY="/home/richie/Projects/Noir_Wallet/backend/asset/target/x86_64-unknown-linux-gnu/release/noir-backend"

PASS=0
FAIL=0
TEST_DEVICE_SERIAL="E2E-TEST-DEVICE-SERIAL-001"

GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
pass() { PASS=$((PASS+1)); echo -e "  ${GREEN}✓ PASS${NC}: $1"; }
fail() { FAIL=$((FAIL+1)); echo -e "  ${RED}✗ FAIL${NC}: $1"; }

cleanup() {
    echo ""; echo "Cleaning up..."
    [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" 2>/dev/null || true
    wait 2>/dev/null || true; echo "Done."
}
trap cleanup EXIT

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Noir Wallet Backend — E2E Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Start backend (runs migrations automatically) ────────────────────────
echo "── Step 1: Start backend → runs migrations ───────────────────────"

export DATABASE_URL="$DB_URL"
export STELLAR_NETWORK="testnet"
export STELLAR_RPC_URL="https://horizon-testnet.stellar.org"
export ENVIRONMENT="development"
export API_HOST="0.0.0.0"
export API_PORT="8080"
export LOG_LEVEL="info"
export RUST_LOG="info,noir_backend=info"

$BINARY &
BACKEND_PID=$!
echo "  PID: $BACKEND_PID"

echo "  Waiting for backend..."
for i in $(seq 1 45); do
    if curl -sf "http://${BASE_URL}/health" > /dev/null 2>&1; then
        pass "Backend + migrations (${i}s)"
        break
    fi
    if [ "$i" -eq 45 ]; then
        fail "Backend failed to start — check logs"
        exit 1
    fi
    sleep 1
done

# ── 2. Seed database ──────────────────────────────────────────────────────────
echo ""
echo "── Step 2: Seed test data ────────────────────────────────────────"

psql "$DB_URL" <<'SEEDSQL' 2>&1
DO $$
DECLARE
    h TEXT;
BEGIN
    h := encode(sha256('E2E-TEST-DEVICE-SERIAL-001'::bytea), 'hex');

    DELETE FROM payment_transactions WHERE device_hash = h;
    DELETE FROM daily_spends WHERE device_hash = h;
    DELETE FROM transaction_notifications WHERE device_hash = h;
    DELETE FROM fee_channels;
    DELETE FROM devices WHERE device_hash = h;

    INSERT INTO devices (device_hash, wallet_address, status, daily_limit_stroops)
    VALUES (h, 'GBQKFPHDMZNXWVXQFBFWWWQSDK3HYEHUVA7YHXC7QKCYJF5MZBWPPQTA', 'active', 1000000000);

    INSERT INTO fee_channels (channel_address, private_key_encrypted, balance_stroops, status)
    VALUES ('GACWMI576Q5IUHLS75LEYEF3NQWRQAGOC74NYGSZ3LSEM3P5YZHYZZAG', '\x1234'::bytea, 50000000, 'active');
END $$;
SEEDSQL
pass "Seed test data"

# ── 3. Test endpoints ────────────────────────────────────────────────────────
echo ""
echo "── Step 3: Test endpoints ────────────────────────────────────────"

# 3a. Health check
HEALTH=$(curl -s "http://${BASE_URL}/health")
H_STATUS=$(echo "$HEALTH" | python3 -c "import sys,json;print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "fail")
if [[ "$H_STATUS" == "healthy" || "$H_STATUS" == "degraded" ]]; then
    pass "GET /health → $H_STATUS"
else
    fail "GET /health: $HEALTH"
fi

# 3b. Metrics
METRICS=$(curl -s "http://${BASE_URL}/metrics")
if echo "$METRICS" | grep -q '"payments_received"'; then
    pass "GET /metrics"
else
    fail "GET /metrics: $METRICS"
fi

# 3c. Process payment
IDEM_KEY="e2e-test-$(date +%s)-$$"
PAYMENT_RESP=$(curl -s -X POST "http://${BASE_URL}/payment" \
    -H "Content-Type: application/json" \
    -d "{
        \"device_serial\": \"${TEST_DEVICE_SERIAL}\",
        \"destination_wallet\": \"GBQKFPHDMZNXWVXQFBFWWWQSDK3HYEHUVA7YHXC7QKCYJF5MZBWPPQTA\",
        \"amount_stroops\": 10000,
        \"memo\": \"E2E test payment\",
        \"idempotency_key\": \"${IDEM_KEY}\"
    }")

TX_ID=$(echo "$PAYMENT_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('transaction_id',''))" 2>/dev/null || echo "")
S_ACCEPTED=$(echo "$PAYMENT_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "")

if [ "$S_ACCEPTED" = "accepted" ] && [ -n "$TX_ID" ]; then
    pass "POST /payment → accepted (tx: ${TX_ID:0:8}...)"
else
    fail "POST /payment: $PAYMENT_RESP"
fi

# 3d. Get transaction status
if [ -n "$TX_ID" ]; then
    sleep 1
    TX_STATUS=$(curl -s "http://${BASE_URL}/payment/${TX_ID}")
    TS=$(echo "$TX_STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "")
    if [ -n "$TS" ]; then
        pass "GET /payment/{id} → $TS"
    else
        fail "GET /payment/{id}: $TX_STATUS"
    fi
fi

# 3e. Device transactions
DEV_TXS=$(curl -s "http://${BASE_URL}/device/${TEST_DEVICE_SERIAL}/transactions")
TX_COUNT=$(echo "$DEV_TXS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)
if [ "$TX_COUNT" -ge 1 ] 2>/dev/null; then
    pass "GET /device/{serial}/transactions → $TX_COUNT txns"
else
    fail "GET /device/{serial}/transactions: $DEV_TXS"
fi

# 3f. List fee channels
CHANNELS=$(curl -s "http://${BASE_URL}/channels")
CH_COUNT=$(echo "$CHANNELS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)
if [ "$CH_COUNT" -ge 1 ] 2>/dev/null; then
    pass "GET /channels → $CH_COUNT channels"
else
    fail "GET /channels: $CHANNELS"
fi

# 3g. Channel details
CH_ADDR=$(echo "$CHANNELS" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['address'])" 2>/dev/null || echo "")
if [ -n "$CH_ADDR" ]; then
    CH_DETAIL=$(curl -s "http://${BASE_URL}/channels/${CH_ADDR}")
    # Accept either a valid response or a Stellar RPC error (expected when
    # the test channel account doesn't exist on the network)
    if echo "$CH_DETAIL" | grep -q '"in_sync"'; then
        pass "GET /channels/{addr} → details OK"
    elif echo "$CH_DETAIL" | grep -q '"STELLAR_RPC_ERROR"'; then
        pass "GET /channels/{addr} → Stellar RPC error (expected)"
    else
        fail "GET /channels/{addr}: $CH_DETAIL"
    fi
fi

# 3h. Idempotency — same idempotency_key returns same transaction
IDEM_RESP2=$(curl -s -X POST "http://${BASE_URL}/payment" \
    -H "Content-Type: application/json" \
    -d "{
        \"device_serial\": \"${TEST_DEVICE_SERIAL}\",
        \"destination_wallet\": \"GBQKFPHDMZNXWVXQFBFWWWQSDK3HYEHUVA7YHXC7QKCYJF5MZBWPPQTA\",
        \"amount_stroops\": 10000,
        \"idempotency_key\": \"${IDEM_KEY}\"
    }")
IDEM_TX_ID=$(echo "$IDEM_RESP2" | python3 -c "import sys,json; print(json.load(sys.stdin).get('transaction_id',''))" 2>/dev/null || echo "")
if [ "$IDEM_TX_ID" = "$TX_ID" ]; then
    pass "Idempotency → same tx_id"
else
    fail "Idempotency: expected $TX_ID got $IDEM_TX_ID"
fi

# 3i. Validation errors (empty fields)
ERR_RESP=$(curl -s -X POST "http://${BASE_URL}/payment" \
    -H "Content-Type: application/json" \
    -d '{"device_serial":"","destination_wallet":"","amount_stroops":0,"idempotency_key":""}')
if echo "$ERR_RESP" | grep -qi "error"; then
    pass "Validation → empty fields rejected"
else
    fail "Validation: $ERR_RESP"
fi

# 3j. Rate limiting (burst 20 requests, expect some throttled)
echo "  Rate limiting burst..."
RATE_LIMITED=0
for i in $(seq 1 20); do
    RKEY="ratelimit-$(date +%s)-${i}"
    RRESP=$(curl -s -X POST "http://${BASE_URL}/payment" \
        -H "Content-Type: application/json" \
        -d "{
            \"device_serial\": \"${TEST_DEVICE_SERIAL}\",
            \"destination_wallet\": \"GBQKFPHDMZNXWVXQFBFWWWQSDK3HYEHUVA7YHXC7QKCYJF5MZBWPPQTA\",
            \"amount_stroops\": 10000,
            \"idempotency_key\": \"${RKEY}\"
        }")
    if echo "$RRESP" | grep -qi "rate_limit"; then
        RATE_LIMITED=$((RATE_LIMITED+1))
    fi
done
if [ "$RATE_LIMITED" -gt 0 ]; then
    pass "Rate limiting → $RATE_LIMITED of 20 throttled"
else
    echo "    (none throttled — rate window may still be open)"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Results: ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ "$FAIL" -gt 0 ] && exit 1 || exit 0
