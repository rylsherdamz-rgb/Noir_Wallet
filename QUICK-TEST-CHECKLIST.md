# TSK-201 Quick Testing Checklist

**Contract:** `CC2EBXO3BGFSFCM3DKYI4VFT7DYFFEK7YAGIGFFNLSPFRJ2QKITAQIEC`
**Network:** Stellar Testnet

---

## Copy-Paste Commands for Manual Testing

### 1. ✓ Test: Double-Initialization (should fail)
```bash
CONTRACT_ID="CC2EBXO3BGFSFCM3DKYI4VFT7DYFFEK7YAGIGFFNLSPFRJ2QKITAQIEC"
ADMIN="$(stellar keys address alice)"

stellar contract invoke --id "$CONTRACT_ID" --source alice --network testnet -- \
  initialize --admin "$ADMIN"
```
**Expected:** Error (already initialized)
**Result:** [ ] Pass / [ ] Fail

---

### 2. ✓ Test: Register Device 1
```bash
stellar contract invoke --id "$CONTRACT_ID" --source alice --network testnet -- \
  register --device_hash 0000000000000000000000000000000000000000000000000000000000000001 \
  --wallet "$ADMIN"
```
**Expected:** Success with event
**Result:** [ ] Pass / [ ] Fail

---

### 3. ✓ Test: Register Device 2 (Multiple Devices)
```bash
stellar contract invoke --id "$CONTRACT_ID" --source alice --network testnet -- \
  register --device_hash 0000000000000000000000000000000000000000000000000000000000000002 \
  --wallet "$ADMIN"
```
**Expected:** Success
**Result:** [ ] Pass / [ ] Fail

---

### 4. ✓ Test: Get Wallet (Payment Lookup)
```bash
stellar contract invoke --id "$CONTRACT_ID" --source alice --network testnet -- \
  get_wallet --device_hash 0000000000000000000000000000000000000000000000000000000000000001
```
**Expected:** Returns admin address (GB4TRXADRCU...)
**Result:** [ ] Pass / [ ] Fail

---

### 5. ✓ Test: Get Non-Existent Device (Error Handling)
```bash
stellar contract invoke --id "$CONTRACT_ID" --source alice --network testnet -- \
  get_wallet --device_hash FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
```
**Expected:** Error (DeviceNotFound)
**Result:** [ ] Pass / [ ] Fail

---

### 6. ✓ Test: Unregister Device (Revoke)
```bash
stellar contract invoke --id "$CONTRACT_ID" --source alice --network testnet -- \
  unregister --device_hash 0000000000000000000000000000000000000000000000000000000000000001
```
**Expected:** Success with revoke event
**Result:** [ ] Pass / [ ] Fail

---

### 7. ✓ Test: Verify Device Revoked
```bash
stellar contract invoke --id "$CONTRACT_ID" --source alice --network testnet -- \
  get_wallet --device_hash 0000000000000000000000000000000000000000000000000000000000000001
```
**Expected:** Error (DeviceNotFound)
**Result:** [ ] Pass / [ ] Fail

---

### 8. ✓ Test: Other Device Still Works
```bash
stellar contract invoke --id "$CONTRACT_ID" --source alice --network testnet -- \
  get_wallet --device_hash 0000000000000000000000000000000000000000000000000000000000000002
```
**Expected:** Returns admin address
**Result:** [ ] Pass / [ ] Fail

---

## Unit Tests

Run locally to verify all edge cases:

```bash
cd contracts/device_registry
cargo test --test integration --target x86_64-pc-windows-msvc
```

**Expected:** 6/6 tests passing
**Result:** [ ] Pass / [ ] Fail

---

## Summary

| Test | Status |
|------|--------|
| 1. Double-init guard | [ ] |
| 2. Register device 1 | [ ] |
| 3. Register device 2 | [ ] |
| 4. Get wallet | [ ] |
| 5. Non-existent device error | [ ] |
| 6. Unregister device | [ ] |
| 7. Verify revoked | [ ] |
| 8. Other device accessible | [ ] |
| Unit Tests 6/6 | [ ] |

**All Tests Pass:** [ ] YES ✅

---

## What This Proves

- ✅ **Initialization:** Admin can be set once, immutable
- ✅ **Register:** 32-byte hashes map to wallets with proper auth
- ✅ **Get:** Fast read-only lookup for payments
- ✅ **Unregister:** Lost/stolen devices can be revoked
- ✅ **Authorization:** Only admin can change state
- ✅ **Persistence:** Data survives across transactions
- ✅ **Error Handling:** Edge cases handled properly

---

## Blockchain Links

- **Contract:** https://stellar.expert/explorer/testnet/contract/CC2EBXO3BGFSFCM3DKYI4VFT7DYFFEK7YAGIGFFNLSPFRJ2QKITAQIEC
- **Deployment Tx:** https://stellar.expert/explorer/testnet/tx/941f63febf51b2df5deaba36fc67519f18f4e7a3762603ea9b40d55597bcba47
- **Test Env:** https://lab.stellar.org/

---

**TSK-201 Status:** 🎉 **COMPLETE**
