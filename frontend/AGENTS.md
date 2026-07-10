# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Stellar CLI

A TypeScript CLI for Stellar/Soroban operations. Located at `scripts/stellar-cli.ts`.

```
npm run stellar help          # Show help
npm run stellar fund <addr>   # Fund via Friendbot (testnet only)
npm run stellar balance <addr> # Check XLM balance
npm run stellar create-wallet # Generate random keypair
npm run stellar invoke <contract> <method> <secret> [type:val...]
npm run stellar register-device <contract> <hash-hex> <secret>
npm run stellar tx-status <hash>
npm run stellar read <contract> <method> <pubkey> [type:val...]
```

Network: `STELLAR_NETWORK=mainnet` for mainnet (default: testnet).

# Known stellar-sdk v16 auth issue

`prepareTransaction` doesn't auto-populate `sorobanAuth` entries for contracts using `wallet.require_auth()`. Transactions fail with `sceAuth` error. This affects both the CLI and the frontend's `invokeContract`. The simulation returns no auth entries, so the prepared transaction lacks authorization.

Workaround: Manual `SorobanAuthorizationEntry` construction (if needed before SDK fix).
