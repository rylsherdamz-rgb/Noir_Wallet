# Instaward Evidence Package — Week 4

The final evidence index for the Stellar Community Fund Instaward: every Week 4 expected output, where its proof lives, and what is still open. Status is as of **2026-10-21**. The rule for this page: an item is ✅ only if the linked artifact exists and can be checked by a reviewer today.

**Repository:** [github.com/rylsherdamz-rgb/Noir_Wallet](https://github.com/rylsherdamz-rgb/Noir_Wallet) — public, [MIT](../LICENSE) (GitHub detects the license as `MIT`).

## Summary

| Week 4 output | Status | Evidence |
|---------------|--------|----------|
| Final testing + bug fixes | ✅ code · ⏳ live re-run | [Security audit fixes](#1-final-testing-and-bug-fixes) — 4 exploitable contract bugs fixed, 60 contract tests |
| Public MIT repository | ✅ | [`LICENSE`](../LICENSE), public repo, [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`SECURITY.md`](../SECURITY.md), [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) |
| Deployment scripts + docs | ✅ | [`scripts/redeploy-contracts.sh`](../scripts/redeploy-contracts.sh), [deployment.md](deployment.md), [installation.md](installation.md) |
| Published Contract IDs + WASM hashes + tx links | 🟡 | 2026-10-07 deploy published ([record](../deploy-evidence/deploy-testnet-20261007T050558Z.md)); **runs pre-fix code — redeploy pending** |
| Architecture diagrams | ✅ | [architecture.md](architecture.md) |
| Automated test results + CI | ✅ | [`test-results-20261021T034015Z.txt`](../deploy-evidence/test-results-20261021T034015Z.txt), [CI runs](#3-ci-build-results) |
| Positive- and negative-path validation | ✅ contract tests · ⏳ live Testnet | [Security matrix](#2-positive-and-negative-path-validation) |
| Transaction evidence | 🟡 | Week 1 deploy + Week 2 flow live; `authorize`/`claim` + reject cases live run pending ([runner ready](testing.md#live-security-matrix)) |
| Screenshots | ✅ | [`docs/Evidence/wallet/`](Evidence/wallet/), [`docs/Evidence/`](Evidence/README.md) |
| Demo video | 🟡 | Promo cuts exist ([`assets/noir-demo.mp4`](../assets/noir-demo.mp4)); final walkthrough recording pending — [shot list](demo-video-script.md) |

## 1. Final testing and bug fixes

A Week 4 review of the three contracts found four exploitable bugs on the code that is live on Testnet. Each was reproduced with a test that failed, then fixed (commit `fix(contracts): close escrow drain, agent hijack and revoked-device payment`). Full detail: [contracts.md → Week 4 security fixes](contracts.md#week-4-security-fixes).

| Severity | Bug | Fix |
|----------|-----|-----|
| Critical | **Cross-asset drain.** Escrow balances were plain numbers. Fund your own device with a self-issued token, withdraw the same amount in XLM. | Balance bound to its token; every movement must use it (`InvalidAsset = 9`) |
| Critical | **Agent hijack.** `revoke_agent` / `register_agent` did not check device ownership. A stranger could swap in their own agent and spend the owner's escrow. | Ownership checked in `device_registry` (`NotOwner = 5`); escrow checks the policy owner is the current device owner |
| High | **Revoked device still payable** while its agent policy was on file. | `authorize` requires a registered device (`DeviceNotRegistered = 8`) |
| Medium | **Unclaimed payments expired** (temporary storage) with funds already debited. | Persistent storage |
| Low | Escrow as merchant locks funds; zero/negative amounts reached the token. | `InvalidRecipient = 10`, `InvalidAmount = 11` |

Also fixed: `redeploy-contracts.sh` built all three contracts in one cargo call, which fails on a clean checkout (escrow imports the other two WASMs). The SDK and gateway had tests but no CI; `sdk.yml` now runs them.

**Breaking change:** `agent_registry.initialize(admin, device_registry_id)`. The fixes reach Testnet only with a redeploy, which mints new contract IDs.

## 2. Positive- and negative-path validation

Every SOW case, with the contract test that proves it (CI, every push) and the live Testnet case in the [security matrix runner](testing.md#live-security-matrix).

| SOW case | Expected | Contract test | Live case |
|----------|----------|---------------|-----------|
| Approved payment workflow | register → agent → fund → authorize → claim | `test_authorize_in_policy_payment`, `test_claim_payments` | P1–P5 |
| Revocation returns funds | sweep pays the owner | `test_sweep_on_revoke_returns_all_funds_to_owner` | P6 |
| Unregistered device | `DeviceNotRegistered` | `test_fund_unregistered_device_rejected`, `test_register_for_unowned_device_rejected` | N1 |
| Unauthorized agent | `AgentNotAuthorized` | `test_unauthorized_agent_rejected`, `test_agent_hijack_rejected` | N2, N7 |
| Expired authorization | `AgentNotAuthorized` | `test_expired_authorization_rejected`, `test_check_payment_rejects_after_expiry` | N9 |
| Revoked device | `DeviceNotRegistered` | `test_revoked_device_rejected`, `test_stale_policy_after_ownership_change_rejected` | N11 |
| Revoked agent | `AgentNotAuthorized` | `test_revoked_agent_rejected` | N10 |
| Spending limit violation | `AgentNotAuthorized` | `test_over_limit_payment_rejected` | N3 |
| Invalid asset | `AgentNotAuthorized` / `InvalidAsset` | `test_wrong_asset_rejected`, `test_cross_asset_defund_rejected` | N4, N8 |
| Invalid recipient | `InvalidRecipient` | `test_escrow_as_merchant_rejected` | N5 |
| Replayed payment request | `DuplicateAuth` | `test_replayed_nonce_rejected` | N6 |
| Duplicate device registration | `AlreadyRegistered` | `test_duplicate_registration_rejected` (agent), device `AlreadyRegistered` | N12 |

**Scope note on recipients:** the policy has no merchant allow-list. Any address other than the escrow itself is a valid merchant; the agent key is trusted to choose the merchant within its cap and expiry. This is stated in [contracts.md](contracts.md#week-4-security-fixes) rather than claimed as covered.

## 3. CI build results

| Workflow | What it gates | Latest |
|----------|---------------|--------|
| [`contracts.yml`](../.github/workflows/contracts.yml) | WASM build + 60 contract tests | green on Instaward branches (see [PROGRESS.md → CI Status](../PROGRESS.md#ci-status)) |
| [`frontend.yml`](../.github/workflows/frontend.yml) | `tsc` + 306 Vitest tests | [run 39405833152](https://github.com/rylsherdamz-rgb/Noir_Wallet/actions/runs/39405833152) ✅ (main, 2026-10-20) |
| [`sdk.yml`](../.github/workflows/sdk.yml) | SDK + gateway typecheck, tests, build | new in Week 4; first run on the PR carrying it |

Local run, all suites, 2026-10-21: [`deploy-evidence/test-results-20261021T034015Z.txt`](../deploy-evidence/test-results-20261021T034015Z.txt) — 60 contract, 306 app, 18 SDK, 18 gateway, 0 failures.

## 4. Contract IDs, WASM hashes and transactions

| Record | Contents |
|--------|----------|
| [`deploy-testnet-20261007T050558Z.md`](../deploy-evidence/deploy-testnet-20261007T050558Z.md) | Current Testnet IDs, WASM SHA-256, create + initialize tx links (pre-fix code) |
| [`week2-testnet-flow-20261009T044804Z.md`](../deploy-evidence/week2-testnet-flow-20261009T044804Z.md) | Live register → agent → fund → withdraw → unlink, through the app's code |
| [`WEEK1-EVIDENCE.md`](../deploy-evidence/WEEK1-EVIDENCE.md) | Week 1 index |
| `week4-security-matrix-<ts>.md` | ⏳ written by `npm run test:security-matrix` after the redeploy |

## 5. Remaining steps (maintainer, needs Testnet access and a phone)

These could not be done from the build environment used for Week 4 (no route to Stellar Testnet, no Android device). In order:

1. **Redeploy** with the fixed contracts: `./scripts/redeploy-contracts.sh` (writes a new `deploy-evidence/deploy-testnet-*.md` with IDs, hashes and init args).
2. **Run the live matrix against the new IDs**, before propagating them:
   `cd sdk/agent-sdk && NOIR_DEVICE_REGISTRY=… NOIR_AGENT_REGISTRY=… NOIR_PAYMENT_ESCROW=… npm run test:security-matrix` — every row must be ✅.
3. **Propagate the IDs** everywhere listed in [deployment.md](deployment.md#propagate-new-ids-through-the-docs) (README, `frontend/.env*`, `frontend/eas.json`, `sdk/agent-sdk/src/networks.ts`, `landing/lib/site.ts`, docs, Obsidian notes), then re-run `cd frontend && npm run test:testnet`.
4. **Record the demo video** on a real Android phone with an NTAG213 — [shot list](demo-video-script.md).
5. Fill the ⏳ rows above with the new evidence files, tag a release, and submit.
