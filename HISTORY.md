# Noir Wallet — Engineering History & Context

> Purpose: a durable record of the work done in this repo, the problems hit, their
> root causes, and the fixes — written so a future assistant (or teammate) can pick
> up with full context instead of re-discovering everything. Dated 2026-07-11.

---

## 1. What Noir Wallet is

A Stellar-powered **contactless wallet**: RFID stickers / NFC cards / smartphones act as
payment instruments linked to a Stellar wallet, with a PDAX bridge for PHP cash-in/out.

- **Frontend**: Expo / React Native, **Expo SDK 57** (`frontend/`). Router = expo-router.
  Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing Expo code.
- **Backend**: Rust (actix-web) at `backend/asset/backend/` — payment gateway + PDAX + workers.
- **Contract**: Soroban `DeviceRegistry` at `EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT`
  (`CC2EBXO3BGFSFCM3DKYI4VFT7DYFFEK7YAGIGFFNLSPFRJ2QKITAQIEC`, testnet).
- **Network**: testnet everywhere (`STELLAR_NETWORK=testnet`).

### Infra facts
- **GCP project**: `noir-wallet-hackathon` (project number `646705730224`).
- **GitHub**: `rylsherdamz-rgb/Noir_Wallet`; **deploy on push to `main`** via
  `.github/workflows/deploy.yml` (build Docker → Artifact Registry → Cloud Run).
- **Cloud Run**: service `noir-backend`, region `us-central1`,
  URL `https://noir-backend-646705730224.us-central1.run.app`.
- **Service accounts**:
  - Deployer (CI, via Workload Identity): `noir-backend-deployer@noir-wallet-hackathon.iam.gserviceaccount.com`
  - Runtime: default compute `646705730224-compute@developer.gserviceaccount.com`
- **IAM roles**: project **Owner is `jrabara101@gmail.com`** (a teammate). The working
  account `richiechristiandeguzman11@gmail.com` was `editor` + several admin roles and was
  granted **`roles/resourcemanager.projectIamAdmin`** so it can grant IAM itself now.
- **API auth**: all backend routes are behind an API-key middleware. Header
  `x-api-key: dev-key-not-secure` (matches `EXPO_PUBLIC_API_KEY` / backend `API_KEY`).
  ⚠️ This key is hardcoded/insecure — rotate before anything real.

---

## 2. Backend HTTP API (as built)

Behind `x-api-key`. Base = Cloud Run URL.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | DB + fee-channel health (`healthy`/`degraded`) |
| POST | `/payment` | Non-custodial: accepts a **user-signed inner XDR**, worker fee-bumps + submits |
| POST | `/payment/tap` | **Custodial**: UID + amount → backend signs from the card's custodied wallet + fee-bumps + submits |
| GET | `/payment/{transaction_id}` | Payment status |
| POST | `/cards/provision` | Mint + fund a custodied wallet for a card UID; optional `pin` |
| POST | `/cards/revoke` | Set device status `revoked` |
| POST | `/devices/register` | Map a device UID → wallet in the DB (contract sync is stubbed) |
| POST | `/pdax/cash-in`, `/pdax/cash-out` | PDAX (login works; trade path unverified) |

Note: `api.ts` in the frontend still has methods pointing at **non-existent** backend routes
(`/auth/signup`, `/auth/login`, `/balance`, `/merchant/settings`, `/pdax/quote`, old
`/devices` shapes). Treat those as stubs.

---

## 3. Chronological changes (with commits)

Earlier (pre-session) commits of note: `455096e` API base URL, `5aa1e33` commit Cargo.lock,
`d13abf6` README demo.

1. **Frontend network split-brain fix** (`18e752e`)
   - `src/services/stellar-service.ts`, `src/store/useAppStore.ts`,
     `src/screens/DeviceProvisioningScreen.tsx`.
2. **CI/CD green** (`48fa7e7`, `79f5d6a`) — see §4.
3. **Real non-custodial fee-bump backend** (`a2e2368`) — replaced stubbed crypto; see §5.
4. **`/devices/register`** (`42e023f`) — devices reach the DB (contract sync still a stub).
5. **Frontend non-custodial wiring** (`18e752e`) — `buildSignedPaymentXdr`, `payViaBackend`.
6. **Custodial UID tap-to-pay** (`809f0cd`, frontend `55f8d19`) — passive-card model; see §6.
7. **UI de-merchant reframe** (`13265dd`) — neutral wallet language.
8. **Card controls: revoke + PIN** (`6fc251f`) — server-side; see §6.
9. **Reachable Tap-to-Pay + Cards UI** (`81a2931`) — `/tap`, `/cards`, dashboard action, PIN modal.
10. **Brand icons + splash + Tap back button** (`9194202`) — see §7.

**Verified on-chain testnet transactions (proof the rails work):**
- Non-custodial fee-bump: `c002fc459911bd1154441ecbbb06479e04b40b4ab00a19d1bf4d79ea7d8166df`
  (source = payer wallet, `fee_account` = channel).
- Custodial tap: `21e59a2650d0eaf105943e2f9d1b4b1b52a3ba6cce328e425ae8dc45110568c4`
  (source = card's custodied wallet, `fee_account` = channel).

---

## 4. CI/CD: why it was failing (4 stacked problems)

The pipeline had **four** independent failures; each only surfaced after fixing the prior one:

1. **Image push denied** — the deployer SA `noir-backend-deployer@` had **zero IAM roles**.
   Fixed by granting `roles/artifactregistry.writer` + `roles/run.admin` (project level) and
   `roles/iam.serviceAccountUser` on the runtime compute SA. (Only the Owner or a
   `projectIamAdmin` can grant these — the working account got `projectIamAdmin`.)
2. **Container panic on boot** — `main.rs` does `config.validate().expect(...)`, and
   `validate()` **rejects `ENVIRONMENT=production` while `STELLAR_NETWORK=testnet`**. The
   workflow hardcoded `production`. Fixed → `ENVIRONMENT=development`.
3. **Wrong secret wiring** — workflow mapped secrets the backend never reads
   (`MASTER_KEY_ID` old, `CHANNEL_SECRET_KEY` old, `ISSUER_ADDRESS`, `TERMINAL_ID`,
   `PDAX_SECRET_KEY`, `PDAX_CLIENT_ID`) and omitted the ones it does. Fixed to map only what
   `config.rs` reads.
4. **Multi-tag image** — `image: ${{ steps.meta.outputs.tags }}` passes *two* tags (latest +
   sha) to `gcloud run deploy --image`, which only accepts one. Fixed → pin a single
   `:latest` reference.

### Cloud Run / deploy gotchas (remember these)
- `google-github-actions/deploy-cloudrun` **replaces** all `env_vars`/`secrets` you list;
  anything omitted is dropped from the running revision.
- Secrets mapped as `NAME:latest` are **pinned to the version at deploy time**. Updating a
  secret does NOT hot-reload — you must redeploy (push) or
  `gcloud run services update noir-backend --region us-central1 --update-secrets NAME=NAME:latest`.
- The runtime (compute) SA needs `roles/secretmanager.secretAccessor` **per secret** you mount.
  We granted it for `CHANNEL_SECRET_KEY` and `MASTER_KEY_ID`.

---

## 5. Backend payment engine (was entirely stubbed → now real)

The original `transaction_signer.rs`/`transaction_builder.rs`/`stellar.rs` **could never
produce a valid transaction**:
- `create_signature()` returned `hex::encode(vec![0u8;64])` — 64 zero bytes, never signed.
- Hand-rolled XDR used the **wrong network passphrase** (`"Test SDF Network ; June 2015"` — the
  real one is **September 2015**, and it must be SHA-256 hashed), wrote zero signatures, and
  decoded accounts off-by-one.
- `submit_transaction` POSTed JSON to `{soroban_rpc}/transactions` — that's Horizon's
  form-encoded endpoint, not Soroban RPC.

**Rewrite (non-custodial + fee-bump model):**
- Deps: added `stellar-xdr = 27` (features `base64,std,alloc`), `stellar-strkey = 0.0.18`,
  `ed25519-dalek = 2`, `rand = 0.8`; removed the unused/ancient `stellar_sdk = 0.1`.
- `transaction_signer.rs`: real ed25519 via `SigningKey`, strkey decode; `sign`, `public_strkey`,
  `signature_hint`, `generate()` (random keypair).
- `transaction_builder.rs`: `build_fee_bump(signed_inner_xdr, channel_signer)` wraps a
  user-signed inner tx in a channel-fee-source fee-bump; `build_signed_payment(...)` for
  server-side payments. Uses `FeeBumpTransaction::hash(network_id)` / `Transaction::hash` for
  the signature payload.
- `stellar.rs`: Horizon submission (`POST /transactions`, form `tx=`), Horizon account
  lookups; `fund_testnet`.
- Flow: `POST /payment` stores the user-signed inner XDR (`signed_envelope_xdr` column,
  migration `20260711000001`); `SubmissionProcessor` loads it, fee-bumps with
  `CHANNEL_SECRET_KEY`, submits.
- Startup seeds a `fee_channels` row from `CHANNEL_SECRET_KEY` so `/health` is healthy for a
  real, funded channel (secret lives only in Secret Manager, not the DB row).

### stellar-xdr / strkey / dalek API gotchas (cost real time)
- **stellar-xdr v27 exposes types at the crate root**: `use stellar_xdr::{...}` — there is
  **no `curr` module** and **no `curr` feature** in v27 (it's `alloc`,`std`,`base64`,…).
- **stellar-strkey 0.0.18**: `PublicKey::to_string()` returns a **`heapless::String`** → do
  `.to_string().as_str().to_owned()` to get a `std::String`. `PrivateKey` string encoding is
  behind the **`stellar_strkey::Unredacted(&PrivateKey(seed))`** wrapper (secret-redaction).
- **ed25519-dalek v2**: `SigningKey::generate` needs the `rand_core` feature (not enabled) →
  generate with `rand::rngs::OsRng.fill_bytes(&mut [0u8;32])` + `SigningKey::from_bytes`.

---

## 6. Custodial tap-to-pay for passive NFC cards (the flagship)

A passive NFC/RFID card only carries a **UID** — it cannot sign. So "tap a blank card to pay"
is inherently **custodial**: the backend holds a per-card wallet key and signs on the card's
behalf, bounded by limits. (Non-custodial fee-bump only works when the payer's key is present,
e.g. a phone paying from its own wallet.)

- **Key custody**: `crypto.rs` `LocalKeyManager` (AES-256-GCM envelope encryption) driven by
  **`MASTER_KEY_ID`** (a base64 **32-byte** key in Secret Manager). Each card's Stellar secret
  is `encrypt_at_rest`-stored in `devices.wallet_secret_encrypted` (migration
  `20260711000002`). Plaintext key never persisted.
- `POST /cards/provision` → `TransactionSigner::generate()` mints a wallet, `fund_testnet`
  funds it, secret encrypted + stored, UID hash mapped.
- `POST /payment/tap` → hash UID → decrypt card key → `build_signed_payment` (card → dest) →
  `build_fee_bump` (channel pays fee) → submit. Enforces idempotency, rate limit, daily limit.
- **PIN** (migration `20260711000003`, `devices.pin_hash` = SHA-256 hex): optional at
  provision; `/payment/tap` **requires a matching PIN above 100,000,000 stroops (10 XLM)**.
- **Revoke**: `/cards/revoke` sets device status `revoked` → future taps fail `DEVICE_NOT_ACTIVE`.

**Verified via curl end to end**: small tap (no PIN) ok; large tap w/o PIN rejected
("PIN required"); large tap w/ PIN ok; revoke → tap rejected.

### Security posture (custodial, testnet only)
- Backend holds card keys (encrypted at rest) → backend breach is the trust boundary.
- A UID is **cloneable** → a copy can spend up to the daily limit. Mitigations in place:
  encryption at rest, daily spend limit, rate limiting, PIN above threshold, revocation.
- Before mainnet: rotate `API_KEY`, add velocity monitoring, consider hardware secure elements.

---

## 7. Secrets & keys provisioned (Secret Manager)

| Secret | Value / notes |
|---|---|
| `ISSUER_ADDRESS` | Real issuer **public** `GA254P3EWD4PZ4RS22BXMIQM5V2KIKG4K7P2N7U7VBBUUWTG7N7IVAIX` (also in frontend `.env`). |
| `ISSUER_SECRET_KEY` | Issuer **secret** (backend-only, created this session). |
| `CHANNEL_SECRET_KEY` | Fee-bump channel secret. Public = `GBA6R57HRSEOE2HH4MJGZUP5EJECASKNJ7LKKP6PKLTKTQML4BD4UT47` (funded on testnet). |
| `MASTER_KEY_ID` | Base64 32-byte AES key for card-wallet envelope encryption. |
| `PDAX_USERNAME` / `PDAX_PASSWORD` | **Account email + password** — this is what the PDAX login endpoint wants. |
| `PDAX_CLIENT_ID` / `PDAX_SECRET_KEY` | Hold `pdaxapi_temp_01` / API password — **NOT** used by the backend login; leftover. |
| `DATABASE_URL` | Postgres (Cloud SQL/hosted). |
| `TERMINAL_ID` | Still `replace-me`, unused by backend. |

### PDAX gotcha (cost time)
The backend PDAX login (`pdax.rs`) POSTs `username`+`password`. The correct credentials are the
**account email/password** (returns an `access_token`), NOT the `pdaxapi_temp_01` API pair
(those return 401). They were briefly swapped and caused `PDAX login failed: 401`.

---

## 8. Frontend UI work

- **De-merchant reframe** (`13265dd`): "Merchant" → "To" in tx detail + share text; search
  placeholder "Search name or amount…"; `Avatar` merchant variant icon storefront → person;
  Send/tx-detail avatars use neutral variants. (Data field is still `merchantName` internally;
  only visible copy changed.)
- **Reachable Tap-to-Pay**: `app/tap.tsx` routes `MerchantPosScreen` (was **orphaned** — not
  routed anywhere). Dashboard has a 5th quick action **"Tap"** (Send/Receive/Tap/Cash In/Cash
  Out — may feel tight on narrow screens; split into two rows if so). Added a **back button** to
  the Tap header (it lacked one after becoming a routed screen).
- **Cards management**: `src/screens/CardsScreen.tsx` + `app/cards.tsx` (linked from Settings):
  Add Card (reads UID → `provisionCard`, optional PIN), list, Revoke. Cards are stored in the
  Zustand `devices` list (card = a `Device` with `agentPublicKey` = wallet address, `id` = raw
  UID needed for revoke).
- **PIN modal** on taps above ₱1000 (mirrors the backend 100,000,000-stroop threshold), passed
  to `/payment/tap`.

### Brand assets (`9194202`) — regenerated from `assets/logo.jpg` (NOIR low-poly cat, gold/cream on black)
- `icon.png` (1024², opaque black bg — iOS-safe, no alpha), `android-icon-foreground.png` (cat
  in adaptive safe zone on black), `android-icon-background.png` (solid black),
  `android-icon-monochrome.png` (white cat glyph on transparent, for Android 13 themed icons),
  `splash-icon.png` (tight transparent cat), `favicon.png` (196²). Splash wired via the
  `expo-splash-screen` plugin options in `app.json` (`backgroundColor:#000000`, `imageWidth:200`).
- Generated with **ImageMagick** (`magick`). ⚠️ Icons/splash only change after a **native
  rebuild** (`expo prebuild` / EAS / `expo run:android`) — NOT in Expo Go.

---

## 9. Known stubs / limitations / TODO

- **Contract sync is a stub**: `sync.rs::sync_device_from_contract` and
  `workers/contract_sync.rs::sync_contract_state` just `Ok(())`. Devices reach the DB only via
  `/devices/register` or `/cards/provision`, not from on-chain registrations.
- **Passive-card payments are custodial** by necessity (see §6). Non-custodial only when a key
  is present on the device.
- **Channel top-up** (`transfer_to_channel`) needs a configured master account/key or it
  returns a clean `ConfigError`; not wired to a funding source.
- **Frontend has stub API methods** for routes the backend doesn't implement (see §2).
- **PDAX cash-in/out** trade path not verified end-to-end (login works).
- **`API_KEY=dev-key-not-secure`** is hardcoded (workflow + frontend). Rotate.
- **Aspirational, not built**: merchant dashboard backend, loyalty/rewards, asset issuance
  (campus/transport/event tokens), SDKs.

---

## 10. Environment / build cheatsheet

```bash
# Backend (Rust) — from backend/asset/backend
cargo build         # ~10s incremental; first build compiles many deps
cargo test --lib    # 29 tests (crypto, signer, builder, rate limiter, pdax, ...)

# Frontend — from frontend/
npx tsc --noEmit    # tsconfig has noUnusedLocals -> remove unused imports
npm test            # vitest, 144 tests

# Deploy: push to main triggers .github/workflows/deploy.yml (build+push+deploy).
# Watch: gh run watch <id> --exit-status ; verify: curl .../health

# Fast secret refresh without rebuild:
gcloud run services update noir-backend --region us-central1 \
  --update-secrets NAME=NAME:latest
```

- Toolchain present: `cargo 1.96`, ImageMagick `magick`, `gh`, `gcloud`, Node (global `fetch`).
- Vitest quirk: `createService()` in `stellar-service.ts` uses a dynamic
  `require('@/constants/config')` that Node can't resolve under vitest → it falls back to
  testnet defaults (harmless log noise; ES imports resolve fine).
- `.env` (frontend, gitignored) carries `EXPO_PUBLIC_*` incl. the device registry contract and
  issuer address. `EXPO_PUBLIC_STELLAR_NETWORK=testnet`.

---

## 11. First frontend bug fixed this session (network "split-brain")

Symptom: "account not found" even though the account exists on stellar.expert. Root cause: the
`stellarService` singleton's network was frozen at startup from env, while the Zustand store's
`network` toggle (and the explorer link) changed independently. Fix: `setNetwork` now
reconfigures the singleton; `onRehydrateStorage` re-applies the persisted network; and
`accountExists`/`getBalance` no longer swallow transient errors as "not found". Also
`DeviceProvisioningScreen` used `__DEV__` to pick network/friendbot instead of the real
configured network — fixed to use `stellarService.networkName`.
