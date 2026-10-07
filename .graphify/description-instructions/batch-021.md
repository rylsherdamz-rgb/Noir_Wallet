# Node Description Batch 22 of 84

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

- "karpathywiki_main_computejaccard": "computeJaccard()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83264 | neighbors=[main.js, runBigramCrossLangSignal(), runSharedIncomingSignal(), runSharedLinksSignal()]
- "karpathywiki_main_computereingestmentions": "computeReingestMentions()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70253 | neighbors=[main.js, assembleFinalContent(), dedupMentionsByProvenanceKey(), parseMentionsSection()]
- "karpathywiki_main_config": "config()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L727 | neighbors=[main.js, getErrorMap(), "node_modules/zod/v4/classic/external.j…, setErrorMap()]
- "karpathywiki_main_convertdatacontenttouint8array": "convertDataContentToUint8Array()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23151 | neighbors=[main.js, convertBase64ToUint8Array(), toImageModelV3File(), transcribe()]
- "karpathywiki_main_correctrelatedlinkprefixes": "correctRelatedLinkPrefixes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69118 | neighbors=[main.js, applyRelatedLinks(), buildVaultResolver(), createSummaryPage()]
- "karpathywiki_main_createanthropic": "createAnthropic()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L46076 | neighbors=[main.js, loadOptionalSetting(), normalizeBaseURL(), "node_modules/@ai-sdk/anthropic/dist/in…]
- "karpathywiki_main_createbatchcontext": "createBatchContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75673 | neighbors=[main.js, buildIngestedHashes(), processBatch(), runBatchIngest()]
- "karpathywiki_main_createopenai": "createOpenAI()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L38177 | neighbors=[main.js, loadOptionalSetting(), withoutTrailingSlash(), "node_modules/@ai-sdk/openai/dist/index…]
- "karpathywiki_main_createopenaistreamerror": "createOpenAIStreamError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36347 | neighbors=[main.js, getStatusCode(), parseStreamError(), throwIfOpenAIStreamErrorBeforeOutput()]
- "karpathywiki_main_createorupdateconceptpage": "createOrUpdateConceptPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74240 | neighbors=[main.js, createOrUpdatePage(), sourceContextFromAnalysis(), ingestConversation()]
- "karpathywiki_main_createorupdateentitypage": "createOrUpdateEntityPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74229 | neighbors=[main.js, createOrUpdatePage(), sourceContextFromAnalysis(), ingestConversation()]
- "karpathywiki_main_createpdfcache": "createPdfCache()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54663 | neighbors=[main.js, convertPdfToMarkdown(), convertPdfWithMineru(), getPdfCacheDir()]
- "karpathywiki_main_createprovidertoolfactorywithoutputschema": "createProviderToolFactoryWithOutputSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18425 | neighbors=[main.js, "node_modules/@ai-sdk/anthropic/dist/in…, "node_modules/@ai-sdk/gateway/dist/inde…, "node_modules/@ai-sdk/openai/dist/index…]
- "karpathywiki_main_createstreaminguimessagestate": "createStreamingUIMessageState()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26345 | neighbors=[main.js, createIdMap(), handleUIMessageStreamFinish(), readUIMessageStream()]
- "karpathywiki_main_createtoolmodeloutput": "createToolModelOutput()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23585 | neighbors=[main.js, getErrorMessage(), toJSONValue(), toResponseMessages()]
- "karpathywiki_main_decidesourcelemma": "decideSourceLemma()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71972 | neighbors=[main.js, isLemmaExtracted(), slugKeys(), ensureSourceLemma()]
- "karpathywiki_main_dedupmentionsbyprovenancekey": "dedupMentionsByProvenanceKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70085 | neighbors=[main.js, computeReingestMentions(), mentionKey(), mergeMentionsFields()]
- "karpathywiki_main_detecthubs": "detectHubs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82482 | neighbors=[main.js, countTotalDegree(), personalizedPageRank(), scanHubLinkDensity()]
- "karpathywiki_main_detectratelimitfailures": "detectRateLimitFailures()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69026 | neighbors=[main.js, runAliasCompletion(), runBatchedWithRetry(), runDedupPhase()]
- "karpathywiki_main_downloadresult": "downloadResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68818 | neighbors=[main.js, convertPdfWithMineru(), throwIfAborted5(), withDeadline()]
- "karpathywiki_main_emitchange": "emitChange()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87117 | neighbors=[main.js, addTag(), getValue(), removeTag()]
- "karpathywiki_main_executetoolcall": "executeToolCall()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24357 | neighbors=[main.js, assembleOperationName(), recordSpan(), selectTelemetryAttributes()]
- "karpathywiki_main_extractbalancedjson": "extractBalancedJson()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53043 | neighbors=[main.js, parseJsonResult(), repairKnownDefects(), tryParseFromThinkingBlocks()]
- "karpathywiki_main_extracthexstring": "extractHexString()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68114 | neighbors=[main.js, decodeBytesIfUtf16(), hexToBytes(), extractStringField()]
- "karpathywiki_main_extractstringfield": "extractStringField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68074 | neighbors=[main.js, extractHexString(), extractLiteralString(), parsePdfInfoDictText()]
- "karpathywiki_main_extractthinkingblocks": "extractThinkingBlocks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43667 | neighbors=[main.js, unescapeThinkingTag(), extractThinkingPanel(), stripThinkingBlocks()]
- "karpathywiki_main_extractwikilinks": "extractWikiLinks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84866 | neighbors=[main.js, buildEntry(), parseDetailRows(), parseSectionItem()]
- "karpathywiki_main_findsection": "findSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70273 | neighbors=[main.js, escapeRegex2(), parseMentionsSection(), stripMentionsSection()]
- "karpathywiki_main_findsection2": "findSection2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72687 | neighbors=[main.js, snapHeaderToCanonical(), keptEntries(), relatedListLines()]
- "karpathywiki_main_finishgeneration": "finishGeneration()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78747 | neighbors=[main.js, rebuildTurnIndicator(), scrollToStartOfCurrentTurn(), sendMessage()]
- "karpathywiki_main_firstactivetag": "firstActiveTag()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72539 | neighbors=[main.js, ensureSourceLemma(), getActiveConceptTags(), getActiveEntityTags()]
- "karpathywiki_main_firstbodyline": "firstBodyLine()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75140 | neighbors=[main.js, parseFrontmatter(), getPageSummary(), renderSection()]
- "karpathywiki_main_firstquotesforprompt": "firstQuotesForPrompt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73488 | neighbors=[main.js, appendToReviewedPage(), buildNewInfoSummary(), mergePage()]
- "karpathywiki_main_flushapikey": "flushApiKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87656 | neighbors=[main.js, commitTempSettings(), getText(), save()]
- "karpathywiki_main_flushbedrockiamkeys": "flushBedrockIamKeys()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87613 | neighbors=[main.js, getText(), saveIamKeys(), hide()]
- "karpathywiki_main_function": "_function()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9954 | neighbors=[main.js, _array(), _tuple(), _unknown()]
- "karpathywiki_main_gatecandidates": "gateCandidates()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69401 | neighbors=[main.js, gateProfileFor(), pruneDroppedNames(), ingestSource()]
- "karpathywiki_main_generatekeywordswithtypedoutput": "generateKeywordsWithTypedOutput()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77815 | neighbors=[main.js, normalizeKeywords(), parseJsonResponse(), generateQueryKeywords()]
- "karpathywiki_main_generateurlcandidates": "generateUrlCandidates()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43714 | neighbors=[main.js, fetchModelsWithFallback(), hasV1Segment(), resolveBaseUrlWithFallback()]
- "karpathywiki_main_getorbuild": "getOrBuild()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75011 | neighbors=[main.js, buildGraphFromContent(), setsEqual(), getOrBuildGraph()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-021.json

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
