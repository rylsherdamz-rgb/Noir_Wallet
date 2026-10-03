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
- [x] Architecture diagrams published — `docs/architecture.md` (system overview, provisioning, tap-to-pay, revocation)
- [x] Captured test-run output as evidence — `deploy-evidence/test-results-*.txt` (41 passed, 0 failed)
- [x] Reconciled Contract IDs to one evidence-backed set across README, `.env.example`, and the Obsidian notes
- [x] Corrected README contract method tables + build guide to match the Rust source
- [x] Week 1 evidence index — `deploy-evidence/WEEK1-EVIDENCE.md`
- [ ] Record deploy-time transaction hashes (needs the Stellar CLI; contract explorer links already published)
- [ ] Capture wallet create/import evidence (screenshot or recording)

### Week 2 — NFC provisioning + register + association + agent auth + escrow fund (wire app ↔ contracts)  🟡 IN PROGRESS
**Planned:** NTAG213 provisioning; device register via DeviceRegistry; wallet-to-device association; delegated payment agent authorization (with constraints); escrow funding; connect RN app to deployed contracts.

**Expected output:** Functional RN wallet demonstrating register + association + delegated auth + escrow fund on Testnet.

- [ ] NTAG213 provisioning flow in app
- [x] Device register via DeviceRegistry (on-chain association) — verified on Testnet 2026-10-03
- [ ] Agent authorization UI passes constraints (limit, asset, expiry) to AgentRegistry — args wired with fixed defaults; UI pending
- [ ] Escrow funding wired to PaymentEscrow
- [ ] App ↔ deployed Soroban contracts integration verified on Testnet

### Week 3 — Full x402 flow + tests + security paths + docs  ⬜ NOT STARTED
**Expected output:** Complete x402 flow validated; automated tests passing; positive/negative security validation; developer docs.

### Week 4 — Final testing + MIT release + evidence package  ⬜ NOT STARTED
**Expected output:** Public MIT repo; published Contract IDs + WASM hashes + Stellar Expert tx links; install/deploy guides; demo video; evidence package.

---

## CI Status

Workflows live in `.github/workflows/`. Both now run on the Instaward branches (`instaward`, `instaward-staging`, `instaward-development`) as well as `main` — previously `frontend.yml` only triggered on `main`, so no Instaward push ever ran CI.

| Workflow | Scope | Status |
|----------|-------|--------|
| `contracts.yml` | Builds all three contracts to `wasm32v1-none`, runs the 41 contract tests on the host target, then prints a WASM SHA-256 reproducibility report (informational) | ✅ Passing |
| `frontend.yml` | `tsc --noEmit` + Vitest (226 tests) on Node 22 | ✅ Passing |

**Contract tests in CI: passing.** Run [`37019373910`](https://github.com/rylsherdamz-rgb/Noir_Wallet/actions/runs/37019373910) executed 17 + 8 + 16 = 41 tests, 0 failures. This satisfies the SOW metric "automated contract tests passing in CI".

**Resolved — WASM hash step is now informational.** The hash-match assertion used to fail CI. Root cause (diagnosed 2026-10-02): Soroban WASM is **not byte-identical across machines**, independent of compiler version. `soroban-sdk` embeds the absolute source path of the build host into the artifact — a panic-location string pointing at `/home/<user>/.cargo/registry/.../soroban-sdk-25.3.1/src/ledger.rs`. On a GitHub runner that prefix is `/home/runner/...`; on the maintainer's machine it is `/home/richie/...`. Different byte string → different WASM → different SHA-256, even under the pinned `1.98.1` compiler.

Evidence of the divergence:
- CI, `@stable`: device `d26fc268…`, agent `f2d55011…`, escrow `8314a126…`
- CI, pinned `1.98.1` (run `37021650785`): device `f531a8e5…`, agent `9b068271…`, escrow `b8883a60…`
- Local, `1.98.1`, clean rebuild: device `2b258a49…`, agent `2c9ee8f6…`, escrow `068ce429…` ✅ matches published `deploy-evidence/`
- Confirmed path embedding: `strings device_registry.wasm | grep /home` → `/home/richie/.cargo/registry/.../soroban-sdk-25.3.1/src/ledger.rs`

Resolution: the toolchain pin (`backend/rust-toolchain.toml` → `1.98.1` + `wasm32v1-none`) is kept, and the `contracts.yml` hash step is demoted to a **non-blocking reproducibility report** (writes a table to the job summary, never exits non-zero). The published hashes remain reproducible on the maintainer's machine (verified by clean local rebuild) and are the authoritative values in `deploy-evidence/`. The SOW gate — automated contract tests passing in CI — is enforced by the build + test steps, which are green.

Rationale: byte-identical cross-machine WASM would require full `--remap-path-prefix` normalization, which would *change* the hashes away from the already-published/deployed values and force a redeploy + evidence rewrite — a larger, misleading change for no SOW benefit. The hash match is an extra reproducibility proof, not a release gate, so it should not hold CI red.

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

### Testnet (redeployed 2026-10-03 — clean state; same WASM as 2026-10-01)
Admin / deployer: `GA33JXYPD5H3KVYEFDS6DPAHPASEN7QUHSTJ5XU6BG4TUONKXIUB4RDP` (identity `deployer`)
Full evidence (tx links, init args): `deploy-evidence/deploy-testnet-20261003T053204Z.md`

| Contract | ID | WASM SHA-256 |
|----------|----|--------------|
| device_registry | `CAVDDFFTS3FJZCVLDNOXTPLUYCYEEJGS7TGIOI5U6N4J4EIUFGMDETS5` | `a252a4070120af7222bed4dfcb220ca51c290071f2c286a2f58f7259f367bea2` |
| agent_registry | `CCFR7FTYU5NAVNRHK5NCTFO22L3K4O4R43BVUK4XRE2WFUGDVTRTIXBG` | `b0da4885fd635a6b3d76250c9423424c84c409a2e617b76946ffd2af90c7a22b` |
| payment_escrow | `CBMAP5SOZLGOHEFJX6NLBWJM73W5K6EDBVNDC33N62X2MFOT4RTP4MMO` | `3861809c9dfbcc4bf9d9941cc76ebeafb4a7d37453e15074826093d12a2941ed` |

> Admin changed from `noir-deployer` (`GCDAAT6G…`) to `deployer` (`GA33JXYP…`) in this redeploy. README and `frontend/.env.example` still list the 2026-10-01 IDs.

<details><summary>Previous: 2026-10-01 (superseded)</summary>

Admin `GCDAAT6G6BUANDLY432YEAFY2MHUDP4PVEQ6ODMKWMUL6THLDY4GY2KD` · evidence `deploy-evidence/deploy-testnet-20261002T235948Z.md`

| Contract | ID |
|----------|----|
| device_registry | `CCSW6R7ATZJNBGNQVXOTQNVBGBAHOSFR2RXUG32DLRU6I2LUQHVJKION` |
| agent_registry | `CBP6KC6IFBQQHOGKVYYDPHXPSHTYUKKHV5EGHSSNPRTJQ6G4M545NFUC` |
| payment_escrow | `CAHYPZNULA67IALHHBWTHDYGXG6DIVQNQGENWLEBMCEH5QS3JVX7DIWH` |

</details>

Redeploy script: `scripts/redeploy-contracts.sh` (build → hash → deploy → initialize → write evidence).

---

## Session Log — 2026-10-03 (app ↔ contracts wiring)

Branch `instaward-development`, 8 local commits (not pushed). `tsc` clean, Vitest 226/226.

**Fixes**
- `register_agent` failed with `MismatchingParameterLen` — app sent 3 args, contract takes 6. App now sends the policy args (`max_amount=0`, native XLM SAC, `expires_at=0` → uncapped, no expiry). Verified on-chain via `get_policy`. (`abdd5f4`)
- Provisioning hung on "Writing to NFC tag…" — `writeTag()` had no timeout. Now 15s, optional, reports real result. (`6017c86`)
- Tag owned by another wallet was reported as success (`AlreadyRegistered` swallowed). Now raises `DeviceOwnedByOtherWalletError`; nothing is signed. (`abdd5f4`)
- Payment Agents showed "1 agent" and "No agents yet" at once — orphaned agent keys were counted. Now counts only device-linked agents. (`96928bc`)

**Features**
- Provisioning checks on-chain ownership before the signature prompt, with dedicated "Already linked to you" / "Linked to another wallet" screens, a 4-step progress tracker, and categorized errors. (`4c04e80`)
- Transaction history (Transactions, Dashboard, Blockchain) loads from Horizon via `stellarService.getPaymentHistory` instead of the parked backend; date-grouped, searchable by hash. (`3fe2334`)
- Centered NFC scan pulse (`NfcScanPulse`) on Link Device and Receive. (`ad00137`)
- Layout fixes across 8 screens: keyboard covering forms, overflowing addresses, non-scrolling Receive, small touch targets. (`cc826b1`)

**Week 2 checklist impact**
- Device register via DeviceRegistry — working end-to-end on Testnet.
- Agent authorization passes constraints — wired, but with fixed defaults; no UI yet for limit / asset / expiry.
- Escrow funding — not yet wired (app never calls `fund_escrow`).

**Open**
- Push the 8 commits; update README + `.env.example` to the 2026-10-03 IDs.
- Constraint UI for agent policy; wire `fund_escrow` / `authorize`.
- Unlink/revoke flow so a tag can move between wallets.
- Not yet tested on device: NFC write timeout, ownership screens, scan animation.
