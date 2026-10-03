---
tags: [backend, godnode]
---

# Repository

`backend/asset/backend/src/db.rs` — PostgreSQL data access layer. **God node (24 edges)**, cross-community bridge. Part of [[Backend]].

Reads/writes: [[devices]] · [[payment_transactions]] · [[fee_channels]] · [[channel_transactions]] · [[daily_spends]] · [[sessions]] · [[auth_challenges]] · [[pdax_orders]] · [[rate_limits]].

Used by [[api.rs]], [[auth.rs]], and [[PdaxClient]].
