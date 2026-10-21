# Automated Test Documentation

How to run every test suite, what each one covers, and which test proves each SOW security requirement.

## Summary (run 2026-10-21)

| Suite | Command | Result |
|-------|---------|--------|
| Soroban contracts | `cargo test` in `backend/` (host target) | **60 passed**, 0 failed (10 + 21 + 29) |
| App unit tests | `npm test` in `frontend/` | **306 passed** in 23 files |
| App type check | `npx tsc --noEmit` in `frontend/` | clean |
| Agent SDK | `npm test` in `sdk/agent-sdk/` | 18 passed; live suites skipped (`npm run test:testnet`, `npm run test:security-matrix`) |
| REST gateway | `npm test` in `sdk/noir-api/` (after `npm run setup`) | 18 passed |
| Live Testnet flow | `npm run test:testnet` in `frontend/` | passing; last evidence [`week2-testnet-flow-20261009T044804Z.md`](../deploy-evidence/week2-testnet-flow-20261009T044804Z.md) |
| Live security matrix | `npm run test:security-matrix` in `sdk/agent-sdk/` | **not yet run** — needs the post-fix redeploy; writes `deploy-evidence/week4-security-matrix-*.md` |

Full output of this run: [`deploy-evidence/test-results-20261021T034015Z.txt`](../deploy-evidence/test-results-20261021T034015Z.txt). CI runs the contract, app and SDK suites on every push and PR (`contracts.yml`, `frontend.yml`, `sdk.yml`).

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

# SDK + gateway (the gateway depends on the built SDK)
cd ../sdk/agent-sdk && npm ci && npm test
cd ../noir-api && npm run setup && npm test
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

### agent_registry (21)

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
| `test_register_for_unowned_device_rejected` | Policy for an unregistered device → `#5 NotOwner` |
| `test_register_for_someone_elses_device_rejected` | Policy for another wallet's device → `#5 NotOwner` |
| `test_revoke_by_stranger_rejected` | Revoke by a wallet that did not grant the policy → `#5 NotOwner` |
| `test_new_owner_replaces_stale_policy` | After the tag changes hands, the new owner's policy replaces the old one |

The agent_registry tests use a small mock `device_registry` (`MockDevices`) that only answers `get_owner`; the escrow tests below use the real one.

### payment_escrow (29)

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
| `test_cross_asset_defund_rejected` | Deposit in a junk token withdrawn as the real token → `#9 InvalidAsset` (was a drain) |
| `test_cross_asset_sweep_rejected` | Sweep in another token → `#9` |
| `test_fund_with_second_asset_rejected` | Topping up a funded escrow in another token → `#9` |
| `test_claim_only_pays_the_payment_asset` | Claim in another token pays nothing; the real payment stays claimable |
| `test_agent_hijack_rejected` | Stranger cannot revoke the agent, install their own, or spend the escrow |
| `test_revoked_device_rejected` | Device revoked with its agent policy still on file → `#8 DeviceNotRegistered` |
| `test_stale_policy_after_ownership_change_rejected` | Previous owner's agent cannot spend the new owner's escrow → `#3` |
| `test_escrow_as_merchant_rejected` | Merchant = escrow contract → `#10 InvalidRecipient` |
| `test_nonpositive_fund_rejected`, `test_negative_defund_rejected` | Zero / negative amounts → `#11 InvalidAmount` |
| `test_late_claim_still_pays` | A payment claimed after the temporary-entry TTL still pays (persistent storage) |

## SOW security matrix → tests

| SOW requirement | Test(s) | Status |
|-----------------|---------|--------|
| Registered NFC device accepted | `test_register_maps_device`, `test_fund_escrow_increases_balance` | ✅ |
| Unregistered NFC device rejected | `test_fund_unregistered_device_rejected`, `test_is_authorized_false_for_unknown_device`, `test_register_for_unowned_device_rejected` | ✅ |
| Duplicate device registration handled | `device_registry` `AlreadyRegistered`; `test_duplicate_registration_rejected`; live run step 5 | ✅ |
| Authorized payment agent accepted | `test_authorize_in_policy_payment`, `test_is_auth_true_for_authorized_agent` | ✅ |
| Unauthorized payment agent rejected | `test_unauthorized_agent_rejected`, `test_is_auth_false_for_stranger` | ✅ |
| Expired authorization rejected | `test_expired_authorization_rejected`, `test_check_payment_rejects_after_expiry` | ✅ |
| Revoked device rejected | `test_revoked_device_rejected`, `test_get_device_after_revoke_panics`; `fund_escrow` after revoke → `#8` | ✅ |
| Revoked payment agent rejected | `test_revoked_agent_rejected`, `test_revoke_removes_authorization` | ✅ |
| Payment over spending limit rejected | `test_over_limit_payment_rejected`, `test_check_payment_rejects_over_limit` | ✅ |
| Invalid asset rejected | `test_wrong_asset_rejected`, `test_check_payment_rejects_wrong_asset`, `test_cross_asset_defund_rejected`, `test_cross_asset_sweep_rejected`, `test_fund_with_second_asset_rejected` | ✅ |
| Invalid recipient rejected | `test_escrow_as_merchant_rejected` | ✅ the escrow itself. Any other address is a valid merchant: the policy does not hold a merchant allow-list |
| Agent cannot be hijacked by a stranger | `test_agent_hijack_rejected`, `test_revoke_by_stranger_rejected`, `test_register_for_someone_elses_device_rejected`, `test_stale_policy_after_ownership_change_rejected` | ✅ |
| Replayed payment request rejected | `test_replayed_nonce_rejected` | ✅ |
| Funds never stranded on revoke | `test_sweep_on_revoke_returns_all_funds_to_owner`, `test_sweep_rejected_while_agent_active` | ✅ |
| Funds never stranded unclaimed | `test_late_claim_still_pays` | ✅ |

These run in CI on every push. The live Testnet versions are in the [security matrix runner](#live-security-matrix); it has not been run yet because it needs the post-fix redeploy.

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

## Live security matrix

`npm run test:security-matrix` in `sdk/agent-sdk/` ([`tests/security-matrix.testnet.test.ts`](../sdk/agent-sdk/tests/security-matrix.testnet.test.ts)) runs the approved payment workflow and every reject case against the deployed contracts, with fresh Friendbot accounts. It writes `deploy-evidence/week4-security-matrix-<timestamp>.md`: a transaction link for each accepted step and the contract error for each refusal. Refusals happen at simulation, so they have no transaction hash.

| # | Case | Expected |
|---|------|----------|
| P1–P3 | register device, constrained agent (5 XLM cap, 1 h), fund 20 XLM | accepted |
| P4–P5 | agent authorizes 2 XLM, merchant claims | accepted |
| P6 | revoke agent, sweep the balance back to the owner | accepted |
| N1 | fund an unregistered device | `DeviceNotRegistered` |
| N2 | authorize signed by a key that is not the agent | `AgentNotAuthorized` |
| N3 | 6 XLM against the 5 XLM cap | `AgentNotAuthorized` |
| N4 | non-policy asset | `AgentNotAuthorized` |
| N5 | escrow contract as merchant | `InvalidRecipient` |
| N6 | replayed nonce | `DuplicateAuth` |
| N7 | stranger revokes the agent / registers their own | `NotOwner` |
| N8 | junk-token deposit withdrawn as XLM | `InvalidAsset` |
| N9 | authorize after `expires_at` | `AgentNotAuthorized` |
| N10 | revoked agent | `AgentNotAuthorized` |
| N11 | revoked device (agent policy still on file), and funding it | `DeviceNotRegistered` |
| N12 | duplicate device registration | `AlreadyRegistered` |

To check a fresh deploy before its IDs are propagated:

```bash
cd sdk/agent-sdk && npm ci
NOIR_DEVICE_REGISTRY=C... NOIR_AGENT_REGISTRY=C... NOIR_PAYMENT_ESCROW=C... npm run test:security-matrix
```

Against the 2026-10-07 deploy, N1, N5, N7, N8 and N11 are expected to fail (❌ in the evidence file): those are the bugs the Week 4 fixes close.

