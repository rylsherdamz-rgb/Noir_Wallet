# Node Description Batch 44 of 84

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

- "karpathywiki_main_converttoopenaicompatiblechatmessages": "convertToOpenAICompatibleChatMessages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L50551 | neighbors=[main.js, getOpenAIMetadata()]
- "karpathywiki_main_copybedrockusercode": "copyBedrockUserCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86473 | neighbors=[main.js, bedrockAuthError()]
- "karpathywiki_main_copycodexdevicecode": "copyCodexDeviceCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86384 | neighbors=[main.js, copyOpenAICodexDeviceCode()]
- "karpathywiki_main_correctlinkpollution": "correctLinkPollution()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66062 | neighbors=[main.js, fillEmptyPage()]
- "karpathywiki_main_counttotaldegree": "countTotalDegree()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82525 | neighbors=[main.js, detectHubs()]
- "karpathywiki_main_countunescapedquotes": "countUnescapedQuotes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53189 | neighbors=[main.js, closeUnterminatedLines()]
- "karpathywiki_main_createasynciterablestream": "createAsyncIterableStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27036 | neighbors=[main.js, readUIMessageStream()]
- "karpathywiki_main_createcontextkey": "createContextKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22000 | neighbors=[main.js, "node_modules/@opentelemetry/api/build/…]
- "karpathywiki_main_createdownload": "createDownload()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29199 | neighbors=[main.js, "node_modules/ai/dist/index.mjs"()]
- "karpathywiki_main_createemptyaccumulation": "createEmptyAccumulation()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70133 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_createidmap": "createIdMap()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26315 | neighbors=[main.js, createStreamingUIMessageState()]
- "karpathywiki_main_createloopbackserver": "createLoopbackServer()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65020 | neighbors=[main.js, productionServerFactory()]
- "karpathywiki_main_createopenaicompatible": "createOpenAICompatible()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L50952 | neighbors=[main.js, withoutTrailingSlash()]
- "karpathywiki_main_createresolvablepromise": "createResolvablePromise()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27113 | neighbors=[main.js, createStitchableStream()]
- "karpathywiki_main_createsigv4signingfetch": "createSigV4SigningFetch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54969 | neighbors=[main.js, createBedrockClient()]
- "karpathywiki_main_createstitchablestream": "createStitchableStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27126 | neighbors=[main.js, createResolvablePromise()]
- "karpathywiki_main_createtextstreamresponse": "createTextStreamResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26215 | neighbors=[main.js, prepareHeaders()]
- "karpathywiki_main_createuimessagestream": "createUIMessageStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27644 | neighbors=[main.js, handleUIMessageStreamFinish()]
- "karpathywiki_main_createzodenum": "createZodEnum()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L13129 | neighbors=[main.js, processCreateParams()]
- "karpathywiki_main_cuid22": "cuid22()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11225 | neighbors=[main.js, _cuid2()]
- "karpathywiki_main_cuid3": "cuid3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11222 | neighbors=[main.js, _cuid()]
- "karpathywiki_main_custom": "_custom()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9845 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_custom2": "custom2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L13141 | neighbors=[main.js, superRefine()]
- "karpathywiki_main_customprovider": "customProvider()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30296 | neighbors=[main.js, asProviderV3()]
- "karpathywiki_main_date2": "date2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11104 | neighbors=[main.js, _isoDate()]
- "karpathywiki_main_date3": "date3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11315 | neighbors=[main.js, _date()]
- "karpathywiki_main_date4": "date4()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12195 | neighbors=[main.js, _coercedDate()]
- "karpathywiki_main_datetime": "datetime()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1552 | neighbors=[main.js, timeSource()]
- "karpathywiki_main_datetime2": "datetime2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11101 | neighbors=[main.js, _isoDateTime()]
- "karpathywiki_main_datetimeregex": "datetimeRegex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L13008 | neighbors=[main.js, timeRegexSource()]
- "karpathywiki_main_decide": "decide()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79160 | neighbors=[main.js, close()]
- "karpathywiki_main_decideonboardingaction": "decideOnboardingAction()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80422 | neighbors=[main.js, ensureWelcomeNote()]
- "karpathywiki_main_decideprogressdisplay": "decideProgressDisplay()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66300 | neighbors=[main.js, showProgressFor()]
- "karpathywiki_main_decodebase64url": "decodeBase64Url()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64678 | neighbors=[main.js, tokenClaims()]
- "karpathywiki_main_dedupandsort": "dedupAndSort()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70408 | neighbors=[main.js, formatMentionsSection()]
- "karpathywiki_main_dedupstrings": "dedupStrings()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70100 | neighbors=[main.js, mergeMentionsFields()]
- "karpathywiki_main_defaultseverityforkind": "defaultSeverityForKind()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85101 | neighbors=[main.js, parseSectionItem()]
- "karpathywiki_main_deltachip": "deltaChip()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85156 | neighbors=[main.js, renderCriticalKpiCards()]
- "karpathywiki_main_derivebaseurlfrommodelsurl": "deriveBaseUrlFromModelsUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43839 | neighbors=[main.js, fetchModelsWithFallback()]
- "karpathywiki_main_describedemotion": "describeDemotion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73429 | neighbors=[main.js, mergePage()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-043.json

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
