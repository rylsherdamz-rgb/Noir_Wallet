---
tags: [flow]
---

# Flow - Escrow Payment

Pre-funded escrow settlement. See [[Noir Wallet]] and [[PaymentEscrow]].

1. **Pre-fund** — owner deposits XLM via [[PaymentEscrow]] `fund_escrow` (one-time per device)
2. **Tap** — [[x402]] agent reads NFC → SHA-256 hash → [[PaymentEscrow]] `authorize(agent, device_hash, merchant, amount)`
3. **Instant** — funds locked for merchant; no Horizon submission, no per-tap fee
4. **Settle** — merchant calls [[PaymentEscrow]] `claim` in batch
5. **Reclaim** — owner calls `defund_escrow` for unused balance

Agent authorization is validated against [[AgentRegistry]] `is_auth`.
