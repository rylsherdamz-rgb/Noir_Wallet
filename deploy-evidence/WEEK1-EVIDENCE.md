# Instaward — Week 1 Evidence Index

Maps the Week 1 deliverable to the artifact that proves it, so a reviewer can verify each item without reading the codebase.

- **Project:** Noir Wallet · **Team:** Noir · **Chapter:** Philippines
- **Repo:** https://github.com/rylsherdamz-rgb/Noir_Wallet
- **Branch:** `instaward-development`
- **Network:** Stellar Testnet

**Week 1 expected output (per SOW §5.1):** initial Soroban contracts deployed to Testnet, React Native project configured, wallet create/import operational, architecture documentation completed, initial contract deployment validated.

---

## Evidence

| # | Evidence required (SOW §6.1) | Status | Artifact |
|---|------------------------------|--------|----------|
| 1 | Public GitHub repository | ✅ | Repo above, MIT licensed ([`LICENSE`](../LICENSE)) |
| 2 | Deployed Soroban Contract IDs | ✅ | [`deploy-evidence/deploy-testnet-20261001T074804Z.md`](deploy-testnet-20261001T074804Z.md) |
| 3 | WASM SHA-256 hashes | ✅ | Same file — reproducible from source, see below |
| 4 | Automated contract test results | ✅ | [`test-results-20261002T132728Z.txt`](test-results-20261002T132728Z.txt) — 41 passed, 0 failed |
| 5 | Architecture diagrams | ✅ | [`docs/architecture.md`](../docs/architecture.md) — Mermaid, renders on GitHub |
| 6 | Contract interface documentation | ✅ | [`README.md`](../README.md#contract-methods) + [`Noir/_AI Build Guide - Contracts.md`](../Noir/_AI%20Build%20Guide%20-%20Contracts.md) |
| 7 | Deployment script / reproducible deploy | ✅ | [`scripts/redeploy-contracts.sh`](../scripts/redeploy-contracts.sh) |
| 8 | Deployment transaction hashes | ⬜ Outstanding | Requires the Stellar CLI to query; see *Outstanding* below |
| 9 | Wallet create/import demonstrated | ⬜ Outstanding | Implemented in the app; needs a screenshot/recording captured as evidence |

---

## Deployed contracts (Testnet)

Deployed 2026-10-01. Admin / deployer: `GCDAAT6G6BUANDLY432YEAFY2MHUDP4PVEQ6ODMKWMUL6THLDY4GY2KD`

| Contract | ID | WASM SHA-256 |
|----------|----|--------------|
| device_registry | [`CCJQCI34…FAF6C2AM`](https://stellar.expert/explorer/testnet/contract/CCJQCI34FAW5W3U55HZERPZVZF3IIEVFP2ATGIZASDGSY2K2FAF6C2AM) | `2b258a496495a2a15cdf76ceb20d14dcd89ca316e74eb08a496b61e3af986817` |
| agent_registry | [`CAOVUFDV…V37GAA`](https://stellar.expert/explorer/testnet/contract/CAOVUFDVSOVCYJKMBLJWRERNEZOGA62D56ZZOKGLJWPROAV7SUV37GAA) | `2c9ee8f6aea1a44c317ba306cb22b782c7cef58fbbffafdcf30a8abdb275617a` |
| payment_escrow | [`CCSWYQ7O…T5MG3DIU`](https://stellar.expert/explorer/testnet/contract/CCSWYQ7ORLF2ZG5RBBPDX4VUVPYF2LGV5N3OYJERZUBVX7KMT5MG3DIU) | `068ce429550d6e7fb34c6b88975e6fad063d7463572aca38b5fb7db61e55280c` |

These IDs are the single set used across the README, `frontend/.env.example`, and the Obsidian contract notes.

### Verifying the hashes yourself

The published hashes are reproducible from source:

```bash
cd backend
cargo build --release --target wasm32v1-none -p agent-registry -p device-registry
cargo build --release --target wasm32v1-none -p payment-escrow
sha256sum target/wasm32v1-none/release/{device_registry,agent_registry,payment_escrow}.wasm
```

---

## Test evidence

41 automated contract tests, all passing:

| Contract | Tests |
|----------|-------|
| device_registry | 8 |
| agent_registry | 17 |
| payment_escrow | 16 |

Reproduce:

```bash
cd backend
HOST=$(rustc -vV | awk '/host/{print $2}')
cargo test -p device-registry -p agent-registry -p payment-escrow --target "$HOST"
```

### SOW security paths covered (§7.2)

Accepted: registered device · authorized agent · in-policy payment · merchant settlement.

Rejected, each by a named test: unregistered device · duplicate registration (`test_duplicate_registration_rejected`) · unauthorized agent (`test_unauthorized_agent_rejected`) · expired authorization (`test_expired_authorization_rejected`) · over-limit payment (`test_over_limit_payment_rejected`) · wrong asset (`test_wrong_asset_rejected`) · revoked agent (`test_revoked_agent_rejected`) · replayed nonce (`test_replayed_nonce_rejected`) · insufficient balance (`test_insufficient_balance_rejected`) · sweep while agent active (`test_sweep_rejected_while_agent_active`).

Fund recovery on revoke: `test_sweep_on_revoke_returns_all_funds_to_owner`.

---

## Outstanding for Week 1 sign-off

1. **Deployment transaction hashes.** The contract IDs and WASM hashes are recorded, but the deploy-time tx hashes are not. The Stellar CLI was unavailable in the environment where the contracts were built and verified, so these must be captured on a machine with `stellar`/`soroban` installed. The contract explorer links above already let a reviewer confirm the contracts exist on Testnet.
2. **Wallet create/import evidence.** The flow is implemented; Week 1 sign-off needs a screenshot or short recording showing create and import against Testnet.

Neither gap affects the contract layer, which is deployed, documented, and covered by the 41 passing tests above.
