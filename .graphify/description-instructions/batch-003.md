# Node Description Batch 4 of 84

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

- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f52569da24cb50bbd8ed54d699ac3c72b47fe6fc": "f52569d fix: type errors and add missing soroban/useProfile modules" | kind=Commit | source=git | neighbors=[5c65d3b chore: merge backend branch int…, _layout.tsx, scan-qr.tsx, feat/multi-agent, instaward, instaward-development] | lang=en
- "components_emptystate": "EmptyState.tsx" | kind=code-symbol | source=frontend/src/components/EmptyState.tsx:L1 | neighbors=[1ec631e fix: all CI workflows passing —…, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 81efec3 fix: NFC provisioning now worki…, bc5a0ce feat(frontend): NOIR-branded wa…, bd5fbe7 fix issue and added mainet addr…] | lang=en
- "components_transactionitem": "TransactionItem.tsx" | kind=code-symbol | source=frontend/src/components/TransactionItem.tsx:L1 | neighbors=[22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 698366e feat(frontend): add Noir Wallet…, 81efec3 fix: NFC provisioning now worki…, a303810 Merge pull request #2 from ryls…, bd5fbe7 fix issue and added mainet addr…] | lang=en
- "demo_scenes_taptopayscene": "TapToPayScene.tsx" | kind=code-symbol | source=promotion/src/demo-scenes/TapToPayScene.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, f895531 update video, Icon.tsx, Icon()] | lang=en
- "karpathywiki_main_appendtoreviewedpage": "appendToReviewedPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74111 | neighbors=[main.js, applySectionLabels(), buildNoteExcerpt(), buildSystemPrompt(), captureFinish(), cleanMarkdownResponse()] | lang=en
- "karpathywiki_main_buildsystemprompt": "buildSystemPrompt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69953 | neighbors=[main.js, analyzeSource(), appendToReviewedPage(), askTypeFromVocabulary(), buildActiveTagVocabularySection(), buildWikiLanguageDirective()] | lang=en
- "lib_soroban": "soroban.ts" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L1 | neighbors=[0315f62 fix: sign soroban auth entries …, 16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, 4d7a39e chore: merge frontend branch — …, 6cd6f70 fix: add Friendbot funding butt…] | lang=en
- "scenes_architecture": "Architecture.tsx" | kind=code-symbol | source=promotion/src/scenes/Architecture.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, de00d30 feat: promo — logo, scene shell…, f8751a9 feat: Remotion promo video — No…, BlockchainApp.tsx] | lang=en
- "scenes_problem": "Problem.tsx" | kind=code-symbol | source=promotion/src/scenes/Problem.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, de00d30 feat: promo — logo, scene shell…, f8751a9 feat: Remotion promo video — No…, DevicesApp.tsx] | lang=en
- "src_auth": "auth.rs" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, Arc, accepts_a_genuine_signature(), constant_time_eq(), constant_time_eq_matches_normal_equalit…] | lang=en
- "src_crypto": "crypto.rs" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, decrypt_at_rest(), encrypt_at_rest(), EncryptedPayload, KeyManager] | lang=en
- "src_theme_withalpha": "withAlpha()" | kind=code-symbol | source=promotion/src/theme.ts:L56 | neighbors=[AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx, RevokeApp.tsx] | lang=en
- "tests_setup": "setup.ts" | kind=code-symbol | source=frontend/tests/setup.ts:L1 | neighbors=[00faebf fix: UI pass — greeting, splash…, 16f1d4d Merge branch 'testing', 1ec631e fix: all CI workflows passing —…, 28b92cc fix native token address, fix U…, 3381d81 Merge PR #7 (cGradying:main) 'A…, 3da5eab fix: SendScreen imports unified…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a11a08716e6e5eba1eda566b5aa7f49c6bbeee93": "a11a087 ui: replace remaining hex-opacity concatenation with colorWithOpacity" | kind=Commit | source=git | neighbors=[0c78c60 ui: replace hex-opacity concate…, index.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@c2d1154d52b129af856c356bd64e6afab2b5b71f": "c2d1154 Restructure: move repo contents into backend/" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 1e2f935 Merge remote-tracking branch 'o…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f8751a9f97ba90ede75e4336fdc44dcdd521781f": "f8751a9 feat: Remotion promo video — Noir Wallet x402 contactless payments" | kind=Commit | source=git | neighbors=[a5e130b feat: premium onboarding with g…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "components_readytotapindicator": "ReadyToTapIndicator.tsx" | kind=code-symbol | source=frontend/src/components/ReadyToTapIndicator.tsx:L1 | neighbors=[16f1d4d Merge branch 'testing', 1ec631e fix: all CI workflows passing —…, 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…] | lang=en
- "components_smarttip": "SmartTip.tsx" | kind=code-symbol | source=frontend/src/components/SmartTip.tsx:L1 | neighbors=[0c78c60 ui: replace hex-opacity concate…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…] | lang=en
- "karpathywiki_main_createnewpage": "createNewPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74251 | neighbors=[main.js, appendSourceSlugToFrontmatter(), applyRelatedLinks(), applySectionLabels(), buildSystemPrompt(), canonicalizeSectionHeaders()] | lang=en
- "src_noirpromo": "NoirPromo.tsx" | kind=code-symbol | source=promotion/src/NoirPromo.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, f8751a9 feat: Remotion promo video — No…, Architecture.tsx, Architecture()] | lang=en
- "src_root": "Root.tsx" | kind=code-symbol | source=promotion/src/Root.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, f8751a9 feat: Remotion promo video — No…, f895531 update video, index.ts] | lang=en
- "tests_01_x402_test": "01-x402.test.ts" | kind=code-symbol | source=frontend/tests/01-x402.test.ts:L1 | neighbors=[16f1d4d Merge branch 'testing', 1edd811 added latest changes, 2cb58fa fix: persistent storage for TTL…, 425ba44 fix(x402): remove double sequen…, 42df689 fix(x402): keep base reserve wh…, 53f0009 fix(agents): show agents after …] | lang=en
- "app_import_wallet": "import-wallet.tsx" | kind=code-symbol | source=frontend/app/import-wallet.tsx:L1 | neighbors=[ImportWalletRoute(), logger.ts, logger, ImportWalletScreen.tsx, ImportWalletScreen(), stellar-service.ts] | lang=en
- "app_screens_receiveapp": "ReceiveApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/ReceiveApp.tsx:L1 | neighbors=[assets, ease, finderModule(), isFinder(), QRCodePattern(), rand()] | lang=en
- "components_statuspill": "StatusPill.tsx" | kind=code-symbol | source=frontend/src/components/StatusPill.tsx:L1 | neighbors=[0c78c60 ui: replace hex-opacity concate…, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, bc5a0ce feat(frontend): NOIR-branded wa…, bd5fbe7 fix issue and added mainet addr…, CONFIG] | lang=en
- "demo_scenes_posescrowscene": "PosEscrowScene.tsx" | kind=code-symbol | source=promotion/src/demo-scenes/PosEscrowScene.tsx:L1 | neighbors=[dc5a97e video, f895531 update video, Icon.tsx, Icon(), clamp, ease] | lang=en
- "karpathywiki_main_tryreadfile": "tryReadFile()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76777 | neighbors=[main.js, appendAliases(), appendToReviewedPage(), applyClassificationDecision(), createOrUpdatePage(), createSummaryPage()] | lang=en
- "karpathywiki_main_updaterelatedpage": "updateRelatedPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74396 | neighbors=[main.js, appendToReviewedPage(), applyRelatedLinks(), assembleFinalContent(), buildSystemPrompt(), canonicalizeSectionHeaders()] | lang=en
- "lib_logger": "logger.ts" | kind=code-symbol | source=frontend/src/lib/logger.ts:L1 | neighbors=[import-wallet.tsx, _layout.tsx, seed-phrase.tsx, 16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…] | lang=en
- "scenes_intro": "Intro.tsx" | kind=code-symbol | source=promotion/src/scenes/Intro.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, de00d30 feat: promo — logo, scene shell…, f8751a9 feat: Remotion promo video — No…, WelcomeApp.tsx] | lang=en
- "services_stellar": "stellar.ts" | kind=code-symbol | source=frontend/src/services/stellar.ts:L1 | neighbors=[042630c fix: correct Friendbot URL in f…, 16f1d4d Merge branch 'testing', 18e752e feat(frontend): non-custodial f…, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, 698366e feat(frontend): add Noir Wallet…] | lang=en
- "src_theme_colors": "Colors" | kind=code-symbol | source=promotion/src/theme.ts:L4 | neighbors=[AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx, RevokeApp.tsx] | lang=en
- "app_seed_phrase": "seed-phrase.tsx" | kind=code-symbol | source=frontend/app/seed-phrase.tsx:L1 | neighbors=[SeedPhraseRoute(), logger.ts, logger, SeedPhraseScreen.tsx, SeedPhraseScreen(), stellar-service.ts] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f8955314202cdd364bfde71b80fd2ad614e32843": "f895531 update video" | kind=Commit | source=git | neighbors=[e7539c9 Update landing page: centered p…, RevokeApp.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging] | lang=en
- "components_searchbar": "SearchBar.tsx" | kind=code-symbol | source=frontend/src/components/SearchBar.tsx:L1 | neighbors=[16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…] | lang=en
- "demo_scenes_nfctagscene": "NfcTagScene.tsx" | kind=code-symbol | source=promotion/src/demo-scenes/NfcTagScene.tsx:L1 | neighbors=[f895531 update video, DevicesApp.tsx, DevicesApp(), Icon.tsx, Icon(), ease] | lang=en
- "karpathywiki_main_load": "load()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65296 | neighbors=[main.js, bindModelCatalog(), currentAccountId(), discoverAccountRole(), getAccess(), getCredentials()] | lang=en
- "karpathywiki_main_savesettings": "saveSettings()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88635 | neighbors=[main.js, applyCustomInstructions(), cleanupVocabularyTags(), clearCustomInstructions(), clearHistory(), doSave()] | lang=en
- "scenes_sceneshell": "SceneShell.tsx" | kind=code-symbol | source=promotion/src/scenes/SceneShell.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, de00d30 feat: promo — logo, scene shell…, Architecture.tsx, Intro.tsx] | lang=en
- "scenes_x402": "X402.tsx" | kind=code-symbol | source=promotion/src/scenes/X402.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, de00d30 feat: promo — logo, scene shell…, f8751a9 feat: Remotion promo video — No…, AgentsApp.tsx] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-003.json

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
