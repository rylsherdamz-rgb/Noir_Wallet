# Node Description Batch 2 of 84

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

- "app_layout": "_layout.tsx" | kind=code-symbol | source=frontend/app/_layout.tsx:L1 | neighbors=[EventPolyfill, EventTargetPolyfill, RootLayout(), styles, ToastProvider.tsx, ToastProvider()]
- "karpathywiki_main_ingestsource": "ingestSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75966 | neighbors=[main.js, ingestActiveFile(), ingestConversionSource(), analyzeSource(), apiDelay(), applyCoverageThreshold()]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f6a15abbd90afb7ebaec94e1c5a204e5416b860f": "f6a15ab refactor(backend): flatten to backend/, park unused PDAX server" | kind=Commit | source=git | neighbors=[6691b06 ci: make WASM hash check inform…, instaward-development, 425ba44 fix(x402): remove double sequen…, pdax_env_cache.rs, pdax_balances.rs, pdax_crypto_deposit.rs]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@3ea9e39fd236472274e8c85e066b88630c7d81f0": "3ea9e39 fix soroban auth signing (txTooLate, txMalformed), add screenshots, add…" | kind=Commit | source=git | neighbors=[0315f62 fix: sign soroban auth entries …, AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx]
- "screens_profilescreen": "ProfileScreen.tsx" | kind=code-symbol | source=frontend/src/screens/ProfileScreen.tsx:L1 | neighbors=[profile.tsx, 153ffb7 feat: persist store, fix testne…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…]
- "screens_blockchainscreen": "BlockchainScreen.tsx" | kind=code-symbol | source=frontend/src/screens/BlockchainScreen.tsx:L1 | neighbors=[0354052 feat: remove all mock data, wir…, 153ffb7 feat: persist store, fix testne…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…]
- "tests_integration_random_address": "random_address()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L9 | neighbors=[integration.rs, deploy(), setup(), test_authorize_in_policy_payment(), test_check_payment_accepts_in_policy(), test_check_payment_rejects_after_expiry…]
- "brand_pressablescale_pressablescale": "PressableScale()" | kind=code-symbol | source=frontend/src/components/brand/PressableScale.tsx:L35 | neighbors=[fiat.tsx, PressableScale.tsx, ActionSheet.tsx, AmountInput.tsx, BalanceCard.tsx, Button.tsx]
- "screens_receivescreen": "ReceiveScreen.tsx" | kind=code-symbol | source=frontend/src/screens/ReceiveScreen.tsx:L1 | neighbors=[receive.tsx, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…]
- "components_balancecard": "BalanceCard.tsx" | kind=code-symbol | source=frontend/src/components/BalanceCard.tsx:L1 | neighbors=[0354052 feat: remove all mock data, wir…, 16f1d4d Merge branch 'testing', 1ddcf05 ci: add Google Cloud Run deploy…, 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…]
- "services_stellar_service_stellarservice": "StellarService" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L129 | neighbors=[import-wallet.tsx, seed-phrase.tsx, TestnetFaucetBanner.tsx, x402.ts, useProfile.ts, BlockchainScreen.tsx]
- "src_pdax": "pdax.rs" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, Arc, Client, RwLock, code_to_string()]
- "karpathywiki_main_mergepage": "mergePage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73891 | neighbors=[main.js, createOrUpdatePage(), appendContradictedByMarker(), applyComplementaryAppends(), applyRelatedLinks(), applySectionLabels()]
- "screens_welcomescreen": "WelcomeScreen.tsx" | kind=code-symbol | source=frontend/src/screens/WelcomeScreen.tsx:L1 | neighbors=[onboarding.tsx, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…]
- "services_api_apiservice": "ApiService" | kind=code-symbol | source=frontend/src/services/api.ts:L4 | neighbors=[fiat.tsx, _layout.tsx, BlockchainScreen.tsx, CardsScreen.tsx, DashboardScreen.tsx, MerchantPosScreen.tsx]
- "src_lib": "lib.rs" | kind=code-symbol | source=unused/pdax-backend/src/lib.rs:L1 | neighbors=[100294c contracts: migrate events to #[…, 1e2f935 Merge remote-tracking branch 'o…, 372965a contracts: deploy all 3 to test…, 914cc25 Merge pull request #10 from ryl…, b30c3ed Merge pull request #5 from ryls…, c2d1154 Restructure: move repo contents…]
- "karpathywiki_main_analyzesource": "analyzeSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72099 | neighbors=[main.js, adjustBatchSizeForResponse(), buildDomainContext(), buildSourceAnalysis(), buildSystemPrompt(), calculateBatchLimits()]
- "tabs_settings": "settings.tsx" | kind=code-symbol | source=frontend/app/(tabs)/settings.tsx:L1 | neighbors=[042e052 feat(frontend): add Settings ta…, 153ffb7 feat: persist store, fix testne…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@81efec38dba8f77ecc3dc9962ab8819350c8c155": "81efec3 fix: NFC provisioning now working — registerTagEvent event-based readTa…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 6cd6f70 fix: add Friendbot funding butt…]
- "demo_scenes_walkthroughscenes": "WalkthroughScenes.tsx" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, f895531 update video, AgentsApp.tsx, AgentsApp()]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@1dd5d788f9cf947c68cadb4d2bca0a80aee8524e": "1dd5d78 chore: merge backend branch into main" | kind=Commit | source=git | neighbors=[07387d7 feat(db): initialize database s…, feat/multi-agent, instaward, instaward-development, instaward-staging, main]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@5c65d3be9719ac93a2bd91324e916c10a8fac29b": "5c65d3b chore: merge backend branch into frontend" | kind=Commit | source=git | neighbors=[07387d7 feat(db): initialize database s…, feat/multi-agent, instaward, instaward-development, instaward-staging, main]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ebc715b6ec1b6962d0171b494f24055899a68966": "ebc715b fix: all CI checks — clippy/fmt pass, contracts CI pinned, integration …" | kind=Commit | source=git | neighbors=[4c6ed1d fix: pin Rust 1.85 in Dockerfil…, feat/multi-agent, instaward, instaward-development, instaward-staging, main]
- "karpathywiki_main_parsefrontmatter": "parseFrontmatter()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67566 | neighbors=[main.js, appendAliases(), appendContradictedByMarker(), appendToReviewedPage(), applyClassificationDecision(), createOrUpdatePage()]
- "screens_seedphrasescreen": "SeedPhraseScreen.tsx" | kind=code-symbol | source=frontend/src/screens/SeedPhraseScreen.tsx:L1 | neighbors=[seed-phrase.tsx, 16f1d4d Merge branch 'testing', 1edd811 added latest changes, 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…]
- "app_fiat": "fiat.tsx" | kind=code-symbol | source=frontend/app/fiat.tsx:L1 | neighbors=[BalanceEntry, BeneficiaryInfo, FiatScreen(), Mode, styles, PressableScale.tsx]
- "screens_transactiondetailscreen": "TransactionDetailScreen.tsx" | kind=code-symbol | source=frontend/src/screens/TransactionDetailScreen.tsx:L1 | neighbors=[0354052 feat: remove all mock data, wir…, 13265dd ui: remove merchant framing — n…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…]
- "src_demoshell": "DemoShell.tsx" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, NfcTagScene.tsx, PosEscrowScene.tsx, Subtitle.tsx]
- "src_theme": "theme.ts" | kind=code-symbol | source=promotion/src/theme.ts:L1 | neighbors=[AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx, RevokeApp.tsx]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a3038105e654a1c4f9305d56e3d76c3b56aa8100": "a303810 Merge pull request #2 from rylsherdamz-rgb/frontend" | kind=Commit | source=git | neighbors=[8041d9f fix: pin react-dom@19.2.3 and a…, 870a0cf Merge pull request #1 from ryls…, index.tsx, _layout.tsx, onboarding.tsx, feat/multi-agent]
- "components_numerickeypad": "NumericKeypad.tsx" | kind=code-symbol | source=frontend/src/components/NumericKeypad.tsx:L1 | neighbors=[fiat.tsx, lock.tsx, 00faebf fix: UI pass — greeting, splash…, 16f1d4d Merge branch 'testing', 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…]
- "components_toast": "Toast.tsx" | kind=code-symbol | source=frontend/src/components/Toast.tsx:L1 | neighbors=[fiat.tsx, 1ddcf05 ci: add Google Cloud Run deploy…, 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, bd5fbe7 fix issue and added mainet addr…]
- "screens_exportkeysscreen": "ExportKeysScreen.tsx" | kind=code-symbol | source=frontend/src/screens/ExportKeysScreen.tsx:L1 | neighbors=[5dc3574 feat(settings): add gated key e…, PressableScale.tsx, PressableScale(), Toast.tsx, Toast(), theme.ts]
- "screens_importwalletscreen": "ImportWalletScreen.tsx" | kind=code-symbol | source=frontend/src/screens/ImportWalletScreen.tsx:L1 | neighbors=[import-wallet.tsx, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…]
- "screens_notificationsscreen": "NotificationsScreen.tsx" | kind=code-symbol | source=frontend/src/screens/NotificationsScreen.tsx:L1 | neighbors=[153ffb7 feat: persist store, fix testne…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…]
- "services_api": "api.ts" | kind=code-symbol | source=frontend/src/services/api.ts:L1 | neighbors=[fiat.tsx, _layout.tsx, 153ffb7 feat: persist store, fix testne…, 18e752e feat(frontend): non-custodial f…, 1fe9de1 migrating workspace, 55f8d19 feat(frontend): POS tap uses cu…]
- "scenes_usecases": "UseCases.tsx" | kind=code-symbol | source=promotion/src/scenes/UseCases.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, de00d30 feat: promo — logo, scene shell…, f8751a9 feat: Remotion promo video — No…, DashboardApp.tsx]
- "src_noirdemo": "NoirDemo.tsx" | kind=code-symbol | source=promotion/src/NoirDemo.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, dc5a97e video, f895531 update video, NfcTagScene.tsx]
- "tests_10_new_features_test": "10-new-features.test.ts" | kind=code-symbol | source=frontend/tests/10-new-features.test.ts:L1 | neighbors=[0bba7fc feat: replace Tap-to-Pay with A…, 28b92cc fix native token address, fix U…, 4d7a39e chore: merge frontend branch — …, 5dc3574 feat(settings): add gated key e…, 65d8450 feat(agents): support multiple …, b30c3ed Merge pull request #5 from ryls…]
- "app_lock": "lock.tsx" | kind=code-symbol | source=frontend/app/lock.tsx:L1 | neighbors=[formatCountdown(), LockScreen(), styles, NumericKeypad.tsx, NumericKeypad(), theme.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-001.json

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
