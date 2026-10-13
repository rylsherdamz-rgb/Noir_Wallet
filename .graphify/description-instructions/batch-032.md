# Node Description Batch 33 of 84

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

- "karpathywiki_main_gettotaltimeoutms": "getTotalTimeoutMs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23057 | neighbors=[main.js, generateText(), streamText()]
- "karpathywiki_main_getvalue": "getValue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87017 | neighbors=[main.js, emitChange(), getSpan()]
- "karpathywiki_main_getwikilanguagename": "getWikiLanguageName()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69597 | neighbors=[main.js, analyzeSource(), isCrossLanguage()]
- "karpathywiki_main_gt": "_gt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9515 | neighbors=[main.js, normalizeParams(), _positive()]
- "karpathywiki_main_gte": "_gte()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9523 | neighbors=[main.js, normalizeParams(), _nonnegative()]
- "karpathywiki_main_guid": "_guid()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9108 | neighbors=[main.js, normalizeParams(), guid2()]
- "karpathywiki_main_handlefetcherror": "handleFetchError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17177 | neighbors=[main.js, isAbortError(), isBunNetworkError()]
- "karpathywiki_main_handleintersectionresults": "handleIntersectionResults()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2368 | neighbors=[main.js, aborted(), mergeValues()]
- "karpathywiki_main_handlekeydown": "handleKeydown()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87063 | neighbors=[main.js, addTag(), removeTag()]
- "karpathywiki_main_hashsha256hex": "hashSha256Hex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54864 | neighbors=[main.js, assertCryptoSubtle(), signRequest()]
- "karpathywiki_main_haskeys": "hasKeys()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65343 | neighbors=[main.js, hasIamKeys(), load()]
- "karpathywiki_main_hastoken": "hasToken()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65317 | neighbors=[main.js, hasSsoToken(), load()]
- "karpathywiki_main_headerstoobject": "headersToObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L194 | neighbors=[main.js, obsidianFetchBridge(), streamingObsidianFetch()]
- "karpathywiki_main_inspectcausechain": "inspectCauseChain()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75403 | neighbors=[main.js, ingestConversionSource(), errorToString()]
- "karpathywiki_main_invalidate": "invalidate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75028 | neighbors=[main.js, invalidateGraph(), invalidatePageCaches()]
- "karpathywiki_main_invalidategraph": "invalidateGraph()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75713 | neighbors=[main.js, invalidateAllQueryGraphs(), invalidate()]
- "karpathywiki_main_ipv4": "_ipv4()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9228 | neighbors=[main.js, normalizeParams(), ipv42()]
- "karpathywiki_main_ipv6": "_ipv6()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9237 | neighbors=[main.js, normalizeParams(), ipv62()]
- "karpathywiki_main_isaborterror": "isAbortError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17163 | neighbors=[main.js, handleFetchError(), retryWithExponentialBackoffInternal()]
- "karpathywiki_main_isatorinfolderscope": "isAtOrInFolderScope()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65863 | neighbors=[main.js, isInFolderScope(), isExcludedFromSourcePicker()]
- "karpathywiki_main_isdynamictooluipart": "isDynamicToolUIPart()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26333 | neighbors=[main.js, getToolName(), isToolUIPart()]
- "karpathywiki_main_isemptystub": "isEmptyStub()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71090 | neighbors=[main.js, deleteEmptyStubs(), extractBody()]
- "karpathywiki_main_isenumerationchunk": "isEnumerationChunk()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69337 | neighbors=[main.js, classifyCandidate(), chunkLength()]
- "karpathywiki_main_isexcludedfromsourcepicker": "isExcludedFromSourcePicker()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65868 | neighbors=[main.js, isAtOrInFolderScope(), isIngestableSource()]
- "karpathywiki_main_isincomplete": "isIncomplete()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68001 | neighbors=[main.js, findIncompletePages(), parseFrontmatter()]
- "karpathywiki_main_isingestablesource": "isIngestableSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65871 | neighbors=[main.js, isExcludedFromSourcePicker(), isInFolderScope()]
- "karpathywiki_main_islemmaextracted": "isLemmaExtracted()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71963 | neighbors=[main.js, decideSourceLemma(), slugKeys()]
- "karpathywiki_main_islocalnokeyprovider": "isLocalNoKeyProvider()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54812 | neighbors=[main.js, probeLlm(), providerRequiresApiKey()]
- "karpathywiki_main_isobject2": "isObject2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52678 | neighbors=[main.js, normalizeNode(), stripOptionalNulls()]
- "karpathywiki_main_isodate": "_isoDate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9311 | neighbors=[main.js, date2(), normalizeParams()]
- "karpathywiki_main_isodatetime": "_isoDateTime()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9300 | neighbors=[main.js, datetime2(), normalizeParams()]
- "karpathywiki_main_isoduration": "_isoDuration()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9328 | neighbors=[main.js, duration2(), normalizeParams()]
- "karpathywiki_main_isotime": "_isoTime()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9319 | neighbors=[main.js, normalizeParams(), time2()]
- "karpathywiki_main_ispageempty": "isPageEmpty()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70052 | neighbors=[main.js, deleteEmptyStubs(), runLintWiki()]
- "karpathywiki_main_isplaceholderobject": "isPlaceholderObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52855 | neighbors=[main.js, gatePlaceholder(), isPlaceholderJsonText()]
- "karpathywiki_main_isprivateipv4": "isPrivateIPv4()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L16953 | neighbors=[main.js, isPrivateIPv6(), validateDownloadUrl()]
- "karpathywiki_main_isquotegrounded": "isQuoteGrounded()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70074 | neighbors=[main.js, normalizeQuote(), scanQuoteGrounding()]
- "karpathywiki_main_isreasoningrunaway": "isReasoningRunaway()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43898 | neighbors=[main.js, assertNotReasoningOnly(), normalizeFinishReason()]
- "karpathywiki_main_issourceownpagelemma": "isSourceOwnPageLemma()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73645 | neighbors=[main.js, slugKeys(), mergePage()]
- "karpathywiki_main_isspancontextvalid": "isSpanContextValid()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22248 | neighbors=[main.js, isValidSpanId(), isValidTraceId()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-032.json

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
