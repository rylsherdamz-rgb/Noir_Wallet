# Node Description Batch 15 of 84

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

- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@06abc90433f8f7f60064c74d96a7b953bb455416": "06abc90 refactor: use instance storage for admin key in production" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, 859fe54 testing phase, c630f0f fix: test infrastructure and co…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@100294c37513b2a70c6a4cc4d014f2d0bf830f30": "100294c contracts: migrate events to #[contractevent], fix warnings, add tests;…" | kind=Commit | source=git | neighbors=[instaward-development, 75116eb docs(readme): restyle header — …, 914cc25 Merge pull request #10 from ryl…, lib.rs, integration.rs, 425ba44 fix(x402): remove double sequen…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@1588c78e5306918b2e810260672b64c905d50385": "1588c78 Consolidate project files into asset folder" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, bb4cd46 setup: initialize backend works…, 859fe54 testing phase]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4697f5613aefe5aa6cc6bd5da446a3996c76d720": "4697f56 feat(contracts): deploy soroban device_registry contract with persisten…" | kind=Commit | source=git | neighbors=[170c60c Step 4 and Step 5, feat/multi-agent, instaward, instaward-staging, main, 7117506 Completed Task1]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4e623fe4d3b831663472075bbaa7607152a5e018": "4e623fe Completed Task1" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, 5eeb5d3 fix: test infrastructure and co…, 727140c feat(contracts): deploy soroban…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@5eeb5d3a105bf528c930d8b829680c1f538eb2f7": "5eeb5d3 fix: test infrastructure and contract storage improvements" | kind=Commit | source=git | neighbors=[4e623fe Completed Task1, feat/multi-agent, instaward, instaward-staging, main, 72c44db refactor: use instance storage …]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@62257e3c9f57383f1cf244d0eb4e366ba3b42315": "62257e3 setup: initialize backend workspace with core dependencies" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, f2cb3ca fix: resolve Phase 1 critical i…, bb4cd46 setup: initialize backend works…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@71175064086ffe77add66c06b6f768a915cd9dd5": "7117506 Completed Task1" | kind=Commit | source=git | neighbors=[4697f56 feat(contracts): deploy soroban…, feat/multi-agent, instaward, instaward-staging, main, c630f0f fix: test infrastructure and co…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@727140cfed16aa39b6d473ee7378e4c31ea6b089": "727140c feat(contracts): deploy soroban device_registry contract with persisten…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, 4e623fe Completed Task1, 9194edf Step 4 and Step 5]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@72c44db6811ca81473ef728f5b34d65eaa8ff5b2": "72c44db refactor: use instance storage for admin key in production" | kind=Commit | source=git | neighbors=[5eeb5d3 fix: test infrastructure and co…, feat/multi-agent, instaward, instaward-staging, main, 9f10fd0 testing phase]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@8041d9f29b2471e0b21a16a793c44d736b9512b2": "8041d9f fix: pin react-dom@19.2.3 and align async-storage for SDK 56 compat" | kind=Commit | source=git | neighbors=[698366e feat(frontend): add Noir Wallet…, feat/multi-agent, instaward, instaward-staging, main, a303810 Merge pull request #2 from ryls…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@859fe542b3b91f4d6516cd7727c1024460cfc574": "859fe54 testing phase" | kind=Commit | source=git | neighbors=[06abc90 refactor: use instance storage …, feat/multi-agent, instaward, instaward-staging, main, 1588c78 Consolidate project files into …]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9f10fd04946e70570b599e98337ac05515057d57": "9f10fd0 testing phase" | kind=Commit | source=git | neighbors=[72c44db refactor: use instance storage …, feat/multi-agent, instaward, instaward-staging, main, 870a0cf Merge pull request #1 from ryls…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@bb4cd4665a566d7b4f2f05974d4f1b5269bde535": "bb4cd46 setup: initialize backend workspace with core dependencies" | kind=Commit | source=git | neighbors=[1588c78 Consolidate project files into …, feat/multi-agent, instaward, instaward-staging, main, 62257e3 setup: initialize backend works…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@c630f0f019c80adb0d689ed711bf136e9a606050": "c630f0f fix: test infrastructure and contract storage improvements" | kind=Commit | source=git | neighbors=[7117506 Completed Task1, feat/multi-agent, instaward, instaward-staging, main, 06abc90 refactor: use instance storage …]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d0cb3cd28fae8716f24a3392c04008454ff5c649": "d0cb3cd feat: implement Phase 2 core payment processing infrastructure" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, d250082 feat: implement Phase 2b transa…, f2cb3ca fix: resolve Phase 1 critical i…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d250082d47a0a54c4dfb1a0fee8a4ce766bf53fb": "d250082 feat: implement Phase 2b transaction building and Stellar integration" | kind=Commit | source=git | neighbors=[d0cb3cd feat: implement Phase 2 core pa…, feat/multi-agent, instaward, instaward-staging, main, 1f374ba Gitignore]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e9fd81ce2e4aca5f3bd5e1a8163211b626ad1f57": "e9fd81c ci: sync yarn.lock and package-lock.json with package.json" | kind=Commit | source=git | neighbors=[5dc3574 feat(settings): add gated key e…, feat/multi-agent, instaward, instaward-development, instaward-staging, 1edd811 added latest changes]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f2cb3ca0d13f6c0f9c1825bb5c49452c3dc18647": "f2cb3ca fix: resolve Phase 1 critical issues" | kind=Commit | source=git | neighbors=[62257e3 setup: initialize backend works…, feat/multi-agent, instaward, instaward-staging, main, d0cb3cd feat: implement Phase 2 core pa…]
- "components_catlogo_catlogo": "CatLogo()" | kind=code-symbol | source=promotion/src/components/CatLogo.tsx:L16 | neighbors=[BlockchainApp.tsx, DevicesApp.tsx, WelcomeApp.tsx, CatLogo.tsx, Intro.tsx, Outro.tsx]
- "components_emptystate_emptystate": "EmptyState()" | kind=code-symbol | source=frontend/src/components/EmptyState.tsx:L17 | neighbors=[EmptyState.tsx, AgentDetailScreen.tsx, DashboardScreen.tsx, NotificationsScreen.tsx, SendScreen.tsx, TransactionHistoryScreen.tsx]
- "components_errormessage_errormessage": "ErrorMessage()" | kind=code-symbol | source=frontend/src/components/ErrorMessage.tsx:L15 | neighbors=[fiat.tsx, ErrorMessage.tsx, ImportWalletScreen.tsx, MerchantPosScreen.tsx, SendScreen.tsx, TransactionHistoryScreen.tsx]
- "components_phoneframe_phoneframe": "PhoneFrame()" | kind=code-symbol | source=promotion/src/components/PhoneFrame.tsx:L16 | neighbors=[PhoneFrame.tsx, Architecture.tsx, Intro.tsx, Problem.tsx, UseCases.tsx, X402.tsx]
- "hooks_usecountup": "useCountUp.ts" | kind=code-symbol | source=frontend/src/hooks/useCountUp.ts:L1 | neighbors=[7b2e909 feat(frontend): Noir brand refi…, 7c7b9ab feat(frontend): Noir brand refi…, 8eca877 fix soroban auth signing, UI im…, BalanceCard.tsx, CountUpOptions, useCountUp()]
- "karpathywiki_main_asarray": "asArray()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22740 | neighbors=[main.js, convertToLanguageModelPrompt(), generateText(), notify(), standardizePrompt(), streamText()]
- "karpathywiki_main_asktypefromvocabulary": "askTypeFromVocabulary()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72599 | neighbors=[main.js, buildSystemPrompt(), callLlm(), foldToVocabulary(), parseJsonResponse(), resolveModelForTask()]
- "karpathywiki_main_buildturnindicator": "buildTurnIndicator()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77215 | neighbors=[main.js, findTurnElements(), remove(), syncIndicatorWindowPx(), updateIndicatorTranslation(), rebuildTurnIndicator()]
- "karpathywiki_main_callcompletionapi": "callCompletionApi()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30580 | neighbors=[main.js, consumeStream(), getRuntimeEnvironmentUserAgent(), parseJsonEventStream(), processTextStream(), withUserAgentSuffix()]
- "karpathywiki_main_checkrequirements": "checkRequirements()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75754 | neighbors=[main.js, buildIngestedHashes(), checkContentRequirements(), extractBody(), hashBody(), ingestSource()]
- "karpathywiki_main_classifylemmatype": "classifyLemmaType()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72641 | neighbors=[main.js, buildSystemPrompt(), callLlm(), parseJsonResponse(), resolveModelForTask(), ensureSourceLemma()]
- "karpathywiki_main_converttoopenairesponsesinput": "convertToOpenAIResponsesInput()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L37025 | neighbors=[main.js, getPromptCacheBreakpoint2(), parseJSON(), parseProviderOptions(), serializeToolCallArguments2(), validateTypes()]
- "karpathywiki_main_convertuint8arraytobase64": "convertUint8ArrayToBase64()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L16851 | neighbors=[main.js, convertDataContentToBase64String(), convertToBase64(), maybeEncodeImageFile(), maybeEncodeVideoFile(), toBase64url()]
- "karpathywiki_main_createbedrockclient": "createBedrockClient()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55017 | neighbors=[main.js, bedrockMantleChatCompletionsUrl(), bedrockMantleMessagesUrl(), createSigV4SigningFetch(), resolveBedrockRegion(), createLLMClientFromSettingsSync()]
- "karpathywiki_main_createllmclient": "createLLMClient()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64635 | neighbors=[main.js, createLLMClientFromSettingsSync(), getText(), wrapWithAdvancedSettings(), initializeLLMClient(), testLLMConnection()]
- "karpathywiki_main_currentaccountid": "currentAccountId()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65153 | neighbors=[main.js, beginOpenAICodexDeviceLogin(), clearUnboundOpenAICodexModelCache(), load(), loginOpenAICodexBrowser(), refreshOpenAICodexModels()]
- "karpathywiki_main_deleteemptystubs": "deleteEmptyStubs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71097 | neighbors=[main.js, deleteFile(), isEmptyStub(), isPageEmpty(), isStubPage(), parseFrontmatter()]
- "karpathywiki_main_deletefile": "deleteFile()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76749 | neighbors=[main.js, deleteEmptyStubs(), invalidatePageCaches(), fixPollutedPage(), ingestSource(), mergeDuplicatePages()]
- "karpathywiki_main_discoveraccountrole": "discoverAccountRole()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65705 | neighbors=[main.js, listAccountRoles(), listAccounts(), load(), now(), loginBedrockSso()]
- "karpathywiki_main_doparsetoolcall": "doParseToolCall()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L25110 | neighbors=[main.js, asSchema(), parseProviderExecutedDynamicToolCall(), safeParseJSON(), safeValidateTypes(), parseToolCall()]
- "karpathywiki_main_dosave": "doSave()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77518 | neighbors=[main.js, getProgressCallback(), hide(), ingestConversation(), saveSettings(), setProgressCallback()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-014.json

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
