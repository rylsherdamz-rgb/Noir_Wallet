# Node Description Batch 41 of 84

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

- "components_sectionheader_sectionheader": "SectionHeader()" | kind=code-symbol | source=frontend/src/components/SectionHeader.tsx:L12 | neighbors=[SectionHeader.tsx, settings.tsx]
- "components_smarttip_smarttip": "SmartTip()" | kind=code-symbol | source=frontend/src/components/SmartTip.tsx:L38 | neighbors=[SmartTip.tsx, SendScreen.tsx]
- "components_testnetfaucetbanner_testnetfaucetbanner": "TestnetFaucetBanner()" | kind=code-symbol | source=frontend/src/components/TestnetFaucetBanner.tsx:L10 | neighbors=[TestnetFaucetBanner.tsx, DashboardScreen.tsx]
- "components_toastprovider_toastoptions": "ToastOptions" | kind=code-symbol | source=frontend/src/components/ToastProvider.tsx:L14 | neighbors=[ToastProvider.tsx, ToastState]
- "components_toastprovider_toastprovider": "ToastProvider()" | kind=code-symbol | source=frontend/src/components/ToastProvider.tsx:L36 | neighbors=[_layout.tsx, ToastProvider.tsx]
- "components_toastprovider_toaststate": "ToastState" | kind=code-symbol | source=frontend/src/components/ToastProvider.tsx:L29 | neighbors=[ToastProvider.tsx, ToastOptions]
- "components_walletswitcher_walletswitcher": "WalletSwitcher()" | kind=code-symbol | source=frontend/src/components/WalletSwitcher.tsx:L15 | neighbors=[WalletSwitcher.tsx, ProfileScreen.tsx]
- "constants_config_contractsfor": "contractsFor()" | kind=code-symbol | source=frontend/src/constants/config.ts:L66 | neighbors=[config.ts, 13-network-freshness.test.ts]
- "constants_config_getactivecontractnetwork": "getActiveContractNetwork()" | kind=code-symbol | source=frontend/src/constants/config.ts:L81 | neighbors=[config.ts, 13-network-freshness.test.ts]
- "demo_scenes_nfctagscene_nfctagscene": "NfcTagScene()" | kind=code-symbol | source=promotion/src/demo-scenes/NfcTagScene.tsx:L20 | neighbors=[NfcTagScene.tsx, NoirDemo.tsx]
- "demo_scenes_posescrowscene_posescrowscene": "PosEscrowScene()" | kind=code-symbol | source=promotion/src/demo-scenes/PosEscrowScene.tsx:L31 | neighbors=[PosEscrowScene.tsx, NoirDemo.tsx]
- "demo_scenes_subtitle_subtitle": "Subtitle()" | kind=code-symbol | source=promotion/src/demo-scenes/Subtitle.tsx:L16 | neighbors=[Subtitle.tsx, NoirDemo.tsx]
- "demo_scenes_taptopayscene_taptopayscene": "TapToPayScene()" | kind=code-symbol | source=promotion/src/demo-scenes/TapToPayScene.tsx:L20 | neighbors=[TapToPayScene.tsx, NoirDemo.tsx]
- "demo_scenes_walkthroughscenes_agentscene": "AgentScene()" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L57 | neighbors=[WalkthroughScenes.tsx, NoirDemo.tsx]
- "demo_scenes_walkthroughscenes_dashboardscene": "DashboardScene()" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L46 | neighbors=[WalkthroughScenes.tsx, NoirDemo.tsx]
- "demo_scenes_walkthroughscenes_receivescene": "ReceiveScene()" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L90 | neighbors=[WalkthroughScenes.tsx, NoirDemo.tsx]
- "demo_scenes_walkthroughscenes_revokescene": "RevokeScene()" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L68 | neighbors=[WalkthroughScenes.tsx, NoirDemo.tsx]
- "demo_scenes_walkthroughscenes_sendscene": "SendScene()" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L79 | neighbors=[WalkthroughScenes.tsx, NoirDemo.tsx]
- "demo_scenes_walkthroughscenes_transactionsscene": "TransactionsScene()" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L101 | neighbors=[WalkthroughScenes.tsx, NoirDemo.tsx]
- "demo_scenes_walkthroughscenes_welcomescene": "WelcomeScene()" | kind=code-symbol | source=promotion/src/demo-scenes/WalkthroughScenes.tsx:L35 | neighbors=[WalkthroughScenes.tsx, NoirDemo.tsx]
- "domain_x402_legacydevicekey": "legacyDeviceKey()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L40 | neighbors=[x402.ts, loadAgentMeta()]
- "examples_pdax_login_main": "main()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_login.rs:L13 | neighbors=[pdax_login.rs, print_session()]
- "examples_pdax_login_print_session": "print_session()" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_login.rs:L81 | neighbors=[pdax_login.rs, main()]
- "frontend_babel_config": "babel.config.js" | kind=code-symbol | source=frontend/babel.config.js:L1 | neighbors=[1fe9de1 migrating workspace, ff96a30 chore: rebuild frontend with Ex…]
- "frontend_global_d": "global.d.ts" | kind=code-symbol | source=frontend/global.d.ts:L1 | neighbors=[ff96a30 chore: rebuild frontend with Ex…, *.css]
- "frontend_index": "index.ts" | kind=code-symbol | source=frontend/index.ts:L1 | neighbors=[0354052 feat: remove all mock data, wir…, ff96a30 chore: rebuild frontend with Ex…]
- "frontend_tailwind_config": "tailwind.config.js" | kind=code-symbol | source=frontend/tailwind.config.js:L1 | neighbors=[1fe9de1 migrating workspace, NOTE: Update this to include the paths …]
- "hooks_usecountup_usecountup": "useCountUp()" | kind=code-symbol | source=frontend/src/hooks/useCountUp.ts:L15 | neighbors=[BalanceCard.tsx, useCountUp.ts]
- "hooks_usenfc_usenfc": "useNfc()" | kind=code-symbol | source=frontend/src/hooks/useNfc.ts:L6 | neighbors=[useNfc.ts, DeviceProvisioningScreen.tsx]
- "js_main": "main.js" | kind=code-symbol | source=landing/js/main.js:L1 | neighbors=[51a44a4 Enhance landing page: GitHub st…, d2ad098 landing]
- "karpathywiki_main_aborterror": "abortError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64779 | neighbors=[main.js, throwIfAborted2()]
- "karpathywiki_main_aborterror2": "abortError2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64915 | neighbors=[main.js, throwIfAborted3()]
- "karpathywiki_main_aborterror4": "abortError4()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65350 | neighbors=[main.js, throwIfAborted4()]
- "karpathywiki_main_aborterror5": "abortError5()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68680 | neighbors=[main.js, throwIfAborted5()]
- "karpathywiki_main_addadditionalpropertiestojsonschema": "addAdditionalPropertiesToJsonSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17374 | neighbors=[main.js, visit()]
- "karpathywiki_main_addformat": "addFormat()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17703 | neighbors=[main.js, parseStringDef()]
- "karpathywiki_main_addissuetocontext": "addIssueToContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L12837 | neighbors=[main.js, getErrorMap2()]
- "karpathywiki_main_addlanguagemodelusage": "addLanguageModelUsage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24120 | neighbors=[main.js, addTokenCounts()]
- "karpathywiki_main_addressableforms": "addressableForms()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71424 | neighbors=[main.js, chooseLinkpath()]
- "karpathywiki_main_adjustbatchsizeforresponse": "adjustBatchSizeForResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71879 | neighbors=[main.js, analyzeSource()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-040.json

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
