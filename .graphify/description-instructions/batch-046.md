# Node Description Batch 47 of 84

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

- "karpathywiki_main_geturlstring": "getUrlString()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L44888 | neighbors=[main.js, convertToAnthropicMessagesPrompt()]
- "karpathywiki_main_groupintoblocks": "groupIntoBlocks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L45710 | neighbors=[main.js, convertToAnthropicMessagesPrompt()]
- "karpathywiki_main_guid2": "guid2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11198 | neighbors=[main.js, _guid()]
- "karpathywiki_main_handlearrayresult": "handleArrayResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2279 | neighbors=[main.js, prefixIssues()]
- "karpathywiki_main_handlecheckpropertyresult": "handleCheckPropertyResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1616 | neighbors=[main.js, prefixIssues()]
- "karpathywiki_main_handlemapresult": "handleMapResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2390 | neighbors=[main.js, prefixIssues()]
- "karpathywiki_main_handleobjectresult": "handleObjectResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2285 | neighbors=[main.js, prefixIssues()]
- "karpathywiki_main_handleoptionalobjectresult": "handleOptionalObjectResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2291 | neighbors=[main.js, prefixIssues()]
- "karpathywiki_main_handlepiperesult": "handlePipeResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2443 | neighbors=[main.js, aborted()]
- "karpathywiki_main_handlerefineresult": "handleRefineResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2453 | neighbors=[main.js, issue()]
- "karpathywiki_main_handletupleresult": "handleTupleResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L2384 | neighbors=[main.js, prefixIssues()]
- "karpathywiki_main_haskey": "hasKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87528 | neighbors=[main.js, load()]
- "karpathywiki_main_hasnonemptyaliases": "hasNonEmptyAliases()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82686 | neighbors=[main.js, detectAliasDeficiency()]
- "karpathywiki_main_hassourcefileschanged": "hasSourceFilesChanged()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81047 | neighbors=[main.js, runLint()]
- "karpathywiki_main_hasv1segment": "hasV1Segment()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43727 | neighbors=[main.js, generateUrlCandidates()]
- "karpathywiki_main_hextobytes": "hexToBytes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68127 | neighbors=[main.js, extractHexString()]
- "karpathywiki_main_includes": "_includes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9615 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_inflatesync": "inflateSync()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68523 | neighbors=[main.js, unzipSync()]
- "karpathywiki_main_initializellmclientaftermodules": "initializeLLMClientAfterModules()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88422 | neighbors=[main.js, onload()]
- "karpathywiki_main_injectadvancedsettings": "injectAdvancedSettings()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55276 | neighbors=[main.js, capMaxTokens()]
- "karpathywiki_main_instanceof": "_instanceof()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11577 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_int": "_int()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9351 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_int32": "_int32()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9378 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_int64": "_int64()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9422 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_invalidatecache": "invalidateCache()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80195 | neighbors=[main.js, updateSettings()]
- "karpathywiki_main_invokemodelmaximagespercall": "invokeModelMaxImagesPerCall()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28687 | neighbors=[main.js, generateImage()]
- "karpathywiki_main_invokemodelmaxvideospercall": "invokeModelMaxVideosPerCall()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29825 | neighbors=[main.js, experimental_generateVideo()]
- "karpathywiki_main_ipv42": "ipv42()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11237 | neighbors=[main.js, _ipv4()]
- "karpathywiki_main_ipv62": "ipv62()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11240 | neighbors=[main.js, _ipv6()]
- "karpathywiki_main_isapprovalneeded": "isApprovalNeeded()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24504 | neighbors=[main.js, validateApprovedToolApprovals()]
- "karpathywiki_main_isasynciterable": "isAsyncIterable()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18534 | neighbors=[main.js, executeTool()]
- "karpathywiki_main_isbrowserruntime": "isBrowserRuntime()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L16890 | neighbors=[main.js, fetchWithValidatedRedirects()]
- "karpathywiki_main_isbunnetworkerror": "isBunNetworkError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17167 | neighbors=[main.js, handleFetchError()]
- "karpathywiki_main_isdatauipart": "isDataUIPart()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26318 | neighbors=[main.js, convertToModelMessages()]
- "karpathywiki_main_isencryptedpdftext": "isEncryptedPdfText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68062 | neighbors=[main.js, convertPdfToMarkdown()]
- "karpathywiki_main_isfileuipart": "isFileUIPart()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26324 | neighbors=[main.js, convertToModelMessages()]
- "karpathywiki_main_isglossspan": "isGlossSpan()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69302 | neighbors=[main.js, classifyCandidate()]
- "karpathywiki_main_isgraphmature": "isGraphMature()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77042 | neighbors=[main.js, pprCascade()]
- "karpathywiki_main_ishttperrorstatuscode": "isHttpErrorStatusCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36423 | neighbors=[main.js, getStatusCode()]
- "karpathywiki_main_isinwikicontentfolder": "isInWikiContentFolder()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75557 | neighbors=[main.js, createOrUpdateFile()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-046.json

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
