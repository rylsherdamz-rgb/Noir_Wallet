---
tags: [contract, soroban]
---

# PaymentEscrow

A [[Smart Contracts|Soroban contract]]. Escrow-based settlement — wallet pre-funds, agent authorizes payments instantly, merchants claim in batch.

Source: `backend/asset/contracts/payment_escrow/src/lib.rs`

## Methods (real signatures — see [[_AI Build Guide - Contracts]])

- `initialize(admin, agent_registry_id, device_registry_id)` — **takes BOTH registry IDs** (README wrong); `admin.require_auth()`; panics `AlreadyInitialized`
- `fund_escrow(token, wallet, device_hash, amount)` — `wallet.require_auth()`; `token.transfer(wallet→contract)`; `EscrowBalance[device] += amount`
- `authorize(agent, device_hash, merchant, asset, amount, nonce)` — `agent.require_auth()`; **nonce replay guard** (`DuplicateAuth`); enforces the **full constrained policy** via [[AgentRegistry]] `check_payment` (agent match + asset match + amount>0 + within cap + not expired → `AgentNotAuthorized` on any failure); `InsufficientBalance` check; deducts; writes pending `Payment` to **temporary** storage. No transfer here.
- `claim(token, merchant)` — `merchant.require_auth()`; sums pending, `NothingToClaim` if 0, transfers total, resets index
- `defund_escrow(token, device_hash, amount)` — owner resolved via [[DeviceRegistry]] `get_owner` then `owner.require_auth()`; `InsufficientBalance` check; refunds owner
- `sweep_on_revoke(token, device_hash, agent) -> i128` — **on-revoke sweep**: owner (via [[DeviceRegistry]] `get_owner`) `require_auth`; refuses with `AgentStillActive` if the agent is still `is_auth` in [[AgentRegistry]]; otherwise transfers the device's **entire** escrow balance back to the owner and zeroes it. Returns the swept amount (0 if empty). Call *after* `agent_registry.revoke_agent`.
- `balance_of(device_hash) -> i128` · `pending_balance(merchant) -> i128`

`Payment`: `device_hash, amount, timestamp`. Errors: `AlreadyInitialized=1, InsufficientBalance=2, AgentNotAuthorized=3, NotDeviceOwner=4, NothingToClaim=5, DuplicateAuth=6, AgentStillActive=7`.

> ⚠️ Pending payments use **temporary** storage (can expire if unclaimed). `nonce` must strictly increase per (device, agent) — this is the on-chain replay protection.
> ⚠️ `authorize` now takes `asset` and enforces the policy's approved asset + spending cap + expiry. The `agent_registry` and `device_registry` import modules in `lib.rs` are `pub` so integration tests can deploy the real dependency contracts.

## Relationships

- Depends on [[AgentRegistry]] (`check_payment` on authorize, `is_auth` on sweep guard) to authorize agents
- Depends on [[DeviceRegistry]] (`get_owner`) for defund + sweep ownership
- Drives [[Flow - Escrow Payment]] and [[Flow - Tap to Pay]]
- On revocation: owner calls `agent_registry.revoke_agent` then `payment_escrow.sweep_on_revoke` to pull all device funds back to the main account

## Deployed IDs

- testnet: `CCSWYQ7ORLF2ZG5RBBPDX4VUVPYF2LGV5N3OYJERZUBVX7KMT5MG3DIU`
- mainnet: `CCEIB2BLMHK7N7OX23HJ3RCMJBP2NLBMMBGUA6SB5IWJJ6JEWH6ZZPK3`
