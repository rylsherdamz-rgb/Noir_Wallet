---
tags: [service, godnode]
---

# ApiService

`frontend/src/services/api.ts` — HTTP client to the [[Backend]]. **God node (36 edges)**, cross-community bridge.

Part of [[Services]] in [[Frontend]].

Calls backend [[api.rs]] endpoints: custodial `/payment/tap`, device register, fiat cash-out, auth challenge/verify.

Used across [[Screens]] and drives [[Flow - Tap to Pay]] and [[Flow - Fiat Cash-out]].
