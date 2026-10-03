---
tags: [backend, godnode]
---

# PdaxClient

`unused/pdax-backend/src/pdax.rs` — PDAX fiat bridge client. **God node (27 edges)**. Part of [[Backend]].

Handles PDAX login/session, firm quotes, order placement, balances, and fiat/crypto deposit/withdraw. Powers [[Flow - Fiat Cash-out]].

Persists via [[Repository]] ([[pdax_orders]], [[PdaxSession]], [[PdaxOrder]]).
