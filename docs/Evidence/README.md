# On-Chain Deployment Evidence — Testnet

Visual proof that the three Noir Wallet Soroban contracts are deployed,
initialized, and verifiable on Stellar testnet. These screenshots back the
contract IDs listed in the [root README](../../README.md#smart-contracts) and
the machine-readable record in
[`deploy-evidence/deploy-testnet-20261002T235948Z.md`](../../deploy-evidence/deploy-testnet-20261002T235948Z.md).

> **Why these IDs change:** each `./scripts/redeploy-contracts.sh` run deploys
> **fresh contract instances**, so every redeploy mints **new contract IDs** —
> it is a clean slate, not an in-place upgrade. The IDs below are from the
> latest run (2026-10-03, deployer `GA33JXYP…4RDP`).

## Deployed contracts

| Contract | ID | Explorer |
|----------|----|----------|
| device_registry | `CCSW6R7ATZJNBGNQVXOTQNVBGBAHOSFR2RXUG32DLRU6I2LUQHVJKION` | [view](https://stellar.expert/explorer/testnet/contract/CCSW6R7ATZJNBGNQVXOTQNVBGBAHOSFR2RXUG32DLRU6I2LUQHVJKION) |
| agent_registry | `CBP6KC6IFBQQHOGKVYYDPHXPSHTYUKKHV5EGHSSNPRTJQ6G4M545NFUC` | [view](https://stellar.expert/explorer/testnet/contract/CBP6KC6IFBQQHOGKVYYDPHXPSHTYUKKHV5EGHSSNPRTJQ6G4M545NFUC) |
| payment_escrow | `CAHYPZNULA67IALHHBWTHDYGXG6DIVQNQGENWLEBMCEH5QS3JVX7DIWH` | [view](https://stellar.expert/explorer/testnet/contract/CAHYPZNULA67IALHHBWTHDYGXG6DIVQNQGENWLEBMCEH5QS3JVX7DIWH) |

### WASM SHA-256 hashes

The hash of each deployed WASM — recompute locally with `sha256sum` on the
release build and it must match, proving the on-chain code is exactly what's in
this repo.

| Contract | SHA-256 |
|----------|---------|
| device_registry.wasm | `a252a4070120af7222bed4dfcb220ca51c290071f2c286a2f58f7259f367bea2` |
| agent_registry.wasm | `b0da4885fd635a6b3d76250c9423424c84c409a2e617b76946ffd2af90c7a22b` |
| payment_escrow.wasm | `3861809c9dfbcc4bf9d9941cc76ebeafb4a7d37453e15074826093d12a2941ed` |

## Explorer screenshots

### device_registry — `CCSW6R7A…`

Stellar Expert view of the deployed device registry: maps hardware device
hashes to the owner wallet and its authorized agent.

![device_registry on Stellar Expert](stellar.expert-explorer-testnet-contract-CCSW6R7ATZJNBGNQVX.png)

### agent_registry — `CBP6KC6I…`

The agent registry holding each device's constrained delegated-payment policy
(agent key, per-tap cap, allowed asset, expiry).

![agent_registry on Stellar Expert](stellar.expert-explorer-testnet-contract-CBP6KC6IFBQQHOGKVY.png)

### payment_escrow — `CAHYPZNU…`

The escrow contract that pre-funds a device, authorizes payments instantly
against the agent policy, and lets merchants batch-claim.

![payment_escrow on Stellar Expert](stellar.expert-explorer-testnet-contract-CAHYPZNULA67IALHHB.png)

## Deployment console output

The redeploy script's deploy + initialize output, showing the freshly minted
contract addresses.

![Deploy console output 1](contract_address1.png)
![Deploy console output 2](contract_address2.png)

## Test suite

All contract tests passing (positive and negative paths) prior to deployment.

![cargo test output 1](cargo_test1.png)
![cargo test output 2](cargo_test2.png)
