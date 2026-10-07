# Node Description Batch 57 of 84

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

- "services_stellar_service_stellarservice_registerdevice": ".registerDevice()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L755 | neighbors=[StellarService, .invokeContractAndWait()]
- "services_stellar_service_stellarservice_submitcreateaccount": ".submitCreateAccount()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L281 | neighbors=[StellarService, withTimeout()]
- "services_stellar_stellarservice_buildsignedpaymentxdr": ".buildSignedPaymentXdr()" | kind=code-symbol | source=frontend/src/services/stellar.ts:L147 | neighbors=[StellarService, .loadAccount()]
- "services_stellar_stellarservice_fundtestnetaccount": ".fundTestnetAccount()" | kind=code-symbol | source=frontend/src/services/stellar.ts:L30 | neighbors=[StellarService, .loadAccount()]
- "services_stellar_stellarservice_getbalance": ".getBalance()" | kind=code-symbol | source=frontend/src/services/stellar.ts:L81 | neighbors=[StellarService, .loadAccount()]
- "services_stellar_stellarservice_submitpayment": ".submitPayment()" | kind=code-symbol | source=frontend/src/services/stellar.ts:L108 | neighbors=[StellarService, .loadAccount()]
- "services_storage_storagekeys": "StorageKeys" | kind=code-symbol | source=frontend/src/services/storage.ts:L3 | neighbors=[storage.ts, wallet.ts]
- "services_storage_walletlistitem": "WalletListItem" | kind=code-symbol | source=frontend/src/services/storage.ts:L15 | neighbors=[storage.ts, wallet.ts]
- "services_txmonitor_notify": "notify()" | kind=code-symbol | source=frontend/src/services/txMonitor.ts:L8 | neighbors=[txMonitor.ts, poll()]
- "services_txmonitor_starttxmonitor": "startTxMonitor()" | kind=code-symbol | source=frontend/src/services/txMonitor.ts:L66 | neighbors=[txMonitor.ts, poll()]
- "services_wallet_walletservice_addwallettolist": ".addWalletToList()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L152 | neighbors=[WalletService, .getWalletList()]
- "services_wallet_walletservice_derivekeys": ".deriveKeys()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L50 | neighbors=[WalletService, toHex()]
- "services_wallet_walletservice_getactivewalletindex": ".getActiveWalletIndex()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L148 | neighbors=[WalletService, .removeWalletFromList()]
- "services_wallet_walletservice_isagentindexretired": ".isAgentIndexRetired()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L125 | neighbors=[WalletService, .loadKeys()]
- "src_api_auth_challenge": "auth_challenge()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L40 | neighbors=[api.rs, random_hex()]
- "src_api_auth_verify": "auth_verify()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L74 | neighbors=[api.rs, random_hex()]
- "src_api_map_event_status": "map_event_status()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L484 | neighbors=[api.rs, pdax_webhook()]
- "src_api_paginationquery": "PaginationQuery" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L611 | neighbors=[api.rs, Option]
- "src_api_parse_direction": "parse_direction()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L185 | neighbors=[api.rs, pdax_quote()]
- "src_api_pdax_balance": "pdax_balance()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L464 | neighbors=[api.rs, ensure_pdax_session()]
- "src_api_pdax_cash_in": "pdax_cash_in()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L240 | neighbors=[api.rs, run_conversion()]
- "src_api_pdax_cash_out": "pdax_cash_out()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L251 | neighbors=[api.rs, run_conversion()]
- "src_api_pdax_webhook": "pdax_webhook()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L498 | neighbors=[api.rs, map_event_status()]
- "src_api_random_hex_is_the_right_width_and_not_constant": "random_hex_is_the_right_width_and_not_constant()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L679 | neighbors=[api.rs, random_hex()]
- "src_auth_accepts_a_genuine_signature": "accepts_a_genuine_signature()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L252 | neighbors=[auth.rs, keypair()]
- "src_auth_constant_time_eq": "constant_time_eq()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L51 | neighbors=[auth.rs, .call()]
- "src_auth_hash_token": "hash_token()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L42 | neighbors=[auth.rs, .call()]
- "src_auth_rejects_a_signature_from_a_different_key": "rejects_a_signature_from_a_different_key()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L261 | neighbors=[auth.rs, keypair()]
- "src_auth_rejects_a_signature_over_a_different_message": "rejects_a_signature_over_a_different_message()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L272 | neighbors=[auth.rs, keypair()]
- "src_auth_rejects_malformed_input": "rejects_malformed_input()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L280 | neighbors=[auth.rs, keypair()]
- "src_auth_sessionauthservice_s": "SessionAuthService<S>" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L140 | neighbors=[.call(), .poll_ready()]
- "src_auth_validates_wallet_addresses": "validates_wallet_addresses()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L290 | neighbors=[auth.rs, keypair()]
- "src_config_config_from_env": ".from_env()" | kind=code-symbol | source=unused/pdax-backend/src/config.rs:L51 | neighbors=[Config, parse_env()]
- "src_config_config_is_production": ".is_production()" | kind=code-symbol | source=unused/pdax-backend/src/config.rs:L145 | neighbors=[Config, .validate()]
- "src_config_config_validate": ".validate()" | kind=code-symbol | source=unused/pdax-backend/src/config.rs:L98 | neighbors=[Config, .is_production()]
- "src_config_parse_env": "parse_env()" | kind=code-symbol | source=unused/pdax-backend/src/config.rs:L150 | neighbors=[config.rs, .from_env()]
- "src_crypto_encryptedpayload_from_bytes": ".from_bytes()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L115 | neighbors=[decrypt_at_rest(), EncryptedPayload]
- "src_crypto_encryptedpayload_to_bytes": ".to_bytes()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L104 | neighbors=[encrypt_at_rest(), EncryptedPayload]
- "src_crypto_test_key_manager_rejects_wrong_length_key": "test_key_manager_rejects_wrong_length_key()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L186 | neighbors=[crypto.rs, .new()]
- "src_demoshell_grad": "Grad()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L228 | neighbors=[TitleScenes.tsx, DemoShell.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-056.json

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
