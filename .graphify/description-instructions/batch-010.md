# Node Description Batch 11 of 84

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

- "karpathywiki_main_assemblefinalcontent": "assembleFinalContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73677 | neighbors=[main.js, computeReingestMentions(), getSectionLabels(), injectMentionsSection(), isConversationSource(), stripMentionsSection()] | lang=en
- "karpathywiki_main_buildentry": "buildEntry()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84940 | neighbors=[main.js, classifySectionKind(), extractWikiLinks(), parseCountFromHeading(), parseDetailRows(), parseKpiSummary()] | lang=en
- "karpathywiki_main_completedeviceauthorization2": "completeDeviceAuthorization2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65458 | neighbors=[main.js, bedrockOidcBaseUrl(), postJson(), raceWithBounds2(), requiredString3(), responseJson3()] | lang=en
- "karpathywiki_main_detectmediatype": "detectMediaType()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23084 | neighbors=[main.js, convertPartToLanguageModelPart(), detectFileMediaType(), convertBase64ToUint8Array(), stripID3TagsIfPresent(), experimental_generateVideo()] | lang=en
- "karpathywiki_main_ensurewelcomenote": "ensureWelcomeNote()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80736 | neighbors=[main.js, buildWelcomeNote(), decideOnboardingAction(), getWelcomeFileName(), localizeWelcomeNote(), probeVaultState()] | lang=en
- "karpathywiki_main_evaluatewithllm": "evaluateWithLLM()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78459 | neighbors=[main.js, evaluateAndSuggestSave(), computeConversationHash(), formatConversation(), parseJsonResponse(), renderTemplate()] | lang=en
- "karpathywiki_main_fold": "fold()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65876 | neighbors=[main.js, collectActiveVocabulary(), collectDomainVocabulary(), collectWikiVocabulary(), enforceFrontmatterConstraints(), incomingTypeTag()] | lang=en
- "karpathywiki_main_generateduplicatecandidates": "generateDuplicateCandidates()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83346 | neighbors=[main.js, bodyWordSet(), hashBody(), parseFrontmatter(), partitionPagesMultiBucket(), resolveThreshold()] | lang=en
- "karpathywiki_main_getglobalprovider": "getGlobalProvider()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23053 | neighbors=[main.js, resolveEmbeddingModel(), resolveImageModel(), resolveLanguageModel(), resolveRerankingModel(), resolveSpeechModel()] | lang=en
- "karpathywiki_main_ingestconversionsource": "ingestConversionSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75865 | neighbors=[main.js, convertPdfToMarkdown(), getText(), ingestSource(), inspectCauseChain(), isPdfRelatedLlmError()] | lang=en
- "karpathywiki_main_loadsettings": "loadSettings()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88546 | neighbors=[main.js, applySettingsMigrations(), bedrockCredentialPresence(), commitSettingsMigrationV1_25_3(), hasCredential(), isProviderConfigured()] | lang=en
- "karpathywiki_main_object": "object()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11325 | neighbors=[main.js, buildOutputArgs(), "node_modules/ai/dist/index.mjs"(), "node_modules/@ai-sdk/anthropic/dist/in…, "node_modules/@ai-sdk/gateway/dist/inde…, "node_modules/@ai-sdk/openai-compatible…] | lang=en
- "karpathywiki_main_refresh": "refresh()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65213 | neighbors=[main.js, getAccess(), onOpen(), then(), refreshAfterUnauthorized(), runCodexModelRefresh()] | lang=en
- "karpathywiki_main_remove": "remove()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66271 | neighbors=[main.js, buildTurnIndicator(), rebuildTurnIndicator(), notify(), removeTag(), renderChips()] | lang=en
- "karpathywiki_main_rerank": "rerank()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30390 | neighbors=[main.js, assembleOperationName(), getBaseTelemetryAttributes(), getTracer(), prepareRetries(), recordSpan()] | lang=en
- "karpathywiki_main_selecttelemetryattributes": "selectTelemetryAttributes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23971 | neighbors=[main.js, embed(), embedMany(), executeToolCall(), generateObject(), generateText()] | lang=en
- "karpathywiki_main_validatetypes": "validateTypes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18283 | neighbors=[main.js, convertToAnthropicMessagesPrompt(), convertToOpenAIResponsesInput(), parseJSON(), prepareResponsesTools(), prepareTools()] | lang=en
- "scripts_estimate_mainnet_cost": "estimate-mainnet-cost.ts" | kind=code-symbol | source=scripts/estimate-mainnet-cost.ts:L1 | neighbors=[2570dc4 optimize demo video to 2MB for …, 372965a contracts: deploy all 3 to test…, 7c52081 merge main into staging, resolv…, 914cc25 Merge pull request #10 from ryl…, b30c3ed Merge pull request #5 from ryls…, f6a15ab refactor(backend): flatten to b…] | lang=en
- "scripts_stellar_cli_main": "main()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L128 | neighbors=[stellar-cli.ts, cmdBalance(), cmdCreateWallet(), cmdFund(), cmdInvoke(), cmdRead()] | lang=en
- "services_stellar_stellarservice": "StellarService" | kind=code-symbol | source=frontend/src/services/stellar.ts:L13 | neighbors=[stellar.ts, .buildSignedPaymentXdr(), .constructor(), .createKeypair(), .fundTestnetAccount(), .getBalance()] | lang=en
- "src_demoshell_usereveal": "useReveal()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L56 | neighbors=[PosEscrowScene.tsx, TapToPayScene.tsx, TitleScenes.tsx, DemoShell.tsx, Body(), Caption()] | lang=en
- "src_state_appstate": "AppState" | kind=code-symbol | source=unused/pdax-backend/src/state.rs:L13 | neighbors=[state.rs, Arc, MetricsCollector, PdaxClient, RateLimiter, Repository] | lang=en
- "tabs_pos": "pos.tsx" | kind=code-symbol | source=frontend/app/(tabs)/pos.tsx:L1 | neighbors=[0bba7fc feat: replace Tap-to-Pay with A…, 1fe9de1 migrating workspace, 698366e feat(frontend): add Noir Wallet…, a303810 Merge pull request #2 from ryls…, AgentListScreen.tsx, AgentListScreen()] | lang=en
- "tests_06_components_test": "06-components.test.ts" | kind=code-symbol | source=frontend/tests/06-components.test.ts:L1 | neighbors=[9313cd3 test: 108 tests across 9 suites…, bd5fbe7 fix issue and added mainet addr…, BalanceCard.tsx, NumericKeypad.tsx, ReadyToTapIndicator.tsx, TestnetFaucetBanner.tsx] | lang=en
- "tests_integration_create_token": "create_token()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L29 | neighbors=[integration.rs, Address, setup(), test_wrong_asset_rejected(), test_claim_nothing_fails(), test_claim_payments()] | lang=en
- "tests_integration_deploy_agent_registry": "deploy_agent_registry()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L17 | neighbors=[integration.rs, setup(), test_claim_nothing_fails(), test_claim_payments(), test_defund_escrow_returns_funds(), test_fund_escrow_increases_balance()] | lang=en
- "uitest_debug_store": "debug-store.js" | kind=code-symbol | source=frontend/uitest/debug-store.js:L1 | neighbors=[53f0009 fix(agents): show agents after …, { buildSeed }, { chromium }, path, { spawn }, waitForServer()] | lang=en
- "uitest_probe": "probe.js" | kind=code-symbol | source=frontend/uitest/probe.js:L1 | neighbors=[53f0009 fix(agents): show agents after …, { buildSeed }, { chromium }, path, { spawn }, waitForServer()] | lang=en
- "app_onboarding": "onboarding.tsx" | kind=code-symbol | source=frontend/app/onboarding.tsx:L1 | neighbors=[Onboarding(), WelcomeScreen.tsx, WelcomeScreen(), 1fe9de1 migrating workspace, 698366e feat(frontend): add Noir Wallet…, a303810 Merge pull request #2 from ryls…] | lang=en
- "arc": "Arc" | kind=code-symbol | neighbors=[auth.rs, SessionAuth, SessionAuthService, pdax.rs, PdaxClient, state.rs] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@05f1c1d0525609f70ad8165a9e00ef6ed1ef9aa6": "05f1c1d Revert \"use video tag with poster fallback instead of YouTube link\"" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, cb4564a Update README.md] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@07f1e7285d1f99031b95d2b87b277705b1c6e3dd": "07f1e72 Confis" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 6e48972 chore: stop tracking target/ bu…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@0873492439688800acb21c2b02dbe2d021a5689b": "0873492 fix: bump Docker Rust 1.85 → 1.90 (deps need >=1.88)" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 9f26648 fix: switch wallet creation to …] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@13af4e9058c7747ee6ecf60b2402acb97103d9e8": "13af4e9 feat: implement Phase 2e API enhancement & transaction caching" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, e2439bf feat: implement Phase 2f resili…, 4c7abaf feat: implement Phase 2d fee ch…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@195c6ec60a7dd5a821f97e41047d75d9b2d50c9c": "195c6ec fix: proper 1024x1024 icon per Expo guidelines; cat at original size ce…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, acb72a5 Merge branch 'staging-2' into s…] | lang=it
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@1f374bac7b59eab5efb57f234cdb77702533f086": "1f374ba Gitignore" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, 7ec45fc feat: implement Phase 2c transa…, d250082 feat: implement Phase 2b transa…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@261c148ec73954bbba0c310189a1e4d5f9c76360": "261c148 ci: single deploy workflow to Cloud Run" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 0873492 fix: bump Docker Rust 1.85 → 1.…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@27c2c5983acb8621d8e1868235f339dbefb5be35": "27c2c59 fix: resolve all TS errors, add soroban/useProfile modules, NFC improve…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, fba6f3e ci: remove EAS Android/iOS buil…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@2ee3cbfb345caacdc9a9359890d23ad3db8d6e38": "2ee3cbf feat: implement Phase 2g — migrations, production hardening, graceful s…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, b187753 feat: implement Phase 2h — Dock…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@341371b7478bdfee81aff3f8ece5c5b407261bc8": "341371b docs: mark resolved items in UI improvements list after Aug 2026 audit" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 3abbb7b ci: use node 22 in frontend wor…] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-010.json

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
