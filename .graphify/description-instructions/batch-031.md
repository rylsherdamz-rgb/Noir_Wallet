# Node Description Batch 32 of 84

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

- "karpathywiki_main_extractapicallresponse": "extractApiCallResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L19574 | neighbors=[main.js, asGatewayError(), secureJsonParse()]
- "karpathywiki_main_extracterrorvalue": "extractErrorValue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L44891 | neighbors=[main.js, convertToAnthropicMessagesPrompt(), safeParseJSON()]
- "karpathywiki_main_extractliteralstring": "extractLiteralString()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68088 | neighbors=[main.js, decodeBytesIfUtf16(), extractStringField()]
- "karpathywiki_main_extractmentionssection": "extractMentionsSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82781 | neighbors=[main.js, collectCitedRawNoteTargets(), scanQuoteGrounding()]
- "karpathywiki_main_extractminerumarkdown": "extractMineruMarkdown()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68648 | neighbors=[main.js, convertPdfWithMineru(), unzipSync()]
- "karpathywiki_main_extractrawsourcesentries": "extractRawSourcesEntries()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71759 | neighbors=[main.js, fixPollutedSources(), scanPollutedSources()]
- "karpathywiki_main_extractsourcetags": "extractSourceTags()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69041 | neighbors=[main.js, createSummaryPage(), parseFrontmatter()]
- "karpathywiki_main_filetoblob": "fileToBlob()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36968 | neighbors=[main.js, convertBase64ToUint8Array(), downloadBlob()]
- "karpathywiki_main_filetoblob2": "fileToBlob2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L50945 | neighbors=[main.js, convertBase64ToUint8Array(), downloadBlob()]
- "karpathywiki_main_finddeadlinktarget": "findDeadLinkTarget()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70529 | neighbors=[main.js, slugKey(), fixDeadLink()]
- "karpathywiki_main_findfilebypath": "findFileByPath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79932 | neighbors=[main.js, collectCheckedFiles(), findFileInNode()]
- "karpathywiki_main_findincompletepages": "findIncompletePages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68006 | neighbors=[main.js, isIncomplete(), runStartupCheck()]
- "karpathywiki_main_findjob": "findJob()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66282 | neighbors=[main.js, complete(), start()]
- "karpathywiki_main_findsectionheader": "findSectionHeader()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77968 | neighbors=[main.js, extractSummaryFromPage(), escapeRegex3()]
- "karpathywiki_main_findsectioninbody": "findSectionInBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73729 | neighbors=[main.js, escapeRegex2(), resolveSectionAnchor()]
- "karpathywiki_main_findturnelements": "findTurnElements()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77203 | neighbors=[main.js, buildTurnIndicator(), observeVisibleTurn()]
- "karpathywiki_main_foldtovocabulary": "foldToVocabulary()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66025 | neighbors=[main.js, askTypeFromVocabulary(), repairTypesAgainstVocabulary()]
- "karpathywiki_main_formatamzdate": "formatAmzDate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54889 | neighbors=[main.js, pad2(), signRequest()]
- "karpathywiki_main_formatbytes": "formatBytes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67553 | neighbors=[main.js, formatIngestMetricsSuffix(), renderIngestMetricCards()]
- "karpathywiki_main_formatconversation": "formatConversation()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74611 | neighbors=[main.js, evaluateWithLLM(), ingestConversation()]
- "karpathywiki_main_formatingestmetricssuffix": "formatIngestMetricsSuffix()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75362 | neighbors=[main.js, appendIngest(), formatBytes()]
- "karpathywiki_main_frombase64url": "fromBase64url()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24541 | neighbors=[main.js, convertBase64ToUint8Array(), verifyToolApprovalSignature()]
- "karpathywiki_main_gateplaceholder": "gatePlaceholder()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52868 | neighbors=[main.js, isPlaceholderObject(), parseJsonResult()]
- "karpathywiki_main_gateprofilefor": "gateProfileFor()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69234 | neighbors=[main.js, applyOutcomeTable(), gateCandidates()]
- "karpathywiki_main_generateflatindex": "generateFlatIndex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75058 | neighbors=[main.js, renderSection(), generateIndexFromEngine()]
- "karpathywiki_main_generateoauthstate": "generateOAuthState()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64700 | neighbors=[main.js, validateEntropy(), runLoopbackLogin()]
- "karpathywiki_main_generatepkce": "generatePkce()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64693 | neighbors=[main.js, validateEntropy(), runLoopbackLogin()]
- "karpathywiki_main_generatequerykeywords": "generateQueryKeywords()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77848 | neighbors=[main.js, generateKeywordsWithTypedOutput(), selectPprSeeds()]
- "karpathywiki_main_getactivesourcetags": "getActiveSourceTags()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66022 | neighbors=[main.js, enforceFrontmatterConstraints(), scanTagViolations()]
- "karpathywiki_main_getcachecontrol": "getCacheControl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L44455 | neighbors=[main.js, convertToAnthropicMessagesPrompt(), prepareTools()]
- "karpathywiki_main_getcachedurl": "getCachedUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43731 | neighbors=[main.js, fetchModelsWithFallback(), resolveBaseUrlWithFallback()]
- "karpathywiki_main_getglobaltelemetryintegration": "getGlobalTelemetryIntegration()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24047 | neighbors=[main.js, generateText(), getGlobalTelemetryIntegrations()]
- "karpathywiki_main_getopencontradictions": "getOpenContradictions()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71689 | neighbors=[main.js, parseFrontmatter(), runContradictionPhase()]
- "karpathywiki_main_getorbuildgraph": "getOrBuildGraph()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75744 | neighbors=[main.js, buildWikiContext(), getOrBuild()]
- "karpathywiki_main_getprogresscallback": "getProgressCallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75536 | neighbors=[main.js, doSave(), saveToWiki()]
- "karpathywiki_main_getsourcelanguage": "getSourceLanguage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69606 | neighbors=[main.js, normalizeSourceLanguage(), ingestSource()]
- "karpathywiki_main_getsourcepageheadlabels": "getSourcePageHeadLabels()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69904 | neighbors=[main.js, createSummaryPage(), getSectionLabels()]
- "karpathywiki_main_getstatuscode": "getStatusCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36389 | neighbors=[main.js, createOpenAIStreamError(), isHttpErrorStatusCode()]
- "karpathywiki_main_getsteptimeoutms": "getStepTimeoutMs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23066 | neighbors=[main.js, generateText(), streamText()]
- "karpathywiki_main_gettoolname": "getToolName()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26342 | neighbors=[main.js, getStaticToolName(), isDynamicToolUIPart()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-031.json

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
