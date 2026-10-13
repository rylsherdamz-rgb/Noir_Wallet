# Node Description Batch 48 of 84

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

- "karpathywiki_main_isipv4": "isIPv4()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L16945 | neighbors=[main.js, validateDownloadUrl()]
- "karpathywiki_main_isjsonwhitespace": "isJsonWhitespace()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53153 | neighbors=[main.js, escapeContentQuotes()]
- "karpathywiki_main_islistsection": "isListSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73478 | neighbors=[main.js, applyComplementaryAppends()]
- "karpathywiki_main_islocalbaseurl": "isLocalBaseURL()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L306 | neighbors=[main.js, streamWithFallback()]
- "karpathywiki_main_ismodelnotfound404": "isModelNotFound404()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43748 | neighbors=[main.js, isUrlError()]
- "karpathywiki_main_isnonemptyobject": "isNonEmptyObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23696 | neighbors=[main.js, prepareToolsAndToolChoice()]
- "karpathywiki_main_isobject": "isObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L911 | neighbors=[main.js, isPlainObject()]
- "karpathywiki_main_isoldformatlogheader": "isOldFormatLogHeader()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75250 | neighbors=[main.js, needsLogHeaderMigration()]
- "karpathywiki_main_isopenaichatcompletionchunk": "isOpenAIChatCompletionChunk()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L38076 | neighbors=[main.js, asRecord2()]
- "karpathywiki_main_ispdfrelatedllmerror": "isPdfRelatedLlmError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75842 | neighbors=[main.js, ingestConversionSource()]
- "karpathywiki_main_isplaceholderjsontext": "isPlaceholderJsonText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52860 | neighbors=[main.js, isPlaceholderObject()]
- "karpathywiki_main_isplainobject2": "isPlainObject2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L45912 | neighbors=[main.js, sanitizeDefinition()]
- "karpathywiki_main_isreasoninguipart": "isReasoningUIPart()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26327 | neighbors=[main.js, convertToModelMessages()]
- "karpathywiki_main_isschema": "isSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18196 | neighbors=[main.js, asSchema()]
- "karpathywiki_main_issourceborneloop": "isSourceBorneLoop()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72013 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_isstatictooluipart": "isStaticToolUIPart()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26330 | neighbors=[main.js, isToolUIPart()]
- "karpathywiki_main_isstructured": "isStructured()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70405 | neighbors=[main.js, formatMentionsSection()]
- "karpathywiki_main_issue": "issue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1179 | neighbors=[main.js, handleRefineResult()]
- "karpathywiki_main_istextuipart": "isTextUIPart()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26321 | neighbors=[main.js, convertToModelMessages()]
- "karpathywiki_main_istimeouterror": "isTimeoutError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L19587 | neighbors=[main.js, asGatewayError()]
- "karpathywiki_main_isurlerror": "isUrlError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43737 | neighbors=[main.js, isModelNotFound404()]
- "karpathywiki_main_isurlstring": "isUrlString()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L44885 | neighbors=[main.js, isUrlData()]
- "karpathywiki_main_isvalidbase64": "isValidBase64()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2240 | neighbors=[main.js, isValidBase64URL()]
- "karpathywiki_main_isvalidbase64url": "isValidBase64URL()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2252 | neighbors=[main.js, isValidBase64()]
- "karpathywiki_main_iszod4schema": "isZod4Schema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18273 | neighbors=[main.js, zodSchema()]
- "karpathywiki_main_jwt": "_jwt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9291 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_ksuid2": "ksuid2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11234 | neighbors=[main.js, _ksuid()]
- "karpathywiki_main_length": "_length()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9586 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_levenshtein": "levenshtein()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71225 | neighbors=[main.js, snapHeaderToCanonical()]
- "karpathywiki_main_lexisreliable": "lexIsReliable()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77006 | neighbors=[main.js, selectPprSeeds()]
- "karpathywiki_main_lexscoreof": "lexScoreOf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77154 | neighbors=[main.js, mergeWithPPR()]
- "karpathywiki_main_lineat": "lineAt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69309 | neighbors=[main.js, classifyCandidate()]
- "karpathywiki_main_linktarget": "linkTarget()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70289 | neighbors=[main.js, parseMentionsSection()]
- "karpathywiki_main_literal": "_literal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9753 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_llmseverityfor": "llmSeverityFor()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85146 | neighbors=[main.js, parseSectionItem()]
- "karpathywiki_main_loadrelevantpages": "loadRelevantPages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79071 | neighbors=[main.js, loadRelevantPagesForQuery()]
- "karpathywiki_main_localkeywordmatch": "localKeywordMatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70586 | neighbors=[main.js, selectCandidateWindow()]
- "karpathywiki_main_logcustominstructionsinjectioncontext": "logCustomInstructionsInjectionContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78135 | neighbors=[main.js, sendMessage()]
- "karpathywiki_main_logproxy": "logProxy()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L21850 | neighbors=[main.js, getGlobal()]
- "karpathywiki_main_lowercase": "_lowercase()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9601 | neighbors=[main.js, normalizeParams()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-047.json

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
