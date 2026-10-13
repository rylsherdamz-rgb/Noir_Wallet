# Node Description Batch 76 of 84

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

- "promo_generate_voiceover_generateall": "generateAll()" | kind=code-symbol | source=promo/generate-voiceover.ts:L48 | neighbors=[generate-voiceover.ts]
- "promo_generate_voiceover_outputdir": "outputDir" | kind=code-symbol | source=promo/generate-voiceover.ts:L45 | neighbors=[generate-voiceover.ts]
- "promo_generate_voiceover_scene": "Scene" | kind=code-symbol | source=promo/generate-voiceover.ts:L13 | neighbors=[generate-voiceover.ts]
- "promo_generate_voiceover_scenes": "SCENES" | kind=code-symbol | source=promo/generate-voiceover.ts:L18 | neighbors=[generate-voiceover.ts]
- "promo_remotion_config": "remotion.config.ts" | kind=code-symbol | source=promo/remotion.config.ts:L1 | neighbors=[f8751a9 feat: Remotion promo video — No…]
- "promotion_generate_voiceover_generateall": "generateAll()" | kind=code-symbol | source=promotion/generate-voiceover.ts:L28 | neighbors=[generate-voiceover.ts]
- "promotion_generate_voiceover_outputdir": "outputDir" | kind=code-symbol | source=promotion/generate-voiceover.ts:L25 | neighbors=[generate-voiceover.ts]
- "pubmat_shoot_chromium": "{ chromium }" | kind=code-symbol | source=promo/pubmat/shoot.js:L1 | neighbors=[shoot.js]
- "pubmat_shoot_path": "path" | kind=code-symbol | source=promo/pubmat/shoot.js:L2 | neighbors=[shoot.js]
- "pubmat_test_editor_chromium": "{ chromium }" | kind=code-symbol | source=promo/pubmat/test-editor.js:L1 | neighbors=[test-editor.js]
- "pubmat_test_editor_fs": "fs" | kind=code-symbol | source=promo/pubmat/test-editor.js:L4 | neighbors=[test-editor.js]
- "pubmat_test_editor_http": "http" | kind=code-symbol | source=promo/pubmat/test-editor.js:L3 | neighbors=[test-editor.js]
- "pubmat_test_editor_mime": "MIME" | kind=code-symbol | source=promo/pubmat/test-editor.js:L7 | neighbors=[test-editor.js]
- "pubmat_test_editor_path": "path" | kind=code-symbol | source=promo/pubmat/test-editor.js:L2 | neighbors=[test-editor.js]
- "pubmat_test_editor_server": "server" | kind=code-symbol | source=promo/pubmat/test-editor.js:L10 | neighbors=[test-editor.js]
- "s": "S" | kind=code-symbol | neighbors=[SessionAuthService]
- "scenes_architecture_ease": "ease" | kind=code-symbol | source=promotion/src/scenes/Architecture.tsx:L9 | neighbors=[Architecture.tsx]
- "scenes_architecture_steps": "steps" | kind=code-symbol | source=promotion/src/scenes/Architecture.tsx:L11 | neighbors=[Architecture.tsx]
- "scenes_intro_ease": "ease" | kind=code-symbol | source=promotion/src/scenes/Intro.tsx:L9 | neighbors=[Intro.tsx]
- "scenes_outro_ease": "ease" | kind=code-symbol | source=promotion/src/scenes/Outro.tsx:L7 | neighbors=[Outro.tsx]
- "scenes_problem_ease": "ease" | kind=code-symbol | source=promotion/src/scenes/Problem.tsx:L9 | neighbors=[Problem.tsx]
- "scenes_problem_points": "points" | kind=code-symbol | source=promotion/src/scenes/Problem.tsx:L11 | neighbors=[Problem.tsx]
- "scenes_sceneshell_ease": "ease" | kind=code-symbol | source=promotion/src/scenes/SceneShell.tsx:L5 | neighbors=[SceneShell.tsx]
- "scenes_sceneshell_headline": "Headline()" | kind=code-symbol | source=promotion/src/scenes/SceneShell.tsx:L48 | neighbors=[SceneShell.tsx]
- "scenes_sceneshell_sub": "Sub()" | kind=code-symbol | source=promotion/src/scenes/SceneShell.tsx:L78 | neighbors=[SceneShell.tsx]
- "scenes_usecases_cases": "cases" | kind=code-symbol | source=promotion/src/scenes/UseCases.tsx:L14 | neighbors=[UseCases.tsx]
- "scenes_usecases_ease": "ease" | kind=code-symbol | source=promotion/src/scenes/UseCases.tsx:L12 | neighbors=[UseCases.tsx]
- "scenes_usecases_screencarousel": "ScreenCarousel()" | kind=code-symbol | source=promotion/src/scenes/UseCases.tsx:L25 | neighbors=[UseCases.tsx]
- "scenes_usecases_screens": "SCREENS" | kind=code-symbol | source=promotion/src/scenes/UseCases.tsx:L22 | neighbors=[UseCases.tsx]
- "scenes_x402_ease": "ease" | kind=code-symbol | source=promotion/src/scenes/X402.tsx:L8 | neighbors=[X402.tsx]
- "screens_agentdetailscreen_inforow": "InfoRow()" | kind=code-symbol | source=frontend/src/screens/AgentDetailScreen.tsx:L400 | neighbors=[AgentDetailScreen.tsx]
- "screens_agentdetailscreen_metricbox": "MetricBox()" | kind=code-symbol | source=frontend/src/screens/AgentDetailScreen.tsx:L391 | neighbors=[AgentDetailScreen.tsx]
- "screens_agentdetailscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/AgentDetailScreen.tsx:L409 | neighbors=[AgentDetailScreen.tsx]
- "screens_agentlistscreen_emptyagents": "EmptyAgents()" | kind=code-symbol | source=frontend/src/screens/AgentListScreen.tsx:L224 | neighbors=[AgentListScreen.tsx]
- "screens_agentlistscreen_noir_mark": "NOIR_MARK" | kind=code-symbol | source=frontend/src/screens/AgentListScreen.tsx:L27 | neighbors=[AgentListScreen.tsx]
- "screens_agentlistscreen_steprow": "StepRow()" | kind=code-symbol | source=frontend/src/screens/AgentListScreen.tsx:L277 | neighbors=[AgentListScreen.tsx]
- "screens_agentlistscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/AgentListScreen.tsx:L288 | neighbors=[AgentListScreen.tsx]
- "screens_blockchainscreen_blockchainscreen": "BlockchainScreen()" | kind=code-symbol | source=frontend/src/screens/BlockchainScreen.tsx:L25 | neighbors=[BlockchainScreen.tsx]
- "screens_blockchainscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/BlockchainScreen.tsx:L213 | neighbors=[BlockchainScreen.tsx]
- "screens_cardsscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/CardsScreen.tsx:L189 | neighbors=[CardsScreen.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-075.json

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
