# Node Description Batch 45 of 84

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

- "karpathywiki_main_detectconvergence": "detectConvergence()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71897 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_detectpollutedpages": "detectPollutedPages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70057 | neighbors=[main.js, runProgrammaticPhase()]
- "karpathywiki_main_detectstalewikifolders": "detectStaleWikiFolders()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66122 | neighbors=[main.js, checkQueryHistoryForStaleFolders()]
- "karpathywiki_main_discriminatedunion": "_discriminatedUnion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9689 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_downloadassets": "downloadAssets()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23413 | neighbors=[main.js, convertToLanguageModelPrompt()]
- "karpathywiki_main_dropsourcesfield": "dropSourcesField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74382 | neighbors=[main.js, createNewPage()]
- "karpathywiki_main_duration2": "duration2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11110 | neighbors=[main.js, _isoDuration()]
- "karpathywiki_main_e1642": "e1642()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11255 | neighbors=[main.js, _e164()]
- "karpathywiki_main_el": "el()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78151 | neighbors=[main.js, renderCustomInstructionsPanel()]
- "karpathywiki_main_email2": "email2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11195 | neighbors=[main.js, _email()]
- "karpathywiki_main_emoji": "emoji()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1541 | neighbors=[main.js, parseStringDef()]
- "karpathywiki_main_emoji2": "_emoji2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9165 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_emptybatch": "emptyBatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72072 | neighbors=[main.js, normalizeBatchResponse()]
- "karpathywiki_main_emptywikihint": "emptyWikiHint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78105 | neighbors=[main.js, buildWikiContext()]
- "karpathywiki_main_en_default": "en_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L4729 | neighbors=[main.js, "node_modules/zod/v4/classic/external.j…]
- "karpathywiki_main_endingestion": "endIngestion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75798 | neighbors=[main.js, ingestSource()]
- "karpathywiki_main_endswith": "_endsWith()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9631 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_enum": "_enum()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9738 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_enum2": "_enum2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11422 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_errortostring": "errorToString()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75420 | neighbors=[main.js, inspectCauseChain()]
- "karpathywiki_main_escapelatexinmath": "escapeLatexInMath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53156 | neighbors=[main.js, parseJsonResult()]
- "karpathywiki_main_escapenonalphanumeric": "escapeNonAlphaNumeric()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17693 | neighbors=[main.js, escapeLiteralCheckValue()]
- "karpathywiki_main_escaperegex3": "escapeRegex3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77942 | neighbors=[main.js, findSectionHeader()]
- "karpathywiki_main_exceedscustomcap": "exceedsCustomCap()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72524 | neighbors=[main.js, ensureSourceLemma()]
- "karpathywiki_main_executetool": "executeTool()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18537 | neighbors=[main.js, isAsyncIterable()]
- "karpathywiki_main_extractbodyfromfull": "extractBodyFromFull()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79987 | neighbors=[main.js, parseSchemaSuggestion()]
- "karpathywiki_main_extractpagecount": "extractPageCount()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68145 | neighbors=[main.js, parsePdfInfoDictText()]
- "karpathywiki_main_extractprovidermessage": "extractProviderMessage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L44099 | neighbors=[main.js, mapAiSdkError()]
- "karpathywiki_main_extractsourcebody": "extractSourceBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82786 | neighbors=[main.js, scanQuoteGrounding()]
- "karpathywiki_main_extracttranslatedfield": "extractTranslatedField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80677 | neighbors=[main.js, localizeWelcomeNote()]
- "karpathywiki_main_file": "_file()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9760 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_filterseedstograph": "filterSeedsToGraph()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77086 | neighbors=[main.js, pprCascade()]
- "karpathywiki_main_finalizeissue": "finalizeIssue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1149 | neighbors=[main.js, unwrapMessage()]
- "karpathywiki_main_findfileinnode": "findFileInNode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79939 | neighbors=[main.js, findFileByPath()]
- "karpathywiki_main_findh1": "findH1()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71370 | neighbors=[main.js, reassertH1()]
- "karpathywiki_main_findrepetitionloop": "findRepetitionLoop()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71997 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_findsectionend": "findSectionEnd()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77956 | neighbors=[main.js, extractSummaryFromPage()]
- "karpathywiki_main_fixjson": "fixJson()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24679 | neighbors=[main.js, parsePartialJson()]
- "karpathywiki_main_flashduplicate": "flashDuplicate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87109 | neighbors=[main.js, addTag()]
- "karpathywiki_main_float32": "_float32()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9360 | neighbors=[main.js, normalizeParams()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-044.json

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
