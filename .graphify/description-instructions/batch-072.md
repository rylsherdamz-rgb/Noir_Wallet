# Node Description Batch 73 of 84

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "karpathywiki_main_parsenativeenumdef": "parseNativeEnumDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17882 | neighbors=[main.js]
- "karpathywiki_main_parsenulldef": "parseNullDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17899 | neighbors=[main.js]
- "karpathywiki_main_parsenumberdef": "parseNumberDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17981 | neighbors=[main.js]
- "karpathywiki_main_parsetaskpolicyspec": "parseTaskPolicySpec()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55204 | neighbors=[main.js]
- "karpathywiki_main_parseuniondef": "parseUnionDef()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17904 | neighbors=[main.js]
- "karpathywiki_main_pathctx": "pathCtx()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74498 | neighbors=[main.js]
- "karpathywiki_main_pickactiveturn": "pickActiveTurn()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77302 | neighbors=[main.js]
- "karpathywiki_main_pipe": "_pipe()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9813 | neighbors=[main.js]
- "karpathywiki_main_pl_default": "pl_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L7262 | neighbors=[main.js]
- "karpathywiki_main_prefault": "prefault()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11477 | neighbors=[main.js]
- "karpathywiki_main_preparechattools": "prepareChatTools()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L36742 | neighbors=[main.js]
- "karpathywiki_main_preparetools2": "prepareTools2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L50758 | neighbors=[main.js]
- "karpathywiki_main_preprocess": "preprocess()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11596 | neighbors=[main.js]
- "karpathywiki_main_promise": "_promise()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9839 | neighbors=[main.js]
- "karpathywiki_main_prunemessages": "pruneMessages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29395 | neighbors=[main.js]
- "karpathywiki_main_ps_default": "ps_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L7131 | neighbors=[main.js]
- "karpathywiki_main_pt_default": "pt_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L7388 | neighbors=[main.js]
- "karpathywiki_main_pushto": "pushTo()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73173 | neighbors=[main.js]
- "karpathywiki_main_randombytes": "randomBytes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64668 | neighbors=[main.js]
- "karpathywiki_main_randomstring": "randomString()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L900 | neighbors=[main.js]
- "karpathywiki_main_rationale_52079": "TODO: deprecate non-camelCase keys and remove in future major version" | kind=entity | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52079 | neighbors=[main.js]
- "karpathywiki_main_rationale_56064": "NOTE: We deliberately do NOT claim \"task completed\" in the Toast —" | kind=entity | source=Noir/.obsidian/plugins/karpathywiki/main.js:L56064 | neighbors=[main.js]
- "karpathywiki_main_readonly": "_readonly()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9820 | neighbors=[main.js]
- "karpathywiki_main_readoutput": "readOutput()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53260 | neighbors=[main.js]
- "karpathywiki_main_recorderroronspan": "recordErrorOnSpan()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23934 | neighbors=[main.js]
- "karpathywiki_main_recordupdatedpage": "recordUpdatedPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75232 | neighbors=[main.js]
- "karpathywiki_main_registerglobal": "registerGlobal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L21804 | neighbors=[main.js]
- "karpathywiki_main_registertelemetryintegration": "registerTelemetryIntegration()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24026 | neighbors=[main.js]
- "karpathywiki_main_relatedctx": "relatedCtx()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74504 | neighbors=[main.js]
- "karpathywiki_main_renderglobalinsight": "renderGlobalInsight()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85473 | neighbors=[main.js]
- "karpathywiki_main_repointline": "repointLine()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69098 | neighbors=[main.js]
- "karpathywiki_main_requestheaders": "requestHeaders()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88280 | neighbors=[main.js]
- "karpathywiki_main_requesturl4": "requestUrl4()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88277 | neighbors=[main.js]
- "karpathywiki_main_requirenodehttp": "requireNodeHttp()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64996 | neighbors=[main.js]
- "karpathywiki_main_requireopenexternal": "requireOpenExternal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65271 | neighbors=[main.js]
- "karpathywiki_main_resolveinitialapikey": "resolveInitialApiKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54798 | neighbors=[main.js]
- "karpathywiki_main_resolverowstate": "resolveRowState()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79475 | neighbors=[main.js]
- "karpathywiki_main_ru_default": "ru_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L7528 | neighbors=[main.js]
- "karpathywiki_main_runtoolstransformation": "runToolsTransformation()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27205 | neighbors=[main.js]
- "karpathywiki_main_schedulestreamrender": "scheduleStreamRender()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78854 | neighbors=[main.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-072.json

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
