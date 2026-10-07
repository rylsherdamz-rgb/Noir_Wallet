# Node Description Batch 16 of 84

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

- "karpathywiki_main_downloadblob": "downloadBlob()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17122 | neighbors=[main.js, cancelResponseBody(), fetchWithValidatedRedirects(), readResponseWithSizeLimit(), fileToBlob(), fileToBlob2()]
- "karpathywiki_main_ensuresourcelemma": "ensureSourceLemma()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72478 | neighbors=[main.js, analyzeSource(), classifyLemmaType(), decideSourceLemma(), exceedsCustomCap(), firstActiveTag()]
- "karpathywiki_main_ensurewikistructure": "ensureWikiStructure()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76461 | neighbors=[main.js, ensureSchemaExists(), generateIndexFromEngine(), ingestConversation(), ingestSource(), testLLMConnection()]
- "karpathywiki_main_exchangeauthorizationcode2": "exchangeAuthorizationCode2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65055 | neighbors=[main.js, extractTokenResponseAccountId(), parseTokenResponse(), raceWithLoginBounds(), tokenResponseJson2(), runLoopbackLogin()]
- "karpathywiki_main_extractpassthroughlines": "extractPassthroughLines()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67714 | neighbors=[main.js, enforceFrontmatterConstraints(), mergeDuplicatePages(), mergeFrontmatter(), mergeFrontmatterArrayField(), replaceFrontmatterArrayField()]
- "karpathywiki_main_extractthinkingpanel": "extractThinkingPanel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77358 | neighbors=[main.js, extractThinkingBlocks(), normalizeWikiLinkContent(), renderThinkingBlocksUI(), substituteWikiFolderPlaceholder(), renderMarkdownContent()]
- "karpathywiki_main_extracttokenresponseaccountid": "extractTokenResponseAccountId()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64764 | neighbors=[main.js, exchangeAuthorizationCode(), exchangeAuthorizationCode2(), explicitAccountId(), organizationAccountId(), refreshWithFetch()]
- "karpathywiki_main_fetchcodexmodelcatalog": "fetchCodexModelCatalog()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88298 | neighbors=[main.js, getAccess(), isAuthenticationForbidden2(), parseCatalog(), refreshAfterUnauthorized(), refreshOpenAICodexModels()]
- "karpathywiki_main_fixpollutedpage": "fixPollutedPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71652 | neighbors=[main.js, createOrUpdateFile(), deleteFile(), escapeRegex2(), getExistingWikiPages(), tryReadFile()]
- "karpathywiki_main_fixpollutedsources": "fixPollutedSources()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71779 | neighbors=[main.js, createOrUpdateFile(), extractRawSourcesEntries(), normalizeSourcesField(), normalizeSourcesInFolder(), runPreparationPhase()]
- "karpathywiki_main_formatmentionssection": "formatMentionsSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70375 | neighbors=[main.js, buildBullets(), dedupAndSort(), isStructured(), renderCitation(), injectMentionsSection()]
- "karpathywiki_main_generateimage": "generateImage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28570 | neighbors=[main.js, addImageModelUsage(), invokeModelMaxImagesPerCall(), prepareRetries(), resolveImageModel(), withUserAgentSuffix()]
- "karpathywiki_main_generateindexfromengine": "generateIndexFromEngine()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76845 | neighbors=[main.js, ensureWikiStructure(), generateEmptyIndex(), generateFlatIndex(), ingestSource(), runLintWiki()]
- "karpathywiki_main_getbasetelemetryattributes": "getBaseTelemetryAttributes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23852 | neighbors=[main.js, embed(), embedMany(), generateObject(), generateText(), rerank()]
- "karpathywiki_main_getcredentials": "getCredentials()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65655 | neighbors=[main.js, cacheKeyOf(), getRoleCredentials(), load(), now(), then()]
- "karpathywiki_main_gettracer": "getTracer()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23893 | neighbors=[main.js, embed(), embedMany(), generateObject(), generateText(), rerank()]
- "karpathywiki_main_guardbodyrewrite": "guardBodyRewrite()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73290 | neighbors=[main.js, preserveExistingSections(), preserveSourcedParagraphs(), reassertH1(), mergePage(), updateRelatedPage()]
- "karpathywiki_main_hashbody": "hashBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68979 | neighbors=[main.js, checkRequirements(), createSummaryPage(), generateDuplicateCandidates(), noteHasDrifted(), scanSourceDrift()]
- "karpathywiki_main_hasssotoken": "hasSsoToken()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65586 | neighbors=[main.js, bedrockCredentialPresence(), hasToken(), loginBedrockSso(), renderProviderSection(), testLLMConnection()]
- "karpathywiki_main_loadschema": "loadSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80245 | neighbors=[main.js, getSchemaContext(), getSchemaPath(), parseConfigFile(), stripLegacyBakedTagEnum(), suggestSchemaUpdate()]
- "karpathywiki_main_loginbedrocksso": "loginBedrockSso()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87856 | neighbors=[main.js, discoverAccountRole(), display(), getText(), hasSsoToken(), runBedrockDeviceAuth()]
- "karpathywiki_main_loginwithdevicecode": "loginWithDeviceCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65183 | neighbors=[main.js, beginOpenAICodexDeviceLogin(), abortError3(), raceWithAbort(), startLogin(), then()]
- "karpathywiki_main_logv2compatibilitywarning": "logV2CompatibilityWarning()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22782 | neighbors=[main.js, asEmbeddingModelV3(), asImageModelV3(), asLanguageModelV3(), asSpeechModelV3(), asTranscriptionModelV3()]
- "karpathywiki_main_mergefrontmatterarrayfield": "mergeFrontmatterArrayField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67751 | neighbors=[main.js, createNewPage(), createSummaryPage(), extractPassthroughLines(), parseFrontmatter(), serializeFrontmatter()]
- "karpathywiki_main_node_modules_ai_sdk_gateway_dist_index_mjs": "\"node_modules/@ai-sdk/gateway/dist/index.mjs\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L19894 | neighbors=[main.js, createGatewayProvider(), createProviderToolFactoryWithOutputSche…, lazySchema(), nullish(), object()]
- "karpathywiki_main_normalizeimagedata": "normalizeImageData()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29773 | neighbors=[main.js, convertBase64ToUint8Array(), detectFileMediaType(), splitDataUrl(), normalizePrompt2(), normalizeReferenceData()]
- "karpathywiki_main_normalizenode": "normalizeNode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52724 | neighbors=[main.js, canonical(), foldTypeUnion(), isObject2(), makeNullable(), normalizeStrictJsonSchema()]
- "karpathywiki_main_notehasdrifted": "noteHasDrifted()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79465 | neighbors=[main.js, extractBody(), hashBody(), originNoteRefs(), parseFrontmatter(), scanDiskStates()]
- "karpathywiki_main_parseanydef": "parseAnyDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17408 | neighbors=[main.js, parseEffectsDef(), parseMapDef(), parseNeverDef(), parseUndefinedDef(), parseUnknownDef()]
- "karpathywiki_main_parsestringdef": "parseStringDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17545 | neighbors=[main.js, parseRecordDef(), addFormat(), addPattern(), emoji(), escapeLiteralCheckValue()]
- "karpathywiki_main_preserveexistingsections": "preserveExistingSections()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71307 | neighbors=[main.js, guardBodyRewrite(), blockContentLength(), canonicalSectionBlocks(), replaceSectionBlocks(), stripMentionsSection()]
- "karpathywiki_main_processbatch": "processBatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80959 | neighbors=[main.js, onFileChanged(), clear(), createBatchContext(), ingestSource(), markRecentWrite()]
- "karpathywiki_main_refreshwithfetch": "refreshWithFetch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65239 | neighbors=[main.js, extractTokenResponseAccountId(), now(), parseTokenResponse(), requireFetch(), responseJson2()]
- "karpathywiki_main_registerwikicommands": "registerWikiCommands()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88076 | neighbors=[main.js, onload(), getText(), setIngestionCallbacks(), setLintCallbacks(), setStatusBarUpdateCallback()]
- "karpathywiki_main_rendermarkdowncontent": "renderMarkdownContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78768 | neighbors=[main.js, renderHistoryMessage(), bindWikiLinkClicks(), extractThinkingPanel(), load(), sendMessage()]
- "karpathywiki_main_renderrelatedsections": "renderRelatedSections()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72728 | neighbors=[main.js, applyRelatedLinks(), folderOf(), keptEntries(), resolve(), slugify()]
- "karpathywiki_main_renderreportsection": "renderReportSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85796 | neighbors=[main.js, renderMaintenanceDetails(), renderDeadLinkSection(), renderLlmAnalysisSection(), renderSimpleListSection(), renderTagViolationSection()]
- "karpathywiki_main_repairknowndefects": "repairKnownDefects()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53160 | neighbors=[main.js, parseJsonResult(), closeMismatchedBrackets(), closeUnterminatedLines(), extractBalancedJson(), fixCommonJsonIssues()]
- "karpathywiki_main_repointlinksafterrun": "repointLinksAfterRun()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76491 | neighbors=[main.js, ingestSource(), createOrUpdateFile(), parseFrontmatter(), repointFolderTypedLinks(), tryReadFile()]
- "karpathywiki_main_resolvelanguagemodel": "resolveLanguageModel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22939 | neighbors=[main.js, generateObject(), generateText(), asLanguageModelV3(), getGlobalProvider(), streamText()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-015.json

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
