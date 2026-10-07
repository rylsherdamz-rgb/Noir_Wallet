# Node Description Batch 84 of 84

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "types_index_registration": "Registration" | kind=code-symbol | source=frontend/src/types/index.ts:L127 | neighbors=[index.ts]
- "types_index_smarttip": "SmartTip" | kind=code-symbol | source=frontend/src/types/index.ts:L90 | neighbors=[index.ts]
- "types_index_toastmessage": "ToastMessage" | kind=code-symbol | source=frontend/src/types/index.ts:L109 | neighbors=[index.ts]
- "types_index_userrole": "UserRole" | kind=code-symbol | source=frontend/src/types/index.ts:L1 | neighbors=[index.ts]
- "types_index_x402agent": "X402Agent" | kind=code-symbol | source=frontend/src/types/index.ts:L117 | neighbors=[index.ts]
- "uitest_debug_store_buildseed": "{ buildSeed }" | kind=code-symbol | source=frontend/uitest/debug-store.js:L5 | neighbors=[debug-store.js]
- "uitest_debug_store_chromium": "{ chromium }" | kind=code-symbol | source=frontend/uitest/debug-store.js:L2 | neighbors=[debug-store.js]
- "uitest_debug_store_path": "path" | kind=code-symbol | source=frontend/uitest/debug-store.js:L4 | neighbors=[debug-store.js]
- "uitest_debug_store_spawn": "{ spawn }" | kind=code-symbol | source=frontend/uitest/debug-store.js:L3 | neighbors=[debug-store.js]
- "uitest_debug_store_waitforserver": "waitForServer()" | kind=code-symbol | source=frontend/uitest/debug-store.js:L10 | neighbors=[debug-store.js]
- "uitest_harness_buildseed": "{ buildSeed }" | kind=code-symbol | source=frontend/uitest/harness.js:L9 | neighbors=[harness.js]
- "uitest_harness_chromium": "{ chromium }" | kind=code-symbol | source=frontend/uitest/harness.js:L5 | neighbors=[harness.js]
- "uitest_harness_fs": "fs" | kind=code-symbol | source=frontend/uitest/harness.js:L8 | neighbors=[harness.js]
- "uitest_harness_out": "OUT" | kind=code-symbol | source=frontend/uitest/harness.js:L13 | neighbors=[harness.js]
- "uitest_harness_path": "path" | kind=code-symbol | source=frontend/uitest/harness.js:L7 | neighbors=[harness.js]
- "uitest_harness_routes": "ROUTES" | kind=code-symbol | source=frontend/uitest/harness.js:L31 | neighbors=[harness.js]
- "uitest_harness_spawn": "{ spawn }" | kind=code-symbol | source=frontend/uitest/harness.js:L6 | neighbors=[harness.js]
- "uitest_harness_waitforserver": "waitForServer()" | kind=code-symbol | source=frontend/uitest/harness.js:L16 | neighbors=[harness.js]
- "uitest_probe_buildseed": "{ buildSeed }" | kind=code-symbol | source=frontend/uitest/probe.js:L5 | neighbors=[probe.js]
- "uitest_probe_chromium": "{ chromium }" | kind=code-symbol | source=frontend/uitest/probe.js:L2 | neighbors=[probe.js]
- "uitest_probe_path": "path" | kind=code-symbol | source=frontend/uitest/probe.js:L4 | neighbors=[probe.js]
- "uitest_probe_spawn": "{ spawn }" | kind=code-symbol | source=frontend/uitest/probe.js:L3 | neighbors=[probe.js]
- "uitest_probe_waitforserver": "waitForServer()" | kind=code-symbol | source=frontend/uitest/probe.js:L10 | neighbors=[probe.js]
- "uitest_seed_bip39": "bip39" | kind=code-symbol | source=frontend/uitest/seed.js:L4 | neighbors=[seed.js]
- "uitest_seed_buffer": "{ Buffer }" | kind=code-symbol | source=frontend/uitest/seed.js:L7 | neighbors=[seed.js]
- "uitest_seed_derivepath": "{ derivePath }" | kind=code-symbol | source=frontend/uitest/seed.js:L5 | neighbors=[seed.js]
- "uitest_seed_keypair": "{ Keypair }" | kind=code-symbol | source=frontend/uitest/seed.js:L6 | neighbors=[seed.js]
- "uitest_seed_rationale_61": "NOTE: storeVersion is computed from contract IDs at runtime; we intentionally" | kind=entity | source=frontend/uitest/seed.js:L61 | neighbors=[seed.js]
- "uitest_seed_sha256": "{ sha256 }" | kind=code-symbol | source=frontend/uitest/seed.js:L8 | neighbors=[seed.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-083.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
