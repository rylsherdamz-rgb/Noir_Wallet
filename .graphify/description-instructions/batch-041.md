# Node Description Batch 42 of 84

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

- "karpathywiki_main_aliasclaimsfrompages": "aliasClaimsFromPages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72935 | neighbors=[main.js, resolvePagePath()]
- "karpathywiki_main_appendcustomqueryinstructions": "appendCustomQueryInstructions()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78123 | neighbors=[main.js, sendMessage()]
- "karpathywiki_main_appendsourceslugtofrontmatter": "appendSourceSlugToFrontmatter()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74316 | neighbors=[main.js, createNewPage()]
- "karpathywiki_main_applycustominstructions": "applyCustomInstructions()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78965 | neighbors=[main.js, saveSettings()]
- "karpathywiki_main_applydiffmodalclasses": "applyDiffModalClasses()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81677 | neighbors=[main.js, onOpen()]
- "karpathywiki_main_applysettingsmigrations": "applySettingsMigrations()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65800 | neighbors=[main.js, loadSettings()]
- "karpathywiki_main_armdisplay": "armDisplay()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77445 | neighbors=[main.js, renderRetrievalLabel()]
- "karpathywiki_main_aslanguagemodelusage": "asLanguageModelUsage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24081 | neighbors=[main.js, addTokenCounts()]
- "karpathywiki_main_asrecord": "asRecord()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36417 | neighbors=[main.js, parseStreamError()]
- "karpathywiki_main_asrecord2": "asRecord2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L38098 | neighbors=[main.js, isOpenAIChatCompletionChunk()]
- "karpathywiki_main_assemblewikicontext": "assembleWikiContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78051 | neighbors=[main.js, buildWikiContext()]
- "karpathywiki_main_assertnotreasoningonly": "assertNotReasoningOnly()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43907 | neighbors=[main.js, isReasoningRunaway()]
- "karpathywiki_main_assesswelcomeneed": "assessWelcomeNeed()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81175 | neighbors=[main.js, runStartupCheck()]
- "karpathywiki_main_backupfilename": "backupFilename()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81865 | neighbors=[main.js, applySchemaSuggestion()]
- "karpathywiki_main_base642": "base642()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11249 | neighbors=[main.js, _base64()]
- "karpathywiki_main_base64url2": "base64url2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11252 | neighbors=[main.js, _base64url()]
- "karpathywiki_main_basenamenoext": "basenameNoExt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67531 | neighbors=[main.js, sourceBaseSlug()]
- "karpathywiki_main_bedrockmantlechatcompletionsurl": "bedrockMantleChatCompletionsUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54 | neighbors=[main.js, createBedrockClient()]
- "karpathywiki_main_bedrockmantlemessagesurl": "bedrockMantleMessagesUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L51 | neighbors=[main.js, createBedrockClient()]
- "karpathywiki_main_bigint2": "bigint2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11285 | neighbors=[main.js, _bigint()]
- "karpathywiki_main_bigint3": "bigint3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12192 | neighbors=[main.js, _coercedBigint()]
- "karpathywiki_main_bigrams": "bigrams()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83197 | neighbors=[main.js, runBigramCrossLangSignal()]
- "karpathywiki_main_bindwikilinkclicks": "bindWikiLinkClicks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77371 | neighbors=[main.js, renderMarkdownContent()]
- "karpathywiki_main_blockcontentlength": "blockContentLength()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71304 | neighbors=[main.js, preserveExistingSections()]
- "karpathywiki_main_bodywordset": "bodyWordSet()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83259 | neighbors=[main.js, generateDuplicateCandidates()]
- "karpathywiki_main_boolean2": "boolean2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11282 | neighbors=[main.js, _boolean()]
- "karpathywiki_main_boolean3": "boolean3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12189 | neighbors=[main.js, _coercedBoolean()]
- "karpathywiki_main_builddeadlinkreplacement": "buildDeadLinkReplacement()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70555 | neighbors=[main.js, fixDeadLink()]
- "karpathywiki_main_builddiffcell": "buildDiffCell()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81688 | neighbors=[main.js, renderPane()]
- "karpathywiki_main_builddomaincontext": "buildDomainContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65942 | neighbors=[main.js, analyzeSource()]
- "karpathywiki_main_buildemptypageprompt": "buildEmptyPagePrompt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66051 | neighbors=[main.js, fillEmptyPage()]
- "karpathywiki_main_buildincominglinkindex": "buildIncomingLinkIndex()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83319 | neighbors=[main.js, runDedupPhase()]
- "karpathywiki_main_buildingeststatusbartext": "buildIngestStatusBarText()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84769 | neighbors=[main.js, composeStatusBarUpdate()]
- "karpathywiki_main_buildknowntargets": "buildKnownTargets()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82648 | neighbors=[main.js, runPreparationPhase()]
- "karpathywiki_main_buildlintanalysiscontext": "buildLintAnalysisContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82453 | neighbors=[main.js, runLintWiki()]
- "karpathywiki_main_buildlintreport": "buildLintReport()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83887 | neighbors=[main.js, runLintWiki()]
- "karpathywiki_main_buildmodelspaths": "buildModelsPaths()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43845 | neighbors=[main.js, fetchModelsWithFallback()]
- "karpathywiki_main_buildorphanlinkprompt": "buildOrphanLinkPrompt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71125 | neighbors=[main.js, linkOrphanPage()]
- "karpathywiki_main_buildorphanlinkupdate": "buildOrphanLinkUpdate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71133 | neighbors=[main.js, linkOrphanPage()]
- "karpathywiki_main_buildrangesliderdesc": "buildRangeSliderDesc()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86339 | neighbors=[main.js, renderRangeSlider()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-041.json

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
