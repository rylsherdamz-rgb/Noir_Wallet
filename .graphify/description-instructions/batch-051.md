# Node Description Batch 52 of 84

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

- "karpathywiki_main_renderclosefooter": "renderCloseFooter()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85410 | neighbors=[main.js, renderContent()]
- "karpathywiki_main_renderfilerow": "renderFileRow()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79714 | neighbors=[main.js, renderTreeNode()]
- "karpathywiki_main_renderfrontmatter": "renderFrontmatter()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80484 | neighbors=[main.js, buildWelcomeNote()]
- "karpathywiki_main_renderhowtousesection": "renderHowToUseSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80522 | neighbors=[main.js, buildWelcomeNote()]
- "karpathywiki_main_renderquickstartsection": "renderQuickStartSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80584 | neighbors=[main.js, buildWelcomeNote()]
- "karpathywiki_main_renderstructuresection": "renderStructureSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80541 | neighbors=[main.js, buildWelcomeNote()]
- "karpathywiki_main_renderthinkingblocksui": "renderThinkingBlocksUI()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77335 | neighbors=[main.js, extractThinkingPanel()]
- "karpathywiki_main_renderverifysection": "renderVerifySection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80501 | neighbors=[main.js, buildWelcomeNote()]
- "karpathywiki_main_repetitionpenaltywirefield": "repetitionPenaltyWireField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53237 | neighbors=[main.js, buildRepetitionPenaltyHint()]
- "karpathywiki_main_replacedeadlink": "replaceDeadLink()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70559 | neighbors=[main.js, fixDeadLink()]
- "karpathywiki_main_replaceorinsertyamllistfield": "replaceOrInsertYamlListField()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67736 | neighbors=[main.js, appendContradictedByMarker()]
- "karpathywiki_main_replacetargetlink": "replaceTargetLink()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70833 | neighbors=[main.js, fixDeadLink()]
- "karpathywiki_main_required": "required()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1099 | neighbors=[main.js, clone()]
- "karpathywiki_main_requiredstring": "requiredString()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64685 | neighbors=[main.js, parseTokenResponse()]
- "karpathywiki_main_requirefetch": "requireFetch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65267 | neighbors=[main.js, refreshWithFetch()]
- "karpathywiki_main_requirestring": "requireString()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65287 | neighbors=[main.js, load()]
- "karpathywiki_main_resolvebedrockregion": "resolveBedrockRegion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55014 | neighbors=[main.js, createBedrockClient()]
- "karpathywiki_main_resolvecreated": "resolveCreated()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67879 | neighbors=[main.js, enforceFrontmatterConstraints()]
- "karpathywiki_main_resolveprovideroptionskey": "resolveProviderOptionsKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L50492 | neighbors=[main.js, toCamelCase()]
- "karpathywiki_main_resolvetaskpolicy": "resolveTaskPolicy()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55177 | neighbors=[main.js, applyTaskPolicy()]
- "karpathywiki_main_resolvethreshold": "resolveThreshold()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83278 | neighbors=[main.js, generateDuplicateCandidates()]
- "karpathywiki_main_rotatebackups": "rotateBackups()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81869 | neighbors=[main.js, applySchemaSuggestion()]
- "karpathywiki_main_runbatch": "runBatch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74922 | neighbors=[main.js, runBatchedWithRetry()]
- "karpathywiki_main_runcasevariantsignal": "runCaseVariantSignal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83523 | neighbors=[main.js, runSignalsForBucket()]
- "karpathywiki_main_runextractiononly": "runExtractionOnly()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75725 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_runsourcefingerprintsignal": "runSourceFingerprintSignal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83542 | neighbors=[main.js, runSignalsForBucket()]
- "karpathywiki_main_safeisoptional": "safeIsOptional()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18063 | neighbors=[main.js, parseObjectDef()]
- "karpathywiki_main_sanitizeattributevalue": "sanitizeAttributeValue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23952 | neighbors=[main.js, selectTelemetryAttributes()]
- "karpathywiki_main_sanitizejsonschema": "sanitizeJsonSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L45799 | neighbors=[main.js, sanitizeSchema()]
- "karpathywiki_main_scandeadlinks": "scanDeadLinks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82716 | neighbors=[main.js, runProgrammaticPhase()]
- "karpathywiki_main_scrolltoturn": "scrollToTurn()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77436 | neighbors=[main.js, scrollTurnToStart()]
- "karpathywiki_main_selectfoldertoingest": "selectFolderToIngest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84618 | neighbors=[main.js, requireLLMReady()]
- "karpathywiki_main_selectmultiplefilestoingest": "selectMultipleFilesToIngest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84641 | neighbors=[main.js, requireLLMReady()]
- "karpathywiki_main_selectseedswithtypedoutput": "selectSeedsWithTypedOutput()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77681 | neighbors=[main.js, parseJsonResponse()]
- "karpathywiki_main_selectsourcetoingest": "selectSourceToIngest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84577 | neighbors=[main.js, requireLLMReady()]
- "karpathywiki_main_sentenceat": "sentenceAt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69314 | neighbors=[main.js, classifyCandidate()]
- "karpathywiki_main_serializetoolcallarguments": "serializeToolCallArguments()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36464 | neighbors=[main.js, convertToOpenAIChatMessages()]
- "karpathywiki_main_serializetoolcallarguments2": "serializeToolCallArguments2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L37014 | neighbors=[main.js, convertToOpenAIResponsesInput()]
- "karpathywiki_main_servicetiers": "serviceTiers()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88253 | neighbors=[main.js, parseEntry()]
- "karpathywiki_main_set": "_set()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9731 | neighbors=[main.js, normalizeParams()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-051.json

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
