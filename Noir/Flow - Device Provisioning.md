---
tags: [flow]
---

# Flow - Device Provisioning

How a hardware tag becomes a payment-ready device. See [[Noir Wallet]].

1. [[DeviceProvisioningScreen]] → pick a label → tap **Link Device**
2. [[NFCService]] reads the tag UID (via [[useNfc]])
3. App SHA-256 hashes the UID
4. Ownership pre-check: [[DeviceRegistry]] `get_device` → free / mine (already linked) / other wallet (stop — never ask for a doomed signature)
5. **Signature Request sheet** shows the constrained delegation policy the owner is about to sign:
   - Max per payment: No cap / 10 / 25 / 50 / 100 XLM (default 25)
   - Agent access expires: Never / 7 / 30 / 90 days (default 30)
   - Asset: native XLM (SAC)
   `buildAgentPolicy` converts to stroops + unix seconds and rejects values the contract would reject (`InvalidPolicy`).
6. [[x402]] agent wallet derived (one HD index per card)
7. Owner signs [[DeviceRegistry]] `register(wallet, device_hash, agent)` then [[AgentRegistry]] `register_agent(wallet, device_hash, agent, max_amount, asset, expires_at)` — one shared source account, reads first so already-done steps are skipped
8. Device linked + agent authorized → fund escrow ([[Flow - Escrow Payment]]) → ready for [[Flow - Tap to Pay]]

Error codes differ per contract: device_registry `#4` = AlreadyRegistered, agent_registry `#3` = AlreadyRegistered but `#4` = InvalidPolicy (surfaced to the user, never swallowed). User-facing text lives in `frontend/src/domain/contractErrors.ts`.
