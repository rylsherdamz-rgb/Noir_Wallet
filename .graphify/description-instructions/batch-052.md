# Node Description Batch 53 of 84

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

- "karpathywiki_main_setdonecallback": "setDoneCallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75583 | neighbors=[main.js, runBatchIngest()]
- "karpathywiki_main_seterrormap": "setErrorMap()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12146 | neighbors=[main.js, config()]
- "karpathywiki_main_setgenerationcomplete": "setGenerationComplete()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68035 | neighbors=[main.js, parseFrontmatter()]
- "karpathywiki_main_setingestioncallbacks": "setIngestionCallbacks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75586 | neighbors=[main.js, registerWikiCommands()]
- "karpathywiki_main_setlintcallbacks": "setLintCallbacks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75590 | neighbors=[main.js, registerWikiCommands()]
- "karpathywiki_main_setsequal": "setsEqual()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74990 | neighbors=[main.js, getOrBuild()]
- "karpathywiki_main_setsettingsvisible": "setSettingsVisible()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86354 | neighbors=[main.js, renderWikiConfigSection()]
- "karpathywiki_main_setspancontext": "setSpanContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22215 | neighbors=[main.js, setSpan()]
- "karpathywiki_main_setstatusbarupdatecallback": "setStatusBarUpdateCallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75539 | neighbors=[main.js, registerWikiCommands()]
- "karpathywiki_main_shouldcreatestubforunresolvablelink": "shouldCreateStubForUnresolvableLink()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70861 | neighbors=[main.js, fixDeadLink()]
- "karpathywiki_main_shouldrendermodeldropdown": "shouldRenderModelDropdown()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86241 | neighbors=[main.js, renderModelField()]
- "karpathywiki_main_showprogress": "showProgress()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88687 | neighbors=[main.js, showProgressFor()]
- "karpathywiki_main_signoutbedrock": "signOutBedrock()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87918 | neighbors=[main.js, runBedrockSignOut()]
- "karpathywiki_main_size": "_size()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9564 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_slugmatchkeys": "slugMatchKeys()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72808 | neighbors=[main.js, computeSlug()]
- "karpathywiki_main_smoketest": "smokeTest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80452 | neighbors=[main.js, ensureWelcomeNote()]
- "karpathywiki_main_snapshottaskusage": "snapshotTaskUsage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55145 | neighbors=[main.js, ingestSource()]
- "karpathywiki_main_sortnode": "sortNode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79448 | neighbors=[main.js, buildFolderTree()]
- "karpathywiki_main_sorttoolresultcontentbytoolcallorder": "sortToolResultContentByToolCallOrder()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L25309 | neighbors=[main.js, toResponseMessages()]
- "karpathywiki_main_sourcefingerprint": "sourceFingerprint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67523 | neighbors=[main.js, resolveSourceSlug()]
- "karpathywiki_main_spliceaftersection": "spliceAfterSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73771 | neighbors=[main.js, applyComplementaryAppends()]
- "karpathywiki_main_splicebody": "spliceBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81907 | neighbors=[main.js, applySchemaSuggestion()]
- "karpathywiki_main_splitlines": "splitLines()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81670 | neighbors=[main.js, lineDiff()]
- "karpathywiki_main_src_llm_sdk_output_args_ts": "\"src/llm-sdk/output-args.ts\"()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52830 | neighbors=[main.js, json()]
- "karpathywiki_main_startswith": "_startsWith()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9623 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_strictobject": "strictObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11336 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_string2": "string2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11192 | neighbors=[main.js, _string()]
- "karpathywiki_main_string3": "string3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12183 | neighbors=[main.js, _coercedString()]
- "karpathywiki_main_stringarray": "stringArray()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88243 | neighbors=[main.js, parseEntry()]
- "karpathywiki_main_stringbool": "_stringbool()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9866 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_stringformat": "_stringFormat()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9921 | neighbors=[main.js, normalizeParams()]
- "karpathywiki_main_stringifyregexpwithflags": "stringifyRegExpWithFlags()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17743 | neighbors=[main.js, addPattern()]
- "karpathywiki_main_stripcodefence": "stripCodeFence()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79980 | neighbors=[main.js, parseSchemaSuggestion()]
- "karpathywiki_main_stripfrontmatter": "stripFrontmatter()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77945 | neighbors=[main.js, extractSummaryFromPage()]
- "karpathywiki_main_stripid3tagsifpresent": "stripID3TagsIfPresent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23078 | neighbors=[main.js, detectMediaType()]
- "karpathywiki_main_striplegacybakedtagenum": "stripLegacyBakedTagEnum()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80003 | neighbors=[main.js, loadSchema()]
- "karpathywiki_main_stripoptionalnulls": "stripOptionalNulls()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52757 | neighbors=[main.js, isObject2()]
- "karpathywiki_main_stripstubmarker": "stripStubMarker()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69537 | neighbors=[main.js, mergePage()]
- "karpathywiki_main_striptrailingseparators": "stripTrailingSeparators()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43643 | neighbors=[main.js, cleanMarkdownResponse()]
- "karpathywiki_main_stripwikilinks": "stripWikilinks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77948 | neighbors=[main.js, extractSummaryFromPage()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-052.json

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
