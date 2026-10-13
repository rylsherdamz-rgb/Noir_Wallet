# Node Description Batch 37 of 84

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

- "karpathywiki_main_setfieldvalue": "setFieldValue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87971 | neighbors=[main.js, cascadeUnifiedModelChange(), markLLMConfigStale()]
- "karpathywiki_main_setnewbody": "setNewBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81725 | neighbors=[main.js, recompute(), refresh()]
- "karpathywiki_main_setprogresscallback": "setProgressCallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75533 | neighbors=[main.js, doSave(), saveToWiki()]
- "karpathywiki_main_setspan": "setSpan()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22209 | neighbors=[main.js, setValue(), setSpanContext()]
- "karpathywiki_main_setusecustomflag": "setUseCustomFlag()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88046 | neighbors=[main.js, cascadeUnifiedModelChange(), prefillPerTaskFromUnified()]
- "karpathywiki_main_shaperelatedlists": "shapeRelatedLists()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67414 | neighbors=[main.js, ingestSource(), nameKey()]
- "karpathywiki_main_showopenaicodexmodelrefreshfailure": "showOpenAICodexModelRefreshFailure()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88379 | neighbors=[main.js, loginOpenAICodexBrowser(), getText()]
- "karpathywiki_main_slugkey": "slugKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70525 | neighbors=[main.js, findDeadLinkTarget(), computeSlug()]
- "karpathywiki_main_sourcecontextfromanalysis": "sourceContextFromAnalysis()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74192 | neighbors=[main.js, createOrUpdateConceptPage(), createOrUpdateEntityPage()]
- "karpathywiki_main_splitmdextension": "splitMdExtension()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82775 | neighbors=[main.js, collectCitedRawNoteTargets(), scanQuoteGrounding()]
- "karpathywiki_main_ssotokenexpiry": "ssoTokenExpiry()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65589 | neighbors=[main.js, renderProviderSection(), load()]
- "karpathywiki_main_stampsourcepagehead": "stampSourcePageHead()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70354 | neighbors=[main.js, createSummaryPage(), stripMentionsSection()]
- "karpathywiki_main_standardschema": "standardSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18206 | neighbors=[main.js, asSchema(), jsonSchema()]
- "karpathywiki_main_startlintoperation": "startLintOperation()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75607 | neighbors=[main.js, lintWiki(), runSchemaAnalyze()]
- "karpathywiki_main_startlogin": "startLogin()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65250 | neighbors=[main.js, loginWithBrowser(), loginWithDeviceCode()]
- "karpathywiki_main_startwatching": "startWatching()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80839 | neighbors=[main.js, onload(), saveSettings()]
- "karpathywiki_main_statementonpage": "statementOnPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73365 | neighbors=[main.js, applyContradictionGates(), normalizeStatement()]
- "karpathywiki_main_streamingobsidianfetch": "streamingObsidianFetch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L266 | neighbors=[main.js, headersToObject(), streamWithFallback()]
- "karpathywiki_main_streamobject": "streamObject()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29267 | neighbors=[main.js, getOutputStrategy(), validateObjectGenerationInput()]
- "karpathywiki_main_strictschemafor": "strictSchemaFor()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52795 | neighbors=[main.js, buildOutputArgs(), toStrictSchema()]
- "karpathywiki_main_string": "_string()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9086 | neighbors=[main.js, normalizeParams(), string2()]
- "karpathywiki_main_stringvalue": "stringValue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68848 | neighbors=[main.js, requestUpload(), waitForResult()]
- "karpathywiki_main_superrefine": "superRefine()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11556 | neighbors=[main.js, custom2(), check()]
- "karpathywiki_main_symbol": "_symbol()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9440 | neighbors=[main.js, normalizeParams(), symbol15()]
- "karpathywiki_main_t": "t()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79321 | neighbors=[main.js, onOpen(), getText()]
- "karpathywiki_main_timeregexsource": "timeRegexSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12995 | neighbors=[main.js, datetimeRegex(), timeRegex()]
- "karpathywiki_main_timesource": "timeSource()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1544 | neighbors=[main.js, datetime(), time()]
- "karpathywiki_main_tokenresponsejson": "tokenResponseJson()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64800 | neighbors=[main.js, exchangeAuthorizationCode(), json()]
- "karpathywiki_main_tokenresponsejson2": "tokenResponseJson2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65048 | neighbors=[main.js, exchangeAuthorizationCode2(), json()]
- "karpathywiki_main_toresponsemessages": "toResponseMessages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L25175 | neighbors=[main.js, createToolModelOutput(), sortToolResultContentByToolCallOrder()]
- "karpathywiki_main_tostrictschema": "toStrictSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52781 | neighbors=[main.js, strictSchemaFor(), jsonSchema()]
- "karpathywiki_main_tuple": "_tuple()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9704 | neighbors=[main.js, _function(), normalizeParams()]
- "karpathywiki_main_ulid": "_ulid()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9201 | neighbors=[main.js, normalizeParams(), ulid2()]
- "karpathywiki_main_undefined2": "_undefined2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9446 | neighbors=[main.js, normalizeParams(), _undefined3()]
- "karpathywiki_main_unzipsync": "unzipSync()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68591 | neighbors=[main.js, extractMineruMarkdown(), inflateSync()]
- "karpathywiki_main_updateindicatortranslation": "updateIndicatorTranslation()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77243 | neighbors=[main.js, buildTurnIndicator(), updateActiveDot()]
- "karpathywiki_main_usesbedrockawscredentials": "usesBedrockAwsCredentials()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54818 | neighbors=[main.js, createLLMClientFromSettingsSync(), testLLMConnection()]
- "karpathywiki_main_uuid": "_uuid()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9117 | neighbors=[main.js, normalizeParams(), uuid2()]
- "karpathywiki_main_validateentropy": "validateEntropy()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64690 | neighbors=[main.js, generateOAuthState(), generatePkce()]
- "karpathywiki_main_validateobjectgenerationinput": "validateObjectGenerationInput()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28810 | neighbors=[main.js, generateObject(), streamObject()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-036.json

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
