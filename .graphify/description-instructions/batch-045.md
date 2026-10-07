# Node Description Batch 46 of 84

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

- "karpathywiki_main_float64": "_float64()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9369 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_folderof": "folderOf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72725 | neighbors=[main.js, renderRelatedSections()]
- "karpathywiki_main_folderof2": "folderOf2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72805 | neighbors=[main.js, resolve()]
- "karpathywiki_main_folderscopeprefix": "folderScopePrefix()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65854 | neighbors=[main.js, isInFolderScope()]
- "karpathywiki_main_foldtypeunion": "foldTypeUnion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52712 | neighbors=[main.js, normalizeNode()]
- "karpathywiki_main_footnotesof": "footnotesOf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73158 | neighbors=[main.js, sourceKey()]
- "karpathywiki_main_formatcontradictionreport": "formatContradictionReport()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83862 | neighbors=[main.js, runContradictionPhase()]
- "karpathywiki_main_formatconvergencestatus": "formatConvergenceStatus()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71952 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_formattaskusage": "formatTaskUsage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55158 | neighbors=[main.js, ingestSource()]
- "karpathywiki_main_generateemptyindex": "generateEmptyIndex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75165 | neighbors=[main.js, generateIndexFromEngine()]
- "karpathywiki_main_getactivespan": "getActiveSpan()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22206 | neighbors=[main.js, getSpan()]
- "karpathywiki_main_getbedrockauthuistate": "getBedrockAuthUiState()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86442 | neighbors=[main.js, renderProviderSection()]
- "karpathywiki_main_getchunktimeoutms": "getChunkTimeoutMs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23072 | neighbors=[main.js, streamText()]
- "karpathywiki_main_getcodexauthuistate": "getCodexAuthUiState()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86362 | neighbors=[main.js, renderProviderSection()]
- "karpathywiki_main_getconstraintdescription": "getConstraintDescription()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L45890 | neighbors=[main.js, sanitizeSchema()]
- "karpathywiki_main_getcurrentmodelvalue": "getCurrentModelValue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87945 | neighbors=[main.js, resolveDisplayedModelForTask()]
- "karpathywiki_main_getcustomtypecaps": "getCustomTypeCaps()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71885 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_geterrormap": "getErrorMap()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12151 | neighbors=[main.js, config()]
- "karpathywiki_main_geterrormap2": "getErrorMap2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12825 | neighbors=[main.js, addIssueToContext()]
- "karpathywiki_main_geterrormessage": "getErrorMessage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L335 | neighbors=[main.js, createToolModelOutput()]
- "karpathywiki_main_geterrormessage2": "getErrorMessage2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17151 | neighbors=[main.js, retryWithExponentialBackoffInternal()]
- "karpathywiki_main_getgatewayauthtoken": "getGatewayAuthToken()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L19875 | neighbors=[main.js, loadOptionalSetting()]
- "karpathywiki_main_getglobal": "getGlobal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L21823 | neighbors=[main.js, logProxy()]
- "karpathywiki_main_getglobaltelemetryintegrations": "getGlobalTelemetryIntegrations()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24032 | neighbors=[main.js, getGlobalTelemetryIntegration()]
- "karpathywiki_main_getgranularityfixlimits": "getGranularityFixLimits()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69934 | neighbors=[main.js, fillEmptyPage()]
- "karpathywiki_main_getgranularityinstruction": "getGranularityInstruction()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69924 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_getloglabels": "getLogLabels()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75213 | neighbors=[main.js, appendIngest()]
- "karpathywiki_main_getopenaimetadata": "getOpenAIMetadata()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L50536 | neighbors=[main.js, convertToOpenAICompatibleChatMessages()]
- "karpathywiki_main_getpagealiases": "getPageAliases()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75193 | neighbors=[main.js, parseAliases()]
- "karpathywiki_main_getpagesummary": "getPageSummary()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75183 | neighbors=[main.js, firstBodyLine()]
- "karpathywiki_main_getpdfcachedir": "getPdfCacheDir()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54660 | neighbors=[main.js, createPdfCache()]
- "karpathywiki_main_getpromptcachebreakpoint": "getPromptCacheBreakpoint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36467 | neighbors=[main.js, convertToOpenAIChatMessages()]
- "karpathywiki_main_getpromptcachebreakpoint2": "getPromptCacheBreakpoint2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L37017 | neighbors=[main.js, convertToOpenAIResponsesInput()]
- "karpathywiki_main_getretrydelayinms": "getRetryDelayInMs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24204 | neighbors=[main.js, now()]
- "karpathywiki_main_getruntimeenvironmentuseragent": "getRuntimeEnvironmentUserAgent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17209 | neighbors=[main.js, callCompletionApi()]
- "karpathywiki_main_getspancontext": "getSpanContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22218 | neighbors=[main.js, getSpan()]
- "karpathywiki_main_getstatictoolname": "getStaticToolName()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26339 | neighbors=[main.js, getToolName()]
- "karpathywiki_main_getstringornumber": "getStringOrNumber()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36420 | neighbors=[main.js, parseStreamError()]
- "karpathywiki_main_getsuggestionspath": "getSuggestionsPath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80192 | neighbors=[main.js, appendSuggestion()]
- "karpathywiki_main_gettextdynamic": "getTextDynamic()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87680 | neighbors=[main.js, renderNumberInput()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-045.json

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
