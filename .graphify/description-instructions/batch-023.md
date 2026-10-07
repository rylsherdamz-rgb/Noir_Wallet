# Node Description Batch 24 of 84

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

- "karpathywiki_main_originnoterefs": "originNoteRefs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67642 | neighbors=[main.js, noteHasDrifted(), pageBelongsToNote(), scanSourceDrift()]
- "karpathywiki_main_parsealiases": "parseAliases()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75157 | neighbors=[main.js, getPageAliases(), parseFrontmatter(), renderSection()]
- "karpathywiki_main_parsecatalog": "parseCatalog()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88283 | neighbors=[main.js, fetchCodexModelCatalog(), json(), objectValue()]
- "karpathywiki_main_parsejson": "parseJSON()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18321 | neighbors=[main.js, convertToOpenAIResponsesInput(), secureJsonParse(), validateTypes()]
- "karpathywiki_main_parsemapdef": "parseMapDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17859 | neighbors=[main.js, parseAnyDef(), parseDef(), parseRecordDef()]
- "karpathywiki_main_parsementionssection": "parseMentionsSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70292 | neighbors=[main.js, computeReingestMentions(), findSection(), linkTarget()]
- "karpathywiki_main_parseobjectdef": "parseObjectDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18012 | neighbors=[main.js, decideAdditionalProperties(), parseDef(), safeIsOptional()]
- "karpathywiki_main_parsepdfinfodicttext": "parsePdfInfoDictText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68067 | neighbors=[main.js, convertPdfToMarkdown(), extractPageCount(), extractStringField()]
- "karpathywiki_main_parseproviderexecuteddynamictoolcall": "parseProviderExecutedDynamicToolCall()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L25091 | neighbors=[main.js, doParseToolCall(), safeParseJSON(), parseToolCall()]
- "karpathywiki_main_parseprovideroptions": "parseProviderOptions()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18371 | neighbors=[main.js, convertToAnthropicMessagesPrompt(), convertToOpenAIResponsesInput(), safeValidateTypes()]
- "karpathywiki_main_parseschemasuggestion": "parseSchemaSuggestion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79954 | neighbors=[main.js, extractBodyFromFull(), stripCodeFence(), suggestSchemaUpdate()]
- "karpathywiki_main_parsestreamerror": "parseStreamError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36365 | neighbors=[main.js, createOpenAIStreamError(), asRecord(), getStringOrNumber()]
- "karpathywiki_main_parsetoolcall": "parseToolCall()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L25028 | neighbors=[main.js, doParseToolCall(), parseProviderExecutedDynamicToolCall(), safeParseJSON()]
- "karpathywiki_main_performpdfcachehousekeeping": "performPdfCacheHousekeeping()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81403 | neighbors=[main.js, onload(), resolve(), then()]
- "karpathywiki_main_personalizedpagerank": "personalizedPageRank()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76886 | neighbors=[main.js, detectHubs(), pprFromSeeds(), scoreHubLinkDistinctiveness()]
- "karpathywiki_main_pipeuimessagestreamtoresponse": "pipeUIMessageStreamToResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27012 | neighbors=[main.js, pipeAgentUIStreamToResponse(), prepareHeaders(), writeToServerResponse()]
- "karpathywiki_main_portalheaders": "portalHeaders()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65512 | neighbors=[main.js, getRoleCredentials(), listAccountRoles(), listAccounts()]
- "karpathywiki_main_postjson": "postJson()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65416 | neighbors=[main.js, completeDeviceAuthorization2(), registerClient(), startDeviceAuthorization()]
- "karpathywiki_main_preparepdfcacheforbatchingest": "preparePdfCacheForBatchIngest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81389 | neighbors=[main.js, resolve(), then(), runBatchIngest()]
- "karpathywiki_main_prepareresponsestools": "prepareResponsesTools()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L37741 | neighbors=[main.js, mapShellEnvironment(), prepareFunctionTool(), validateTypes()]
- "karpathywiki_main_preservesourcedparagraphs": "preserveSourcedParagraphs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73220 | neighbors=[main.js, guardBodyRewrite(), layoutOf(), sourceKey()]
- "karpathywiki_main_probellm": "probeLlm()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81347 | neighbors=[main.js, isLocalNoKeyProvider(), resolveModelForTask(), resolveProviderApiKey()]
- "karpathywiki_main_providerrequiresapikey": "providerRequiresApiKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54821 | neighbors=[main.js, isProviderConfigured(), isLocalNoKeyProvider(), testLLMConnection()]
- "karpathywiki_main_prunedroppednames": "pruneDroppedNames()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69416 | neighbors=[main.js, applyCoverageThreshold(), applyOutcomeTable(), gateCandidates()]
- "karpathywiki_main_queuestalecodexmodelrefresh": "queueStaleCodexModelRefresh()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87780 | neighbors=[main.js, now(), refreshOpenAICodexModels(), renderProviderSection()]
- "karpathywiki_main_racewithbounds": "raceWithBounds()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64834 | neighbors=[main.js, exchangeAuthorizationCode(), pollAuthorizationCode(), throwIfAborted2()]
- "karpathywiki_main_racewithbounds2": "raceWithBounds2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65388 | neighbors=[main.js, completeDeviceAuthorization2(), then(), throwIfAborted4()]
- "karpathywiki_main_racewithloginbounds": "raceWithLoginBounds()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65026 | neighbors=[main.js, exchangeAuthorizationCode2(), throwIfAborted3(), runLoopbackLogin()]
- "karpathywiki_main_readresponsewithsizelimit": "readResponseWithSizeLimit()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17069 | neighbors=[main.js, downloadBlob(), readResponseBodyAsText(), cancelResponseBody()]
- "karpathywiki_main_readwikiindex": "readWikiIndex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77548 | neighbors=[main.js, buildWikiContext(), parseIndexForPages(), tryReadFile()]
- "karpathywiki_main_reasserth1": "reassertH1()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71357 | neighbors=[main.js, guardBodyRewrite(), mergeDuplicatePages(), findH1()]
- "karpathywiki_main_refreshrowstates": "refreshRowStates()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79743 | neighbors=[main.js, buildLeftPane(), getSnapshot(), scanDiskStates()]
- "karpathywiki_main_regeneratedefaultschema": "regenerateDefaultSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76802 | neighbors=[main.js, buildDefaultSchemaBody(), getSchemaPath(), localDateStamp()]
- "karpathywiki_main_removetag": "removeTag()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87053 | neighbors=[main.js, handleKeydown(), emitChange(), remove()]
- "karpathywiki_main_renderadvancedsection": "renderAdvancedSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86868 | neighbors=[main.js, display(), getText(), renderNumberInput()]
- "karpathywiki_main_renderadvancedsettingssection": "renderAdvancedSettingsSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87380 | neighbors=[main.js, display(), getText(), renderNumberInput()]
- "karpathywiki_main_renderchips": "renderChips()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87086 | neighbors=[main.js, appendChip(), remove(), setValue()]
- "karpathywiki_main_rendercontent": "renderContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86039 | neighbors=[main.js, onOpen(), parseLogEntries(), renderCloseFooter()]
- "karpathywiki_main_rendercustominstructionspanel": "renderCustomInstructionsPanel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78159 | neighbors=[main.js, onOpen(), el(), updateCounter()]
- "karpathywiki_main_renderdeadlinksection": "renderDeadLinkSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85489 | neighbors=[main.js, renderDeadLinkTable(), renderSectionTitle(), renderReportSection()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-023.json

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
