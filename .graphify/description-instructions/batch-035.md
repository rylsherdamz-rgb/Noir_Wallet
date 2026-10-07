# Node Description Batch 36 of 84

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

- "karpathywiki_main_renderpagetypegroup": "renderPageTypeGroup()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85891 | neighbors=[main.js, renderIngestDetails(), createWikiLink()]
- "karpathywiki_main_renderpane": "renderPane()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81841 | neighbors=[main.js, onOpen(), buildDiffCell()]
- "karpathywiki_main_renderretrievallabel": "renderRetrievalLabel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77462 | neighbors=[main.js, addRetrievalLabel(), armDisplay()]
- "karpathywiki_main_rendersourcecontextblock": "renderSourceContextBlock()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73631 | neighbors=[main.js, classifyMergeNeed(), renderSourceOwnershipRule()]
- "karpathywiki_main_rendersourceownershiprule": "renderSourceOwnershipRule()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73640 | neighbors=[main.js, classifyMergeNeed(), renderSourceContextBlock()]
- "karpathywiki_main_rendertestconnectionsection": "renderTestConnectionSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86918 | neighbors=[main.js, display(), getText()]
- "karpathywiki_main_replacesectionblocks": "replaceSectionBlocks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71338 | neighbors=[main.js, preserveExistingSections(), sectionIdentityKey()]
- "karpathywiki_main_repointfoldertypedlinks": "repointFolderTypedLinks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69108 | neighbors=[main.js, buildVaultResolver(), repointLinksAfterRun()]
- "karpathywiki_main_reportfinish": "reportFinish()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43883 | neighbors=[main.js, normalizeFinishReason(), normalizeUsage()]
- "karpathywiki_main_requiredstring2": "requiredString2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64785 | neighbors=[main.js, parseAuthorizationCode(), parseDeviceAuthorization()]
- "karpathywiki_main_resolvedisplayedmodelfortask": "resolveDisplayedModelForTask()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86235 | neighbors=[main.js, getCurrentModelValue(), resolveModelTaskUiMode()]
- "karpathywiki_main_resolvefileinvault": "resolveFileInVault()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76762 | neighbors=[main.js, createOrUpdateFile(), tryReadFile()]
- "karpathywiki_main_resolvemodeltaskuimode": "resolveModelTaskUiMode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86232 | neighbors=[main.js, renderModelSection(), resolveDisplayedModelForTask()]
- "karpathywiki_main_resolvererankingmodel": "resolveRerankingModel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23032 | neighbors=[main.js, rerank(), getGlobalProvider()]
- "karpathywiki_main_resolvevideomodel": "resolveVideoModel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23011 | neighbors=[main.js, experimental_generateVideo(), getGlobalProvider()]
- "karpathywiki_main_responsejson2": "responseJson2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65116 | neighbors=[main.js, refreshWithFetch(), json()]
- "karpathywiki_main_retargetlinkstopage": "retargetLinksToPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71446 | neighbors=[main.js, mergeDuplicatePages(), chooseLinkpath()]
- "karpathywiki_main_runbedrockdeviceauth": "runBedrockDeviceAuth()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86447 | neighbors=[main.js, loginBedrockSso(), openExternal()]
- "karpathywiki_main_runbedrocksignout": "runBedrockSignOut()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86476 | neighbors=[main.js, runCodexSignOut(), signOutBedrock()]
- "karpathywiki_main_runcodexdeviceauth": "runCodexDeviceAuth()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86387 | neighbors=[main.js, loginOpenAICodexDevice(), openExternal()]
- "karpathywiki_main_runcodexmodelrefresh": "runCodexModelRefresh()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86367 | neighbors=[main.js, refreshOpenAICodexModels(), refresh()]
- "karpathywiki_main_rundeadlinkfixes": "runDeadLinkFixes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82150 | neighbors=[main.js, checkCancelled(), hide()]
- "karpathywiki_main_runduplicatemerges": "runDuplicateMerges()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82287 | neighbors=[main.js, checkCancelled(), hide()]
- "karpathywiki_main_runemptypagefixes": "runEmptyPageFixes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82202 | neighbors=[main.js, checkCancelled(), hide()]
- "karpathywiki_main_runorphanfixes": "runOrphanFixes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82242 | neighbors=[main.js, checkCancelled(), hide()]
- "karpathywiki_main_runretagviolations": "runRetagViolations()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82332 | neighbors=[main.js, checkCancelled(), hide()]
- "karpathywiki_main_safevalidateuimessages": "safeValidateUIMessages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28010 | neighbors=[main.js, validateTypes(), validateUIMessages()]
- "karpathywiki_main_sanitizedefinition": "sanitizeDefinition()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L45802 | neighbors=[main.js, isPlainObject2(), sanitizeSchema()]
- "karpathywiki_main_saveiamkeys": "saveIamKeys()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65596 | neighbors=[main.js, flushBedrockIamKeys(), save()]
- "karpathywiki_main_scancontradictionmarkers": "scanContradictionMarkers()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82954 | neighbors=[main.js, runProgrammaticPhase(), parseFrontmatter()]
- "karpathywiki_main_scanorphans": "scanOrphans()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82744 | neighbors=[main.js, runProgrammaticPhase(), parseFrontmatter()]
- "karpathywiki_main_scanpagerefsbykeywords": "scanPageRefsByKeywords()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77928 | neighbors=[main.js, scorePagesByNeedles(), selectPprSeeds()]
- "karpathywiki_main_scheduleperiodiclint": "schedulePeriodicLint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81002 | neighbors=[main.js, onload(), saveSettings()]
- "karpathywiki_main_scorehublinkdistinctiveness": "scoreHubLinkDistinctiveness()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82538 | neighbors=[main.js, scanHubLinkDensity(), personalizedPageRank()]
- "karpathywiki_main_scrolltobottom": "scrollToBottom()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77423 | neighbors=[main.js, onOpen(), sendMessage()]
- "karpathywiki_main_scrolltostartofcurrentturn": "scrollToStartOfCurrentTurn()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77426 | neighbors=[main.js, finishGeneration(), scrollTurnToStart()]
- "karpathywiki_main_scrollturntostart": "scrollTurnToStart()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77294 | neighbors=[main.js, scrollToStartOfCurrentTurn(), scrollToTurn()]
- "karpathywiki_main_selectdedupcandidates": "selectDedupCandidates()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72950 | neighbors=[main.js, resolvePagePath(), selectCandidateWindow()]
- "karpathywiki_main_selectsections": "selectSections()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80216 | neighbors=[main.js, getSchemaContext(), parseSections()]
- "karpathywiki_main_selectseedswithllm": "selectSeedsWithLLM()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77728 | neighbors=[main.js, selectPprSeeds(), withTransientRetry()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-035.json

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
