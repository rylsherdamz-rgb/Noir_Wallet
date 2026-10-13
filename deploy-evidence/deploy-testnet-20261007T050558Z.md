# Noir Wallet — Contract Deployment Evidence

- **Network:** testnet
- **Deployed (UTC):** 20261007T050558Z
- **Deployer / admin:** `GA33JXYPD5H3KVYEFDS6DPAHPASEN7QUHSTJ5XU6BG4TUONKXIUB4RDP` (identity: `deployer`)

## Contract IDs

| Contract | ID | Explorer |
|----------|----|----------|
| device_registry | `CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA` | [testnet](https://stellar.expert/explorer/testnet/contract/CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA) |
| agent_registry | `CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ` | [testnet](https://stellar.expert/explorer/testnet/contract/CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ) |
| payment_escrow | `CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX` | [testnet](https://stellar.expert/explorer/testnet/contract/CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX) |

## WASM SHA-256 hashes

| Contract | SHA-256 |
|----------|---------|
| device_registry.wasm | `a252a4070120af7222bed4dfcb220ca51c290071f2c286a2f58f7259f367bea2` |
| agent_registry.wasm | `b0da4885fd635a6b3d76250c9423424c84c409a2e617b76946ffd2af90c7a22b` |
| payment_escrow.wasm | `3861809c9dfbcc4bf9d9941cc76ebeafb4a7d37453e15074826093d12a2941ed` |

## Deploy transactions

Recovered 2026-10-09 from Horizon (deployer account operations) and Soroban RPC
`getTransaction` — each create-contract tx's return value is the contract ID above.
The WASM was already installed on-chain, so this deploy has no upload transactions.

| Contract | Step | Transaction | Ledger |
|----------|------|-------------|--------|
| device_registry | create contract | [`9059b7be61cc…`](https://stellar.expert/explorer/testnet/tx/9059b7be61cc67ed87efecd14db0da93775a8c09b267f094a7d644e7456049cc) | 5065196 |
| agent_registry | create contract | [`4bb278be2d1f…`](https://stellar.expert/explorer/testnet/tx/4bb278be2d1f581c28f5a6440e9ddc8ae278104af37d73bd37b26dc84d149fe7) | 5065197 |
| payment_escrow | create contract | [`89089a753eca…`](https://stellar.expert/explorer/testnet/tx/89089a753eca066e74329aabdbd356e9a1bbb94176d2dc855c93e9d3eda46742) | 5065199 |
| device_registry | initialize | [`e9803bb084cb…`](https://stellar.expert/explorer/testnet/tx/e9803bb084cb9bd649ec0ccb356973c3a8777d70fd309a8d1b5f8e5593d03d8c) |  |
| agent_registry | initialize | [`0a9bb162bf82…`](https://stellar.expert/explorer/testnet/tx/0a9bb162bf82502c0f4b5f83164db5767bd90822b3b6cc25bcb71b1cd5d5f90c) |  |
| payment_escrow | initialize | [`204af92bc845…`](https://stellar.expert/explorer/testnet/tx/204af92bc845067e81db1bb9dfcbd1ca88e62876583ea871efcb19ccdfa05c92) |  |

## Initialization

- device_registry: `initialize(admin=GA33JXYPD5H3KVYEFDS6DPAHPASEN7QUHSTJ5XU6BG4TUONKXIUB4RDP)`
- agent_registry: `initialize(admin=GA33JXYPD5H3KVYEFDS6DPAHPASEN7QUHSTJ5XU6BG4TUONKXIUB4RDP)`
- payment_escrow: `initialize(admin=GA33JXYPD5H3KVYEFDS6DPAHPASEN7QUHSTJ5XU6BG4TUONKXIUB4RDP, agent_registry_id=CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ, device_registry_id=CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA)`

## Env (paste into frontend/.env)

```
EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT=CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA
EXPO_PUBLIC_AGENT_REGISTRY_CONTRACT=CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ
EXPO_PUBLIC_PAYMENT_ESCROW_CONTRACT=CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX
```
