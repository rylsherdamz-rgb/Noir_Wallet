---
tags: [flow]
---

# Flow - Device Provisioning

How a hardware tag becomes a payment-ready device. See [[Noir Wallet]].

1. [[DeviceProvisioningScreen]] → tap **Link Device**
2. [[NFCService]] reads the tag UID (via [[useNfc]])
3. App SHA-256 hashes the UID
4. Owner signs → [[StellarService]] / [[soroban.ts]] calls [[DeviceRegistry]] `register(device_hash, wallet)`
5. [[x402]] agent wallet created + funded (Friendbot on testnet)
6. Owner signs [[AgentRegistry]] `register_agent(wallet, device_hash, agent)`
7. Device linked + agent authorized → ready for [[Flow - Tap to Pay]]
