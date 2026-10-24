# Deployment Guide

Deploy your own copy of the three Noir contracts to Stellar Testnet, point the app at them, and record verifiable evidence. Finish the [Installation guide](installation.md) first.

> [!IMPORTANT]
> Every deploy creates **new contract IDs**. It is a clean slate, not an upgrade: devices, policies and escrow balances on the old contracts are not carried over.

## 0. Create a funded deployer identity

```bash
stellar keys generate deployer --network testnet --fund   # creates and funds via Friendbot
stellar keys address deployer                             # G… — becomes the contracts' admin
```

To reuse an existing key: `stellar keys add deployer --secret-key`.

## Option A — scripted (recommended)

[`scripts/redeploy-contracts.sh`](../scripts/redeploy-contracts.sh) builds, hashes, deploys and initializes all three contracts in the right order, then writes an evidence file.

```bash
./scripts/redeploy-contracts.sh                      # testnet, identity "deployer"
UPDATE_ENV=1 ./scripts/redeploy-contracts.sh         # also patch frontend/.env with the new IDs
NETWORK=testnet DEPLOYER=myid ./scripts/redeploy-contracts.sh
```

| Step | What it does |
|------|--------------|
| 1. Build | `agent_registry` + `device_registry` WASM, then `payment_escrow` |
| 2. Hash | SHA-256 of each `.wasm`, for the evidence file |
| 3. Deploy | `stellar contract deploy` for each WASM |
| 4. Initialize | `device_registry.initialize(admin)` → `agent_registry.initialize(admin, device_registry_id)` → `payment_escrow.initialize(admin, agent_registry_id, device_registry_id)` |
| 5. Evidence | Writes `deploy-evidence/deploy-<network>-<UTC timestamp>.md` with IDs, hashes, Stellar Expert links and a ready-to-paste `.env` block |
| 6. Env (optional) | With `UPDATE_ENV=1`, rewrites the three `EXPO_PUBLIC_*_CONTRACT` lines in `frontend/.env` |

### From GitHub Actions (redeploy + APK release)

[`redeploy-release.yml`](../.github/workflows/redeploy-release.yml) does the whole release from the Actions tab (**Redeploy contracts + release APK → Run workflow**):

1. Checks out `base_branch` (default `instaward-development`) and runs the preflight checks: the previous deploy must resolve (`propagate-contract-ids.sh --check`), and no `redeploy/testnet-*` PR may still be open. It then runs the contract tests and `scripts/redeploy-contracts.sh` on Testnet. The evidence file is saved as a run artifact, so it survives a later failure. If the script fails partway, it writes a `.partial.md` record of the contracts that did go on-chain.
2. [`scripts/propagate-contract-ids.sh`](../scripts/propagate-contract-ids.sh) replaces the previous deploy's contract IDs and WASM hashes with the new ones. It reads the previous deploy from `frontend/eas.json` and checks every value before editing. Records of past runs are left alone: `deploy-evidence/`, `docs/walkthrough.md`, `docs/evidence-package.md` and the `Noir/Session - *` logs. `.github/` is skipped too, because the workflow token cannot push workflow changes, so update the expected hashes in `contracts.yml` by hand.
3. Commits only those files plus the new evidence file, pushes a `redeploy/testnet-<timestamp>` branch and opens a PR into `base_branch`. The PR lists the prose that still needs a hand edit, such as deploy dates and evidence pointers.
4. Builds the `preview` APK on EAS from that branch, so the APK uses the new contracts.
5. Uploads `Noir.apk` and the evidence file to the release (`Beta-Test` by default; it is created as a pre-release if missing), replacing an existing `Noir.apk`. A marked block in the release notes is rewritten with the commit and contract IDs of the APK. The rest of the notes is kept.

Turn off the `redeploy` input to only rebuild the APK from `base_branch`.

One-time setup: add the repository secrets `STELLAR_DEPLOYER_SECRET` (secret key of the funded deployer/admin) and `EXPO_TOKEN` (expo.dev access token). Also add `RELEASE_PR_TOKEN`, a fine-grained PAT with contents and pull-requests write. A PR opened with the default `GITHUB_TOKEN` does not start CI, so the required `test` check never reports on it. Without the PAT, enable **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**, then close and reopen the ID PR to start its CI.

## Option B — manual

### 1. Build

```bash
cd backend
cargo build --release --target wasm32v1-none -p agent-registry -p device-registry
cargo build --release --target wasm32v1-none -p payment-escrow
sha256sum target/wasm32v1-none/release/*.wasm
```

### 2. Deploy

```bash
W=target/wasm32v1-none/release
DEVICE=$(stellar contract deploy --wasm $W/device_registry.wasm --source deployer --network testnet)
AGENT=$(stellar contract deploy  --wasm $W/agent_registry.wasm  --source deployer --network testnet)
ESCROW=$(stellar contract deploy --wasm $W/payment_escrow.wasm  --source deployer --network testnet)
ADMIN=$(stellar keys address deployer)
```

### 3. Initialize (order matters)

```bash
stellar contract invoke --id $DEVICE --source deployer --network testnet -- initialize --admin $ADMIN
stellar contract invoke --id $AGENT  --source deployer --network testnet -- initialize --admin $ADMIN --device_registry_id $DEVICE
stellar contract invoke --id $ESCROW --source deployer --network testnet -- \
  initialize --admin $ADMIN --agent_registry_id $AGENT --device_registry_id $DEVICE
```

`agent_registry` must receive the `device_registry` ID (it checks device ownership there before accepting or revoking a policy). `payment_escrow` must receive **both** registry IDs. It reads policies from `agent_registry` and owners from `device_registry`. Each `initialize` can run only once (`AlreadyInitialized = 1`).

### 4. Smoke test

```bash
stellar contract invoke --id $DEVICE --source deployer --network testnet --send=no -- \
  wallet_device_count --wallet $ADMIN            # → 0
stellar contract invoke --id $ESCROW --source deployer --network testnet --send=no -- \
  balance_of --device_hash 0000000000000000000000000000000000000000000000000000000000000000   # → "0"
```

## Point the app at the new contracts

1. Set the three IDs in `frontend/.env` (or use `UPDATE_ENV=1`).
2. For EAS / Play Store builds, also update the `base` profile in [`frontend/eas.json`](../frontend/eas.json). `.env` is gitignored, so EAS builds take the contract IDs from there. Secrets go in `eas env`, never in `eas.json`.
3. Restart Metro (`npx expo start -c`). `EXPO_PUBLIC_*` values are inlined at bundle time.
4. Run the live Testnet check against your contracts (see [Testing](testing.md#live-testnet-run)):

```bash
cd frontend && npm run test:testnet
```

## Propagate new IDs through the docs

The script only patches `frontend/.env`. After a redeploy that should become the public reference deploy, grep for the old IDs and replace them:

```bash
git grep -l CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA
```

Files that carry the IDs: `README.md`, `frontend/.env.example`, `frontend/eas.json`, `docs/*.md`, `docs/Evidence/README.md`, `landing/lib/site.ts`, `sdk/agent-sdk/src/networks.ts`, `PROGRESS.md`.

## Building the Android release

```bash
cd frontend
npx eas build --platform android --profile preview      # installable APK (internal distribution)
npx eas build --platform android --profile production   # Play Store app bundle (AAB)
```

Or build locally with `npx expo run:android --variant release`. [`app.json`](../frontend/app.json) requests only the `NFC` permission (plus what Expo needs), blocks unused permissions and sets `allowBackup: false`. Keep it that way.

## Verifying a deploy

Anyone can check a deploy without trusting this repo:

1. Open each contract ID on [Stellar Expert (testnet)](https://stellar.expert/explorer/testnet) and confirm the create and `initialize` transactions.
2. Rebuild the WASM with the pinned toolchain and compare `sha256sum` against the evidence file.

> [!NOTE]
> The WASM hashes reproduce only on the **same build path** (for example the maintainer's machine). `soroban-sdk` embeds the absolute path of the cargo registry in the binary, so a build under a different home directory produces different bytes. CI prints its hashes as an informational report rather than failing on them. See [`PROGRESS.md` → CI Status](../PROGRESS.md#ci-status).

Reference deploy currently in use: [`deploy-evidence/deploy-testnet-20261007T050558Z.md`](../deploy-evidence/deploy-testnet-20261007T050558Z.md).

Next: [Walkthrough](walkthrough.md) · [Contract reference](contracts.md)
