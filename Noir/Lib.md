---
tags: [frontend, lib]
---

# Lib

Part of [[Frontend]]. Low-level helpers in `frontend/src/lib/`.

- [[soroban.ts]] — Soroban invoke/read helpers (`getServer`, `invokeContract`, `readContract`)
- [[stellarAccount]] — account existence / funding helpers
- [[stellarErrors]] — error mapping
- [[logger]] — logging util

[[soroban.ts]] is the bridge between [[Services|StellarService]] and the [[Smart Contracts]].
