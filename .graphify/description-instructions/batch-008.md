# Node Description Batch 9 of 84

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

- "karpathywiki_main_loginopenaicodexbrowser": "loginOpenAICodexBrowser()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87788 | neighbors=[main.js, clearOpenAICodexModelCache(), codexAuthError(), currentAccountId(), display(), initializeLLMClient()] | lang=en
- "karpathywiki_main_mergefrontmatter": "mergeFrontmatter()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67832 | neighbors=[main.js, appendToReviewedPage(), extractBody(), extractPassthroughLines(), localDateStamp(), parseFrontmatter()] | lang=en
- "karpathywiki_main_prepareretries": "prepareRetries()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24233 | neighbors=[main.js, embed(), embedMany(), experimental_generateVideo(), generateImage(), generateObject()] | lang=en
- "karpathywiki_main_safevalidatetypes": "safeValidateTypes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18294 | neighbors=[main.js, createGatewayErrorFromResponse(), doParseToolCall(), parseAuthMethod(), parseProviderOptions(), safeParseJSON()] | lang=en
- "migrations_20260708000001_merchants_users_notification_cache": "20260708000001_merchants_users_notification_cache.sql" | kind=code-symbol | source=unused/pdax-backend/migrations/20260708000001_merchants_users_notification_cache.sql:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, app_users, devices, merchants, payment_transactions] | lang=en
- "src_lib_deviceregistry": "DeviceRegistry" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L46 | neighbors=[lib.rs, .get_agent(), .get_device(), .get_owner(), .initialize(), .is_authorized()] | lang=en
- "src_pdax_pdaxsession": "PdaxSession" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L398 | neighbors=[pdax.rs, PdaxClient, DateTime, Option, .from_refresh(), .from_tokens()] | lang=en
- "src_theme_borderradius": "BorderRadius" | kind=code-symbol | source=promotion/src/theme.ts:L47 | neighbors=[AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx, RevokeApp.tsx] | lang=en
- "src_theme_spacing": "Spacing" | kind=code-symbol | source=promotion/src/theme.ts:L38 | neighbors=[AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx, RevokeApp.tsx] | lang=en
- "address": "Address" | kind=code-symbol | neighbors=[AgentPolicy, AgentRegEvent, AuthorizeEvent, ClaimEvent, DataKey, DeviceInfo] | lang=en
- "brand_brandglyph": "BrandGlyph.tsx" | kind=code-symbol | source=frontend/src/components/brand/BrandGlyph.tsx:L1 | neighbors=[GlyphProps, SparkGlyph(), TapGlyph(), 7b2e909 feat(frontend): Noir brand refi…, 7c7b9ab feat(frontend): Noir brand refi…, 8eca877 fix soroban auth signing, UI im…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@042e052795f7d2847728f013dc2f4e8c1b23873d": "042e052 feat(frontend): add Settings tab/screen, gold tab tint (typecheck clean)" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 1fe9de1 migrating workspace] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@3da5eab4a29d8cef3ac78d5e318b7056eb3638cc": "3da5eab fix: SendScreen imports unified stellar-service instead of legacy stell…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 9d7fb09 fix(tests): mock Platform expor…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@51a44a43b3867b09c34a4dd9fb151d817c4807fc": "51a44a4 Enhance landing page: GitHub star button, download link, remove short v…" | kind=Commit | source=git | neighbors=[16f1d4d Merge branch 'testing', feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@55f8d19765ad51972282fc09694481baa3ac9b9c": "55f8d19 feat(frontend): POS tap uses custodial /payment/tap for passive NFC car…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 13265dd ui: remove merchant framing — n…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@7c52081d31cf16ed264a807ff418685cc87e0b16": "7c52081 merge main into staging, resolve README conflicts" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, f7cf7b0 add agent_registry + payment_es…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@819892e24b60c1520b475cfbfd474f287c0a86c6": "819892e fix: always pass onComplete to Button, disabled prop prevents press" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 1dd5d78 chore: merge backend branch int…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9303402761ea9726d92bd8d2b7827a13d4210552": "9303402 fix: fetch balance via raw RPC call to get balance field that SDK's Acc…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, b7a5f20 chore: remove accidentally comm…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9d7fb0906d2ffc9336c50bab1ac6296044cc7eef": "9d7fb09 fix(tests): mock Platform export from react-native, remove alias confli…" | kind=Commit | source=git | neighbors=[3da5eab fix: SendScreen imports unified…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a043e33487f7bcc252917a9e81f6f6ee5847704c": "a043e33 fix: reduce portfolio value font from 64px to 32px, MetaMask-style card" | kind=Commit | source=git | neighbors=[29554f5 feat: remove Blockchain tab, ad…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d2e3c85160ca9517e0b4115695a93ec2d3f399ea": "d2e3c85 fix(frontend): resolve \"account not found\" on NFC card / agent linking" | kind=Commit | source=git | neighbors=[338c78a feat(frontend): latest brand po…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d724606960323cfbbb976134c1eef827370a710f": "d724606 fix: mock stellar-service in tests, add SafeArea bottom padding to Merc…" | kind=Commit | source=git | neighbors=[64e0d4d chore: gitignore generated cost…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "components_keyboardawarescreen": "KeyboardAwareScreen.tsx" | kind=code-symbol | source=frontend/src/components/KeyboardAwareScreen.tsx:L1 | neighbors=[16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, KeyboardAwareScreen(), KeyboardAwareScreenProps, styles] | lang=en
- "constants_config_appconfig": "AppConfig" | kind=code-symbol | source=frontend/src/constants/config.ts:L91 | neighbors=[config.ts, x402.ts, useProfile.ts, BlockchainScreen.tsx, DeviceProvisioningScreen.tsx, ReceiveScreen.tsx] | lang=en
- "constants_theme_fonts": "Fonts" | kind=code-symbol | source=frontend/src/constants/theme.ts:L117 | neighbors=[BalanceCard.tsx, WalletSwitcher.tsx, theme.ts, AgentDetailScreen.tsx, AgentListScreen.tsx, DashboardScreen.tsx] | lang=en
- "examples_pdax_login": "pdax_login.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_login.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), print_session(), 14aca0e PDAX Credentials, 192bd8f Cargo tests] | lang=en
- "karpathywiki_main_applysectionlabels": "applySectionLabels()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69945 | neighbors=[main.js, appendToReviewedPage(), getSectionLabels(), classifyMergeNeed(), createNewPage(), createSummaryPage()] | lang=en
- "karpathywiki_main_callllm": "callLlm()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71984 | neighbors=[main.js, analyzeSource(), askTypeFromVocabulary(), checkDedup(), classifyLemmaType(), ingestConversation()] | lang=en
- "karpathywiki_main_clear": "clear()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65314 | neighbors=[main.js, wrapStorageError(), clearIamKeys(), clearPdfCache(), dispose(), processBatch()] | lang=en
- "karpathywiki_main_clone": "clone()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L940 | neighbors=[main.js, extend(), isAuthenticationForbidden(), isAuthenticationForbidden2(), merge(), omit()] | lang=en
- "karpathywiki_main_computeslug": "computeSlug()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67327 | neighbors=[main.js, now(), matchExtractedToExisting(), normalizeSourcePath(), slugify(), slugKey()] | lang=en
- "karpathywiki_main_convertbase64touint8array": "convertBase64ToUint8Array()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L16846 | neighbors=[main.js, convertDataContentToUint8Array(), convertToString(), detectMediaType(), fileToBlob(), fileToBlob2()] | lang=en
- "karpathywiki_main_createorupdatepage": "createOrUpdatePage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74201 | neighbors=[main.js, createOrUpdateConceptPage(), createOrUpdateEntityPage(), appendToReviewedPage(), createNewPage(), mergePage()] | lang=en
- "karpathywiki_main_embed": "embed()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28213 | neighbors=[main.js, assembleOperationName(), getBaseTelemetryAttributes(), getTracer(), prepareRetries(), recordSpan()] | lang=en
- "karpathywiki_main_embedmany": "embedMany()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28333 | neighbors=[main.js, assembleOperationName(), getBaseTelemetryAttributes(), getTracer(), prepareRetries(), recordSpan()] | lang=en
- "karpathywiki_main_requirellmready": "requireLLMReady()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81556 | neighbors=[main.js, ingestActiveFile(), lintWiki(), queryWiki(), getText(), runSchemaAnalyze()] | lang=en
- "karpathywiki_main_runpreparationphase": "runPreparationPhase()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82969 | neighbors=[main.js, runLintWiki(), buildKnownTargets(), checkCancelled(), fixPollutedSources(), getText()] | lang=en
- "karpathywiki_main_safeparsejson": "safeParseJSON()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18338 | neighbors=[main.js, doParseToolCall(), extractErrorValue(), parseAndValidateObjectResult(), parsePartialJson(), parseProviderExecutedDynamicToolCall()] | lang=en
- "karpathywiki_main_selectpprseeds": "selectPprSeeds()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77861 | neighbors=[main.js, buildWikiContext(), generateQueryKeywords(), lexIsReliable(), lexMatchByTitleAndAliases(), pprCascade()] | lang=en
- "karpathywiki_main_suggestschemaupdate": "suggestSchemaUpdate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80313 | neighbors=[main.js, runSchemaAnalyze(), appendSuggestion(), callLlm(), capMaxTokens(), loadSchema()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-008.json

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
