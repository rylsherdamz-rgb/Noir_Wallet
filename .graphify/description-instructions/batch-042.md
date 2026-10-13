# Node Description Batch 43 of 84

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

- "karpathywiki_main_buildsourceanalysis": "buildSourceAnalysis()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70208 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_buildstubidentityresolver": "buildStubIdentityResolver()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69498 | neighbors=[main.js, ingestSource()]
- "karpathywiki_main_buildusertext": "buildUserText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68948 | neighbors=[main.js, convertPdfToMarkdown()]
- "karpathywiki_main_buildwikilanguagedirective": "buildWikiLanguageDirective()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69625 | neighbors=[main.js, buildSystemPrompt()]
- "karpathywiki_main_bytestobase64": "bytesToBase64()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68939 | neighbors=[main.js, convertPdfToMarkdown()]
- "karpathywiki_main_cached": "cached()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L827 | neighbors=[main.js, "node_modules/zod/v4/core/util.js"()]
- "karpathywiki_main_cachekeyof": "cacheKeyOf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65569 | neighbors=[main.js, getCredentials()]
- "karpathywiki_main_calculatebatchlimits": "calculateBatchLimits()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71851 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_calculatebatchstats": "calculateBatchStats()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70247 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_cancelingestion": "cancelIngestion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75594 | neighbors=[main.js, getText()]
- "karpathywiki_main_cancellint": "cancelLint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75613 | neighbors=[main.js, getText()]
- "karpathywiki_main_canonical": "canonical()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52705 | neighbors=[main.js, normalizeNode()]
- "karpathywiki_main_canonicaljson": "canonicalJSON()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24522 | neighbors=[main.js, hashInput()]
- "karpathywiki_main_capturethinkingblocks": "captureThinkingBlocks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53072 | neighbors=[main.js, parseJsonResult()]
- "karpathywiki_main_check": "check()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11542 | neighbors=[main.js, superRefine()]
- "karpathywiki_main_checkcontentrequirements": "checkContentRequirements()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68972 | neighbors=[main.js, checkRequirements()]
- "karpathywiki_main_checkcumulativelimits": "checkCumulativeLimits()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71923 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_checkemptybatch": "checkEmptyBatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71943 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_checknonempty": "checkNonEmpty()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68962 | neighbors=[main.js, isBlankSource()]
- "karpathywiki_main_cidrv42": "cidrv42()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11243 | neighbors=[main.js, _cidrv4()]
- "karpathywiki_main_cidrv62": "cidrv62()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11246 | neighbors=[main.js, _cidrv6()]
- "karpathywiki_main_classifyminerufailure": "classifyMineruFailure()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68851 | neighbors=[main.js, waitForResult()]
- "karpathywiki_main_classifyoperation": "classifyOperation()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84795 | neighbors=[main.js, parseLogEntries()]
- "karpathywiki_main_classifysectionkind": "classifySectionKind()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85057 | neighbors=[main.js, buildEntry()]
- "karpathywiki_main_classifytiers": "classifyTiers()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83571 | neighbors=[main.js, runDedupPhase()]
- "karpathywiki_main_cleanincompletepages": "cleanIncompletePages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68022 | neighbors=[main.js, runStartupCheck()]
- "karpathywiki_main_clearcustominstructions": "clearCustomInstructions()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78976 | neighbors=[main.js, saveSettings()]
- "karpathywiki_main_cleariamkeys": "clearIamKeys()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65601 | neighbors=[main.js, clear()]
- "karpathywiki_main_clearperiodiclint": "clearPeriodicLint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81021 | neighbors=[main.js, stop()]
- "karpathywiki_main_closemismatchedbrackets": "closeMismatchedBrackets()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53200 | neighbors=[main.js, repairKnownDefects()]
- "karpathywiki_main_coercetoarray": "coerceToArray()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69050 | neighbors=[main.js, normalizeBatchResponse()]
- "karpathywiki_main_collectcheckedfiles": "collectCheckedFiles()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79923 | neighbors=[main.js, findFileByPath()]
- "karpathywiki_main_commitsettingsmigrationv1_25_3": "commitSettingsMigrationV1_25_3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65846 | neighbors=[main.js, loadSettings()]
- "karpathywiki_main_composestatusbarupdate": "composeStatusBarUpdate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84774 | neighbors=[main.js, buildIngestStatusBarText()]
- "karpathywiki_main_computeglobalinsight": "computeGlobalInsight()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85327 | neighbors=[main.js, renderHistoryEntries()]
- "karpathywiki_main_computeverifybatch": "computeVerifyBatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83585 | neighbors=[main.js, runDedupPhase()]
- "karpathywiki_main_contextaround": "contextAround()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70662 | neighbors=[main.js, fixDeadLink()]
- "karpathywiki_main_contextkeywords": "contextKeywords()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70623 | neighbors=[main.js, selectCandidateWindow()]
- "karpathywiki_main_contextualizeerror": "contextualizeError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73470 | neighbors=[main.js, createNewPage()]
- "karpathywiki_main_convertdatacontenttobase64string": "convertDataContentToBase64String()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23142 | neighbors=[main.js, convertUint8ArrayToBase64()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-042.json

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
