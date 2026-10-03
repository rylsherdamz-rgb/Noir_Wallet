---
tags: [layer, contracts, soroban]
---

# Smart Contracts

Part of [[Noir Wallet]]. Three Soroban (Rust) contracts deployed on Stellar testnet + mainnet.

> 📖 Full source-accurate function reference: [[_AI Build Guide - Contracts]]

Location: `backend/asset/contracts/`

## Contracts

- [[DeviceRegistry]] — maps hardware device hashes → Stellar wallets
- [[AgentRegistry]] — authorizes a signing agent per device
- [[PaymentEscrow]] — pre-funded escrow, instant agent authorize, batch merchant claim

## Relationships

- [[PaymentEscrow]] links to [[AgentRegistry]] at init (`agent_registry_id`) to check agent authorization
- [[Flow - Device Provisioning]] calls [[DeviceRegistry]] then [[AgentRegistry]]
- [[Flow - Escrow Payment]] uses [[PaymentEscrow]]

All owner-initiated calls use `wallet.require_auth()`.
