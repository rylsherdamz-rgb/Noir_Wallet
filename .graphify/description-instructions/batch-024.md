# Node Description Batch 25 of 84

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

- "karpathywiki_main_renderhistorymessage": "renderHistoryMessage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77385 | neighbors=[main.js, addCopyButton(), renderMarkdownContent(), sendMessage()]
- "karpathywiki_main_renderingestdetails": "renderIngestDetails()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85820 | neighbors=[main.js, renderEntry(), renderIngestMetricCards(), renderPageTypeGroup()]
- "karpathywiki_main_renderlinewithlinks": "renderLineWithLinks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85441 | neighbors=[main.js, renderFixDetails(), createWikiLink(), renderLlmItems()]
- "karpathywiki_main_renderllmanalysissection": "renderLlmAnalysisSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85597 | neighbors=[main.js, renderLlmItems(), renderSectionTitle(), renderReportSection()]
- "karpathywiki_main_rendermaintenancedetails": "renderMaintenanceDetails()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85669 | neighbors=[main.js, renderEntry(), renderCriticalKpiCards(), renderReportSection()]
- "karpathywiki_main_rendernoteexcerptblock": "renderNoteExcerptBlock()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73542 | neighbors=[main.js, appendToReviewedPage(), classifyMergeNeed(), mergePage()]
- "karpathywiki_main_rendernumberinput": "renderNumberInput()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86844 | neighbors=[main.js, renderAdvancedSection(), renderAdvancedSettingsSection(), getTextDynamic()]
- "karpathywiki_main_renderrangeslider": "renderRangeSlider()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86345 | neighbors=[main.js, renderProviderSection(), buildRangeSliderDesc(), then()]
- "karpathywiki_main_renderrightpane": "renderRightPane()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79865 | neighbors=[main.js, onOpen(), getSnapshot(), getText()]
- "karpathywiki_main_rendersection": "renderSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75111 | neighbors=[main.js, generateFlatIndex(), firstBodyLine(), parseAliases()]
- "karpathywiki_main_rendersimplelistsection": "renderSimpleListSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85579 | neighbors=[main.js, renderReportSection(), createWikiLink(), renderSectionTitle()]
- "karpathywiki_main_renderstatussection": "renderStatusSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86303 | neighbors=[main.js, display(), getText(), isWikiInitialized()]
- "karpathywiki_main_rendertagviolationsection": "renderTagViolationSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85560 | neighbors=[main.js, renderReportSection(), createWikiLink(), renderSectionTitle()]
- "karpathywiki_main_rendertreenode": "renderTreeNode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79658 | neighbors=[main.js, buildLeftPane(), getText(), renderFileRow()]
- "karpathywiki_main_renderwikiconfigsection": "renderWikiConfigSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87123 | neighbors=[main.js, display(), getText(), setSettingsVisible()]
- "karpathywiki_main_requestdevicecode": "requestDeviceCode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64882 | neighbors=[main.js, parseDeviceAuthorization(), responseJson(), throwIfAborted2()]
- "karpathywiki_main_requiredstring3": "requiredString3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65356 | neighbors=[main.js, completeDeviceAuthorization2(), registerClient(), startDeviceAuthorization()]
- "karpathywiki_main_resetopenaicodexmodelstate": "resetOpenAICodexModelState()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88361 | neighbors=[main.js, clearOpenAICodexModelCache(), applyCodexModelPolicy(), signOutOpenAICodex()]
- "karpathywiki_main_resolveimagemodel": "resolveImageModel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22997 | neighbors=[main.js, generateImage(), asImageModelV3(), getGlobalProvider()]
- "karpathywiki_main_resolveminaliaslength": "resolveMinAliasLength()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67366 | neighbors=[main.js, appendAliases(), createSummaryPage(), enforceFrontmatterConstraints()]
- "karpathywiki_main_resolvesectionanchor": "resolveSectionAnchor()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73739 | neighbors=[main.js, applyComplementaryAppends(), findSectionInBody(), snapHeaderToCanonical()]
- "karpathywiki_main_resolvesourceslug": "resolveSourceSlug()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67538 | neighbors=[main.js, ingestSource(), sourceBaseSlug(), sourceFingerprint()]
- "karpathywiki_main_resolvespeechmodel": "resolveSpeechModel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22982 | neighbors=[main.js, generateSpeech(), asSpeechModelV3(), getGlobalProvider()]
- "karpathywiki_main_resolvetranscriptionmodel": "resolveTranscriptionModel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22967 | neighbors=[main.js, asTranscriptionModelV3(), getGlobalProvider(), transcribe()]
- "karpathywiki_main_responsejson": "responseJson()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64790 | neighbors=[main.js, pollAuthorizationCode(), requestDeviceCode(), json()]
- "karpathywiki_main_retrywithexponentialbackoffinternal": "retryWithExponentialBackoffInternal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18460 | neighbors=[main.js, delay(), getErrorMessage2(), isAbortError()]
- "karpathywiki_main_runcodexsignout": "runCodexSignOut()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86412 | neighbors=[main.js, runBedrockSignOut(), signOut(), signOutOpenAICodex()]
- "karpathywiki_main_runlint": "runLint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81025 | neighbors=[main.js, getExistingWikiPages(), hasSourceFilesChanged(), now()]
- "karpathywiki_main_runsharedincomingsignal": "runSharedIncomingSignal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83462 | neighbors=[main.js, computeJaccard(), yieldForComparison(), runSignalsForBucket()]
- "karpathywiki_main_runsharedlinkssignal": "runSharedLinksSignal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83447 | neighbors=[main.js, computeJaccard(), yieldForComparison(), runSignalsForBucket()]
- "karpathywiki_main_sanitizeschema": "sanitizeSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L45808 | neighbors=[main.js, sanitizeDefinition(), sanitizeJsonSchema(), getConstraintDescription()]
- "karpathywiki_main_scanpollutedsources": "scanPollutedSources()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71747 | neighbors=[main.js, normalizeSourcesInFolder(), runPreparationPhase(), extractRawSourcesEntries()]
- "karpathywiki_main_scorepagesbyneedles": "scorePagesByNeedles()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76949 | neighbors=[main.js, lexMatchByTitleAndAliases(), scanPageRefsByKeywords(), needleHits()]
- "karpathywiki_main_selectdomains": "selectDomains()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65950 | neighbors=[main.js, buildDissentStubContent(), ingestSource(), fold()]
- "karpathywiki_main_setcurrentbody": "setCurrentBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81739 | neighbors=[main.js, normalizeEmptyMode(), recompute(), refresh()]
- "karpathywiki_main_setvalue": "setValue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87023 | neighbors=[main.js, $constructor(), setSpan(), renderChips()]
- "karpathywiki_main_sha256bytes": "sha256Bytes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54646 | neighbors=[main.js, convertPdfToMarkdown(), convertPdfWithMineru(), bytesToHex()]
- "karpathywiki_main_sourcebaseslug": "sourceBaseSlug()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67535 | neighbors=[main.js, resolveSourceSlug(), basenameNoExt(), computeSlug()]
- "karpathywiki_main_sourcekey": "sourceKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73153 | neighbors=[main.js, footnotesOf(), preserveSourcedParagraphs(), turkishCaseFold()]
- "karpathywiki_main_splitdataurl": "splitDataUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23101 | neighbors=[main.js, convertToLanguageModelV3DataContent(), normalizeImageData(), toImageModelV3File()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-024.json

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
