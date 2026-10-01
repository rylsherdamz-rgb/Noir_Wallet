---
tags: [flow]
---

# Flow - Tap to Pay

Zero-interaction x402 payment. See [[Noir Wallet]].

1. [[MerchantPosScreen]] enters amount, arms terminal ([[ReadyToTapIndicator]])
2. Tag tapped → [[NFCService]] reads UID → SHA-256 hash
3. [[x402]] agent signs → [[PaymentEscrow]] `authorize` (escrow path) **or** custodial `/payment/tap` via [[ApiService]] → [[Backend]]
4. Funds debited instantly — no unlock, no app, no confirmation
5. Result surfaced via [[Toast]]; history updated in [[useAppStore]]

Depends on prior [[Flow - Device Provisioning]].
