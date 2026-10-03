---
tags: [layer, frontend]
---

# Frontend

Part of [[Noir Wallet]]. React Native + Expo (expo-router file-based routing), TypeScript, NativeWind, Zustand.

Location: `frontend/src/` and `frontend/app/`

## Sub-areas

- [[Screens]] — full-page views
- [[Components]] — reusable UI
- [[Services]] — SDK / API / device integrations
- [[Store]] — Zustand global state
- [[Domain]] — x402 agent logic
- [[Constants]] — theme, design tokens, network config
- [[Hooks]] — custom React hooks
- [[Lib]] — Soroban + Stellar helpers

## Key dependencies

- [[StellarService]] — Stellar/Soroban network operations
- [[ApiService]] — talks to [[Backend]]
- [[NFCService]] — NFC tag read/write
- [[useAppStore]] — global state
