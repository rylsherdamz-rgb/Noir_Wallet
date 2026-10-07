# Node Description Batch 1 of 84

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
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "karpathywiki_main": "main.js" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1 | neighbors=[15bf75e docs(instaward): track SOW prog…, 914cc25 Merge pull request #10 from ryl…, aborted(), abortError(), abortError2(), abortError3()] | lang=en
- "branch:repo:github.com/rylsherdamz-rgb/Noir_Wallet#instaward-development": "instaward-development" | kind=Branch | source=git | neighbors=[00faebf fix: UI pass — greeting, splash…, 0315f62 fix: sign soroban auth entries …, 0354052 feat: remove all mock data, wir…, 042630c fix: correct Friendbot URL in f…, 042e052 feat(frontend): add Settings ta…, 05f1c1d Revert "use video tag with post…] | lang=en
- "branch:repo:github.com/rylsherdamz-rgb/Noir_Wallet#feat/multi-agent": "feat/multi-agent" | kind=Branch | source=git | neighbors=[00faebf fix: UI pass — greeting, splash…, 0315f62 fix: sign soroban auth entries …, 0354052 feat: remove all mock data, wir…, 042630c fix: correct Friendbot URL in f…, 042e052 feat(frontend): add Settings ta…, 05f1c1d Revert "use video tag with post…] | lang=en
- "branch:repo:github.com/rylsherdamz-rgb/Noir_Wallet#instaward": "instaward" | kind=Branch | source=git | neighbors=[00faebf fix: UI pass — greeting, splash…, 0315f62 fix: sign soroban auth entries …, 0354052 feat: remove all mock data, wir…, 042630c fix: correct Friendbot URL in f…, 042e052 feat(frontend): add Settings ta…, 05f1c1d Revert "use video tag with post…] | lang=en
- "branch:repo:github.com/rylsherdamz-rgb/Noir_Wallet#instaward-staging": "instaward-staging" | kind=Branch | source=git | neighbors=[00faebf fix: UI pass — greeting, splash…, 0315f62 fix: sign soroban auth entries …, 0354052 feat: remove all mock data, wir…, 042630c fix: correct Friendbot URL in f…, 042e052 feat(frontend): add Settings ta…, 05f1c1d Revert "use video tag with post…] | lang=en
- "branch:repo:github.com/rylsherdamz-rgb/Noir_Wallet#main": "main" | kind=Branch | source=git | neighbors=[00faebf fix: UI pass — greeting, splash…, 0315f62 fix: sign soroban auth entries …, 0354052 feat: remove all mock data, wir…, 042630c fix: correct Friendbot URL in f…, 042e052 feat(frontend): add Settings ta…, 05f1c1d Revert "use video tag with post…] | lang=en
- "karpathywiki_main_normalizeparams": "normalizeParams()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L946 | neighbors=[main.js, _array(), _base64(), _base64url(), _bigint(), _boolean()] | lang=en
- "tests_integration": "integration.rs" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L1 | neighbors=[100294c contracts: migrate events to #[…, 1e2f935 Merge remote-tracking branch 'o…, 372965a contracts: deploy all 3 to test…, 914cc25 Merge pull request #10 from ryl…, b30c3ed Merge pull request #5 from ryls…, c2d1154 Restructure: move repo contents…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@16f1d4d60c317f4570dc6a82a5d57261fd7e484a": "16f1d4d Merge branch 'testing'" | kind=Commit | source=git | neighbors=[fiat.tsx, import-wallet.tsx, index.tsx, _layout.tsx, lock.tsx, scan-qr.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@3381d810db6fa4cb075a813e25b37ee34c42d2e9": "3381d81 Merge PR #7 (cGradying:main) 'Auditing and Fixing Backend and Frontend'…" | kind=Commit | source=git | neighbors=[fiat.tsx, import-wallet.tsx, index.tsx, _layout.tsx, lock.tsx, scan-qr.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@427833b597a02a6add9df8e1a8714968c91a2046": "427833b Auditing and Fixing Backend and Frontend" | kind=Commit | source=git | neighbors=[fiat.tsx, import-wallet.tsx, index.tsx, _layout.tsx, lock.tsx, scan-qr.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@bd5fbe7f0cb218eb69fa8db9b867e884761014ef": "bd5fbe7 fix issue and added mainet address" | kind=Commit | source=git | neighbors=[a49fa40 docs: update payment_escrow con…, fiat.tsx, import-wallet.tsx, index.tsx, _layout.tsx, feat/multi-agent] | lang=en
- "constants_theme": "theme.ts" | kind=code-symbol | source=frontend/src/constants/theme.ts:L1 | neighbors=[fiat.tsx, index.tsx, _layout.tsx, lock.tsx, +not-found.tsx, scan-qr.tsx] | lang=en
- "domain_x402": "x402.ts" | kind=code-symbol | source=frontend/src/domain/x402.ts:L1 | neighbors=[_layout.tsx, 16f1d4d Merge branch 'testing', 1edd811 added latest changes, 28b92cc fix native token address, fix U…, 2cb58fa fix: persistent storage for TTL…, 3381d81 Merge PR #7 (cGradying:main) 'A…] | lang=en
- "screens_dashboardscreen": "DashboardScreen.tsx" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L1 | neighbors=[00faebf fix: UI pass — greeting, splash…, 0354052 feat: remove all mock data, wir…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 28b92cc fix native token address, fix U…] | lang=en
- "screens_deviceprovisioningscreen": "DeviceProvisioningScreen.tsx" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L1 | neighbors=[16f1d4d Merge branch 'testing', 18afb29 feat: auto-fund testnet wallet …, 18e752e feat(frontend): non-custodial f…, 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 231b7b7 fix: phone/card icon misalignme…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@8eca87703b84dd3295a559748cfb525db4349b32": "8eca877 fix soroban auth signing, UI improvements, screenshots (#3)" | kind=Commit | source=git | neighbors=[_layout.tsx, AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx] | lang=en
- "store_useappstore": "useAppStore.ts" | kind=code-symbol | source=frontend/src/store/useAppStore.ts:L1 | neighbors=[import-wallet.tsx, index.tsx, _layout.tsx, lock.tsx, seed-phrase.tsx, seed-verify.tsx] | lang=en
- "screens_sendscreen": "SendScreen.tsx" | kind=code-symbol | source=frontend/src/screens/SendScreen.tsx:L1 | neighbors=[send.tsx, 0354052 feat: remove all mock data, wir…, 13265dd ui: remove merchant framing — n…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@1fe9de141104e2334e1bba15accb68c88f3608c2": "1fe9de1 migrating workspace" | kind=Commit | source=git | neighbors=[042e052 feat(frontend): add Settings ta…, import-wallet.tsx, _layout.tsx, onboarding.tsx, profile.tsx, receive.tsx] | lang=nl
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@22cce0486e06319a356e58dee40b8ac7e70ba695": "22cce04 refactor: replace all StyleSheet with NativeWind className" | kind=Commit | source=git | neighbors=[fiat.tsx, index.tsx, _layout.tsx, lock.tsx, +not-found.tsx, scan-qr.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@2c6012b152e0d2cba03e58b24ec7a5b0deee0743": "2c6012b Update README contract IDs to match .env, add Stellar Expert explorer l…" | kind=Commit | source=git | neighbors=[fiat.tsx, index.tsx, _layout.tsx, lock.tsx, +not-found.tsx, scan-qr.tsx] | lang=en
- "screens_merchantposscreen": "MerchantPosScreen.tsx" | kind=code-symbol | source=frontend/src/screens/MerchantPosScreen.tsx:L1 | neighbors=[tap.tsx, 00faebf fix: UI pass — greeting, splash…, 16f1d4d Merge branch 'testing', 18e752e feat(frontend): non-custodial f…, 1ec631e fix: all CI workflows passing —…, 1fe9de1 migrating workspace] | lang=en
- "constants_theme_colors": "Colors" | kind=code-symbol | source=frontend/src/constants/theme.ts:L13 | neighbors=[fiat.tsx, index.tsx, _layout.tsx, lock.tsx, +not-found.tsx, scan-qr.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@acb72a54e9fa25c7268d32f18950e31f9fdfa666": "acb72a5 Merge branch 'staging-2' into staging" | kind=Commit | source=git | neighbors=[195c6ec fix: proper 1024x1024 icon per …, AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx] | lang=pt
- "types_index": "index.ts" | kind=code-symbol | source=frontend/src/types/index.ts:L1 | neighbors=[_layout.tsx, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, 5dc3574 feat(settings): add gated key e…] | lang=en
- "constants_theme_fontsize": "FontSize" | kind=code-symbol | source=frontend/src/constants/theme.ts:L66 | neighbors=[fiat.tsx, index.tsx, lock.tsx, +not-found.tsx, scan-qr.tsx, NoirLogo.tsx] | lang=en
- "constants_theme_spacing": "Spacing" | kind=code-symbol | source=frontend/src/constants/theme.ts:L56 | neighbors=[fiat.tsx, index.tsx, lock.tsx, +not-found.tsx, scan-qr.tsx, NoirLogo.tsx] | lang=en
- "screens_securityscreen": "SecurityScreen.tsx" | kind=code-symbol | source=frontend/src/screens/SecurityScreen.tsx:L1 | neighbors=[16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…] | lang=en
- "services_stellar_service": "stellar-service.ts" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L1 | neighbors=[import-wallet.tsx, seed-phrase.tsx, 0315f62 fix: sign soroban auth entries …, 16f1d4d Merge branch 'testing', 18e752e feat(frontend): non-custodial f…, 3381d81 Merge PR #7 (cGradying:main) 'A…] | lang=en
- "brand_pressablescale": "PressableScale.tsx" | kind=code-symbol | source=frontend/src/components/brand/PressableScale.tsx:L1 | neighbors=[fiat.tsx, AnimatedPressable, DEFAULT_HIT_SLOP, PressableScale(), PressableScaleProps, 16f1d4d Merge branch 'testing'] | lang=en
- "constants_theme_fontweight": "FontWeight" | kind=code-symbol | source=frontend/src/constants/theme.ts:L99 | neighbors=[fiat.tsx, lock.tsx, +not-found.tsx, scan-qr.tsx, NoirLogo.tsx, ActionSheet.tsx] | lang=en
- "karpathywiki_main_gettext": "getText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64615 | neighbors=[main.js, analyzeSource(), bedrockAuthError(), buildLeftPane(), buildRepetitionPenaltyHint(), cancelIngestion()] | lang=en
- "screens_agentdetailscreen": "AgentDetailScreen.tsx" | kind=code-symbol | source=frontend/src/screens/AgentDetailScreen.tsx:L1 | neighbors=[[id].tsx, 00faebf fix: UI pass — greeting, splash…, 0bba7fc feat: replace Tap-to-Pay with A…, 16f1d4d Merge branch 'testing', 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@914cc25763ec44c0543ae2142076a9f81cb52867": "914cc25 Merge pull request #10 from rylsherdamz-rgb/instaward-development" | kind=Commit | source=git | neighbors=[100294c contracts: migrate events to #[…, 1edd811 added latest changes, instaward-development, c9a894c Merge origin/instaward (PR #10 …, pdax_env_cache.rs, x402.ts] | lang=en
- "constants_theme_borderradius": "BorderRadius" | kind=code-symbol | source=frontend/src/constants/theme.ts:L108 | neighbors=[fiat.tsx, +not-found.tsx, scan-qr.tsx, ActionSheet.tsx, AmountInput.tsx, Avatar.tsx] | lang=en
- "screens_agentlistscreen": "AgentListScreen.tsx" | kind=code-symbol | source=frontend/src/screens/AgentListScreen.tsx:L1 | neighbors=[00faebf fix: UI pass — greeting, splash…, 0bba7fc feat: replace Tap-to-Pay with A…, 16f1d4d Merge branch 'testing', 22cce04 refactor: replace all StyleShee…, 28b92cc fix native token address, fix U…, 2c6012b Update README contract IDs to m…] | lang=en
- "src_api": "api.rs" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, asset_codes_differ_between_trading_and_…, auth_challenge(), auth_logout(), auth_verify()] | lang=en
- "constants_config": "config.ts" | kind=code-symbol | source=frontend/src/constants/config.ts:L1 | neighbors=[0315f62 fix: sign soroban auth entries …, 16f1d4d Merge branch 'testing', 18e752e feat(frontend): non-custodial f…, 1fe9de1 migrating workspace, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…] | lang=en
- "screens_transactionhistoryscreen": "TransactionHistoryScreen.tsx" | kind=code-symbol | source=frontend/src/screens/TransactionHistoryScreen.tsx:L1 | neighbors=[transactions.tsx, 0354052 feat: remove all mock data, wir…, 13265dd ui: remove merchant framing — n…, 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-000.json

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
