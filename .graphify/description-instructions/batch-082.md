# Node Description Batch 83 of 84

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

- "src_root_demofallbackframes": "demoFallbackFrames" | kind=code-symbol | source=promotion/src/Root.tsx:L21 | neighbors=[Root.tsx]
- "src_root_noirdemoprops": "NoirDemoProps" | kind=code-symbol | source=promotion/src/Root.tsx:L19 | neighbors=[Root.tsx]
- "src_root_noirpromoprops": "NoirPromoProps" | kind=code-symbol | source=promo/src/Root.tsx:L20 | neighbors=[Root.tsx]
- "src_root_scene_audio_files": "SCENE_AUDIO_FILES" | kind=code-symbol | source=promo/src/Root.tsx:L9 | neighbors=[Root.tsx]
- "src_state_appstate_new": ".new()" | kind=code-symbol | source=unused/pdax-backend/src/state.rs:L28 | neighbors=[AppState]
- "stellarassetclient": "StellarAssetClient" | kind=code-symbol | neighbors=[Fixture]
- "store_useappstore_appstate": "AppState" | kind=code-symbol | source=frontend/src/store/useAppStore.ts:L36 | neighbors=[useAppStore.ts]
- "store_useappstore_hashcontractids": "hashContractIds()" | kind=code-symbol | source=frontend/src/store/useAppStore.ts:L21 | neighbors=[useAppStore.ts]
- "store_useappstore_initialstate": "initialState" | kind=code-symbol | source=frontend/src/store/useAppStore.ts:L81 | neighbors=[useAppStore.ts]
- "store_useappstore_store_version_hash": "STORE_VERSION_HASH" | kind=code-symbol | source=frontend/src/store/useAppStore.ts:L19 | neighbors=[useAppStore.ts]
- "tabs_devices_devicesscreen": "DevicesScreen()" | kind=code-symbol | source=frontend/app/(tabs)/devices.tsx:L3 | neighbors=[devices.tsx]
- "tabs_index_tabindex": "TabIndex()" | kind=code-symbol | source=frontend/app/(tabs)/index.tsx:L3 | neighbors=[index.tsx]
- "tabs_layout_ioniconname": "IoniconName" | kind=code-symbol | source=frontend/app/(tabs)/_layout.tsx:L7 | neighbors=[_layout.tsx]
- "tabs_layout_styles": "styles" | kind=code-symbol | source=frontend/app/(tabs)/_layout.tsx:L78 | neighbors=[_layout.tsx]
- "tabs_layout_tabicon": "TabIcon()" | kind=code-symbol | source=frontend/app/(tabs)/_layout.tsx:L9 | neighbors=[_layout.tsx]
- "tabs_layout_tablayout": "TabLayout()" | kind=code-symbol | source=frontend/app/(tabs)/_layout.tsx:L20 | neighbors=[_layout.tsx]
- "tabs_pos_agentstab": "AgentsTab()" | kind=code-symbol | source=frontend/app/(tabs)/pos.tsx:L3 | neighbors=[pos.tsx]
- "tabs_settings_divider": "Divider()" | kind=code-symbol | source=frontend/app/(tabs)/settings.tsx:L261 | neighbors=[settings.tsx]
- "tabs_settings_row": "Row()" | kind=code-symbol | source=frontend/app/(tabs)/settings.tsx:L228 | neighbors=[settings.tsx]
- "tabs_settings_settingsscreen": "SettingsScreen()" | kind=code-symbol | source=frontend/app/(tabs)/settings.tsx:L28 | neighbors=[settings.tsx]
- "tabs_settings_styles": "styles" | kind=code-symbol | source=frontend/app/(tabs)/settings.tsx:L265 | neighbors=[settings.tsx]
- "tabs_settings_timeout_options": "TIMEOUT_OPTIONS" | kind=code-symbol | source=frontend/app/(tabs)/settings.tsx:L21 | neighbors=[settings.tsx]
- "tests_01_x402_test_agenthasbudget": "agentHasBudget()" | kind=code-symbol | source=frontend/tests/01-x402.test.ts:L80 | neighbors=[01-x402.test.ts]
- "tests_01_x402_test_calcbudgetafterpayment": "calcBudgetAfterPayment()" | kind=code-symbol | source=frontend/tests/01-x402.test.ts:L75 | neighbors=[01-x402.test.ts]
- "tests_01_x402_test_mockagentkp": "mockAgentKp" | kind=code-symbol | source=frontend/tests/01-x402.test.ts:L24 | neighbors=[01-x402.test.ts]
- "tests_01_x402_test_mocksecure": "mockSecure" | kind=code-symbol | source=frontend/tests/01-x402.test.ts:L7 | neighbors=[01-x402.test.ts]
- "tests_01_x402_test_totalspentfrombudget": "totalSpentFromBudget()" | kind=code-symbol | source=frontend/tests/01-x402.test.ts:L84 | neighbors=[01-x402.test.ts]
- "tests_09_constants_test_assetcode": "AssetCode" | kind=code-symbol | source=frontend/tests/09-constants.test.ts:L92 | neighbors=[09-constants.test.ts]
- "tests_09_constants_test_devicestatus": "DeviceStatus" | kind=code-symbol | source=frontend/tests/09-constants.test.ts:L107 | neighbors=[09-constants.test.ts]
- "tests_09_constants_test_txfilter": "TxFilter" | kind=code-symbol | source=frontend/tests/09-constants.test.ts:L99 | neighbors=[09-constants.test.ts]
- "tests_09_constants_test_txstatus": "TxStatus" | kind=code-symbol | source=frontend/tests/09-constants.test.ts:L115 | neighbors=[09-constants.test.ts]
- "tests_10_new_features_test_constructor": "constructor()" | kind=code-symbol | source=frontend/tests/10-new-features.test.ts:L72 | neighbors=[10-new-features.test.ts]
- "tests_10_new_features_test_mockfetch": "mockFetch" | kind=code-symbol | source=frontend/tests/10-new-features.test.ts:L201 | neighbors=[10-new-features.test.ts]
- "tests_10_new_features_test_mocksecurestore": "mockSecureStore" | kind=code-symbol | source=frontend/tests/10-new-features.test.ts:L3 | neighbors=[10-new-features.test.ts]
- "tests_13_network_freshness_test_originalnetwork": "originalNetwork" | kind=code-symbol | source=frontend/tests/13-network-freshness.test.ts:L11 | neighbors=[13-network-freshness.test.ts]
- "tests_setup_constructor": "constructor()" | kind=code-symbol | source=frontend/tests/setup.ts:L49 | neighbors=[setup.ts]
- "tests_setup_getassettype": "getAssetType()" | kind=code-symbol | source=frontend/tests/setup.ts:L54 | neighbors=[setup.ts]
- "tests_setup_getcode": "getCode()" | kind=code-symbol | source=frontend/tests/setup.ts:L55 | neighbors=[setup.ts]
- "tests_setup_mockfetch": "mockFetch" | kind=code-symbol | source=frontend/tests/setup.ts:L237 | neighbors=[setup.ts]
- "tests_setup_securestore": "secureStore" | kind=code-symbol | source=frontend/tests/setup.ts:L4 | neighbors=[setup.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-082.json

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
