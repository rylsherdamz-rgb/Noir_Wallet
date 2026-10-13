# Node Description Batch 7 of 84

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

- "services_nfc_nfcservice": "NFCService" | kind=code-symbol | source=frontend/src/services/nfc.ts:L27 | neighbors=[_layout.tsx, useNfc.ts, CardsScreen.tsx, MerchantPosScreen.tsx, ReceiveScreen.tsx, nfc.ts] | lang=en
- "services_pinlock_verifypin": "verifyPin()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L137 | neighbors=[lock.tsx, ExportKeysScreen.tsx, pinLock.ts, clearLockout(), constantTimeEqual(), derive()] | lang=en
- "src_metrics_metricscollector": "MetricsCollector" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L10 | neighbors=[metrics.rs, AtomicU64, .new(), .record_auth_failure(), .record_auth_success(), .record_conversion_failed()] | lang=en
- "tests_09_constants_test": "09-constants.test.ts" | kind=code-symbol | source=frontend/tests/09-constants.test.ts:L1 | neighbors=[4d7a39e chore: merge frontend branch — …, 5dc3574 feat(settings): add gated key e…, 8eca877 fix soroban auth signing, UI im…, 9313cd3 test: 108 tests across 9 suites…, acb72a5 Merge branch 'staging-2' into s…, bd5fbe7 fix issue and added mainet addr…] | lang=en
- "app_not_found": "+not-found.tsx" | kind=code-symbol | source=frontend/app/+not-found.tsx:L1 | neighbors=[NotFoundScreen(), styles, theme.ts, BorderRadius, Colors, FontSize] | lang=en
- "brand_signalripple": "SignalRipple.tsx" | kind=code-symbol | source=frontend/src/components/brand/SignalRipple.tsx:L1 | neighbors=[Ring(), SignalRipple(), SignalRippleProps, theme.ts, Colors, 22cce04 refactor: replace all StyleShee…] | lang=en
- "components_phoneframe": "PhoneFrame.tsx" | kind=code-symbol | source=promotion/src/components/PhoneFrame.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, de00d30 feat: promo — logo, scene shell…, PhoneFrame(), PhoneFrameProps] | lang=en
- "karpathywiki_main_classifymergeneed": "classifyMergeNeed()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73552 | neighbors=[main.js, applyContradictionGates(), applySectionLabels(), buildNewInfoSummary(), buildSystemPrompt(), getSectionLabels()] | lang=en
- "karpathywiki_main_display": "display()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88059 | neighbors=[main.js, applyCodexModelPolicy(), renderAdvancedSection(), renderAdvancedSettingsSection(), renderAutoMaintainSection(), renderLanguageSection()] | lang=en
- "karpathywiki_main_extractbody": "extractBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67674 | neighbors=[main.js, analyzeSource(), appendToReviewedPage(), checkRequirements(), createSummaryPage(), getExistingWikiPages()] | lang=en
- "karpathywiki_main_linkorphanpage": "linkOrphanPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71146 | neighbors=[main.js, buildOrphanLinkPrompt(), buildOrphanLinkUpdate(), buildSystemPrompt(), cleanWikiIndex(), createOrUpdateFile()] | lang=en
- "karpathywiki_main_resolve": "resolve()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18454 | neighbors=[main.js, activateQueryView(), clearPdfCache(), delay(), getExistingWikiPages(), performPdfCacheHousekeeping()] | lang=en
- "karpathywiki_main_runloopbacklogin": "runLoopbackLogin()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65066 | neighbors=[main.js, close(), exchangeAuthorizationCode2(), generateOAuthState(), generatePkce(), parseLoopbackCallback()] | lang=en
- "karpathywiki_main_testllmconnection": "testLLMConnection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81458 | neighbors=[main.js, applyCodexModelPolicy(), createLLMClient(), ensureWikiStructure(), hasCredential(), hasIamKeys()] | lang=en
- "scripts_whitescan": "whitescan.mjs" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L1 | neighbors=[f895531 update video, h, idat, out, png, prev] | lang=en
- "services_biometrics": "biometrics.ts" | kind=code-symbol | source=frontend/src/services/biometrics.ts:L1 | neighbors=[lock.tsx, 16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, ExportKeysScreen.tsx, SecurityScreen.tsx] | lang=en
- "src_rate_limiter": "rate_limiter.rs" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, Repository, degenerate_config_does_not_divide_by_ze…, prune_horizon_is_a_full_window_behind(), RateLimiter] | lang=en
- "uitest_seed": "seed.js" | kind=code-symbol | source=frontend/uitest/seed.js:L1 | neighbors=[53f0009 fix(agents): show agents after …, debug-store.js, harness.js, probe.js, bip39, { Buffer }] | lang=en
- "app_screens_revokeapp": "RevokeApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/RevokeApp.tsx:L1 | neighbors=[clamp, ease, RevokeApp(), Icon.tsx, Icon(), theme.ts] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@14aca0eb71cd24a3ecfa9407d9f41d897b246086": "14aca0e PDAX Credentials" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, bf8431f PDAX Usage] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@6fc251f6073ca4579b35d56e2ff7277c8c3311f9": "6fc251f feat(backend): card revoke + optional PIN (server-side, required above …" | kind=Commit | source=git | neighbors=[13265dd ui: remove merchant framing — n…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@8eaab881107ef37037fcd625b95b2d33b5f93fc9": "8eaab88 feat: add Stellar CLI (scripts/stellar-cli.ts) — fund, balance, create-…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 55f1365 fix: E2E tests all passing (20/…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9f266482b99ae68248b403cae79c6e8af1ef9f4b": "9f26648 fix: switch wallet creation to network-aware stellar-service, add Stell…" | kind=Commit | source=git | neighbors=[0873492 fix: bump Docker Rust 1.85 → 1.…, import-wallet.tsx, seed-phrase.tsx, feat/multi-agent, instaward, instaward-development] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@dc5a97e34daa7c16a05430c6cfa1a7b03c976bcf": "dc5a97e video" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 16f1d4d Merge branch 'testing'] | lang=pt
- "components_progressindicator": "ProgressIndicator.tsx" | kind=code-symbol | source=frontend/src/components/ProgressIndicator.tsx:L1 | neighbors=[22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 81efec3 fix: NFC provisioning now worki…, ProgressIndicator(), ProgressIndicatorProps, styles] | lang=en
- "hooks_useprofile": "useProfile.ts" | kind=code-symbol | source=frontend/src/hooks/useProfile.ts:L1 | neighbors=[4d7a39e chore: merge frontend branch — …, 55f1365 fix: E2E tests all passing (20/…, cc2e817 fix: NFC provisioning flow — ad…, f52569d fix: type errors and add missin…, config.ts, AppConfig] | lang=en
- "karpathywiki_main_collectactivevocabulary": "collectActiveVocabulary()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65933 | neighbors=[main.js, analyzeSource(), appendToReviewedPage(), collectDomainVocabulary(), collectWikiVocabulary(), fold()] | lang=en
- "karpathywiki_main_convertpdftomarkdown": "convertPdfToMarkdown()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68878 | neighbors=[main.js, buildUserText(), bytesToBase64(), convertPdfWithMineru(), createPdfCache(), hashCacheKey()] | lang=en
- "karpathywiki_main_converttoanthropicmessagesprompt": "convertToAnthropicMessagesPrompt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L44906 | neighbors=[main.js, convertToBase64(), convertToString(), extractErrorValue(), getCacheControl(), getUrlString()] | lang=en
- "karpathywiki_main_runbatchingest": "runBatchIngest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84657 | neighbors=[main.js, complete(), createBatchContext(), dismissProgress(), enqueue(), getText()] | lang=en
- "karpathywiki_main_rundedupphase": "runDedupPhase()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83597 | neighbors=[main.js, buildIncomingLinkIndex(), buildSystemPrompt(), classifyTiers(), computeVerifyBatch(), detectRateLimitFailures()] | lang=en
- "karpathywiki_main_runstartupcheck": "runStartupCheck()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81063 | neighbors=[main.js, onload(), assessWelcomeNeed(), cleanIncompletePages(), createOrUpdateFile(), createWelcomeNoteAsync()] | lang=en
- "karpathywiki_main_slugify": "slugify()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67320 | neighbors=[main.js, buildContradictionRecord(), createSummaryPage(), fixDeadLink(), ingestConversation(), ingestSource()] | lang=en
- "lib_stellaraccount": "stellarAccount.ts" | kind=code-symbol | source=frontend/src/lib/stellarAccount.ts:L1 | neighbors=[16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, x402.ts, isValidMemoText(), isValidStellarAddress()] | lang=en
- "scripts_grid": "grid.mjs" | kind=code-symbol | source=promotion/scripts/grid.mjs:L1 | neighbors=[f895531 update video, grid, h, idat, png, prev] | lang=en
- "services_stellar_service_withtimeout": "withTimeout()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L80 | neighbors=[stellar-service.ts, .fundAccount(), .getAccountTransactions(), .getBalance(), .getPaymentStatus(), .getTransactionStatus()] | lang=en
- "tests_12_send_test": "12-send.test.ts" | kind=code-symbol | source=frontend/tests/12-send.test.ts:L1 | neighbors=[16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, stellarAccount.ts, isValidMemoText(), isValidStellarAddress()] | lang=en
- "tests_13_network_freshness_test": "13-network-freshness.test.ts" | kind=code-symbol | source=frontend/tests/13-network-freshness.test.ts:L1 | neighbors=[16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, config.ts, AppConfig, contractsFor()] | lang=en
- "uitest_harness": "harness.js" | kind=code-symbol | source=frontend/uitest/harness.js:L1 | neighbors=[53f0009 fix(agents): show agents after …, 5dc3574 feat(settings): add gated key e…, { buildSeed }, { chromium }, fs, OUT] | lang=en
- "app_seed_verify": "seed-verify.tsx" | kind=code-symbol | source=frontend/app/seed-verify.tsx:L1 | neighbors=[SeedVerifyRoute(), theme.ts, Colors, SeedVerifyScreen.tsx, SeedVerifyScreen(), wallet.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-006.json

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
