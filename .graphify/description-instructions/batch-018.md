# Node Description Batch 19 of 84

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

- "karpathywiki_main_isinfolderscope": "isInFolderScope()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65860 | neighbors=[main.js, collectWikiVocabulary(), isAtOrInFolderScope(), folderScopePrefix(), isIngestableSource()]
- "karpathywiki_main_lazyschema": "lazySchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18171 | neighbors=[main.js, "node_modules/ai/dist/index.mjs"(), "node_modules/@ai-sdk/anthropic/dist/in…, "node_modules/@ai-sdk/gateway/dist/inde…, "node_modules/@ai-sdk/openai/dist/index…]
- "karpathywiki_main_lintwiki": "lintWiki()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84534 | neighbors=[main.js, endLintOperation(), requireLLMReady(), runLintWiki(), startLintOperation()]
- "karpathywiki_main_listaccountroles": "listAccountRoles()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65561 | neighbors=[main.js, discoverAccountRole(), bedrockPortalBaseUrl(), parsePortalResponse(), portalHeaders()]
- "karpathywiki_main_listaccounts": "listAccounts()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65552 | neighbors=[main.js, discoverAccountRole(), bedrockPortalBaseUrl(), parsePortalResponse(), portalHeaders()]
- "karpathywiki_main_loadrelevantpagesforquery": "loadRelevantPagesForQuery()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78010 | neighbors=[main.js, buildWikiContext(), loadRelevantPages(), extractSummaryFromPage(), tryReadFile()]
- "karpathywiki_main_localizewelcomenote": "localizeWelcomeNote()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80614 | neighbors=[main.js, ensureWelcomeNote(), callLlm(), extractTranslatedField(), parseJsonResponse()]
- "karpathywiki_main_minerurequest": "mineruRequest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68826 | neighbors=[main.js, throwIfAborted5(), withDeadline(), requestUpload(), waitForResult()]
- "karpathywiki_main_normalizestatement": "normalizeStatement()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73358 | neighbors=[main.js, applyContradictionGates(), normalizeQuote(), statementOnPage(), verifySourceStance()]
- "karpathywiki_main_nullish": "nullish()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L840 | neighbors=[main.js, "node_modules/@ai-sdk/anthropic/dist/in…, "node_modules/@ai-sdk/gateway/dist/inde…, "node_modules/@ai-sdk/openai-compatible…, "node_modules/@ai-sdk/openai/dist/index…]
- "karpathywiki_main_onclose": "onClose()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77541 | neighbors=[main.js, dispose(), now(), removeDiffModalClasses(), saveSettings()]
- "karpathywiki_main_overwrite": "_overwrite()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9654 | neighbors=[main.js, _normalize(), _toLowerCase(), _toUpperCase(), _trim()]
- "karpathywiki_main_pagebelongstonote": "pageBelongsToNote()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79458 | neighbors=[main.js, isAlreadyIngested(), originNoteRefs(), parseFrontmatter(), scanDiskStates()]
- "karpathywiki_main_parseentry": "parseEntry()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88257 | neighbors=[main.js, objectValue(), reasoningLevels(), serviceTiers(), stringArray()]
- "karpathywiki_main_parselogentries": "parseLogEntries()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84893 | neighbors=[main.js, buildEntry(), classifyOperation(), parseIngestMetrics(), renderContent()]
- "karpathywiki_main_parseportalresponse": "parsePortalResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65515 | neighbors=[main.js, getRoleCredentials(), listAccountRoles(), listAccounts(), json()]
- "karpathywiki_main_parserecorddef": "parseRecordDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17825 | neighbors=[main.js, parseMapDef(), parseBrandedDef(), parseDef(), parseStringDef()]
- "karpathywiki_main_parsesectionitem": "parseSectionItem()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85075 | neighbors=[main.js, buildEntry(), defaultSeverityForKind(), extractWikiLinks(), llmSeverityFor()]
- "karpathywiki_main_parsetokenresponse": "parseTokenResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64718 | neighbors=[main.js, exchangeAuthorizationCode(), exchangeAuthorizationCode2(), requiredString(), refreshWithFetch()]
- "karpathywiki_main_prepareheaders": "prepareHeaders()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26206 | neighbors=[main.js, createTextStreamResponse(), createUIMessageStreamResponse(), pipeTextStreamToResponse(), pipeUIMessageStreamToResponse()]
- "karpathywiki_main_readuimessagestream": "readUIMessageStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27730 | neighbors=[main.js, consumeStream(), createAsyncIterableStream(), createStreamingUIMessageState(), processUIMessageStream()]
- "karpathywiki_main_recompute": "recompute()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81750 | neighbors=[main.js, $constructor(), lineDiff(), setCurrentBody(), setNewBody()]
- "karpathywiki_main_refreshafterunauthorized": "refreshAfterUnauthorized()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65163 | neighbors=[main.js, fetchCodexModelCatalog(), accessFrom(), load(), refresh()]
- "karpathywiki_main_renderentry": "renderEntry()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85952 | neighbors=[main.js, renderFixDetails(), renderIngestDetails(), renderMaintenanceDetails(), renderOpenInLogLink()]
- "karpathywiki_main_rendermodelsection": "renderModelSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86696 | neighbors=[main.js, display(), getText(), renderModelField(), resolveModelTaskUiMode()]
- "karpathywiki_main_rendersectiontitle": "renderSectionTitle()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85401 | neighbors=[main.js, renderDeadLinkSection(), renderLlmAnalysisSection(), renderSimpleListSection(), renderTagViolationSection()]
- "karpathywiki_main_repairtypesagainstvocabulary": "repairTypesAgainstVocabulary()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72563 | neighbors=[main.js, analyzeSource(), foldToVocabulary(), getActiveConceptTags(), getActiveEntityTags()]
- "karpathywiki_main_replacefrontmatterarrayfield": "replaceFrontmatterArrayField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67784 | neighbors=[main.js, createSummaryPage(), extractPassthroughLines(), parseFrontmatter(), serializeFrontmatter()]
- "karpathywiki_main_reportskip": "reportSkip()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75804 | neighbors=[main.js, ingestConversionSource(), ingestSource(), getText(), rejectionNoticeKey()]
- "karpathywiki_main_requestupload": "requestUpload()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68764 | neighbors=[main.js, convertPdfWithMineru(), mineruRequest(), stringValue(), validateRemoteUrl()]
- "karpathywiki_main_resolvebaseurlwithfallback": "resolveBaseUrlWithFallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43752 | neighbors=[main.js, cacheResolvedUrl(), delay2(), generateUrlCandidates(), getCachedUrl()]
- "karpathywiki_main_resolveembeddingmodel": "resolveEmbeddingModel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22953 | neighbors=[main.js, embed(), embedMany(), asEmbeddingModelV3(), getGlobalProvider()]
- "karpathywiki_main_responsejson3": "responseJson3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65361 | neighbors=[main.js, completeDeviceAuthorization2(), registerClient(), json(), startDeviceAuthorization()]
- "karpathywiki_main_scanhublinkdensity": "scanHubLinkDensity()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82598 | neighbors=[main.js, runProgrammaticPhase(), detectHubs(), parseRelatedTargets(), scoreHubLinkDistinctiveness()]
- "karpathywiki_main_sectionidentitykey": "sectionIdentityKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71269 | neighbors=[main.js, canonicalSectionBlocks(), layoutOf(), replaceSectionBlocks(), classifyHeader()]
- "karpathywiki_main_selectcandidatewindow": "selectCandidateWindow()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70630 | neighbors=[main.js, fixDeadLink(), contextKeywords(), localKeywordMatch(), selectDedupCandidates()]
- "karpathywiki_main_showprogressfor": "showProgressFor()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88690 | neighbors=[main.js, ingestActiveFile(), runBatchIngest(), showProgress(), decideProgressDisplay()]
- "karpathywiki_main_signout": "signOut()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65204 | neighbors=[main.js, runCodexSignOut(), cancelLogin(), clear(), signOutOpenAICodex()]
- "karpathywiki_main_signoutopenaicodex": "signOutOpenAICodex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87836 | neighbors=[main.js, resetOpenAICodexModelState(), runCodexSignOut(), signOut(), syncCodexModelsFromPlugin()]
- "karpathywiki_main_signrequest": "signRequest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54899 | neighbors=[main.js, deriveSigningKey(), formatAmzDate(), hashSha256Hex(), hmacSha256()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-018.json

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
