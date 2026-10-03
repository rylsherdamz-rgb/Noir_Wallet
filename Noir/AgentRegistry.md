---
tags: [contract, soroban]
---

# AgentRegistry

A [[Smart Contracts|Soroban contract]]. On-chain agent authorization per device — the wallet owner authorizes a signing key for tap-to-pay.

Source: `backend/asset/contracts/agent_registry/src/lib.rs`

## Methods (real signatures — see [[_AI Build Guide - Contracts]])

- `initialize(admin: Address)` — set admin once (`admin.require_auth()`); panics `AlreadyInitialized`
- `register_agent(wallet, device_hash, agent, max_amount: i128, asset: Address, expires_at: u64)` — `wallet.require_auth()`; stores a **constrained `AgentPolicy`**; panics `AlreadyRegistered` if a mapping exists (rotate via `revoke_agent` first), `InvalidPolicy` if `max_amount < 0` or a non-zero `expires_at` is already in the past
- `revoke_agent(wallet, device_hash)` — `wallet.require_auth()`; panics `AgentNotFound` if none
- `get_agent(device_hash) -> Address` — derives from policy; panics `AgentNotFound`
- `get_policy(device_hash) -> AgentPolicy` — full policy readback; panics `AgentNotFound`
- `is_auth(device_hash, agent) -> bool` — agent match **AND not expired**
- `check_payment(device_hash, agent, asset, amount) -> bool` — **the single enforcement predicate [[PaymentEscrow]] calls**: agent match + asset match + `amount>0` + within cap (`max_amount==0` = uncapped) + not expired

`AgentPolicy { agent: Address, max_amount: i128, asset: Address, expires_at: u64 }`.
- `max_amount == 0` → uncapped single-payment amount
- `expires_at == 0` → never expires; otherwise an **absolute ledger timestamp**

Storage: `AgentMap(device_hash) -> AgentPolicy`. Errors: `AlreadyInitialized=1, AgentNotFound=2, AlreadyRegistered=3, InvalidPolicy=4`.

## Relationships

- [[PaymentEscrow]] calls `check_payment` to enforce the full policy on every `authorize` (and `is_auth` as the sweep-on-revoke guard)
- [[Flow - Device Provisioning]] calls `register_agent` with the owner's chosen limit/asset/expiry
- Linked from [[x402]] agent domain logic on [[Frontend]]

## Deployed IDs

- testnet: `CBP6KC6IFBQQHOGKVYYDPHXPSHTYUKKHV5EGHSSNPRTJQ6G4M545NFUC`
- mainnet: `CDE2Q22BNKHLRNHUXHNL4TYRN5YPCOCO2XD53MAVYG7K2C4KZ2T6NI5T`
