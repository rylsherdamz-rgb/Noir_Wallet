# Node Description Batch 6 of 84

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

- "karpathywiki_main_runprogrammaticphase": "runProgrammaticPhase()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83074 | neighbors=[main.js, runLintWiki(), collectCitedRawNoteTargets(), detectAliasDeficiency(), detectPollutedPages(), getSectionLabels()] | lang=en
- "karpathywiki_main_sendmessage": "sendMessage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78497 | neighbors=[main.js, addCopyButton(), addRetrievalLabel(), appendCustomQueryInstructions(), buildWikiContext(), capMaxTokens()] | lang=en
- "src_pdax_pdaxclient_current_session": ".current_session()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L625 | neighbors=[PdaxClient, .crypto_deposit_address(), .crypto_withdraw(), .refresh(), .is_expired(), .fiat_deposit()] | lang=en
- "app_screens_sendapp": "SendApp.tsx" | kind=code-symbol | source=promotion/src/app-screens/SendApp.tsx:L1 | neighbors=[assets, KEYS, SendApp(), Icon.tsx, Icon(), theme.ts] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@0354052c4f80874f6646baca792b5b8f72c1291f": "0354052 feat: remove all mock data, wire to real API/Stellar services" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 965a5cf feat: add Fund with Testnet XLM…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@0bba7fc601baca033d8f965e5ee097b19296f3b8": "0bba7fc feat: replace Tap-to-Pay with Agents view — per-device agent balances, …" | kind=Commit | source=git | neighbors=[[id].tsx, _layout.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@0c78c60e2c0f2cc45e0429473db7cbc12b28ec45": "0c78c60 ui: replace hex-opacity concatenation with colorWithOpacity in componen…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, a11a087 ui: replace remaining hex-opaci…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@153ffb74d6dbae6335ab943ba61268d1da95a65e": "153ffb7 feat: persist store, fix testnet funding, remove all mock data, fix pad…" | kind=Commit | source=git | neighbors=[_layout.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4c23040de4b7e24716d7871b52d4c83c8bd6f3ed": "4c23040 ui: use surfaceBg consistently for screen backgrounds" | kind=Commit | source=git | neighbors=[4347048 ci: add frontend workflow (type…, fiat.tsx, index.tsx, _layout.tsx, lock.tsx, +not-found.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@53f00098de42e6560422af5c79d32974506eb374": "53f0009 fix(agents): show agents after login + add Playwright UI harness" | kind=Commit | source=git | neighbors=[index.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging, 5dc3574 feat(settings): add gated key e…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@6cd6f70ff1a75dde7cae110f5a27b11582136016": "6cd6f70 fix: add Friendbot funding button when account not funded on testnet" | kind=Commit | source=git | neighbors=[import-wallet.tsx, seed-phrase.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@81a2931bfaf25b475d5e63cf1967759816da877d": "81a2931 feat(frontend): reachable Tap-to-Pay + Cards management (add/PIN/revoke)" | kind=Commit | source=git | neighbors=[6fc251f feat(backend): card revoke + op…, cards.tsx, tap.tsx, feat/multi-agent, instaward, instaward-development] | lang=pt
- "components_chatbubble": "ChatBubble.tsx" | kind=code-symbol | source=frontend/src/components/ChatBubble.tsx:L1 | neighbors=[1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, a11a087 ui: replace remaining hex-opaci…, ChatBubble(), ChatBubbleProps] | lang=en
- "components_sectionheader": "SectionHeader.tsx" | kind=code-symbol | source=frontend/src/components/SectionHeader.tsx:L1 | neighbors=[22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, bc5a0ce feat(frontend): NOIR-branded wa…, bd5fbe7 fix issue and added mainet addr…, PressableScale.tsx, PressableScale()] | lang=en
- "karpathywiki_main_enforcefrontmatterconstraints": "enforceFrontmatterConstraints()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67884 | neighbors=[main.js, createNewPage(), extractPassthroughLines(), filterRedundantAliases(), fold(), getActiveConceptTags()] | lang=en
- "karpathywiki_main_hide": "hide()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87591 | neighbors=[main.js, dismissProgress(), doSave(), commitTempSettings(), flushBedrockIamKeys(), saveSettings()] | lang=en
- "karpathywiki_main_localdatestamp": "localDateStamp()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67558 | neighbors=[main.js, buildDissentStubContent(), buildStubContent(), createNewPage(), createSummaryPage(), enforceFrontmatterConstraints()] | lang=en
- "karpathywiki_main_parsejsonresponse": "parseJsonResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53001 | neighbors=[main.js, askTypeFromVocabulary(), checkDedup(), classifyLemmaType(), classifyMergeNeed(), evaluateWithLLM()] | lang=en
- "karpathywiki_main_then": "then()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87010 | neighbors=[main.js, activateQueryView(), beginOpenAICodexDeviceLogin(), clearPdfCache(), getCredentials(), getExistingWikiPages()] | lang=en
- "lib_logger_logger": "logger" | kind=code-symbol | source=frontend/src/lib/logger.ts:L30 | neighbors=[import-wallet.tsx, _layout.tsx, seed-phrase.tsx, x402.ts, logger.ts, soroban.ts] | lang=en
- "scenes_outro": "Outro.tsx" | kind=code-symbol | source=promotion/src/scenes/Outro.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, de00d30 feat: promo — logo, scene shell…, f8751a9 feat: Remotion promo video — No…, CatLogo.tsx] | lang=en
- "scripts_stellar_cli": "stellar-cli.ts" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L1 | neighbors=[55f1365 fix: E2E tests all passing (20/…, 8eaab88 feat: add Stellar CLI (scripts/…, bd5fbe7 fix issue and added mainet addr…, cmdBalance(), cmdCreateWallet(), cmdFund()] | lang=en
- "tests_integration_cleanup": "cleanup()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L43 | neighbors=[integration.rs, account_deletion_is_scoped_to_one_walle…, challenge_can_only_be_consumed_once(), challenge_is_bound_to_its_wallet(), concurrent_claims_of_one_key_produce_ex…, expired_challenge_is_rejected()] | lang=en
- "tests_integration_test_wallet": "test_wallet()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L35 | neighbors=[integration.rs, account_deletion_is_scoped_to_one_walle…, challenge_can_only_be_consumed_once(), challenge_is_bound_to_its_wallet(), concurrent_claims_of_one_key_produce_ex…, expired_challenge_is_rejected()] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@00faebf66547307220e6f28d734f98b6a52d6ac9": "00faebf fix: UI pass — greeting, splash, safe-area padding, responsive keypad, …" | kind=Commit | source=git | neighbors=[index.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@18e752e355e21cd075569b20d350a753aaa226a1": "18e752e feat(frontend): non-custodial fee-bump tap-to-pay + network-consistency…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 809f0cd feat(backend): custodial UID-au…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@1ec631edcec3c415606bd70eb26bd25a8ff49966": "1ec631e fix: all CI workflows passing — fix TS errors, test mocks, broken sorob…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, ba03a5c fix: backend CI workspace root …] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@28b92cc13b0879a478bc4110ac0bff3441f45e97": "28b92cc fix native token address, fix UI overlap issues, fix test infrastructure" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 00faebf fix: UI pass — greeting, splash…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@55f1365a98ebb3f5ee440dee5d4a18d4265758a3": "55f1365 fix: E2E tests all passing (20/20), fix script syntax error, seed secon…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 394403a feat: abstract Stellar operatio…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@809f0cdd832de38ec34c0d84b6f9c1e7279da62b": "809f0cd feat(backend): custodial UID-authorized tap-to-pay for passive NFC cards" | kind=Commit | source=git | neighbors=[18e752e feat(frontend): non-custodial f…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@b6fa9adab057a0613ff79bd02e13671aa21b0792": "b6fa9ad Fix re-registration of existing devices and add Stellar network timeouts" | kind=Commit | source=git | neighbors=[3381d81 Merge PR #7 (cGradying:main) 'A…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@cc2e8172c50db4e5af0e8a3647f6b820527bd79f": "cc2e817 fix: NFC provisioning flow — add signing modal, fix concurrent session …" | kind=Commit | source=git | neighbors=[1ddcf05 ci: add Google Cloud Run deploy…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d0b703930bfd052a35fa7cdb3486c98b031386d1": "d0b7039 migrate: replace Horizon with Soroban RPC across frontend and backend" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 9303402 fix: fetch balance via raw RPC …] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f7cf7b0726edc8ceb46471cc7fe1ca12e8d2f7a7": "f7cf7b0 add agent_registry + payment_escrow contracts, fix frontend NFC bugs, a…" | kind=Commit | source=git | neighbors=[7c52081 merge main into staging, resolv…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "components_card": "Card.tsx" | kind=code-symbol | source=frontend/src/components/Card.tsx:L1 | neighbors=[22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, bc5a0ce feat(frontend): NOIR-branded wa…, Card(), CardProps, styles] | lang=en
- "components_catlogo": "CatLogo.tsx" | kind=code-symbol | source=promotion/src/components/CatLogo.tsx:L1 | neighbors=[BlockchainApp.tsx, DevicesApp.tsx, WelcomeApp.tsx, 3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…] | lang=en
- "components_skeletonloader": "SkeletonLoader.tsx" | kind=code-symbol | source=frontend/src/components/SkeletonLoader.tsx:L1 | neighbors=[1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 81efec3 fix: NFC provisioning now worki…, BalanceCard.tsx, SkeletonLoader()] | lang=en
- "karpathywiki_main_generateobject": "generateObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28926 | neighbors=[main.js, assembleOperationName(), getBaseTelemetryAttributes(), getOutputStrategy(), getTracer(), jsonSchema()] | lang=en
- "karpathywiki_main_parsedef": "parseDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18135 | neighbors=[main.js, decideAdditionalProperties(), parseArrayDef(), parseBrandedDef(), parseDefaultDef(), parseEffectsDef()] | lang=en
- "karpathywiki_main_refreshopenaicodexmodels": "refreshOpenAICodexModels()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87767 | neighbors=[main.js, loginOpenAICodexBrowser(), queueStaleCodexModelRefresh(), applyCodexModelPolicy(), bindModelCatalog(), clearOpenAICodexModelCache()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-005.json

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
