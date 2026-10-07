# Node Description Batch 27 of 84

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

- "src_api_ensure_pdax_session": "ensure_pdax_session()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L616 | neighbors=[api.rs, execute_conversion(), pdax_balance(), pdax_quote()]
- "src_api_execute_conversion": "execute_conversion()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L340 | neighbors=[api.rs, ensure_pdax_session(), side_for(), run_conversion()]
- "src_api_random_hex": "random_hex()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L31 | neighbors=[api.rs, auth_challenge(), auth_verify(), random_hex_is_the_right_width_and_not_c…]
- "src_auth_sessionauthservice": "SessionAuthService" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L135 | neighbors=[auth.rs, Arc, S, String]
- "src_crypto_decrypt_at_rest": "decrypt_at_rest()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L159 | neighbors=[crypto.rs, .from_bytes(), .unwrap_data_key(), test_encrypt_decrypt_at_rest_roundtrip()]
- "src_crypto_encryptedpayload": "EncryptedPayload" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L97 | neighbors=[crypto.rs, .from_bytes(), .to_bytes(), Vec]
- "src_crypto_localkeymanager_generate_data_key": ".generate_data_key()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L64 | neighbors=[encrypt_at_rest(), LocalKeyManager, .cipher(), test_data_key_wrap_unwrap_roundtrip()]
- "src_crypto_localkeymanager_new": ".new()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L41 | neighbors=[LocalKeyManager, test_decrypt_fails_with_wrong_key_manag…, test_key_manager(), test_key_manager_rejects_wrong_length_k…]
- "src_crypto_localkeymanager_unwrap_data_key": ".unwrap_data_key()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L77 | neighbors=[decrypt_at_rest(), LocalKeyManager, .cipher(), test_data_key_wrap_unwrap_roundtrip()]
- "src_crypto_test_data_key_wrap_unwrap_roundtrip": "test_data_key_wrap_unwrap_roundtrip()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L192 | neighbors=[crypto.rs, .generate_data_key(), .unwrap_data_key(), test_key_manager()]
- "src_crypto_test_decrypt_fails_with_wrong_key_manager": "test_decrypt_fails_with_wrong_key_manager()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L212 | neighbors=[crypto.rs, encrypt_at_rest(), .new(), test_key_manager()]
- "src_crypto_test_encrypt_decrypt_at_rest_roundtrip": "test_encrypt_decrypt_at_rest_roundtrip()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L200 | neighbors=[crypto.rs, decrypt_at_rest(), encrypt_at_rest(), test_key_manager()]
- "src_demoshell_caption": "Caption()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L335 | neighbors=[NfcTagScene.tsx, WalkthroughScenes.tsx, DemoShell.tsx, useReveal()]
- "src_errors_paymenterror_error_response": ".error_response()" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L81 | neighbors=[PaymentError, .error_type(), .public_message(), .status_code()]
- "src_models_appuser": "AppUser" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L10 | neighbors=[models.rs, DateTime, String, Utc]
- "src_models_orderresponse": "OrderResponse" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L159 | neighbors=[models.rs, Option, .from_order(), String]
- "src_pdax_pdaxclient_refresh": ".refresh()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L584 | neighbors=[PdaxClient, .current_session(), pdax_error_message(), .from_refresh()]
- "src_pdax_pdaxmfachallenge": "PdaxMfaChallenge" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L330 | neighbors=[pdax.rs, PdaxLoginOutcome, PdaxLoginResponse, String]
- "src_pdax_pdaxsession_from_tokens": ".from_tokens()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L414 | neighbors=[.login(), .verify_otp(), PdaxSession, session_expiry_tracks_expiry_seconds()]
- "src_rate_limiter_ratelimiter_new": ".new()" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L18 | neighbors=[degenerate_config_does_not_divide_by_ze…, prune_horizon_is_a_full_window_behind(), RateLimiter, snaps_to_stable_window_boundaries()]
- "src_rate_limiter_ratelimiter_window_start": ".window_start()" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L27 | neighbors=[degenerate_config_does_not_divide_by_ze…, RateLimiter, .check(), .prune_before()]
- "tests_03_nfc_test": "03-nfc.test.ts" | kind=code-symbol | source=frontend/tests/03-nfc.test.ts:L1 | neighbors=[1ec631e fix: all CI workflows passing —…, 9313cd3 test: 108 tests across 9 suites…, useNfc.ts, nfc.ts]
- "tests_integration_account_deletion_is_scoped_to_one_wallet": "account_deletion_is_scoped_to_one_wallet()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L456 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_challenge_can_only_be_consumed_once": "challenge_can_only_be_consumed_once()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L65 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_challenge_is_bound_to_its_wallet": "challenge_is_bound_to_its_wallet()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L83 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_concurrent_claims_of_one_key_produce_exactly_one_order": "concurrent_claims_of_one_key_produce_exactly_one_order()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L236 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_expired_challenge_is_rejected": "expired_challenge_is_rejected()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L103 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_expired_session_does_not_resolve": "expired_session_does_not_resolve()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L151 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_idempotency_key_can_only_be_claimed_once": "idempotency_key_can_only_be_claimed_once()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L207 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_non_positive_amounts_are_rejected_by_the_database": "non_positive_amounts_are_rejected_by_the_database()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L308 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_one_wallet_cannot_read_another_wallets_orders": "one_wallet_cannot_read_another_wallets_orders()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L172 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_order_lifecycle_records_amounts_as_integer_minor_units": "order_lifecycle_records_amounts_as_integer_minor_units()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L275 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_session_resolves_to_its_wallet_until_revoked": "session_resolves_to_its_wallet_until_revoked()" | kind=code-symbol | source=unused/pdax-backend/tests/integration.rs:L121 | neighbors=[integration.rs, cleanup(), test_pool(), test_wallet()]
- "tests_integration_test_check_payment_accepts_in_policy": "test_check_payment_accepts_in_policy()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L192 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_check_payment_rejects_after_expiry": "test_check_payment_rejects_after_expiry()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L271 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_check_payment_rejects_nonpositive_amount": "test_check_payment_rejects_nonpositive_amount()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L239 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_check_payment_rejects_over_limit": "test_check_payment_rejects_over_limit()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L208 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_check_payment_rejects_wrong_asset": "test_check_payment_rejects_wrong_asset()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L223 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_check_payment_uncapped_when_max_zero": "test_check_payment_uncapped_when_max_zero()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L255 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]
- "tests_integration_test_duplicate_registration_rejected": "test_duplicate_registration_rejected()" | kind=code-symbol | source=backend/contracts/agent_registry/tests/integration.rs:L65 | neighbors=[integration.rs, deploy(), random_address(), random_bytes_32()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-026.json

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
