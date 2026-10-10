# Node Description Batch 23 of 84

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

- "karpathywiki_main_getoutputstrategy": "getOutputStrategy()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28737 | neighbors=[main.js, generateObject(), asSchema(), streamObject()]
- "karpathywiki_main_getschemacontext": "getSchemaContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80203 | neighbors=[main.js, buildSystemPrompt(), loadSchema(), selectSections()]
- "karpathywiki_main_getschemapath": "getSchemaPath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80189 | neighbors=[main.js, ensureSchemaExists(), loadSchema(), regenerateDefaultSchema()]
- "karpathywiki_main_getsnapshot": "getSnapshot()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66172 | neighbors=[main.js, refreshRowStates(), renderRightPane(), updateCounter()]
- "karpathywiki_main_getspan": "getSpan()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22203 | neighbors=[main.js, getActiveSpan(), getValue(), getSpanContext()]
- "karpathywiki_main_getwelcomefilename": "getWelcomeFileName()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64628 | neighbors=[main.js, ensureWelcomeNote(), getText(), recreateWelcomeNote()]
- "karpathywiki_main_handleuimessagestreamfinish": "handleUIMessageStreamFinish()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26911 | neighbors=[main.js, createUIMessageStream(), createStreamingUIMessageState(), processUIMessageStream()]
- "karpathywiki_main_hashcachekey": "hashCacheKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54639 | neighbors=[main.js, convertPdfToMarkdown(), convertPdfWithMineru(), bytesToHex()]
- "karpathywiki_main_importkey": "importKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24544 | neighbors=[main.js, hmacSha256(), signToolApproval(), verifyToolApprovalSignature()]
- "karpathywiki_main_invalidateallquerygraphs": "invalidateAllQueryGraphs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84526 | neighbors=[main.js, invalidateGraph(), onIngestDoneDispatch(), saveSettings()]
- "karpathywiki_main_isalreadyingested": "isAlreadyIngested()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84561 | neighbors=[main.js, pageBelongsToNote(), slugify(), runBatchIngest()]
- "karpathywiki_main_isauthenticationforbidden": "isAuthenticationForbidden()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54209 | neighbors=[main.js, clone(), json(), structuredErrorCode()]
- "karpathywiki_main_isblanksource": "isBlankSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67680 | neighbors=[main.js, analyzeSource(), checkNonEmpty(), extractBody()]
- "karpathywiki_main_isconversationsource": "isConversationSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73494 | neighbors=[main.js, appendToReviewedPage(), assembleFinalContent(), createNewPage()]
- "karpathywiki_main_iscrosslanguage": "isCrossLanguage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69611 | neighbors=[main.js, analyzeSource(), ingestSource(), getWikiLanguageName()]
- "karpathywiki_main_ismodelcatalogbound": "isModelCatalogBound()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65782 | neighbors=[main.js, clearUnboundOpenAICodexModelCache(), loadRaw(), refreshOpenAICodexModels()]
- "karpathywiki_main_isplainobject": "isPlainObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L914 | neighbors=[main.js, extend(), isObject(), mergeValues()]
- "karpathywiki_main_isprivateipv6": "isPrivateIPv6()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17004 | neighbors=[main.js, isPrivateIPv4(), parseIPv6(), validateDownloadUrl()]
- "karpathywiki_main_isproviderconfigured": "isProviderConfigured()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54824 | neighbors=[main.js, initializeLLMClient(), providerRequiresApiKey(), loadSettings()]
- "karpathywiki_main_istooluipart": "isToolUIPart()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26336 | neighbors=[main.js, convertToModelMessages(), isDynamicToolUIPart(), isStaticToolUIPart()]
- "karpathywiki_main_lexmatch": "lexMatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77014 | neighbors=[main.js, needleHits(), tokenizeQuery(), pprCascade()]
- "karpathywiki_main_lexmatchbytitleandaliases": "lexMatchByTitleAndAliases()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76973 | neighbors=[main.js, scorePagesByNeedles(), tokenizeQuery(), selectPprSeeds()]
- "karpathywiki_main_linkednames": "linkedNames()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69257 | neighbors=[main.js, applyCoverageThreshold(), applyOutcomeTable(), nfc()]
- "karpathywiki_main_loadoptionalsetting": "loadOptionalSetting()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17302 | neighbors=[main.js, createAnthropic(), createOpenAI(), getGatewayAuthToken()]
- "karpathywiki_main_loadraw": "loadRaw()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65758 | neighbors=[main.js, isModelCatalogBound(), load(), save()]
- "karpathywiki_main_loginwithbrowser": "loginWithBrowser()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65171 | neighbors=[main.js, loginOpenAICodexBrowser(), completeLogin(), startLogin()]
- "karpathywiki_main_mergementionsfields": "mergeMentionsFields()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70114 | neighbors=[main.js, dedupMentionsByProvenanceKey(), dedupStrings(), unionDomains()]
- "karpathywiki_main_migratelogheader": "migrateLogHeader()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75258 | neighbors=[main.js, buildLogHeader(), needsLogHeaderMigration(), runStartupCheck()]
- "karpathywiki_main_needslogheadermigration": "needsLogHeaderMigration()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75254 | neighbors=[main.js, migrateLogHeader(), isOldFormatLogHeader(), runStartupCheck()]
- "karpathywiki_main_nfc": "nfc()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69240 | neighbors=[main.js, classifyCandidate(), linkedNames(), needleOf()]
- "karpathywiki_main_node_modules_ai_dist_index_mjs": "\"node_modules/ai/dist/index.mjs\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30784 | neighbors=[main.js, createDownload(), lazySchema(), object()]
- "karpathywiki_main_node_modules_ai_sdk_openai_compatible_dist_index_mjs": "\"node_modules/@ai-sdk/openai-compatible/dist/index.mjs\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L51002 | neighbors=[main.js, looseObject(), nullish(), object()]
- "karpathywiki_main_normalizebatchresponse": "normalizeBatchResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72042 | neighbors=[main.js, analyzeSource(), coerceToArray(), emptyBatch()]
- "karpathywiki_main_normalizequote": "normalizeQuote()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70071 | neighbors=[main.js, isQuoteGrounded(), normalizeStatement(), scanQuoteGrounding()]
- "karpathywiki_main_normalizesourcesinfolder": "normalizeSourcesInFolder()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71807 | neighbors=[main.js, fixPollutedSources(), scanPollutedSources(), runStartupCheck()]
- "karpathywiki_main_objectvalue": "objectValue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88240 | neighbors=[main.js, isAuthenticationForbidden2(), parseCatalog(), parseEntry()]
- "karpathywiki_main_onautoingestdone": "onAutoIngestDone()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88718 | neighbors=[main.js, dismissProgress(), getText(), onIngestDoneDispatch()]
- "karpathywiki_main_onfilechanged": "onFileChanged()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80897 | neighbors=[main.js, isWatched(), now(), processBatch()]
- "karpathywiki_main_oningestdonedispatch": "onIngestDoneDispatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88709 | neighbors=[main.js, dismissProgress(), invalidateAllQueryGraphs(), onAutoIngestDone()]
- "karpathywiki_main_openexternal": "openExternal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88312 | neighbors=[main.js, openCodexExternalUrl(), runBedrockDeviceAuth(), runCodexDeviceAuth()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-022.json

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
