# Node Description Batch 28 of 84

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

- "tests_integration_test_get_device_after_revoke_panics": "test_get_device_after_revoke_panics()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L108 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_initialize_happy_path": "test_initialize_happy_path()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L29 | neighbors=[integration.rs, deploy(), deploy_agent_registry(), random_address()]
- "tests_integration_test_is_auth_false_after_expiry": "test_is_auth_false_after_expiry()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L143 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_is_auth_false_for_stranger": "test_is_auth_false_for_stranger()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L127 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_is_auth_true_for_authorized_agent": "test_is_auth_true_for_authorized_agent()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L112 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_is_authorized_false_for_wrong_agent": "test_is_authorized_false_for_wrong_agent()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L147 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_register_and_get_agent_roundtrip": "test_register_and_get_agent_roundtrip()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L41 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_register_maps_device": "test_register_maps_device()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L45 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_register_with_negative_max_amount_rejected": "test_register_with_negative_max_amount_rejected()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L98 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_register_with_past_expiry_rejected": "test_register_with_past_expiry_rejected()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L81 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_revoke_non_owner_rejected": "test_revoke_non_owner_rejected()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L177 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_revoke_only_removes_owned_device": "test_revoke_only_removes_owned_device()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L125 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_revoke_removes_authorization": "test_revoke_removes_authorization()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L164 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_revoke_removes_entry_enabling_re_registration": "test_revoke_removes_entry_enabling_re_registration()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L83 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_revoke_unknown_device_panics": "test_revoke_unknown_device_panics()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L181 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_wrong_asset_rejected": "test_wrong_asset_rejected()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L187 | neighbors=[integration.rs, create_token(), random_address(), setup()]
- "tests_integration_unknown_asset_is_rejected_by_the_database": "unknown_asset_is_rejected_by_the_database()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L342 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_upsert_user_is_idempotent": "upsert_user_is_idempotent()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L480 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_webhook_redelivery_is_idempotent": "webhook_redelivery_is_idempotent()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L366 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "types_index_nfctag": "NFCTag" | kind=code-symbol | source=frontend/src/types/index.ts:L75 | neighbors=[useNfc.ts, MerchantPosScreen.tsx, nfc.ts, index.ts]
- "app_profile": "profile.tsx" | kind=code-symbol | source=frontend/app/profile.tsx:L1 | neighbors=[ProfileScreen.tsx, ProfileScreen(), 1fe9de1 migrating workspace]
- "app_receive": "receive.tsx" | kind=code-symbol | source=frontend/app/receive.tsx:L1 | neighbors=[ReceiveScreen.tsx, ReceiveScreen(), 1fe9de1 migrating workspace]
- "app_screens_agentsapp_agentsapp": "AgentsApp()" | kind=code-symbol | source=promotion/src/app-screens/AgentsApp.tsx:L30 | neighbors=[AgentsApp.tsx, WalkthroughScenes.tsx, X402.tsx]
- "app_screens_dashboardapp_dashboardapp": "DashboardApp()" | kind=code-symbol | source=promotion/src/app-screens/DashboardApp.tsx:L22 | neighbors=[DashboardApp.tsx, WalkthroughScenes.tsx, UseCases.tsx]
- "app_screens_devicesapp_devicesapp": "DevicesApp()" | kind=code-symbol | source=promotion/src/app-screens/DevicesApp.tsx:L14 | neighbors=[DevicesApp.tsx, NfcTagScene.tsx, Problem.tsx]
- "app_screens_receiveapp_receiveapp": "ReceiveApp()" | kind=code-symbol | source=promotion/src/app-screens/ReceiveApp.tsx:L52 | neighbors=[ReceiveApp.tsx, WalkthroughScenes.tsx, UseCases.tsx]
- "app_screens_sendapp_sendapp": "SendApp()" | kind=code-symbol | source=promotion/src/app-screens/SendApp.tsx:L10 | neighbors=[SendApp.tsx, WalkthroughScenes.tsx, UseCases.tsx]
- "app_screens_transactionsapp_transactionsapp": "TransactionsApp()" | kind=code-symbol | source=promotion/src/app-screens/TransactionsApp.tsx:L19 | neighbors=[TransactionsApp.tsx, WalkthroughScenes.tsx, UseCases.tsx]
- "app_screens_welcomeapp_welcomeapp": "WelcomeApp()" | kind=code-symbol | source=promotion/src/app-screens/WelcomeApp.tsx:L28 | neighbors=[WelcomeApp.tsx, WalkthroughScenes.tsx, Intro.tsx]
- "app_send": "send.tsx" | kind=code-symbol | source=frontend/app/send.tsx:L1 | neighbors=[SendScreen.tsx, SendScreen(), 1fe9de1 migrating workspace]
- "app_transactions": "transactions.tsx" | kind=code-symbol | source=frontend/app/transactions.tsx:L1 | neighbors=[TransactionHistoryScreen.tsx, TransactionHistoryScreen(), 1fe9de1 migrating workspace]
- "brand_signalripple_signalripple": "SignalRipple()" | kind=code-symbol | source=frontend/src/components/brand/SignalRipple.tsx:L29 | neighbors=[SignalRipple.tsx, AgentListScreen.tsx, DashboardScreen.tsx]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@0836500a2426a5c32160703fab0a556fbec07737": "0836500 docs(evidence): add Week 1 evidence index" | kind=Commit | source=git | neighbors=[instaward-development, 9b8bcad docs(progress): record Week 1 d…, 93170d6 docs(readme): link the architec…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@09af30b1cc045e5bc2f4b790ba9b32e022a26ce1": "09af30b feat(contracts): constrained delegated authorization + sweep-on-revoke" | kind=Commit | source=git | neighbors=[instaward-development, 15bf75e docs(instaward): track SOW prog…, 1edd811 added latest changes]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@0e994abc90f5a367362f72a52183e44062b32e6e": "0e994ab ci: run frontend workflow on the instaward branches" | kind=Commit | source=git | neighbors=[instaward-development, ac406d9 ci: pin rust toolchain to 1.98.…, 7308666 ci: add Soroban contracts workf…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@14b8c4b9fcf49fabd98a6d80b5eda65237f46bad": "14b8c4b chore(deploy): add contract redeploy script + testnet deployment eviden…" | kind=Commit | source=git | neighbors=[instaward-development, d315d3c docs(evidence): capture passing…, 15bf75e docs(instaward): track SOW prog…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@170c60c119120a03e0642dc9935877fb9606af2c": "170c60c Step 4 and Step 5" | kind=Commit | source=git | neighbors=[main, 4697f56 feat(contracts): deploy soroban…, 9152806 Step 3: Write Initialize address]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@5a7291912b02d58e55475cc5f56159d6b240545d": "5a72919 docs(guide): update contract build guide for constrained delegated auth" | kind=Commit | source=git | neighbors=[instaward-development, a6fbd8c docs: add architecture referenc…, 90c2a5d docs(readme): correct contract …]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@6691b0696ea754b0a33cbaaf6f921565fba6fc96": "6691b06 ci: make WASM hash check informational (soroban embeds host path)" | kind=Commit | source=git | neighbors=[instaward-development, f6a15ab refactor(backend): flatten to b…, 84fd5a0 docs(progress): record CI statu…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@7308666134b4d22373a8c1abe053b5dd4e09eb4c": "7308666 ci: add Soroban contracts workflow (build, test, verify WASM hashes)" | kind=Commit | source=git | neighbors=[instaward-development, 0e994ab ci: run frontend workflow on th…, 9b8bcad docs(progress): record Week 1 d…]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-027.json

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
