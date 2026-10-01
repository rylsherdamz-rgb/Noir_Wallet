# Noir Wallet — SCF Instaward Progress

Tracking document for the **Stellar Community Fund Instaward** (30 days, capped at $5,000, paid in XLM).
This maps every weekly deliverable to its status. Measure every commit against the SOW.

- **Project:** Noir Wallet
- **Team:** Noir
- **Repo:** https://github.com/rylsherdamz-rgb/Noir_Wallet
- **Network:** Stellar Testnet
- **Branches:** `instaward` (release), `instaward-staging` (staging), `instaward-development` (active work)

## Workflow Rules (binding)

- Work is delivered on the Instaward branches, **not** by pushing freely to `main`.
- **~One scoped deliverable commit per week.** Keep each commit mapped to that week's Expected Output.
- Do not commit unrelated/experimental files into the deliverable commits.

---

## Deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Soroban Smart Contract Infrastructure (DeviceRegistry, AgentRegistry, PaymentEscrow) | 🟡 In progress |
| 2 | React Native Reference Wallet (Android) | 🟡 Partially built (pre-existing) |
| 3 | Documentation & Open-Source Release (MIT) | ⬜ Not started |

---

## Weekly Breakdown

### Week 1 — Contract architecture + RN env + wallet create/import + initial deploy  🟡 IN PROGRESS
**Planned:** Finalize architecture of DeviceRegistry, AgentRegistry, PaymentEscrow. Configure RN Android env, implement wallet create/import, deploy initial contracts to Testnet, document architecture.

**Expected output:** Initial contracts deployed to Testnet; RN project configured; wallet create/import operational; architecture documented.

- [x] Create Instaward branches (`instaward`, `instaward-staging`, `instaward-development`)
- [x] Finalize AgentRegistry constrained-authorization design (max_amount, asset, expiration + revocation)
- [x] Implement constrained authorization policy in AgentRegistry
- [x] Enforce policy in PaymentEscrow.authorize (over-limit / wrong-asset / expired rejection)
- [x] Negative-path tests for both contracts (41 contract tests green)
- [x] Build + test all contracts green
- [x] Deploy updated contracts to Testnet, record Contract IDs + WASM hashes — **DONE** (see `deploy-evidence/`)
- [x] Architecture documentation updated (Obsidian: AgentRegistry.md, PaymentEscrow.md, session note)

### Week 2 — NFC provisioning + register + association + agent auth + escrow fund (wire app ↔ contracts)  ⬜ NOT STARTED
**Planned:** NTAG213 provisioning; device register via DeviceRegistry; wallet-to-device association; delegated payment agent authorization (with constraints); escrow funding; connect RN app to deployed contracts.

**Expected output:** Functional RN wallet demonstrating register + association + delegated auth + escrow fund on Testnet.

- [ ] NTAG213 provisioning flow in app
- [ ] Device register via DeviceRegistry (on-chain association)
- [ ] Agent authorization UI passes constraints (limit, asset, expiry) to AgentRegistry
- [ ] Escrow funding wired to PaymentEscrow
- [ ] App ↔ deployed Soroban contracts integration verified on Testnet

### Week 3 — Full x402 flow + tests + security paths + docs  ⬜ NOT STARTED
**Expected output:** Complete x402 flow validated; automated tests passing; positive/negative security validation; developer docs.

### Week 4 — Final testing + MIT release + evidence package  ⬜ NOT STARTED
**Expected output:** Public MIT repo; published Contract IDs + WASM hashes + Stellar Expert tx links; install/deploy guides; demo video; evidence package.

---

## Security Validation Checklist (positive + negative paths)

Accept:
- [x] Registered device accepted (device_registry tests)
- [x] Authorized agent accepted (escrow `test_authorize_in_policy_payment`)
- [x] In-policy payment accepted (escrow `check_payment` + authorize tests)
- [x] Merchant settlement works (escrow `test_claim_payments`)

Reject (all verified by contract tests):
- [x] Unregistered device rejected
- [x] Duplicate device registration handled (`test_duplicate_registration_rejected`)
- [x] Unauthorized agent rejected (`test_unauthorized_agent_rejected`)
- [x] Expired authorization rejected (`test_expired_authorization_rejected`)
- [x] Over-limit payment rejected (`test_over_limit_payment_rejected`)
- [x] Invalid asset rejected (`test_wrong_asset_rejected`)
- [x] Revoked agent rejected (`test_revoked_agent_rejected`)
- [x] Replayed payment request rejected (`test_replayed_nonce_rejected`)
- [x] Sweep rejected while agent still active (`test_sweep_rejected_while_agent_active`)
- [x] On revoke, escrow funds swept back to owner (`test_sweep_on_revoke_returns_all_funds_to_owner`)

---

## Gap Analysis (as of Week 1 start)

| Contract | Current state | SOW requires | Gap |
|----------|---------------|--------------|-----|
| **device_registry** | register / revoke / lookup / wallet-device index | device registration + wallet association + revocation | ✅ complete |
| **agent_registry** | `AgentMap(device_hash) -> Address`, register / revoke / is_auth | **constrained** auth: max_amount, approved asset, expiration + revocation | ⚠️ no limits/asset/expiry stored |
| **payment_escrow** | fund / authorize (nonce replay guard) / claim / defund | enforce the authorization policy on `authorize` | ⚠️ does not check limit/asset/expiry |

**Week 1 contract work:** extend `agent_registry` to store an authorization policy (max_amount, asset, expiration) and have `payment_escrow.authorize` enforce it. Replay protection (nonce) already exists.

---

## Deployed Contract IDs

### Testnet (redeployed 2026-10-01 with constrained-auth + sweep-on-revoke)
Admin / deployer: `GCDAAT6G6BUANDLY432YEAFY2MHUDP4PVEQ6ODMKWMUL6THLDY4GY2KD` (identity `noir-deployer`)
Full evidence (tx links, init args): `deploy-evidence/deploy-testnet-20261001T074804Z.md`

| Contract | ID | WASM SHA-256 |
|----------|----|--------------|
| device_registry | `CCJQCI34FAW5W3U55HZERPZVZF3IIEVFP2ATGIZASDGSY2K2FAF6C2AM` | `2b258a496495a2a15cdf76ceb20d14dcd89ca316e74eb08a496b61e3af986817` |
| agent_registry | `CAOVUFDVSOVCYJKMBLJWRERNEZOGA62D56ZZOKGLJWPROAV7SUV37GAA` | `2c9ee8f6aea1a44c317ba306cb22b782c7cef58fbbffafdcf30a8abdb275617a` |
| payment_escrow | `CCSWYQ7ORLF2ZG5RBBPDX4VUVPYF2LGV5N3OYJERZUBVX7KMT5MG3DIU` | `068ce429550d6e7fb34c6b88975e6fad063d7463572aca38b5fb7db61e55280c` |

Redeploy script: `scripts/redeploy-contracts.sh` (build → hash → deploy → initialize → write evidence).
