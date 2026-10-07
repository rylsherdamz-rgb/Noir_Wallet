# Node Description Batch 40 of 84

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
Write every description in Portuguese (pt). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "src_pdax_pdaxloginresponse": "PdaxLoginResponse" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L339 | neighbors=[pdax.rs, PdaxLoginTokens, PdaxMfaChallenge]
- "src_pdax_pdaxrefreshtokens": "PdaxRefreshTokens" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L303 | neighbors=[pdax.rs, Option, String]
- "src_rate_limiter_degenerate_config_does_not_divide_by_zero": "degenerate_config_does_not_divide_by_zero()" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L91 | neighbors=[rate_limiter.rs, .new(), .window_start()]
- "src_voiceover_script_scene_script": "SCENE_SCRIPT" | kind=code-symbol | source=promotion/src/voiceover-script.ts:L13 | neighbors=[generate-voiceover.ts, NoirDemo.tsx, voiceover-script.ts]
- "tests_02_stellar_test": "02-stellar.test.ts" | kind=code-symbol | source=frontend/tests/02-stellar.test.ts:L1 | neighbors=[9313cd3 test: 108 tests across 9 suites…, bd5fbe7 fix issue and added mainet addr…, stellar.ts]
- "tests_04_api_test": "04-api.test.ts" | kind=code-symbol | source=frontend/tests/04-api.test.ts:L1 | neighbors=[9313cd3 test: 108 tests across 9 suites…, bd5fbe7 fix issue and added mainet addr…, api.ts]
- "tests_08_fxrates_test": "08-fxrates.test.ts" | kind=code-symbol | source=frontend/tests/08-fxrates.test.ts:L1 | neighbors=[9313cd3 test: 108 tests across 9 suites…, bd5fbe7 fix issue and added mainet addr…, fxRates.ts]
- "tests_integration_test_authorize_in_policy_payment": "test_authorize_in_policy_payment()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L112 | neighbors=[integration.rs, random_address(), setup()]
- "tests_integration_test_expired_authorization_rejected": "test_expired_authorization_rejected()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L202 | neighbors=[integration.rs, random_address(), setup()]
- "tests_integration_test_insufficient_balance_rejected": "test_insufficient_balance_rejected()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L233 | neighbors=[integration.rs, random_address(), setup()]
- "tests_integration_test_over_limit_payment_rejected": "test_over_limit_payment_rejected()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L173 | neighbors=[integration.rs, random_address(), setup()]
- "tests_integration_test_replayed_nonce_rejected": "test_replayed_nonce_rejected()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L217 | neighbors=[integration.rs, random_address(), setup()]
- "tests_integration_test_revoked_agent_rejected": "test_revoked_agent_rejected()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L257 | neighbors=[integration.rs, random_address(), setup()]
- "tests_integration_test_unauthorized_agent_rejected": "test_unauthorized_agent_rejected()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L159 | neighbors=[integration.rs, random_address(), setup()]
- "tests_integration_test_unauthorized_register_rejected": "test_unauthorized_register_rejected()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L69 | neighbors=[integration.rs, random_address(), random_bytes_32()]
- "transaction_id": "[id].tsx" | kind=code-symbol | source=frontend/app/transaction/[id].tsx:L1 | neighbors=[1fe9de1 migrating workspace, TransactionDetailScreen.tsx, TransactionDetailScreen()]
- "types_index_balance": "Balance" | kind=code-symbol | source=frontend/src/types/index.ts:L58 | neighbors=[api.ts, useAppStore.ts, index.ts]
- "types_index_merchantsettings": "MerchantSettings" | kind=code-symbol | source=frontend/src/types/index.ts:L68 | neighbors=[api.ts, useAppStore.ts, index.ts]
- "types_index_notification": "Notification" | kind=code-symbol | source=frontend/src/types/index.ts:L99 | neighbors=[NotificationsScreen.tsx, api.ts, index.ts]
- "types_index_queuedpayment": "QueuedPayment" | kind=code-symbol | source=frontend/src/types/index.ts:L135 | neighbors=[MerchantPosScreen.tsx, useAppStore.ts, index.ts]
- "types_index_stellarnetwork": "StellarNetwork" | kind=code-symbol | source=frontend/src/types/index.ts:L3 | neighbors=[useAppStore.ts, settings.tsx, index.ts]
- "types_index_txfilter": "TxFilter" | kind=code-symbol | source=frontend/src/types/index.ts:L7 | neighbors=[FilterChips.tsx, TransactionHistoryScreen.tsx, index.ts]
- "vec": "Vec" | kind=code-symbol | neighbors=[EncryptedPayload, PdaxLoginTokens, PdaxSession]
- "app_lock_formatcountdown": "formatCountdown()" | kind=code-symbol | source=frontend/app/lock.tsx:L20 | neighbors=[lock.tsx, LockScreen()]
- "app_lock_lockscreen": "LockScreen()" | kind=code-symbol | source=frontend/app/lock.tsx:L27 | neighbors=[lock.tsx, formatCountdown()]
- "app_screens_blockchainapp_blockchainapp": "BlockchainApp()" | kind=code-symbol | source=promotion/src/app-screens/BlockchainApp.tsx:L16 | neighbors=[BlockchainApp.tsx, Architecture.tsx]
- "app_screens_receiveapp_findermodule": "finderModule()" | kind=code-symbol | source=promotion/src/app-screens/ReceiveApp.tsx:L16 | neighbors=[ReceiveApp.tsx, QRCodePattern()]
- "app_screens_receiveapp_isfinder": "isFinder()" | kind=code-symbol | source=promotion/src/app-screens/ReceiveApp.tsx:L11 | neighbors=[ReceiveApp.tsx, QRCodePattern()]
- "app_screens_receiveapp_rand": "rand()" | kind=code-symbol | source=promotion/src/app-screens/ReceiveApp.tsx:L25 | neighbors=[ReceiveApp.tsx, QRCodePattern()]
- "app_screens_revokeapp_revokeapp": "RevokeApp()" | kind=code-symbol | source=promotion/src/app-screens/RevokeApp.tsx:L26 | neighbors=[RevokeApp.tsx, WalkthroughScenes.tsx]
- "client": "Client" | kind=code-symbol | neighbors=[pdax.rs, PdaxClient]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@91528064e45f49d966f2272c3e1b59e564ceb314": "9152806 Step 3: Write Initialize address" | kind=Commit | source=git | neighbors=[main, 170c60c Step 4 and Step 5]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f8e86a93bac1012a75bd6e4a10af618482940a84": "f8e86a9 Step 2 — Define contract storage types" | kind=Commit | source=git | neighbors=[main, fa86c2e Step 3: Write Initialize address]
- "common_pdax_env_cache_env_path": "env_path()" | kind=code-symbol | source=unused/pdax-backend/examples/common/pdax_env_cache.rs:L8 | neighbors=[pdax_env_cache.rs, save_session()]
- "common_pdax_env_cache_save_session": "save_session()" | kind=code-symbol | source=unused/pdax-backend/examples/common/pdax_env_cache.rs:L15 | neighbors=[pdax_env_cache.rs, env_path()]
- "components_balancecard_balancecard": "BalanceCard()" | kind=code-symbol | source=frontend/src/components/BalanceCard.tsx:L56 | neighbors=[BalanceCard.tsx, DashboardScreen.tsx]
- "components_filterchips_filterchips": "FilterChips()" | kind=code-symbol | source=frontend/src/components/FilterChips.tsx:L18 | neighbors=[FilterChips.tsx, TransactionHistoryScreen.tsx]
- "components_keyboardawarescreen_keyboardawarescreen": "KeyboardAwareScreen()" | kind=code-symbol | source=frontend/src/components/KeyboardAwareScreen.tsx:L29 | neighbors=[KeyboardAwareScreen.tsx, SendScreen.tsx]
- "components_screenheader_screenheader": "ScreenHeader()" | kind=code-symbol | source=frontend/src/components/ScreenHeader.tsx:L20 | neighbors=[ScreenHeader.tsx, TransactionHistoryScreen.tsx]
- "components_searchbar_searchbar": "SearchBar()" | kind=code-symbol | source=frontend/src/components/SearchBar.tsx:L13 | neighbors=[SearchBar.tsx, TransactionHistoryScreen.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-039.json

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
