# Node Description Batch 80 of 84

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

- "services_wallet_walletservice_switchtowallet": ".switchToWallet()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L169 | neighbors=[WalletService]
- "services_wallet_walletservice_validatemnemonic": ".validateMnemonic()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L46 | neighbors=[WalletService]
- "src_api_asset_codes_differ_between_trading_and_withdrawal": "asset_codes_differ_between_trading_and_withdrawal()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L654 | neighbors=[api.rs]
- "src_api_auth_logout": "auth_logout()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L132 | neighbors=[api.rs]
- "src_api_delete_account": "delete_account()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L155 | neighbors=[api.rs]
- "src_api_directions_map_to_pdax_sides": "directions_map_to_pdax_sides()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L643 | neighbors=[api.rs]
- "src_api_get_metrics": "get_metrics()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L606 | neighbors=[api.rs]
- "src_api_get_order": "get_order()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L439 | neighbors=[api.rs]
- "src_api_health_check": "health_check()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L577 | neighbors=[api.rs]
- "src_api_list_orders": "list_orders()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L421 | neighbors=[api.rs]
- "src_api_rejects_non_positive_and_oversized_amounts": "rejects_non_positive_and_oversized_amounts()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L634 | neighbors=[api.rs]
- "src_api_webhook_statuses_map_conservatively": "webhook_statuses_map_conservatively()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L669 | neighbors=[api.rs]
- "src_auth_constant_time_eq_matches_normal_equality": "constant_time_eq_matches_normal_equality()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L305 | neighbors=[auth.rs]
- "src_auth_is_valid_wallet": "is_valid_wallet()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L95 | neighbors=[auth.rs]
- "src_auth_require_wallet": "require_wallet()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L229 | neighbors=[auth.rs]
- "src_auth_sessionauth_new": ".new()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L107 | neighbors=[SessionAuth]
- "src_auth_sessionauth_new_transform": ".new_transform()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L127 | neighbors=[SessionAuth]
- "src_auth_sessionauthservice_s_poll_ready": ".poll_ready()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L151 | neighbors=[SessionAuthService<S>]
- "src_auth_token_hashing_is_stable_and_distinct": "token_hashing_is_stable_and_distinct()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L298 | neighbors=[auth.rs]
- "src_auth_verify_wallet_signature": "verify_wallet_signature()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L69 | neighbors=[auth.rs]
- "src_composition_mycomposition": "MyComposition()" | kind=code-symbol | source=promotion/src/Composition.tsx:L1 | neighbors=[Composition.tsx]
- "src_config_config_pdax_base_url": ".pdax_base_url()" | kind=code-symbol | source=unused/pdax-backend/src/config.rs:L90 | neighbors=[Config]
- "src_crypto_keymanager": "KeyManager" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L18 | neighbors=[crypto.rs]
- "src_crypto_localkeymanager_key_version": ".key_version()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L90 | neighbors=[LocalKeyManager]
- "src_db_repository_apply_webhook_event": ".apply_webhook_event()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L353 | neighbors=[Repository]
- "src_db_repository_claim_order": ".claim_order()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L202 | neighbors=[Repository]
- "src_db_repository_consume_challenge": ".consume_challenge()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L59 | neighbors=[Repository]
- "src_db_repository_create_challenge": ".create_challenge()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L33 | neighbors=[Repository]
- "src_db_repository_create_session": ".create_session()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L87 | neighbors=[Repository]
- "src_db_repository_get_order_by_key": ".get_order_by_key()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L232 | neighbors=[Repository]
- "src_db_repository_get_user_by_wallet": ".get_user_by_wallet()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L166 | neighbors=[Repository]
- "src_db_repository_increment_rate_limit": ".increment_rate_limit()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L383 | neighbors=[Repository]
- "src_db_repository_list_orders_for_wallet": ".list_orders_for_wallet()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L246 | neighbors=[Repository]
- "src_db_repository_mark_user_deleted": ".mark_user_deleted()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L182 | neighbors=[Repository]
- "src_db_repository_new": ".new()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L19 | neighbors=[Repository]
- "src_db_repository_ping": ".ping()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L23 | neighbors=[Repository]
- "src_db_repository_prune_expired_challenges": ".prune_expired_challenges()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L77 | neighbors=[Repository]
- "src_db_repository_prune_rate_limits": ".prune_rate_limits()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L404 | neighbors=[Repository]
- "src_db_repository_record_order_placed": ".record_order_placed()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L291 | neighbors=[Repository]
- "src_db_repository_record_quote": ".record_quote()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L270 | neighbors=[Repository]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-079.json

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
