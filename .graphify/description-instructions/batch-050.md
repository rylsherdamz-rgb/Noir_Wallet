# Node Description Batch 51 of 84

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

- "karpathywiki_main_parsekpisummary": "parseKpiSummary()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84811 | neighbors=[main.js, buildEntry()]
- "karpathywiki_main_parseloopbackcallback": "parseLoopbackCallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64921 | neighbors=[main.js, runLoopbackLogin()]
- "karpathywiki_main_parseneverdef": "parseNeverDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17896 | neighbors=[main.js, parseAnyDef()]
- "karpathywiki_main_parsenullabledef": "parseNullableDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17964 | neighbors=[main.js, parseDef()]
- "karpathywiki_main_parsepromisedef": "parsePromiseDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18070 | neighbors=[main.js, parseDef()]
- "karpathywiki_main_parserelatedtargets": "parseRelatedTargets()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82571 | neighbors=[main.js, scanHubLinkDensity()]
- "karpathywiki_main_parsesections": "parseSections()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80224 | neighbors=[main.js, selectSections()]
- "karpathywiki_main_parsesetdef": "parseSetDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18073 | neighbors=[main.js, parseDef()]
- "karpathywiki_main_parsestoredcredential": "parseStoredCredential()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65741 | neighbors=[main.js, load()]
- "karpathywiki_main_parsestoredobject": "parseStoredObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65278 | neighbors=[main.js, load()]
- "karpathywiki_main_parsetupledef": "parseTupleDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18091 | neighbors=[main.js, parseDef()]
- "karpathywiki_main_parseundefineddef": "parseUndefinedDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18127 | neighbors=[main.js, parseAnyDef()]
- "karpathywiki_main_parseunknowndef": "parseUnknownDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18132 | neighbors=[main.js, parseAnyDef()]
- "karpathywiki_main_partial": "partial()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1070 | neighbors=[main.js, clone()]
- "karpathywiki_main_partialrecord": "partialRecord()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11399 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_pick": "pick()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1007 | neighbors=[main.js, clone()]
- "karpathywiki_main_positive": "_positive()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9531 | neighbors=[main.js, _gt()]
- "karpathywiki_main_prefillpertaskfromunified": "prefillPerTaskFromUnified()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88019 | neighbors=[main.js, setUseCustomFlag()]
- "karpathywiki_main_preparefunctiontool": "prepareFunctionTool()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L37998 | neighbors=[main.js, prepareResponsesTools()]
- "karpathywiki_main_prependreasoningforparse": "prependReasoningForParse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43697 | neighbors=[main.js, wrapReasoningContent()]
- "karpathywiki_main_preservecodexruntimemodelstate": "preserveCodexRuntimeModelState()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81442 | neighbors=[main.js, applyCodexModelPolicy()]
- "karpathywiki_main_prettifyerror": "prettifyError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1391 | neighbors=[main.js, toDotPath()]
- "karpathywiki_main_probevaultstate": "probeVaultState()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80796 | neighbors=[main.js, ensureWelcomeNote()]
- "karpathywiki_main_processcreateparams": "processCreateParams()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12971 | neighbors=[main.js, createZodEnum()]
- "karpathywiki_main_processtextstream": "processTextStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30567 | neighbors=[main.js, callCompletionApi()]
- "karpathywiki_main_promiseallobject": "promiseAllObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L889 | neighbors=[main.js, then()]
- "karpathywiki_main_property": "_property()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9639 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_providersupportspdf": "providerSupportsPdf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68934 | neighbors=[main.js, convertPdfToMarkdown()]
- "karpathywiki_main_rankbytagoverlap": "rankByTagOverlap()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72816 | neighbors=[main.js, resolve()]
- "karpathywiki_main_readornull": "readOrNull()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79833 | neighbors=[main.js, scanDiskStates()]
- "karpathywiki_main_readresponsebodyastext": "readResponseBodyAsText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18520 | neighbors=[main.js, readResponseWithSizeLimit()]
- "karpathywiki_main_reasoninglevels": "reasoningLevels()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88246 | neighbors=[main.js, parseEntry()]
- "karpathywiki_main_reasonlabelkey": "reasonLabelKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79325 | neighbors=[main.js, onOpen()]
- "karpathywiki_main_record": "_record()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9715 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_recordtaskusage": "recordTaskUsage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55137 | neighbors=[main.js, withTaskAccounting()]
- "karpathywiki_main_refine": "_refine()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9857 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_regex": "_regex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9593 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_registry": "registry()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9030 | neighbors=[main.js, "node_modules/zod/v4/core/registries.js…]
- "karpathywiki_main_rejectionnoticekey": "rejectionNoticeKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75777 | neighbors=[main.js, reportSkip()]
- "karpathywiki_main_removediffmodalclasses": "removeDiffModalClasses()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81682 | neighbors=[main.js, onClose()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-050.json

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
