---
tags: [moc, root]
---

# 🟡 Noir Wallet — Codebase Mindmap

> x402 contactless payments powered by Stellar. Tap-to-pay with per-device agent wallets, escrow settlement, and a PDAX fiat bridge.

This is the **root map**. Open Obsidian's **Graph View** (Ctrl/Cmd + G) to see the full mindmap render from the `[[wikilinks]]` below.

## 🧠 Project Memory (read first)

- [[_Context - What We Are Building]] — what Noir is, the problem, the end-to-end proof, scope
- [[_AI Build Guide - Contracts]] — complete, source-accurate guide to every contract function for AI/humans building this
- [[_SCF Instaward - Deliverables & Constraints]] — the binding delivery contract: deliverables, weekly plan, success metrics, **weekly-branch + capped-per-week commit rule**
- [[_Redeploy Contracts]] — manual runbook for redeploying the Soroban contracts (reference only)

## Layers

- [[Frontend]] — React Native / Expo mobile app (TypeScript)
- [[Backend]] — Rust Axum API + PDAX fiat bridge
- [[Smart Contracts]] — 3 Soroban (Rust) contracts on Stellar

## Core Flows

- [[Flow - Device Provisioning]]
- [[Flow - Escrow Payment]]
- [[Flow - Tap to Pay]]
- [[Flow - Fiat Cash-out]]

## God Nodes (most connected abstractions)

From the graphify knowledge graph — these are the highest-degree nodes:

- [[Colors]] · [[Spacing]] · [[FontSize]] (design tokens)
- [[StellarService]] — 37 edges
- [[ApiService]] — 36 edges
- [[PdaxClient]] — 27 edges
- [[Repository]] — 24 edges

## Tech Stack

Stellar · Soroban · React Native · Expo 57 · TypeScript · NativeWind · Zustand · `@stellar/stellar-sdk` v16 · Rust (Axum) · PostgreSQL · Vitest
