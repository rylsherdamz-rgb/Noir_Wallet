# Node Description Batch 14 of 84

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "karpathywiki_main_createwikilink": "createWikiLink()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85425 | neighbors=[main.js, renderDeadLinkTable(), renderLineWithLinks(), renderOpenInLogLink(), renderPageTypeGroup(), renderSimpleListSection()]
- "karpathywiki_main_exchangeauthorizationcode": "exchangeAuthorizationCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64869 | neighbors=[main.js, completeDeviceAuthorization(), extractTokenResponseAccountId(), parseTokenResponse(), raceWithBounds(), throwIfAborted2()]
- "karpathywiki_main_experimental_generatevideo": "experimental_generateVideo()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29577 | neighbors=[main.js, detectMediaType(), invokeModelMaxVideosPerCall(), normalizePrompt2(), prepareRetries(), resolveVideoModel()]
- "karpathywiki_main_extractsummaryfrompage": "extractSummaryFromPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77991 | neighbors=[main.js, findSectionEnd(), findSectionHeader(), stripFrontmatter(), stripWikilinks(), truncateAtSentenceBoundary()]
- "karpathywiki_main_fetchmodelswithfallback": "fetchModelsWithFallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43784 | neighbors=[main.js, buildModelsPaths(), cacheResolvedUrl(), delay2(), deriveBaseUrlFromModelsUrl(), generateUrlCandidates()]
- "karpathywiki_main_getaccess": "getAccess()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65157 | neighbors=[main.js, fetchCodexModelCatalog(), accessFrom(), load(), now(), refresh()]
- "karpathywiki_main_getactiveconcepttags": "getActiveConceptTags()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66003 | neighbors=[main.js, buildActiveTagVocabularySection(), enforceFrontmatterConstraints(), firstActiveTag(), incomingTypeTag(), repairTypesAgainstVocabulary()]
- "karpathywiki_main_getactiveentitytags": "getActiveEntityTags()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65994 | neighbors=[main.js, buildActiveTagVocabularySection(), enforceFrontmatterConstraints(), firstActiveTag(), incomingTypeTag(), repairTypesAgainstVocabulary()]
- "karpathywiki_main_hascredential": "hasCredential()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65150 | neighbors=[main.js, load(), initializeLLMClient(), loadSettings(), refreshOpenAICodexModels(), renderProviderSection()]
- "karpathywiki_main_incomingtypetag": "incomingTypeTag()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66012 | neighbors=[main.js, appendToReviewedPage(), fold(), getActiveConceptTags(), getActiveEntityTags(), mergePage()]
- "karpathywiki_main_injectmentionssection": "injectMentionsSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70448 | neighbors=[main.js, appendToReviewedPage(), assembleFinalContent(), createNewPage(), createSummaryPage(), escapeRegex2()]
- "karpathywiki_main_jsonschema": "jsonSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18180 | neighbors=[main.js, asSchema(), generateObject(), standardSchema(), toStrictSchema(), zod3Schema()]
- "karpathywiki_main_node_modules_ai_sdk_anthropic_dist_index_mjs": "\"node_modules/@ai-sdk/anthropic/dist/index.mjs\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L46146 | neighbors=[main.js, createAnthropic(), createProviderToolFactory(), createProviderToolFactoryWithOutputSche…, lazySchema(), nullish()]
- "karpathywiki_main_node_modules_ai_sdk_openai_dist_index_mjs": "\"node_modules/@ai-sdk/openai/dist/index.mjs\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L38275 | neighbors=[main.js, createOpenAI(), createProviderToolFactory(), createProviderToolFactoryWithOutputSche…, lazySchema(), nullish()]
- "karpathywiki_main_notify": "notify()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22743 | neighbors=[main.js, complete(), enqueue(), generateText(), asArray(), remove()]
- "karpathywiki_main_pollauthorizationcode": "pollAuthorizationCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64856 | neighbors=[main.js, completeDeviceAuthorization(), parseAuthorizationCode(), raceWithBounds(), responseJson(), throwIfAborted2()]
- "karpathywiki_main_pprcascade": "pprCascade()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77090 | neighbors=[main.js, filterSeedsToGraph(), isGraphMature(), lexMatch(), mergeWithPPR(), pprFromSeeds()]
- "karpathywiki_main_prefixissues": "prefixIssues()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1137 | neighbors=[main.js, handleArrayResult(), handleCheckPropertyResult(), handleMapResult(), handleObjectResult(), handleOptionalObjectResult()]
- "karpathywiki_main_rebuildturnindicator": "rebuildTurnIndicator()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78808 | neighbors=[main.js, finishGeneration(), limitHistory(), onOpen(), buildTurnIndicator(), observeVisibleTurn()]
- "karpathywiki_main_recordspan": "recordSpan()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23905 | neighbors=[main.js, embed(), embedMany(), executeToolCall(), generateObject(), generateText()]
- "karpathywiki_main_registerclient": "registerClient()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65424 | neighbors=[main.js, beginDeviceLogin(), bedrockOidcBaseUrl(), postJson(), requiredString3(), responseJson3()]
- "karpathywiki_main_runbatchedwithretry": "runBatchedWithRetry()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74883 | neighbors=[main.js, ingestSource(), apiDelay(), checkCancelled(), detectRateLimitFailures(), now()]
- "karpathywiki_main_runonboardingphase": "runOnboardingPhase()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81240 | neighbors=[main.js, createWelcomeNoteAsync(), recreateWelcomeNote(), ensureWelcomeNote(), localDateStamp(), makeVaultAdapter()]
- "karpathywiki_main_runsignalsforbucket": "runSignalsForBucket()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83432 | neighbors=[main.js, generateDuplicateCandidates(), runBigramCrossLangSignal(), runCaseVariantSignal(), runSharedIncomingSignal(), runSharedLinksSignal()]
- "karpathywiki_main_savetowiki": "saveToWiki()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78913 | neighbors=[main.js, computeConversationHash(), getProgressCallback(), hide(), ingestConversation(), saveSettings()]
- "karpathywiki_main_scandiskstates": "scanDiskStates()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79805 | neighbors=[main.js, onOpen(), noteHasDrifted(), pageBelongsToNote(), readOrNull(), refreshRowStates()]
- "karpathywiki_main_scanquotegrounding": "scanQuoteGrounding()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82810 | neighbors=[main.js, runProgrammaticPhase(), extractMentionsSection(), extractSourceBody(), isQuoteGrounded(), normalizeQuote()]
- "karpathywiki_main_serializefrontmatter": "serializeFrontmatter()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67807 | neighbors=[main.js, enforceFrontmatterConstraints(), mergeDuplicatePages(), mergeFrontmatter(), mergeFrontmatterArrayField(), replaceFrontmatterArrayField()]
- "karpathywiki_main_slugkeys": "slugKeys()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67349 | neighbors=[main.js, decideSourceLemma(), isLemmaExtracted(), isSourceOwnPageLemma(), nameKey(), computeSlug()]
- "karpathywiki_main_startdeviceauthorization": "startDeviceAuthorization()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65432 | neighbors=[main.js, beginDeviceLogin(), bedrockOidcBaseUrl(), postJson(), requiredString3(), responseJson3()]
- "karpathywiki_main_stop": "stop()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81368 | neighbors=[main.js, onunload(), saveSettings(), clear(), clearDebounce(), clearPeriodicLint()]
- "karpathywiki_main_streamtext": "streamText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27486 | neighbors=[main.js, asArray(), getChunkTimeoutMs(), getStepTimeoutMs(), getTotalTimeoutMs(), mergeAbortSignals()]
- "karpathywiki_main_throwifaborted2": "throwIfAborted2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64782 | neighbors=[main.js, completeDeviceAuthorization(), exchangeAuthorizationCode(), pollAuthorizationCode(), raceWithBounds(), requestDeviceCode()]
- "karpathywiki_main_throwifaborted5": "throwIfAborted5()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68856 | neighbors=[main.js, downloadResult(), mineruRequest(), abortError5(), uploadPdf(), waitForResult()]
- "pubmat_test_editor": "test-editor.js" | kind=code-symbol | source=promo/pubmat/test-editor.js:L1 | neighbors=[0c6bda4 Add web-based pubmat editor: li…, { chromium }, fs, http, MIME, path]
- "scenes_sceneshell_sceneshell": "SceneShell()" | kind=code-symbol | source=promotion/src/scenes/SceneShell.tsx:L8 | neighbors=[Architecture.tsx, Intro.tsx, Outro.tsx, Problem.tsx, SceneShell.tsx, UseCases.tsx]
- "services_biometrics_authenticate": "authenticate()" | kind=code-symbol | source=frontend/src/services/biometrics.ts:L54 | neighbors=[lock.tsx, ExportKeysScreen.tsx, SecurityScreen.tsx, biometrics.ts, checkAvailability(), unavailableMessage()]
- "services_fxrates": "fxRates.ts" | kind=code-symbol | source=frontend/src/services/fxRates.ts:L1 | neighbors=[0354052 feat: remove all mock data, wir…, FxRates, FxRateService, storage.ts, getItem(), setItem()]
- "types_index_transaction": "Transaction" | kind=code-symbol | source=frontend/src/types/index.ts:L44 | neighbors=[TransactionItem.tsx, DashboardScreen.tsx, TransactionHistoryScreen.tsx, api.ts, stellar-service.ts, useAppStore.ts]
- "brand_noirlogo_noirlogo": "NoirLogo()" | kind=code-symbol | source=frontend/src/components/brand/NoirLogo.tsx:L17 | neighbors=[NoirLogo.tsx, BlockchainScreen.tsx, DeviceProvisioningScreen.tsx, ImportWalletScreen.tsx, SeedPhraseScreen.tsx, SeedVerifyScreen.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-013.json

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
