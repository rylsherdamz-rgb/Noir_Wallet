# Node Description Batch 59 of 84

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

- "src_rate_limiter_prune_horizon_is_a_full_window_behind": "prune_horizon_is_a_full_window_behind()" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L83 | neighbors=[rate_limiter.rs, .new()]
- "src_rate_limiter_ratelimiter_check": ".check()" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L38 | neighbors=[RateLimiter, .window_start()]
- "src_rate_limiter_ratelimiter_prune_before": ".prune_before()" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L49 | neighbors=[RateLimiter, .window_start()]
- "src_rate_limiter_snaps_to_stable_window_boundaries": "snaps_to_stable_window_boundaries()" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L59 | neighbors=[rate_limiter.rs, .new()]
- "src_root_remotionroot": "RemotionRoot()" | kind=code-symbol | source=promotion/src/Root.tsx:L68 | neighbors=[index.ts, Root.tsx]
- "src_voiceover_script_scenescript": "SceneScript" | kind=code-symbol | source=promotion/src/voiceover-script.ts:L5 | neighbors=[generate-voiceover.ts, voiceover-script.ts]
- "tests_integration_deploy_device_registry": "deploy_device_registry()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L23 | neighbors=[integration.rs, setup()]
- "tests_integration_rate_limit_counter_is_shared_and_atomic": "rate_limit_counter_is_shared_and_atomic()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L419 | neighbors=[integration.rs, test_pool()]
- "tests_integration_test_balance_of_unfunded_is_zero": "test_balance_of_unfunded_is_zero()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L93 | neighbors=[integration.rs, setup()]
- "tests_integration_test_is_authorized_false_for_unknown_device": "test_is_authorized_false_for_unknown_device()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L166 | neighbors=[integration.rs, deploy()]
- "tests_integration_test_sweep_on_empty_escrow_is_noop": "test_sweep_on_empty_escrow_is_noop()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L305 | neighbors=[integration.rs, setup()]
- "tests_integration_test_sweep_on_revoke_returns_all_funds_to_owner": "test_sweep_on_revoke_returns_all_funds_to_owner()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L274 | neighbors=[integration.rs, setup()]
- "tests_integration_test_sweep_rejected_while_agent_active": "test_sweep_rejected_while_agent_active()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L294 | neighbors=[integration.rs, setup()]
- "tests_integration_webhook_for_unknown_order_changes_nothing": "webhook_for_unknown_order_changes_nothing()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L403 | neighbors=[integration.rs, test_pool()]
- "tests_setup_contractid": "contractId()" | kind=code-symbol | source=frontend/tests/setup.ts:L56 | neighbors=[setup.ts, native()]
- "tests_setup_native": "native()" | kind=code-symbol | source=frontend/tests/setup.ts:L53 | neighbors=[setup.ts, contractId()]
- "types_index_assetcode": "AssetCode" | kind=code-symbol | source=frontend/src/types/index.ts:L9 | neighbors=[stellar-service.ts, index.ts]
- "types_index_chatmessage": "ChatMessage" | kind=code-symbol | source=frontend/src/types/index.ts:L82 | neighbors=[ChatBubble.tsx, index.ts]
- "types_index_securitysettings": "SecuritySettings" | kind=code-symbol | source=frontend/src/types/index.ts:L11 | neighbors=[useAppStore.ts, index.ts]
- "types_index_user": "User" | kind=code-symbol | source=frontend/src/types/index.ts:L16 | neighbors=[useAppStore.ts, index.ts]
- "uitest_seed_deriveat": "deriveAt()" | kind=code-symbol | source=frontend/uitest/seed.js:L16 | neighbors=[seed.js, buildSeed()]
- "uitest_seed_tohex": "toHex()" | kind=code-symbol | source=frontend/uitest/seed.js:L13 | neighbors=[seed.js, buildSeed()]
- "agent_id_agentdetailroute": "AgentDetailRoute()" | kind=code-symbol | source=frontend/app/agent/[id].tsx:L3 | neighbors=[[id].tsx]
- "app_cards_cardsroute": "CardsRoute()" | kind=code-symbol | source=frontend/app/cards.tsx:L3 | neighbors=[cards.tsx]
- "app_fiat_balanceentry": "BalanceEntry" | kind=code-symbol | source=frontend/app/fiat.tsx:L16 | neighbors=[fiat.tsx]
- "app_fiat_beneficiaryinfo": "BeneficiaryInfo" | kind=code-symbol | source=frontend/app/fiat.tsx:L22 | neighbors=[fiat.tsx]
- "app_fiat_fiatscreen": "FiatScreen()" | kind=code-symbol | source=frontend/app/fiat.tsx:L28 | neighbors=[fiat.tsx]
- "app_fiat_mode": "Mode" | kind=code-symbol | source=frontend/app/fiat.tsx:L14 | neighbors=[fiat.tsx]
- "app_fiat_styles": "styles" | kind=code-symbol | source=frontend/app/fiat.tsx:L235 | neighbors=[fiat.tsx]
- "app_import_wallet_importwalletroute": "ImportWalletRoute()" | kind=code-symbol | source=frontend/app/import-wallet.tsx:L8 | neighbors=[import-wallet.tsx]
- "app_index_index": "Index()" | kind=code-symbol | source=frontend/app/index.tsx:L12 | neighbors=[index.tsx]
- "app_index_noir_mark": "NOIR_MARK" | kind=code-symbol | source=frontend/app/index.tsx:L9 | neighbors=[index.tsx]
- "app_index_styles": "styles" | kind=code-symbol | source=frontend/app/index.tsx:L102 | neighbors=[index.tsx]
- "app_layout_eventpolyfill_constructor": ".constructor()" | kind=code-symbol | source=frontend/app/_layout.tsx:L12 | neighbors=[EventPolyfill]
- "app_layout_eventpolyfill_preventdefault": ".preventDefault()" | kind=code-symbol | source=frontend/app/_layout.tsx:L18 | neighbors=[EventPolyfill]
- "app_layout_eventpolyfill_stoppropagation": ".stopPropagation()" | kind=code-symbol | source=frontend/app/_layout.tsx:L19 | neighbors=[EventPolyfill]
- "app_layout_eventtargetpolyfill_addeventlistener": ".addEventListener()" | kind=code-symbol | source=frontend/app/_layout.tsx:L26 | neighbors=[EventTargetPolyfill]
- "app_layout_eventtargetpolyfill_dispatchevent": ".dispatchEvent()" | kind=code-symbol | source=frontend/app/_layout.tsx:L33 | neighbors=[EventTargetPolyfill]
- "app_layout_eventtargetpolyfill_removeeventlistener": ".removeEventListener()" | kind=code-symbol | source=frontend/app/_layout.tsx:L30 | neighbors=[EventTargetPolyfill]
- "app_layout_rootlayout": "RootLayout()" | kind=code-symbol | source=frontend/app/_layout.tsx:L61 | neighbors=[_layout.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-058.json

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
