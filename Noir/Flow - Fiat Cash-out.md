---
tags: [flow]
---

# Flow - Fiat Cash-out

Optional PHP cash-out via the PDAX bridge. See [[Backend]].

1. Frontend [[ApiService]] hits [[Backend]] [[api.rs]] fiat endpoints
2. [[auth.rs]] verifies the wallet ([[AuthenticatedWallet]]) via challenge/verify
3. [[pdax.rs]] / [[PdaxClient]] logs into PDAX, requests a firm quote, places the order
4. Order state persisted by [[Repository]] ([[pdax_orders]], [[PdaxOrder]])
5. XLM → PHP conversion + withdrawal executed

Sensitive values encrypted at rest via [[crypto.rs]] ([[KeyManager]]).
