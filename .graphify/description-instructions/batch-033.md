# Node Description Batch 34 of 84

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

- "karpathywiki_main_isstubpage": "isStubPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69534 | neighbors=[main.js, deleteEmptyStubs(), mergePage()]
- "karpathywiki_main_isurldata": "isUrlData()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L44882 | neighbors=[main.js, convertToAnthropicMessagesPrompt(), isUrlString()]
- "karpathywiki_main_isvalidhex": "isValidHex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22233 | neighbors=[main.js, isValidSpanId(), isValidTraceId()]
- "karpathywiki_main_isvalidspanid": "isValidSpanId()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22245 | neighbors=[main.js, isSpanContextValid(), isValidHex()]
- "karpathywiki_main_isvalidtraceid": "isValidTraceId()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22242 | neighbors=[main.js, isSpanContextValid(), isValidHex()]
- "karpathywiki_main_iswatched": "isWatched()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80884 | neighbors=[main.js, onFileChanged(), watchWrite()]
- "karpathywiki_main_iswikiinitialized": "isWikiInitialized()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81561 | neighbors=[main.js, renderStatusSection(), testLLMConnection()]
- "karpathywiki_main_keptentries": "keptEntries()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72700 | neighbors=[main.js, findSection2(), renderRelatedSections()]
- "karpathywiki_main_ksuid": "_ksuid()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9219 | neighbors=[main.js, normalizeParams(), ksuid2()]
- "karpathywiki_main_layoutof": "layoutOf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73178 | neighbors=[main.js, sectionIdentityKey(), preserveSourcedParagraphs()]
- "karpathywiki_main_limithistory": "limitHistory()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78894 | neighbors=[main.js, rebuildTurnIndicator(), sendMessage()]
- "karpathywiki_main_linediff": "lineDiff()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81623 | neighbors=[main.js, splitLines(), recompute()]
- "karpathywiki_main_linkspans": "linkSpans()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69280 | neighbors=[main.js, classifyCandidate(), parenSpans()]
- "karpathywiki_main_loginopenaicodexdevice": "loginOpenAICodexDevice()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87803 | neighbors=[main.js, runCodexDeviceAuth(), syncCodexModelsFromPlugin()]
- "karpathywiki_main_loglintfix": "logLintFix()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76869 | neighbors=[main.js, appendLintFix(), runLintWiki()]
- "karpathywiki_main_looseobject": "looseObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11347 | neighbors=[main.js, normalizeParams(), "node_modules/@ai-sdk/openai-compatible…]
- "karpathywiki_main_lt": "_lt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9499 | neighbors=[main.js, normalizeParams(), _negative()]
- "karpathywiki_main_lte": "_lte()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9507 | neighbors=[main.js, normalizeParams(), _nonpositive()]
- "karpathywiki_main_mapshellenvironment": "mapShellEnvironment()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L38012 | neighbors=[main.js, mapShellSkills(), prepareResponsesTools()]
- "karpathywiki_main_markrecentwrite": "markRecentWrite()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80945 | neighbors=[main.js, processBatch(), watchWrite()]
- "karpathywiki_main_matchextractedtoexisting": "matchExtractedToExisting()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70602 | neighbors=[main.js, analyzeSource(), computeSlug()]
- "karpathywiki_main_mergeabortsignals": "mergeAbortSignals()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L25332 | neighbors=[main.js, generateText(), streamText()]
- "karpathywiki_main_mergevalues": "mergeValues()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2324 | neighbors=[main.js, handleIntersectionResults(), isPlainObject()]
- "karpathywiki_main_mergewithppr": "mergeWithPPR()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77159 | neighbors=[main.js, lexScoreOf(), pprCascade()]
- "karpathywiki_main_migrateapikeytosettings": "migrateApiKeyToSettings()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88399 | neighbors=[main.js, getText(), load()]
- "karpathywiki_main_namekey": "nameKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67398 | neighbors=[main.js, slugKeys(), shapeRelatedLists()]
- "karpathywiki_main_nanoid": "_nanoid()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9174 | neighbors=[main.js, normalizeParams(), nanoid2()]
- "karpathywiki_main_needlehits": "needleHits()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76938 | neighbors=[main.js, lexMatch(), scorePagesByNeedles()]
- "karpathywiki_main_needleof": "needleOf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69246 | neighbors=[main.js, classifyCandidate(), nfc()]
- "karpathywiki_main_node_modules_zod_v4_classic_external_js": "\"node_modules/zod/v4/classic/external.js\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12417 | neighbors=[main.js, config(), en_default()]
- "karpathywiki_main_normalizebaseurl": "normalizeBaseURL()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L46072 | neighbors=[main.js, createAnthropic(), withoutTrailingSlash()]
- "karpathywiki_main_normalizeemptymode": "normalizeEmptyMode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81685 | neighbors=[main.js, $constructor(), setCurrentBody()]
- "karpathywiki_main_normalizefinishreason": "normalizeFinishReason()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43873 | neighbors=[main.js, isReasoningRunaway(), reportFinish()]
- "karpathywiki_main_normalizeformatch": "normalizeForMatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83205 | neighbors=[main.js, partitionPagesMultiBucket(), runBigramCrossLangSignal()]
- "karpathywiki_main_normalizellmpath": "normalizeLLMPath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66087 | neighbors=[main.js, linkOrphanPage(), resolvePagePath()]
- "karpathywiki_main_normalizeprompt2": "normalizePrompt2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29756 | neighbors=[main.js, experimental_generateVideo(), normalizeImageData()]
- "karpathywiki_main_normalizesourcelanguage": "normalizeSourceLanguage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69601 | neighbors=[main.js, analyzeSource(), getSourceLanguage()]
- "karpathywiki_main_normalizesourcepath": "normalizeSourcePath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71713 | neighbors=[main.js, computeSlug(), normalizeSourcesField()]
- "karpathywiki_main_normalizesourcesfield": "normalizeSourcesField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71735 | neighbors=[main.js, fixPollutedSources(), normalizeSourcePath()]
- "karpathywiki_main_null2": "_null2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9452 | neighbors=[main.js, normalizeParams(), _null3()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-033.json

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
