---
tags: [service, godnode]
---

# StellarService

`frontend/src/services/stellar-service.ts` — network-aware Stellar/Soroban operations. **God node (37 edges)**, bridges the app to the chain.

Part of [[Services]] in [[Frontend]].

Responsibilities: account create/fund (Friendbot), balance lookup, payment submission, Soroban contract invoke/read via [[soroban.ts]].

Talks to: [[DeviceRegistry]] · [[AgentRegistry]] · [[PaymentEscrow]]
Used by: [[Screens]] (Dashboard, Send, Receive, Device Provisioning) and [[x402]].
