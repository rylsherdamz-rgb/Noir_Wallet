---
tags: [layer, backend]
---

# Backend

Part of [[Noir Wallet]]. Rust Axum HTTP API providing custodial tap-to-pay, auth challenges, and the PDAX fiat bridge.

Location: `backend/asset/backend/src/`

## Modules

- [[api.rs]] — HTTP route handlers ([[ApiService]] on frontend calls these)
- [[auth.rs]] — SEP-10 style challenge/verify wallet auth ([[AuthenticatedWallet]])
- [[pdax.rs]] — [[PdaxClient]] fiat bridge integration
- [[db.rs]] — [[Repository]] PostgreSQL data access
- [[crypto.rs]] — [[KeyManager]] encrypt/decrypt at rest
- [[money.rs]] — decimal parsing / [[CryptoAsset]] amounts
- [[rate_limiter.rs]] — [[RateLimiter]]
- [[config.rs]] — [[Config]] env parsing
- [[models.rs]] — DB models ([[AppUser]], [[PdaxOrder]], [[PdaxSession]])
- [[metrics.rs]] — [[MetricsCollector]]
- [[state.rs]] — shared app state
- [[errors.rs]] — [[PaymentError]]

## Database

Tables: [[devices]] · [[payment_transactions]] · [[fee_channels]] · [[channel_transactions]] · [[daily_spends]] · [[sessions]] · [[auth_challenges]] · [[pdax_orders]] · [[rate_limits]]
