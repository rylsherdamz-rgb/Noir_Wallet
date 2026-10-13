---
tags: [flow]
---

# Flow - Escrow Payment

Pre-funded escrow settlement. See [[Noir Wallet]] and [[PaymentEscrow]].

1. **Pre-fund** — owner deposits XLM via [[PaymentEscrow]] `fund_escrow` (Agent Detail → escrow card → pick 10/25/50/100 XLM → confirm). App: `x402.fundEscrow` refuses before signing if the wallet would drop below its base reserve, and waits for the tx to land before refreshing `balance_of`.
2. **Tap** — [[x402]] agent reads NFC → SHA-256 hash → [[PaymentEscrow]] `authorize(agent, device_hash, merchant, asset, amount, nonce)`
3. **Instant** — funds locked for merchant; no Horizon submission, no per-tap fee
4. **Settle** — merchant calls [[PaymentEscrow]] `claim` in batch
5. **Reclaim** — owner calls `defund_escrow` for unused balance (Agent Detail → "Withdraw all to wallet", `x402.withdrawEscrow`)

Agent authorization is validated against [[AgentRegistry]] `check_payment` (agent + asset + cap + expiry).

## Unlink / revoke (no stranded funds)

`x402.unlinkDevice` — order is load-bearing:

1. `agent_registry.revoke_agent` — `sweep_on_revoke` refuses (`AgentStillActive`) while an agent is live
2. `payment_escrow.sweep_on_revoke` — full balance back to owner (skipped when `balance_of` is 0)
3. `device_registry.revoke` — deletes the device; after this `get_owner` fails, so escrow left here is unrecoverable

Each step is decided by a read first (`get_policy`, `balance_of`, `get_device`) so every write is expected to succeed; all three share one source account and wait for finality. If any step fails the call aborts before step 3 and the app keeps the device + agent keys, so the user can retry. Then the agent wallet itself is swept + retired locally (`x402.retireAgent`).
