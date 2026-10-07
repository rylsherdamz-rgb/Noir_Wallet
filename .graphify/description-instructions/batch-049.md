# Node Description Batch 50 of 84

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

- "karpathywiki_main_node_modules_zod_v4_core_schemas_js": "\"node_modules/zod/v4/core/schemas.js\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2473 | neighbors=[main.js, $constructor()]
- "karpathywiki_main_node_modules_zod_v4_core_util_js": "\"node_modules/zod/v4/core/util.js\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1198 | neighbors=[main.js, cached()]
- "karpathywiki_main_nonnegative": "_nonnegative()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9540 | neighbors=[main.js, _gte()]
- "karpathywiki_main_nonoptional": "_nonoptional()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9793 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_nonpositive": "_nonpositive()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9537 | neighbors=[main.js, _lte()]
- "karpathywiki_main_normalize": "_normalize()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9660 | neighbors=[main.js, _overwrite()]
- "karpathywiki_main_normalizecodexrequest": "normalizeCodexRequest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54166 | neighbors=[main.js, normalizeResponsesBody()]
- "karpathywiki_main_normalizefrontmatterdates": "normalizeFrontmatterDates()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70021 | neighbors=[main.js, fillEmptyPage()]
- "karpathywiki_main_normalizeheaders": "normalizeHeaders()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17225 | neighbors=[main.js, withUserAgentSuffix()]
- "karpathywiki_main_normalizeheadingspacing": "normalizeHeadingSpacing()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67259 | neighbors=[main.js, createOrUpdateFile()]
- "karpathywiki_main_normalizekeywords": "normalizeKeywords()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77797 | neighbors=[main.js, generateKeywordsWithTypedOutput()]
- "karpathywiki_main_normalizeorphanpagepath": "normalizeOrphanPagePath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71141 | neighbors=[main.js, linkOrphanPage()]
- "karpathywiki_main_normalizeprompt": "normalizePrompt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28696 | neighbors=[main.js, toImageModelV3File()]
- "karpathywiki_main_normalizeprovenancemarkers": "normalizeProvenanceMarkers()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68998 | neighbors=[main.js, createOrUpdateFile()]
- "karpathywiki_main_normalizereferencedata": "normalizeReferenceData()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29807 | neighbors=[main.js, normalizeImageData()]
- "karpathywiki_main_normalizeresponsesbody": "normalizeResponsesBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54151 | neighbors=[main.js, normalizeCodexRequest()]
- "karpathywiki_main_normalizesource": "normalizeSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73320 | neighbors=[main.js, appendContradictedByMarker()]
- "karpathywiki_main_normalizestrictjsonschema": "normalizeStrictJsonSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52753 | neighbors=[main.js, normalizeNode()]
- "karpathywiki_main_normalizeusage": "normalizeUsage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43876 | neighbors=[main.js, reportFinish()]
- "karpathywiki_main_normalizevocabularycsv": "normalizeVocabularyCsv()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66034 | neighbors=[main.js, cleanupVocabularyTags()]
- "karpathywiki_main_normalizewikilinkcontent": "normalizeWikiLinkContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66107 | neighbors=[main.js, extractThinkingPanel()]
- "karpathywiki_main_notifyprogress": "notifyProgress()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75546 | neighbors=[main.js, updateStatusBar()]
- "karpathywiki_main_null3": "_null3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11300 | neighbors=[main.js, _null2()]
- "karpathywiki_main_number2": "number2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11264 | neighbors=[main.js, _number()]
- "karpathywiki_main_number3": "number3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12186 | neighbors=[main.js, _coercedNumber()]
- "karpathywiki_main_omit": "omit()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1024 | neighbors=[main.js, clone()]
- "karpathywiki_main_opencodexexternalurl": "openCodexExternalUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86381 | neighbors=[main.js, openExternal()]
- "karpathywiki_main_pad2": "pad2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54886 | neighbors=[main.js, formatAmzDate()]
- "karpathywiki_main_parse2": "_parse2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17329 | neighbors=[main.js, secureJsonParse()]
- "karpathywiki_main_parseandvalidateobjectresultwithrepair": "parseAndValidateObjectResultWithRepair()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28789 | neighbors=[main.js, parseAndValidateObjectResult()]
- "karpathywiki_main_parsearraydef": "parseArrayDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17411 | neighbors=[main.js, parseDef()]
- "karpathywiki_main_parseauthmethod": "parseAuthMethod()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L19636 | neighbors=[main.js, safeValidateTypes()]
- "karpathywiki_main_parseconfigfile": "parseConfigFile()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80359 | neighbors=[main.js, loadSchema()]
- "karpathywiki_main_parsecountfromheading": "parseCountFromHeading()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85067 | neighbors=[main.js, buildEntry()]
- "karpathywiki_main_parsedefaultdef": "parseDefaultDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17492 | neighbors=[main.js, parseDef()]
- "karpathywiki_main_parseindexforpages": "parseIndexForPages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70571 | neighbors=[main.js, readWikiIndex()]
- "karpathywiki_main_parseingestmetrics": "parseIngestMetrics()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85117 | neighbors=[main.js, parseLogEntries()]
- "karpathywiki_main_parseintersectiondef": "parseIntersectionDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17507 | neighbors=[main.js, parseDef()]
- "karpathywiki_main_parseipv6": "parseIPv6()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L16968 | neighbors=[main.js, isPrivateIPv6()]
- "karpathywiki_main_parsejsoneventstream": "parseJsonEventStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18356 | neighbors=[main.js, callCompletionApi()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-049.json

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
