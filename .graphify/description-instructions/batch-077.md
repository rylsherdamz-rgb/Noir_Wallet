# Node Description Batch 78 of 84

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

- "screens_seedverifyscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/SeedVerifyScreen.tsx:L139 | neighbors=[SeedVerifyScreen.tsx]
- "screens_sendscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/SendScreen.tsx:L374 | neighbors=[SendScreen.tsx]
- "screens_transactiondetailscreen_detailrow": "DetailRow()" | kind=code-symbol | source=frontend/src/screens/TransactionDetailScreen.tsx:L162 | neighbors=[TransactionDetailScreen.tsx]
- "screens_transactiondetailscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/TransactionDetailScreen.tsx:L192 | neighbors=[TransactionDetailScreen.tsx]
- "screens_transactionhistoryscreen_filters": "FILTERS" | kind=code-symbol | source=frontend/src/screens/TransactionHistoryScreen.tsx:L34 | neighbors=[TransactionHistoryScreen.tsx]
- "screens_transactionhistoryscreen_keyextractor": "keyExtractor()" | kind=code-symbol | source=frontend/src/screens/TransactionHistoryScreen.tsx:L28 | neighbors=[TransactionHistoryScreen.tsx]
- "screens_transactionhistoryscreen_rationale_104": "TODO: Implement export functionality" | kind=entity | source=frontend/src/screens/TransactionHistoryScreen.tsx:L104 | neighbors=[TransactionHistoryScreen.tsx]
- "screens_transactionhistoryscreen_renderitem": "renderItem()" | kind=code-symbol | source=frontend/src/screens/TransactionHistoryScreen.tsx:L30 | neighbors=[TransactionHistoryScreen.tsx]
- "screens_transactionhistoryscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/TransactionHistoryScreen.tsx:L168 | neighbors=[TransactionHistoryScreen.tsx]
- "screens_welcomescreen_feature": "Feature" | kind=code-symbol | source=frontend/src/screens/WelcomeScreen.tsx:L20 | neighbors=[WelcomeScreen.tsx]
- "screens_welcomescreen_features": "features" | kind=code-symbol | source=frontend/src/screens/WelcomeScreen.tsx:L27 | neighbors=[WelcomeScreen.tsx]
- "screens_welcomescreen_noir_mark": "NOIR_MARK" | kind=code-symbol | source=frontend/src/screens/WelcomeScreen.tsx:L18 | neighbors=[WelcomeScreen.tsx]
- "screens_welcomescreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/WelcomeScreen.tsx:L159 | neighbors=[WelcomeScreen.tsx]
- "screens_welcomescreen_welcomescreenprops": "WelcomeScreenProps" | kind=code-symbol | source=frontend/src/screens/WelcomeScreen.tsx:L13 | neighbors=[WelcomeScreen.tsx]
- "scripts_estimate_mainnet_cost_contracts": "CONTRACTS" | kind=code-symbol | source=scripts/estimate-mainnet-cost.ts:L22 | neighbors=[estimate-mainnet-cost.ts]
- "scripts_estimate_mainnet_cost_main": "main()" | kind=code-symbol | source=scripts/estimate-mainnet-cost.ts:L54 | neighbors=[estimate-mainnet-cost.ts]
- "scripts_grid_grid": "grid" | kind=code-symbol | source=promotion/scripts/grid.mjs:L19 | neighbors=[grid.mjs]
- "scripts_grid_h": "h" | kind=code-symbol | source=promotion/scripts/grid.mjs:L6 | neighbors=[grid.mjs]
- "scripts_grid_idat": "idat" | kind=code-symbol | source=promotion/scripts/grid.mjs:L7 | neighbors=[grid.mjs]
- "scripts_grid_png": "png" | kind=code-symbol | source=promotion/scripts/grid.mjs:L5 | neighbors=[grid.mjs]
- "scripts_grid_prev": "prev" | kind=code-symbol | source=promotion/scripts/grid.mjs:L18 | neighbors=[grid.mjs]
- "scripts_grid_raw": "raw" | kind=code-symbol | source=promotion/scripts/grid.mjs:L16 | neighbors=[grid.mjs]
- "scripts_grid_w": "w" | kind=code-symbol | source=promotion/scripts/grid.mjs:L6 | neighbors=[grid.mjs]
- "scripts_grid_x0": "x0" | kind=code-symbol | source=promotion/scripts/grid.mjs:L4 | neighbors=[grid.mjs]
- "scripts_grid_x1": "x1" | kind=code-symbol | source=promotion/scripts/grid.mjs:L4 | neighbors=[grid.mjs]
- "scripts_grid_y0": "y0" | kind=code-symbol | source=promotion/scripts/grid.mjs:L4 | neighbors=[grid.mjs]
- "scripts_grid_y1": "y1" | kind=code-symbol | source=promotion/scripts/grid.mjs:L4 | neighbors=[grid.mjs]
- "scripts_meta": "meta.mjs" | kind=code-symbol | source=promotion/scripts/meta.mjs:L1 | neighbors=[f895531 update video]
- "scripts_stellar_cli_svc": "svc" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L7 | neighbors=[stellar-cli.ts]
- "scripts_whitescan_h": "h" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L11 | neighbors=[whitescan.mjs]
- "scripts_whitescan_idat": "idat" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L13 | neighbors=[whitescan.mjs]
- "scripts_whitescan_out": "out" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L57 | neighbors=[whitescan.mjs]
- "scripts_whitescan_png": "png" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L9 | neighbors=[whitescan.mjs]
- "scripts_whitescan_prev": "prev" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L56 | neighbors=[whitescan.mjs]
- "scripts_whitescan_raw": "raw" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L22 | neighbors=[whitescan.mjs]
- "scripts_whitescan_row": "row()" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L24 | neighbors=[whitescan.mjs]
- "scripts_whitescan_thresh": "thresh" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L8 | neighbors=[whitescan.mjs]
- "scripts_whitescan_w": "w" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L10 | neighbors=[whitescan.mjs]
- "scripts_whitescan_x0": "x0" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L6 | neighbors=[whitescan.mjs]
- "scripts_whitescan_x1": "x1" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L7 | neighbors=[whitescan.mjs]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-077.json

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
