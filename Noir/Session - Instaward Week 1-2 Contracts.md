---
tags: [memory, session, scf, instaward, contracts]
aliases: [Session - Instaward Week 1-2 Contracts]
date: 2026-10-01
---

# Session — Instaward Week 1–2 Constrained Delegated Authorization

Context: [[_SCF Instaward - Deliverables & Constraints]] · [[AgentRegistry]] · [[PaymentEscrow]] · [[DeviceRegistry]]

## What the user asked

1. Create three branches: `instaward`, `instaward-staging`, `instaward-development`.
2. Track the SCF Instaward SOW in a progress file; measure work against Week 1 & 2 deliverables.
3. Do **both** Week 1 and Week 2 contract work now (contracts first), commit meaningful scoped changes on the **dev** branch.
4. New requirement: **when an agent is revoked, the escrow transfers all that device's funds back to the main user (owner) account.**
5. Record this history + update Obsidian memory.

## Branches

Created `instaward`, `instaward-staging`, `instaward-development` from `feat/multi-agent` HEAD. Work + commits happen on `instaward-development`.

## Gap analysis (Week 1–2)

The SOW's core requirement is **constrained delegated payment authorization**. Before this session:
- `device_registry` — complete.
- `agent_registry` — stored only `device_hash → agent Address`. **No** spending limit, approved asset, or expiration.
- `payment_escrow.authorize` — had nonce replay protection + `is_auth` + balance check, but enforced **no** policy constraints.

So the SOW negative paths (over-limit rejected, expired rejected, wrong-asset rejected) could not pass because the data didn't exist.

## Contract changes

### agent_registry
- Replaced the bare `Address` mapping with `AgentPolicy { agent, max_amount: i128, asset: Address, expires_at: u64 }`.
- `register_agent(wallet, device_hash, agent, max_amount, asset, expires_at)` — breaking signature change. Validates policy (`InvalidPolicy=4` for negative cap or past expiry).
- `max_amount == 0` = uncapped; `expires_at == 0` = never expires (else absolute ledger timestamp).
- Added `get_policy()`, `check_payment()` (single enforcement predicate: agent + asset + amount>0 + cap + not expired). `is_auth()` now also checks expiry.

### payment_escrow
- `authorize(agent, device_hash, merchant, asset, amount, nonce)` — added `asset`; now enforces the full policy via `agent_registry.check_payment`. Kept the nonce replay guard.
- Added **`sweep_on_revoke(token, device_hash, agent) -> i128`**: resolves owner via `device_registry.get_owner`, requires owner auth, refuses with `AgentStillActive=7` if the agent is still `is_auth`, else transfers the device's entire escrow balance to the owner and zeroes it. This is the "funds back to main account on revoke" requirement. Decoupled from `agent_registry` (owner calls `revoke_agent` then `sweep_on_revoke`) to avoid a circular contract dependency.
- Made the `agent_registry` / `device_registry` import modules `pub` so integration tests can deploy the real dependency contracts.

## Tests (all green)

41 contract tests: **8 device_registry + 17 agent_registry + 16 payment_escrow**. All 3 WASM targets build clean.

SOW security negative paths covered: unregistered device, duplicate registration, unauthorized agent, expired auth, over-limit, wrong asset, revoked agent, replayed nonce, insufficient balance, sweep-while-active rejected. Plus positive: in-policy payment, claim, defund, sweep-returns-all-funds-to-owner.

Commands:
```
HOST=$(rustc -vV | awk '/host/{print $2}')
cargo test -p device-registry -p agent-registry -p payment-escrow --target "$HOST"
cargo build --release --target wasm32v1-none -p device-registry -p agent-registry -p payment-escrow
```

## Pre-existing issues fixed to unblock the suite

1. **Cargo.lock**: `cargo update -p soroban-env-host` dropped an incompatible `ed25519-dalek v3.0.0` that broke host-target test compilation (`ChaCha20Rng: CryptoRng` not satisfied). Modifies `backend/asset/Cargo.lock`.
2. **device_registry tests**: rewrote to the generated-client pattern (`DeviceRegistryClient`). The old direct-call-inside-`as_contract` pattern tripped `Error(Auth, ExistingValue)` ("frame is already authorized") under SDK 25 on multi-register/revoke sequences, and a `catch_unwind` test didn't compile under SDK 25 (replaced with `#[should_panic]`).

## Blocked (RESOLVED 2026-10-03)

At the time, `soroban`/`stellar` CLI was **not installed**, so Testnet redeploy could not be done. **Now resolved** — see [[Session - Instaward Week 1 Deploy & Docs]]: contracts redeployed to Testnet, new Contract IDs + WASM hashes published, and tests expanded from 41 → 44.

## Scope note

Pre-existing uncommitted frontend changes (`sweepAgentFunds` reserve fix in `x402.ts`, `.env.example` IDs, `01-x402.test.ts`) were left out of the contract deliverable commit per the SOW "one scoped commit per week" rule.
