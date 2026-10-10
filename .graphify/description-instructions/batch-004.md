# Node Description Batch 5 of 84

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

- "services_storage": "storage.ts" | kind=code-symbol | source=frontend/src/services/storage.ts:L1 | neighbors=[1fe9de1 migrating workspace, 5cb7bcc chore(frontend): snapshot in-pr…, 8eca877 fix soroban auth signing, UI im…, 8fc098f chore(frontend): snapshot in-pr…, bd5fbe7 fix issue and added mainet addr…, fxRates.ts] | lang=en
- "tests_11_security_test": "11-security.test.ts" | kind=code-symbol | source=frontend/tests/11-security.test.ts:L1 | neighbors=[16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, biometrics.ts, authenticate(), checkAvailability()] | lang=en
- "app_screens_welcomeapp": "WelcomeApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/WelcomeApp.tsx:L1 | neighbors=[ease, features, WelcomeApp(), CatLogo.tsx, CatLogo(), Icon.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9313cd37dd0009ff9fc7b2b48bf0d2dcedbf7d6c": "9313cd3 test: 108 tests across 9 suites — full coverage" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, f8a4aa0 feat: fill 14 gaps — QR scan, P…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@bc5a0cef8add6e588fb94b7a251f760ccd6aef8c": "bc5a0ce feat(frontend): NOIR-branded wallet UI (theme, logo, shared components,…" | kind=Commit | source=git | neighbors=[index.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "components_actionsheet": "ActionSheet.tsx" | kind=code-symbol | source=frontend/src/components/ActionSheet.tsx:L1 | neighbors=[1ec631e fix: all CI workflows passing —…, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 81efec3 fix: NFC provisioning now worki…, bd5fbe7 fix issue and added mainet addr…, PressableScale.tsx] | lang=en
- "components_confirmdialog": "ConfirmDialog.tsx" | kind=code-symbol | source=frontend/src/components/ConfirmDialog.tsx:L1 | neighbors=[0c78c60 ui: replace hex-opacity concate…, 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, bd5fbe7 fix issue and added mainet addr…, PressableScale.tsx] | lang=en
- "karpathywiki_main_fixdeadlink": "fixDeadLink()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70864 | neighbors=[main.js, buildDeadLinkReplacement(), buildStubContent(), buildSystemPrompt(), contextAround(), createOrUpdateFile()] | lang=en
- "karpathywiki_main_generatetext": "generateText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L25358 | neighbors=[main.js, asArray(), assembleOperationName(), getBaseTelemetryAttributes(), getGlobalTelemetryIntegration(), getStepTimeoutMs()] | lang=en
- "karpathywiki_main_onopen": "onOpen()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77498 | neighbors=[main.js, applyDiffModalClasses(), buildFolderTree(), buildLeftPane(), getText(), load()] | lang=en
- "src_db": "db.rs" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, PgPool, Repository, 07387d7 feat(db): initialize database s…, 16f1d4d Merge branch 'testing'] | lang=en
- "app_scan_qr": "scan-qr.tsx" | kind=code-symbol | source=frontend/app/scan-qr.tsx:L1 | neighbors=[ScanQrRoute(), styles, theme.ts, BorderRadius, Colors, FontSize] | lang=en
- "app_screens_blockchainapp": "BlockchainApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/BlockchainApp.tsx:L1 | neighbors=[activity, BlockchainApp(), ease, CatLogo.tsx, CatLogo(), Icon.tsx] | lang=en
- "app_screens_dashboardapp": "DashboardApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/DashboardApp.tsx:L1 | neighbors=[actions, assets, DashboardApp(), ease, Icon.tsx, Icon()] | lang=en
- "app_screens_devicesapp": "DevicesApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/DevicesApp.tsx:L1 | neighbors=[DevicesApp(), ease, CatLogo.tsx, CatLogo(), Icon.tsx, Icon()] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@5dc357474d9c9abccb3068d850bfbe046634d1ae": "5dc3574 feat(settings): add gated key export; remove KYC for now" | kind=Commit | source=git | neighbors=[53f0009 fix(agents): show agents after …, import-wallet.tsx, seed-phrase.tsx, feat/multi-agent, instaward, instaward-development] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@65d8450d2ca5a2f0062752cb2022d74dce026673": "65d8450 feat(agents): support multiple HD-derived agents per wallet, one per ca…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, 53f0009 fix(agents): show agents after …, x402.ts] | lang=it
- "components_amountinput": "AmountInput.tsx" | kind=code-symbol | source=frontend/src/components/AmountInput.tsx:L1 | neighbors=[0c78c60 ui: replace hex-opacity concate…, 1ec631e fix: all CI workflows passing —…, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 81efec3 fix: NFC provisioning now worki…, bd5fbe7 fix issue and added mainet addr…] | lang=en
- "karpathywiki_main_fillemptypage": "fillEmptyPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71030 | neighbors=[main.js, applySectionLabels(), buildEmptyPagePrompt(), buildSectionLabelsHint(), buildSystemPrompt(), cleanMarkdownResponse()] | lang=en
- "karpathywiki_main_mergeduplicatepages": "mergeDuplicatePages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71498 | neighbors=[main.js, buildSystemPrompt(), cleanMarkdownResponse(), collectActiveVocabulary(), createOrUpdateFile(), deleteFile()] | lang=en
- "src_errors": "errors.rs" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, ErrorResponse, internal_detail_never_reaches_the_calle…, PaymentError, status_codes_match_the_failure_kind()] | lang=en
- "src_money": "money.rs" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, json_amounts_accept_string_or_number(), parse_decimal(), parse_json_amount(), parses_decimal_strings()] | lang=en
- "src_pdax_pdax_error_message": "pdax_error_message()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L375 | neighbors=[pdax.rs, .crypto_deposit_address(), .crypto_withdraw(), .fiat_deposit(), .fiat_user_info_upload(), .fiat_withdraw()] | lang=en
- "src_state": "state.rs" | kind=code-symbol | source=unused/pdax-backend/src/state.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, Arc, MetricsCollector, PdaxClient, PgPool] | lang=en
- "tests_integration_test_pool": "test_pool()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L20 | neighbors=[integration.rs, account_deletion_is_scoped_to_one_walle…, challenge_can_only_be_consumed_once(), challenge_is_bound_to_its_wallet(), concurrent_claims_of_one_key_produce_ex…, expired_challenge_is_rejected()] | lang=en
- "app_screens_agentsapp": "AgentsApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/AgentsApp.tsx:L1 | neighbors=[agents, AgentsApp(), ease, Icon.tsx, Icon(), theme.ts] | lang=en
- "app_screens_transactionsapp": "TransactionsApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/TransactionsApp.tsx:L1 | neighbors=[ease, filters, TransactionsApp(), txs, Icon.tsx, Icon()] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@07387d749692e844d2e18c2255dff96670dfcef0": "07387d7 feat(db): initialize database schemas with optimized indexes on device …" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 1dd5d78 chore: merge backend branch int…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@7b2e909dee1f748500965b53d91ef6ef5c713daa": "7b2e909 feat(frontend): Noir brand refinement — design foundation + Wallet tab" | kind=Commit | source=git | neighbors=[5cb7bcc chore(frontend): snapshot in-pr…, _layout.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@7c7b9ab07dc8f9ca40e291a9cf198a75e9e41b85": "7c7b9ab feat(frontend): Noir brand refinement — design foundation + Wallet tab" | kind=Commit | source=git | neighbors=[_layout.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a2e2368c9b7f4014d051fe09e5a8301ccb3a886d": "a2e2368 feat(backend): real non-custodial fee-bump payments" | kind=Commit | source=git | neighbors=[79f5d6a ci: deploy a single pinned imag…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "components_avatar": "Avatar.tsx" | kind=code-symbol | source=frontend/src/components/Avatar.tsx:L1 | neighbors=[0c78c60 ui: replace hex-opacity concate…, 13265dd ui: remove merchant framing — n…, 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, Avatar()] | lang=en
- "components_icon_icon": "Icon()" | kind=code-symbol | source=promotion/src/components/Icon.tsx:L132 | neighbors=[AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx, RevokeApp.tsx] | lang=en
- "components_screenheader": "ScreenHeader.tsx" | kind=code-symbol | source=frontend/src/components/ScreenHeader.tsx:L1 | neighbors=[22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 81efec3 fix: NFC provisioning now worki…, bc5a0ce feat(frontend): NOIR-branded wa…, bd5fbe7 fix issue and added mainet addr…, PressableScale.tsx] | lang=en
- "components_toastprovider": "ToastProvider.tsx" | kind=code-symbol | source=frontend/src/components/ToastProvider.tsx:L1 | neighbors=[_layout.tsx, 16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, Toast.tsx, Toast()] | lang=en
- "karpathywiki_main_getexistingwikipages": "getExistingWikiPages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70487 | neighbors=[main.js, analyzeSource(), applyRelatedLinks(), createSummaryPage(), fixDeadLink(), fixPollutedPage()] | lang=en
- "karpathywiki_main_getsectionlabels": "getSectionLabels()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69887 | neighbors=[main.js, appendToReviewedPage(), applyComplementaryAppends(), applySectionLabels(), assembleFinalContent(), buildSectionLabelsHint()] | lang=en
- "karpathywiki_main_rendertemplate": "renderTemplate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67308 | neighbors=[main.js, analyzeSource(), appendToReviewedPage(), checkDedup(), classifyMergeNeed(), createNewPage()] | lang=en
- "karpathywiki_main_resolvepagepath": "resolvePagePath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72954 | neighbors=[main.js, createOrUpdatePage(), aliasClaimsFromPages(), appendAliases(), applyClassificationDecision(), buildSystemPrompt()] | lang=en
- "karpathywiki_main_runlintwiki": "runLintWiki()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84074 | neighbors=[main.js, lintWiki(), buildGraphFromContent(), buildLintAnalysisContext(), buildLintReport(), generateIndexFromEngine()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-004.json

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
