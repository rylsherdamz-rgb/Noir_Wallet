# Node Description Batch 63 of 84

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

- "constants_config_contracts": "CONTRACTS" | kind=code-symbol | source=frontend/src/constants/config.ts:L49 | neighbors=[config.ts]
- "constants_config_env": "ENV" | kind=code-symbol | source=frontend/src/constants/config.ts:L3 | neighbors=[config.ts]
- "constants_config_getenvvars": "getEnvVars()" | kind=code-symbol | source=frontend/src/constants/config.ts:L22 | neighbors=[config.ts]
- "constants_config_stellarnetworkname": "StellarNetworkName" | kind=code-symbol | source=frontend/src/constants/config.ts:L64 | neighbors=[config.ts]
- "demo_scenes_nfctagscene_ease": "ease" | kind=code-symbol | source=promotion/src/demo-scenes/NfcTagScene.tsx:L17 | neighbors=[NfcTagScene.tsx]
- "demo_scenes_nfctagscene_sceneprops": "SceneProps" | kind=code-symbol | source=promotion/src/demo-scenes/NfcTagScene.tsx:L15 | neighbors=[NfcTagScene.tsx]
- "demo_scenes_posescrowscene_clamp": "clamp" | kind=code-symbol | source=promotion/src/demo-scenes/PosEscrowScene.tsx:L16 | neighbors=[PosEscrowScene.tsx]
- "demo_scenes_posescrowscene_ease": "ease" | kind=code-symbol | source=promotion/src/demo-scenes/PosEscrowScene.tsx:L17 | neighbors=[PosEscrowScene.tsx]
- "demo_scenes_posescrowscene_sceneprops": "SceneProps" | kind=code-symbol | source=promotion/src/demo-scenes/PosEscrowScene.tsx:L14 | neighbors=[PosEscrowScene.tsx]
- "demo_scenes_subtitle_subtitleprops": "SubtitleProps" | kind=code-symbol | source=promotion/src/demo-scenes/Subtitle.tsx:L6 | neighbors=[Subtitle.tsx]
- "demo_scenes_taptopayscene_clamp": "clamp" | kind=code-symbol | source=promotion/src/demo-scenes/TapToPayScene.tsx:L17 | neighbors=[TapToPayScene.tsx]
- "demo_scenes_taptopayscene_ease": "ease" | kind=code-symbol | source=promotion/src/demo-scenes/TapToPayScene.tsx:L16 | neighbors=[TapToPayScene.tsx]
- "demo_scenes_taptopayscene_sceneprops": "SceneProps" | kind=code-symbol | source=promotion/src/demo-scenes/TapToPayScene.tsx:L14 | neighbors=[TapToPayScene.tsx]
- "demo_scenes_titlescenes_introscene": "IntroScene()" | kind=code-symbol | source=promotion/src/demo-scenes/TitleScenes.tsx:L52 | neighbors=[TitleScenes.tsx]
- "demo_scenes_titlescenes_logotile": "LogoTile()" | kind=code-symbol | source=promotion/src/demo-scenes/TitleScenes.tsx:L23 | neighbors=[TitleScenes.tsx]
- "demo_scenes_titlescenes_outroscene": "OutroScene()" | kind=code-symbol | source=promotion/src/demo-scenes/TitleScenes.tsx:L158 | neighbors=[TitleScenes.tsx]
- "demo_scenes_titlescenes_problemscene": "ProblemScene()" | kind=code-symbol | source=promotion/src/demo-scenes/TitleScenes.tsx:L88 | neighbors=[TitleScenes.tsx]
- "demo_scenes_titlescenes_sceneprops": "SceneProps" | kind=code-symbol | source=promotion/src/demo-scenes/TitleScenes.tsx:L21 | neighbors=[TitleScenes.tsx]
- "demo_scenes_walkthroughscenes_sceneprops": "SceneProps" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L12 | neighbors=[WalkthroughScenes.tsx]
- "demo_scenes_walkthroughscenes_walk": "Walk()" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L15 | neighbors=[WalkthroughScenes.tsx]
- "domain_x402_addressscval": "addressScVal()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L64 | neighbors=[x402.ts]
- "domain_x402_agentpolicyargs": "agentPolicyArgs()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L18 | neighbors=[x402.ts]
- "domain_x402_devicenonces": "deviceNonces" | kind=code-symbol | source=frontend/src/domain/x402.ts:L33 | neighbors=[x402.ts]
- "domain_x402_ensureagentinsecurestore": "ensureAgentInSecureStore()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L35 | neighbors=[x402.ts]
- "domain_x402_rationale_555": "NOTE: do NOT manually increment here. invokeContract builds the tx with" | kind=entity | source=frontend/src/domain/x402.ts:L555 | neighbors=[x402.ts]
- "domain_x402_rationale_571": "NOTE: do NOT manually increment here. invokeContract builds the tx with" | kind=entity | source=frontend/src/domain/x402.ts:L571 | neighbors=[x402.ts]
- "domain_x402_rationale_81": "IMPORTANT: this migrates ONLY a genuine legacy agent, identified by the old" | kind=entity | source=frontend/src/domain/x402.ts:L81 | neighbors=[x402.ts]
- "domain_x402_rationale_97": "IMPORTANT: this migrates ONLY a genuine legacy agent, identified by the old" | kind=entity | source=frontend/src/domain/x402.ts:L97 | neighbors=[x402.ts]
- "domain_x402_securestore": "SecureStore" | kind=code-symbol | source=frontend/src/domain/x402.ts:L8 | neighbors=[x402.ts]
- "domain_x402_synccreatedtimestamp": "syncCreatedTimestamp()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L47 | neighbors=[x402.ts]
- "examples_pdax_balances_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_balances.rs:L12 | neighbors=[pdax_balances.rs]
- "examples_pdax_crypto_deposit_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_crypto_deposit.rs:L13 | neighbors=[pdax_crypto_deposit.rs]
- "examples_pdax_crypto_transactions_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_crypto_transactions.rs:L14 | neighbors=[pdax_crypto_transactions.rs]
- "examples_pdax_crypto_withdraw_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_crypto_withdraw.rs:L23 | neighbors=[pdax_crypto_withdraw.rs]
- "examples_pdax_fiat_deposit_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_fiat_deposit.rs:L18 | neighbors=[pdax_fiat_deposit.rs]
- "examples_pdax_fiat_transactions_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_fiat_transactions.rs:L14 | neighbors=[pdax_fiat_transactions.rs]
- "examples_pdax_fiat_withdraw_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_fiat_withdraw.rs:L18 | neighbors=[pdax_fiat_withdraw.rs]
- "examples_pdax_firm_quote_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_firm_quote.rs:L17 | neighbors=[pdax_firm_quote.rs]
- "examples_pdax_indicative_price_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_indicative_price.rs:L15 | neighbors=[pdax_indicative_price.rs]
- "examples_pdax_order_details_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_order_details.rs:L12 | neighbors=[pdax_order_details.rs]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-062.json

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
