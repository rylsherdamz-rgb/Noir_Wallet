---
tags: [moc, scf, instaward, memory, delivery-contract]
aliases: [SCF, Instaward, Deliverables, SOW]
---

# 📜 SCF Instaward — Deliverables & Constraints

> Binding delivery contract for the Stellar Community Fund **Instaward** (30 days, capped at $5,000, paid in XLM). Linked from [[_Context - What We Are Building]]. This is what "expected" means — measure every commit against it.

## ⚠️ Workflow rules (READ BEFORE COMMITTING)

Because this is part of the **Stellar Community Fund Instaward**, work is delivered on a **dedicated branch created inside the Instaward process** — *not* by pushing freely to `main`.

- **A branch is created for the Instaward** — do work there, not on `main`.
- **Commits are capped: roughly one deliverable commit per week** (4 weeks = 4 weekly deliverable checkpoints). Keep commits scoped to the week's planned output; do not scatter many small unrelated commits.
- Each weekly commit should map to a **Weekly Breakdown** row below and produce that week's **Expected Output**.
- Do **not** commit unrelated/experimental files into the deliverable commits. Cap the commit to what the deliverable needs.

> Practical rule of thumb: before committing, ask "does this belong to the current week's Expected Output?" If not, hold it.

## Objective (what is true at day 30)

An open-source reference implementation where any user can: create/import a Testnet wallet, provision + register one NTAG213 tag via [[DeviceRegistry]], authorize a constrained agent via [[AgentRegistry]], configure limits/expiry/revocation, fund escrow via [[PaymentEscrow]], trigger one NFC x402 payment, complete the Testnet payment within policy, and revoke device/agent — with full docs, deploy guides, diagrams, and passing tests.

## Deliverables

| # | Deliverable | Core content |
|---|-------------|--------------|
| 1 | **Soroban Smart Contract Infrastructure** | Design/implement/test/deploy [[DeviceRegistry]], [[AgentRegistry]], [[PaymentEscrow]] on Testnet: registration, wallet-to-device association, constrained delegated auth, escrow, revocation |
| 2 | **React Native Reference Wallet** | Android app: wallet create/import, NTAG213 provisioning, on-chain register, agent authorize, escrow fund, x402 payment flow |
| 3 | **Documentation & Open-Source Release** | MIT release: app + contracts + deploy scripts + install guide + architecture diagrams + contract docs + tests + NFC hardware docs + demo video |

## Weekly Breakdown (map each weekly commit to a row)

| Week | Planned work | Expected output (the commit) |
|------|--------------|------------------------------|
| 1 | Finalize contract architecture; set up RN Android env; wallet create/import; deploy initial contracts to Testnet; document architecture | Initial contracts deployed; RN project configured; wallet create/import working; architecture docs |
| 2 | NTAG213 provisioning; device register via [[DeviceRegistry]]; wallet-to-device association; agent authorization; escrow funding; wire app ↔ contracts | Functional RN wallet doing register + association + delegated auth + escrow fund on Testnet |
| 3 | Full x402 workflow; end-to-end + automated tests; positive/negative security paths; install/deploy docs + diagrams | Complete x402 flow validated; tests passing; security validation; developer docs |
| 4 | Final testing + bug fixes; publish MIT repo; release deploy scripts; publish Contract IDs + tx evidence; record demo video; assemble evidence pack | Public MIT repo; published Contract IDs + WASM hashes + Stellar Expert tx links; guides; demo; evidence package |

## Success metrics (all must be YES)

Wallet create/import ✓ · NTAG213 provisioned + registered ✓ · wallet-to-device recorded ✓ · [[DeviceRegistry]]/[[AgentRegistry]]/[[PaymentEscrow]] deployed + validated ✓ · agent authorized with constraints ✓ · revocation demonstrated ✓ · one x402 payment on Testnet ✓ · Testnet payment completed ✓ · unauthorized agent rejected ✓ · expired auth rejected ✓ · over-limit rejected ✓ · revoked device rejected ✓ · replay validation ✓ · MIT repo released ✓ · diagrams published ✓ · install/deploy guide ✓ · CI tests passing ✓ · demo video ✓ · Contract IDs + WASM hashes + tx links published ✓ · a new dev can reproduce from docs ✓

## Security validation (positive + negative paths)

Accept: registered device, authorized agent, in-policy payment, merchant settlement.
Reject: unregistered device, duplicate registration, unauthorized agent, expired auth, over-limit payment, revoked device, revoked agent, invalid asset/recipient, replayed request.
Publish these test outputs in the public repo.

## Evidence to submit

Public GitHub repo · deployed Contract IDs · WASM hashes · Stellar Expert tx links · automated test results/CI · architecture diagrams · contract + API docs · Android build + screenshots · demo video · install/deploy guides.

## Hard constraints (acknowledged)

- Completed in ≤ 30 days · execution not open-ended exploration
- ≤ 2 follow-on Instawards · each capped at $5,000 · total Instawards funding ≤ $15,000
- Budget: $5,000 (Labor $4,000 ≈160 hrs @ ~$25/hr; Non-labor $1,000)
