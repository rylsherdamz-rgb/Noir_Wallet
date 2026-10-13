# Node Description Batch 35 of 84

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

- "karpathywiki_main_number": "_number()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9336 | neighbors=[main.js, normalizeParams(), number2()]
- "karpathywiki_main_observevisibleturn": "observeVisibleTurn()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77315 | neighbors=[main.js, findTurnElements(), rebuildTurnIndicator()]
- "karpathywiki_main_obsidianfetchbridge": "obsidianFetchBridge()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L216 | neighbors=[main.js, headersToObject(), streamWithFallback()]
- "karpathywiki_main_onunload": "onunload()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88524 | neighbors=[main.js, dispose(), stop()]
- "karpathywiki_main_organizationaccountid": "organizationAccountId()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64750 | neighbors=[main.js, extractTokenResponseAccountId(), tokenClaims()]
- "karpathywiki_main_pagelinks": "pageLinks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75358 | neighbors=[main.js, appendIngest(), dedupPages()]
- "karpathywiki_main_parenspans": "parenSpans()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69287 | neighbors=[main.js, classifyCandidate(), linkSpans()]
- "karpathywiki_main_parseandvalidateobjectresult": "parseAndValidateObjectResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28757 | neighbors=[main.js, safeParseJSON(), parseAndValidateObjectResultWithRepair()]
- "karpathywiki_main_parseauthorizationcode": "parseAuthorizationCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64814 | neighbors=[main.js, requiredString2(), pollAuthorizationCode()]
- "karpathywiki_main_parsebrandeddef": "parseBrandedDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17466 | neighbors=[main.js, parseDef(), parseRecordDef()]
- "karpathywiki_main_parsedetailrows": "parseDetailRows()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84880 | neighbors=[main.js, buildEntry(), extractWikiLinks()]
- "karpathywiki_main_parsedeviceauthorization": "parseDeviceAuthorization()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64807 | neighbors=[main.js, requiredString2(), requestDeviceCode()]
- "karpathywiki_main_parseeffectsdef": "parseEffectsDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17498 | neighbors=[main.js, parseAnyDef(), parseDef()]
- "karpathywiki_main_parsepartialjson": "parsePartialJson()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L25014 | neighbors=[main.js, fixJson(), safeParseJSON()]
- "karpathywiki_main_partitionpagesmultibucket": "partitionPagesMultiBucket()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83282 | neighbors=[main.js, generateDuplicateCandidates(), normalizeForMatch()]
- "karpathywiki_main_pipeagentuistreamtoresponse": "pipeAgentUIStreamToResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28196 | neighbors=[main.js, createAgentUIStream(), pipeUIMessageStreamToResponse()]
- "karpathywiki_main_pipetextstreamtoresponse": "pipeTextStreamToResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26264 | neighbors=[main.js, prepareHeaders(), writeToServerResponse()]
- "karpathywiki_main_pprfromseeds": "pprFromSeeds()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77073 | neighbors=[main.js, pprCascade(), personalizedPageRank()]
- "karpathywiki_main_preloadllmclientmodules": "preloadLLMClientModules()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55056 | neighbors=[main.js, resolve(), then()]
- "karpathywiki_main_preparecallsettings": "prepareCallSettings()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23605 | neighbors=[main.js, generateObject(), generateText()]
- "karpathywiki_main_preparetools": "prepareTools()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L44461 | neighbors=[main.js, getCacheControl(), validateTypes()]
- "karpathywiki_main_preparetoolsandtoolchoice": "prepareToolsAndToolChoice()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23699 | neighbors=[main.js, asSchema(), isNonEmptyObject()]
- "karpathywiki_main_processuimessagestream": "processUIMessageStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26361 | neighbors=[main.js, handleUIMessageStreamFinish(), readUIMessageStream()]
- "karpathywiki_main_productionserverfactory": "productionServerFactory()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65023 | neighbors=[main.js, createLoopbackServer(), runLoopbackLogin()]
- "karpathywiki_main_querywiki": "queryWiki()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84508 | neighbors=[main.js, activateQueryView(), requireLLMReady()]
- "karpathywiki_main_racewithabort": "raceWithAbort()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65123 | neighbors=[main.js, loginWithDeviceCode(), abortError3()]
- "karpathywiki_main_recreatewelcomenote": "recreateWelcomeNote()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81265 | neighbors=[main.js, getWelcomeFileName(), runOnboardingPhase()]
- "karpathywiki_main_relatedlistlines": "relatedListLines()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72715 | neighbors=[main.js, mergePage(), findSection2()]
- "karpathywiki_main_renderautomaintainsection": "renderAutoMaintainSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87275 | neighbors=[main.js, display(), getText()]
- "karpathywiki_main_rendercitation": "renderCitation()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70400 | neighbors=[main.js, buildBullets(), formatMentionsSection()]
- "karpathywiki_main_rendercriticalkpicards": "renderCriticalKpiCards()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85691 | neighbors=[main.js, deltaChip(), renderMaintenanceDetails()]
- "karpathywiki_main_renderdeadlinktable": "renderDeadLinkTable()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85512 | neighbors=[main.js, renderDeadLinkSection(), createWikiLink()]
- "karpathywiki_main_renderdisklabel": "renderDiskLabel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79782 | neighbors=[main.js, getText(), remove()]
- "karpathywiki_main_renderfixdetails": "renderFixDetails()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85930 | neighbors=[main.js, renderEntry(), renderLineWithLinks()]
- "karpathywiki_main_renderhistoryentries": "renderHistoryEntries()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85343 | neighbors=[main.js, computeGlobalInsight(), now()]
- "karpathywiki_main_renderingestmetriccards": "renderIngestMetricCards()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85854 | neighbors=[main.js, renderIngestDetails(), formatBytes()]
- "karpathywiki_main_renderlanguagesection": "renderLanguageSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86253 | neighbors=[main.js, display(), getText()]
- "karpathywiki_main_renderllmitems": "renderLlmItems()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85656 | neighbors=[main.js, renderLlmAnalysisSection(), renderLineWithLinks()]
- "karpathywiki_main_rendermodelfield": "renderModelField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87708 | neighbors=[main.js, shouldRenderModelDropdown(), renderModelSection()]
- "karpathywiki_main_renderopeninloglink": "renderOpenInLogLink()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85455 | neighbors=[main.js, renderEntry(), createWikiLink()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-034.json

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
