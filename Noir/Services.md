---
tags: [frontend, services]
---

# Services

Part of [[Frontend]]. Integration layer in `frontend/src/services/`.

## Network / chain
- [[StellarService]] — `stellar-service.ts`, network-aware Stellar/Soroban ops (god node, 37 edges)
- [[ApiService]] — `api.ts`, HTTP client to [[Backend]] (god node, 36 edges)
- [[stellar.ts]] — legacy stellar helpers
- [[txMonitor.ts]] — transaction status polling

## Device / security
- [[NFCService]] — `nfc.ts`, tag read/write
- [[biometrics.ts]] — biometric auth
- [[pinLock.ts]] — PIN lock
- [[secureStorage.ts]] · [[storage.ts]] — key/value + secure storage

## Misc
- [[wallet.ts]] — [[WalletService]] key/account helpers
- [[fxRates.ts]] — FX rate fetch

Used across [[Screens]] and [[Domain]].
