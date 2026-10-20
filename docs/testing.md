# Automated Test Documentation

How to run every test suite, what each one covers, and which test proves each SOW security requirement.

## Summary (run 2026-10-17)

| Suite | Command | Result |
|-------|---------|--------|
| Soroban contracts | `cargo test` in `backend/` (host target) | **45 passed**, 0 failed (10 + 17 + 18) |
| App unit tests | `npm test` in `frontend/` | **306 passed** in 23 files |
| App type check | `npx tsc --noEmit` in `frontend/` | clean |
| Agent SDK | `npm test` in `sdk/agent-sdk/` | 18 passed, 4 live tests skipped (run with `NOIR_TESTNET=1`) |
| REST gateway | `npm test` in `sdk/noir-api/` | 18 passed |
| Live Testnet flow | `npm run test:testnet` in `frontend/` | passing; last evidence [`week2-testnet-flow-20261009T044804Z.md`](../deploy-evidence/week2-testnet-flow-20261009T044804Z.md) |

## Running the tests

```bash
# Contracts — build the dependency WASM first (payment_escrow imports it)
cd backend
cargo build --release --target wasm32v1-none -p agent-registry -p device-registry
cargo build --release --target wasm32v1-none -p payment-escrow
HOST=$(rustc -vV | awk '/host/{print $2}')
cargo test -p device-registry -p agent-registry -p payment-escrow --target "$HOST"
git checkout -- contracts/*/test_snapshots     # cargo rewrites these; no real change

# App
cd ../frontend
npx tsc --noEmit
npm test                 # or: npm run test:coverage

# SDK + gateway
cd ../sdk/agent-sdk && npm test
cd ../noir-api && npm test
```

## Contract tests

Each contract has `tests/integration.rs`. Tests run in the Soroban test `Env` with `env.mock_all_auths()`, a real Stellar Asset Contract token (`register_stellar_asset_contract_v2`) for escrow, and `env.ledger().set_timestamp(...)` to move time for expiry. Negative tests assert the exact contract error with `#[should_panic(expected = "Error(Contract, #N)")]`.

### device_registry (10)

| Test | Proves |
|------|--------|
| `test_initialize_happy_path` | Admin set once |
| `test_initialize_double_init_guard` | Second init → `#1 AlreadyInitialized` |
| `test_register_maps_device` | Hash → owner + agent recorded; wallet index updated |
| `test_unauthorized_register_rejected` | `register` without the wallet's signature fails |
| `test_revoke_removes_entry_enabling_re_registration` | Revoke deletes the entry; the tag can be registered again |
| `test_get_device_after_revoke_panics` | Revoked device is gone → `#2 DeviceNotFound` |
| `test_revoke_only_removes_owned_device` | Index compaction leaves other devices intact |
| `test_is_authorized_false_for_wrong_agent` | Wrong agent → `false` |
| `test_is_authorized_false_for_unknown_device` | Unregistered device → `false` |
| `test_revoke_non_owner_rejected` | Revoke by a non-owner → `#3 NotOwner` |

### agent_registry (17)

| Test | Proves |
|------|--------|
| `test_initialize_happy_path` / `test_initialize_double_init_guard` | Init once → `#1` |
| `test_register_and_get_agent_roundtrip` | Policy stored and read back field by field |
| `test_duplicate_registration_rejected` | Second policy for a device → `#3 AlreadyRegistered` |
| `test_register_with_past_expiry_rejected` | Past `expires_at` → `#4 InvalidPolicy` |
| `test_register_with_negative_max_amount_rejected` | Negative cap → `#4 InvalidPolicy` |
| `test_is_auth_true_for_authorized_agent` | Authorized agent accepted |
| `test_is_auth_false_for_stranger` | Other key refused |
| `test_is_auth_false_after_expiry` | Expired policy refused |
| `test_revoke_removes_authorization` | After `revoke_agent`, `is_auth` is false |
| `test_revoke_unknown_device_panics` | Revoke with no policy → `#2 AgentNotFound` |
| `test_check_payment_accepts_in_policy` | In-policy payment accepted |
| `test_check_payment_rejects_over_limit` | Above `max_amount` refused |
| `test_check_payment_rejects_wrong_asset` | Other token refused |
| `test_check_payment_rejects_nonpositive_amount` | `0` / negative refused |
| `test_check_payment_uncapped_when_max_zero` | `max_amount = 0` means uncapped |
| `test_check_payment_rejects_after_expiry` | Expired policy refused |

### payment_escrow (18)

| Test | Proves |
|------|--------|
| `test_initialize_double_init_guard` | Init once → `#1` |
| `test_balance_of_unfunded_is_zero` | Default balance 0 |
| `test_fund_escrow_increases_balance` | Deposit credits the device |
| `test_fund_unregistered_device_rejected` | Fund for an unknown device → `#8 DeviceNotRegistered` |
| `test_authorize_in_policy_payment` | In-policy tap deducts the balance and creates a pending payment |
| `test_claim_payments` | Merchant batch-claims pending payments |
| `test_claim_nothing_fails` | Nothing pending → `#5 NothingToClaim` |
| `test_defund_escrow_returns_funds` | Owner withdraws part of the balance |
| `test_unauthorized_agent_rejected` | Unknown agent → `#3 AgentNotAuthorized` |
| `test_revoked_agent_rejected` | Agent after `revoke_agent` → `#3` |
| `test_over_limit_payment_rejected` | Above the cap → `#3` |
| `test_wrong_asset_rejected` | Other token → `#3` |
| `test_expired_authorization_rejected` | After `expires_at` → `#3` |
| `test_replayed_nonce_rejected` | Reused nonce → `#6 DuplicateAuth` |
| `test_insufficient_balance_rejected` | More than the balance → `#2 InsufficientBalance` |
| `test_sweep_on_revoke_returns_all_funds_to_owner` | Revoke → full balance back to owner |
| `test_sweep_rejected_while_agent_active` | Sweep with a live agent → `#7 AgentStillActive` |
| `test_sweep_on_empty_escrow_is_noop` | Empty sweep returns 0, no transfer |

## SOW security matrix → tests

| SOW requirement | Test(s) | Status |
|-----------------|---------|--------|
| Registered NFC device accepted | `test_register_maps_device`, `test_fund_escrow_increases_balance` | ✅ |
| Unregistered NFC device rejected | `test_fund_unregistered_device_rejected`, `test_is_authorized_false_for_unknown_device` | ✅ (contract check not yet redeployed; the app guards it client-side) |
| Duplicate device registration handled | `device_registry` `AlreadyRegistered`; `test_duplicate_registration_rejected`; live run step 5 | ✅ |
| Authorized payment agent accepted | `test_authorize_in_policy_payment`, `test_is_auth_true_for_authorized_agent` | ✅ |
| Unauthorized payment agent rejected | `test_unauthorized_agent_rejected`, `test_is_auth_false_for_stranger` | ✅ |
| Expired authorization rejected | `test_expired_authorization_rejected`, `test_check_payment_rejects_after_expiry` | ✅ |
| Revoked device rejected | `test_get_device_after_revoke_panics`; `fund_escrow` after revoke → `#8` | ✅ |
| Revoked payment agent rejected | `test_revoked_agent_rejected`, `test_revoke_removes_authorization` | ✅ |
| Payment over spending limit rejected | `test_over_limit_payment_rejected`, `test_check_payment_rejects_over_limit` | ✅ |
| Invalid asset or merchant rejected | `test_wrong_asset_rejected`, `test_check_payment_rejects_wrong_asset` | ✅ asset. A merchant is any address the agent signs for; the policy does not restrict merchants |
| Replayed payment request rejected | `test_replayed_nonce_rejected` | ✅ |
| Funds never stranded on revoke | `test_sweep_on_revoke_returns_all_funds_to_owner`, `test_sweep_rejected_while_agent_active` | ✅ |

These run in CI on every push. The **live Testnet** versions of the reject paths for `authorize` are still to do (see [to-do](README.md#still-to-do)).

## App unit tests (`frontend/tests/`)

Vitest, with React Native, SecureStore and NFC modules mocked in `tests/setup.ts`.

| File | Covers |
|------|--------|
| `01-x402.test.ts` | Agent budget math, multi-agent logic, `registerDeviceAndAgentOnChain` sequencing, device ownership checks |
| `02-stellar.test.ts` | Stellar service, payment history, balance cache |
| `03-nfc.test.ts` | NFC service and `useNfc` hook logic |
| `04-api.test.ts` | Optional backend API client |
| `05-store.test.ts` | App state store |
| `06-components.test.ts` | Balance card, Testnet faucet banner, other components |
| `07-screens.test.ts` | Device provisioning, agent and dashboard screen logic |
| `08-fxrates.test.ts`, `09-constants.test.ts` | FX rates, theme and config constants, type validation |
| `10-new-features.test.ts` | Sign-out cleanup, explorer links, recovery phrase / key display, profile |
| `11-security.test.ts`, `14-app-password.test.ts` | Wallet password as default unlock, optional phone unlock, app-password fallback |
| `12-send.test.ts`, `12-tx-format.test.ts` | Address validation, reserve and spendable balance, memo limits, amount and transaction formatting |
| `13-flow-helpers.test.ts` | Keypad amount input, receipt route params |
| `13-network-freshness.test.ts` | Per-network contract config, balance freshness |
| `14-logger.test.ts` | Secret redaction, log levels |
| `15-redesign.test.ts` | Browse address bar, default agent policy when linking a card |
| `16-dapp-bridge.test.ts` | In-app browser dApp bridge: request parsing, origins and network, transaction summary |
| `17-incoming-payments.test.ts`, `18-local-activity.test.ts` | Incoming payment notifications, pending activity and history merge |
| `19-payment-qr.test.ts` | SEP-0007 payment QR, `resolveCardRecipient` for tap-to-send |
| `browse-apps.test.ts` | Browse app catalog |

## Live Testnet run

`npm run test:testnet` ([`frontend/testnet/week2-flow.testnet.ts`](../frontend/testnet/week2-flow.testnet.ts)) runs the app's own `walletService` and `x402` code against the deployed contracts. Only native modules are stubbed. It is opt-in and never part of `npm test` or CI, because it spends Friendbot XLM and takes a minute or two.

Steps: create and import a wallet → Friendbot → simulated NTAG213 UID → `register` → `register_agent` → read the policy back → second wallet refused for the same tag → `fund_escrow` → `defund_escrow` → `revoke_agent` → `sweep_on_revoke` → `revoke`. Each transaction hash is written to `deploy-evidence/week2-testnet-flow-<timestamp>.md`.

## CI

| Workflow | Runs on | Steps |
|----------|---------|-------|
| [`contracts.yml`](../.github/workflows/contracts.yml) | push/PR to `main`, `instaward*` | Pinned Rust `1.98.1` + `wasm32v1-none` → build dependency WASM → build escrow → `cargo test` → WASM hash report (informational) |
| [`frontend.yml`](../.github/workflows/frontend.yml) | push/PR to `main`, `instaward*` | Node 22 → `yarn install --frozen-lockfile` → `tsc --noEmit` → `yarn test` |

Run history: [GitHub Actions](https://github.com/rylsherdamz-rgb/Noir_Wallet/actions).

Related: [Contract reference](contracts.md) · [Walkthrough](walkthrough.md)
