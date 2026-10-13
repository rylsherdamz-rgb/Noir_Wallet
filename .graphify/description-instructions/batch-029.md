# Node Description Batch 30 of 84

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

- "karpathywiki_main_aslanguagemodelv3": "asLanguageModelV3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22830 | neighbors=[main.js, logV2CompatibilityWarning(), resolveLanguageModel()]
- "karpathywiki_main_asproviderv3": "asProviderV3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30255 | neighbors=[main.js, customProvider(), wrapProvider()]
- "karpathywiki_main_assertcryptosubtle": "assertCryptoSubtle()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54857 | neighbors=[main.js, hashSha256Hex(), hmacSha256()]
- "karpathywiki_main_asspeechmodelv3": "asSpeechModelV3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22907 | neighbors=[main.js, logV2CompatibilityWarning(), resolveSpeechModel()]
- "karpathywiki_main_astranscriptionmodelv3": "asTranscriptionModelV3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22923 | neighbors=[main.js, logV2CompatibilityWarning(), resolveTranscriptionModel()]
- "karpathywiki_main_base64": "_base64()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9264 | neighbors=[main.js, normalizeParams(), base642()]
- "karpathywiki_main_base64url": "_base64url()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9273 | neighbors=[main.js, normalizeParams(), base64url2()]
- "karpathywiki_main_bedrockautherror": "bedrockAuthError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87852 | neighbors=[main.js, getText(), copyBedrockUserCode()]
- "karpathywiki_main_begindevicelogin": "beginDeviceLogin()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65610 | neighbors=[main.js, registerClient(), startDeviceAuthorization()]
- "karpathywiki_main_bigint": "_bigint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9409 | neighbors=[main.js, normalizeParams(), bigint2()]
- "karpathywiki_main_bindmodelcatalog": "bindModelCatalog()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65777 | neighbors=[main.js, load(), refreshOpenAICodexModels()]
- "karpathywiki_main_boolean": "_boolean()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9396 | neighbors=[main.js, normalizeParams(), boolean2()]
- "karpathywiki_main_buildbullets": "buildBullets()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70423 | neighbors=[main.js, renderCitation(), formatMentionsSection()]
- "karpathywiki_main_buildcontradictionrecord": "buildContradictionRecord()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73325 | neighbors=[main.js, slugify(), writeContradictionRecords()]
- "karpathywiki_main_builddefaultschemabody": "buildDefaultSchemaBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80067 | neighbors=[main.js, ensureSchemaExists(), regenerateDefaultSchema()]
- "karpathywiki_main_buildfoldertree": "buildFolderTree()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79413 | neighbors=[main.js, sortNode(), onOpen()]
- "karpathywiki_main_buildgraphfromcontent": "buildGraphFromContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74958 | neighbors=[main.js, getOrBuild(), runLintWiki()]
- "karpathywiki_main_buildnewinfosummary": "buildNewInfoSummary()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73660 | neighbors=[main.js, firstQuotesForPrompt(), classifyMergeNeed()]
- "karpathywiki_main_buildnoteexcerpt": "buildNoteExcerpt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73512 | neighbors=[main.js, appendToReviewedPage(), mergePage()]
- "karpathywiki_main_buildoutputargs": "buildOutputArgs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52814 | neighbors=[main.js, object(), strictSchemaFor()]
- "karpathywiki_main_buildpayload": "buildPayload()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24562 | neighbors=[main.js, signToolApproval(), verifyToolApprovalSignature()]
- "karpathywiki_main_buildsectionlabelshint": "buildSectionLabelsHint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69989 | neighbors=[main.js, getSectionLabels(), fillEmptyPage()]
- "karpathywiki_main_buildstubcontent": "buildStubContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70843 | neighbors=[main.js, localDateStamp(), fixDeadLink()]
- "karpathywiki_main_bytestohex": "bytesToHex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54653 | neighbors=[main.js, hashCacheKey(), sha256Bytes()]
- "karpathywiki_main_cacheresolvedurl": "cacheResolvedUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43734 | neighbors=[main.js, fetchModelsWithFallback(), resolveBaseUrlWithFallback()]
- "karpathywiki_main_cancellogin": "cancelLogin()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65262 | neighbors=[main.js, dispose(), signOut()]
- "karpathywiki_main_canonicalsectionblocks": "canonicalSectionBlocks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71282 | neighbors=[main.js, sectionIdentityKey(), preserveExistingSections()]
- "karpathywiki_main_cascadeunifiedmodelchange": "cascadeUnifiedModelChange()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87989 | neighbors=[main.js, setUseCustomFlag(), setFieldValue()]
- "karpathywiki_main_chooselinkpath": "chooseLinkpath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71433 | neighbors=[main.js, addressableForms(), retargetLinksToPage()]
- "karpathywiki_main_chunklength": "chunkLength()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69327 | neighbors=[main.js, classifyCandidate(), isEnumerationChunk()]
- "karpathywiki_main_cidrv4": "_cidrv4()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9246 | neighbors=[main.js, normalizeParams(), cidrv42()]
- "karpathywiki_main_cidrv6": "_cidrv6()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9255 | neighbors=[main.js, normalizeParams(), cidrv62()]
- "karpathywiki_main_classifyheader": "classifyHeader()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71260 | neighbors=[main.js, snapHeaderToCanonical(), sectionIdentityKey()]
- "karpathywiki_main_cleanwikiindex": "cleanWikiIndex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66055 | neighbors=[main.js, fillEmptyPage(), linkOrphanPage()]
- "karpathywiki_main_cleardebounce": "clearDebounce()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80994 | neighbors=[main.js, stop(), stopWatching()]
- "karpathywiki_main_clearhistory": "clearHistory()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78942 | neighbors=[main.js, now(), saveSettings()]
- "karpathywiki_main_close": "close()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64989 | neighbors=[main.js, decide(), runLoopbackLogin()]
- "karpathywiki_main_closeunterminatedlines": "closeUnterminatedLines()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53178 | neighbors=[main.js, countUnescapedQuotes(), repairKnownDefects()]
- "karpathywiki_main_coercedbigint": "_coercedBigint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9415 | neighbors=[main.js, bigint3(), normalizeParams()]
- "karpathywiki_main_coercedboolean": "_coercedBoolean()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9402 | neighbors=[main.js, boolean3(), normalizeParams()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-029.json

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
