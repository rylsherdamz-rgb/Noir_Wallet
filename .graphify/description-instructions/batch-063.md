# Node Description Batch 64 of 84

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

- "examples_pdax_orders_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_orders.rs:L12 | neighbors=[pdax_orders.rs]
- "examples_pdax_place_order_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_place_order.rs:L20 | neighbors=[pdax_place_order.rs]
- "examples_pdax_user_info_upload_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_user_info_upload.rs:L22 | neighbors=[pdax_user_info_upload.rs]
- "frontend_global_d_css": "*.css" | kind=code-symbol | source=frontend/global.d.ts:L3 | neighbors=[global.d.ts]
- "frontend_metro_config_config": "config" | kind=code-symbol | source=frontend/metro.config.js:L4 | neighbors=[metro.config.js]
- "frontend_metro_config_getdefaultconfig": "{ getDefaultConfig }" | kind=code-symbol | source=frontend/metro.config.js:L2 | neighbors=[metro.config.js]
- "frontend_tailwind_config_rationale_3": "NOTE: Update this to include the paths to all of your component files." | kind=entity | source=frontend/tailwind.config.js:L3 | neighbors=[tailwind.config.js]
- "frontend_vitest_config_load": "load()" | kind=code-symbol | source=frontend/vitest.config.ts:L22 | neighbors=[vitest.config.ts]
- "frontend_vitest_config_resolveid": "resolveId()" | kind=code-symbol | source=frontend/vitest.config.ts:L19 | neighbors=[vitest.config.ts]
- "frontend_vitest_config_transform": "transform()" | kind=code-symbol | source=frontend/vitest.config.ts:L9 | neighbors=[vitest.config.ts]
- "hooks_usecountup_countupoptions": "CountUpOptions" | kind=code-symbol | source=frontend/src/hooks/useCountUp.ts:L4 | neighbors=[useCountUp.ts]
- "hooks_useprofile_profilestate": "ProfileState" | kind=code-symbol | source=frontend/src/hooks/useProfile.ts:L6 | neighbors=[useProfile.ts]
- "hooks_useprofile_useprofile": "useProfile()" | kind=code-symbol | source=frontend/src/hooks/useProfile.ts:L12 | neighbors=[useProfile.ts]
- "karpathywiki_main_addtoolinputexamplesmiddleware": "addToolInputExamplesMiddleware()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30219 | neighbors=[main.js]
- "karpathywiki_main_any": "_any()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9458 | neighbors=[main.js]
- "karpathywiki_main_ar_default": "ar_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L3910 | neighbors=[main.js]
- "karpathywiki_main_ascontent": "asContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26092 | neighbors=[main.js]
- "karpathywiki_main_assert": "assert()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L812 | neighbors=[main.js]
- "karpathywiki_main_assertequal": "assertEqual()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L801 | neighbors=[main.js]
- "karpathywiki_main_assertis": "assertIs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L807 | neighbors=[main.js]
- "karpathywiki_main_assertnever": "assertNever()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L809 | neighbors=[main.js]
- "karpathywiki_main_assertnotequal": "assertNotEqual()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L804 | neighbors=[main.js]
- "karpathywiki_main_assignprop": "assignProp()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L876 | neighbors=[main.js]
- "karpathywiki_main_astoolcalls": "asToolCalls()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26079 | neighbors=[main.js]
- "karpathywiki_main_az_default": "az_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L4035 | neighbors=[main.js]
- "karpathywiki_main_badgeforkind": "badgeForKind()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L85303 | neighbors=[main.js]
- "karpathywiki_main_be_default": "be_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L4174 | neighbors=[main.js]
- "karpathywiki_main_bindtelemetryintegration": "bindTelemetryIntegration()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24036 | neighbors=[main.js]
- "karpathywiki_main_buildauthorizationurl": "buildAuthorizationUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64704 | neighbors=[main.js]
- "karpathywiki_main_buildmessageswithcachecontrol": "buildMessagesWithCacheControl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L50263 | neighbors=[main.js]
- "karpathywiki_main_buildsamplingargs": "buildSamplingArgs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43943 | neighbors=[main.js]
- "karpathywiki_main_buildseedselectionuserprompt": "buildSeedSelectionUserPrompt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77672 | neighbors=[main.js]
- "karpathywiki_main_ca_default": "ca_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L4332 | neighbors=[main.js]
- "karpathywiki_main_cancelresponsebody2": "cancelResponseBody2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54189 | neighbors=[main.js]
- "karpathywiki_main_catch": "_catch()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9806 | neighbors=[main.js]
- "karpathywiki_main_catch2": "_catch2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11499 | neighbors=[main.js]
- "karpathywiki_main_checkcompatibletype": "checkCompatibleType()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68965 | neighbors=[main.js]
- "karpathywiki_main_classifyfetcherror": "classifyFetchError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86319 | neighbors=[main.js]
- "karpathywiki_main_classifyfielderror": "classifyFieldError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43959 | neighbors=[main.js]
- "karpathywiki_main_cleanenum": "cleanEnum()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1191 | neighbors=[main.js]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-063.json

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
