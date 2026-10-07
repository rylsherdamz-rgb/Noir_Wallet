# Node Description Batch 39 of 84

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

- "services_wallet_tohex": "toHex()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L37 | neighbors=[wallet.ts, .deriveAgentAt(), .deriveKeys()]
- "services_wallet_walletservice_deriveagentat": ".deriveAgentAt()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L81 | neighbors=[WalletService, .allocateAgentIndex(), toHex()]
- "services_wallet_walletservice_getwalletlist": ".getWalletList()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L144 | neighbors=[WalletService, .addWalletToList(), .removeWalletFromList()]
- "services_wallet_walletservice_removewalletfromlist": ".removeWalletFromList()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L159 | neighbors=[WalletService, .getActiveWalletIndex(), .getWalletList()]
- "services_wallet_walletservice_retireagentindex": ".retireAgentIndex()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L116 | neighbors=[WalletService, .loadKeys(), .saveKeys()]
- "services_wallet_walletservice_savekeys": ".saveKeys()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L130 | neighbors=[WalletService, .allocateAgentIndex(), .retireAgentIndex()]
- "settings_notifications": "notifications.tsx" | kind=code-symbol | source=frontend/app/settings/notifications.tsx:L1 | neighbors=[1fe9de1 migrating workspace, NotificationsScreen.tsx, NotificationsScreen()]
- "settings_security": "security.tsx" | kind=code-symbol | source=frontend/app/settings/security.tsx:L1 | neighbors=[1fe9de1 migrating workspace, SecurityScreen.tsx, SecurityScreen()]
- "src_api_side_for": "side_for()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L197 | neighbors=[api.rs, execute_conversion(), pdax_quote()]
- "src_api_validate_php_amount": "validate_php_amount()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L170 | neighbors=[api.rs, pdax_quote(), run_conversion()]
- "src_auth_sessionauthservice_s_call": ".call()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L155 | neighbors=[SessionAuthService<S>, constant_time_eq(), hash_token()]
- "src_crypto_localkeymanager_cipher": ".cipher()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L58 | neighbors=[LocalKeyManager, .generate_data_key(), .unwrap_data_key()]
- "src_crypto_test_encrypted_blobs_are_not_deterministic": "test_encrypted_blobs_are_not_deterministic()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L222 | neighbors=[crypto.rs, encrypt_at_rest(), test_key_manager()]
- "src_demoshell_body": "Body()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L198 | neighbors=[TitleScenes.tsx, DemoShell.tsx, useReveal()]
- "src_demoshell_title": "Title()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L172 | neighbors=[TitleScenes.tsx, DemoShell.tsx, useReveal()]
- "src_lib_agentregevent": "AgentRegEvent" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L45 | neighbors=[lib.rs, Address, BytesN]
- "src_lib_authorizeevent": "AuthorizeEvent" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L60 | neighbors=[lib.rs, Address, BytesN]
- "src_lib_datakey": "DataKey" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L17 | neighbors=[lib.rs, Address, BytesN]
- "src_lib_registerevent": "RegisterEvent" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L22 | neighbors=[lib.rs, Address, BytesN]
- "src_models_cryptoasset_as_str": ".as_str()" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L106 | neighbors=[CryptoAsset, .trade_code(), .parse()]
- "src_pdax_cryptowithdrawrequest": "CryptoWithdrawRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L52 | neighbors=[pdax.rs, Option, String]
- "src_pdax_fiatdepositrequest": "FiatDepositRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L77 | neighbors=[pdax.rs, Option, String]
- "src_pdax_fiatuserinfouploadrequest": "FiatUserInfoUploadRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L230 | neighbors=[pdax.rs, Option, String]
- "src_pdax_fiatwithdrawrequest": "FiatWithdrawRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L150 | neighbors=[pdax.rs, Option, String]
- "src_pdax_pdaxclient_crypto_deposit_address": ".crypto_deposit_address()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L810 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_crypto_withdraw": ".crypto_withdraw()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L847 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_fiat_deposit": ".fiat_deposit()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1031 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_fiat_user_info_upload": ".fiat_user_info_upload()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1100 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_fiat_withdraw": ".fiat_withdraw()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1066 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_firm_quote": ".firm_quote()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L692 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_get_balances": ".get_balances()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L994 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_get_order": ".get_order()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L778 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_indicative_price": ".indicative_price()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L646 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_list_crypto_transactions": ".list_crypto_transactions()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L935 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_list_fiat_transactions": ".list_fiat_transactions()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L882 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_list_orders": ".list_orders()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L734 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_login": ".login()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L478 | neighbors=[PdaxClient, pdax_error_message(), .from_tokens()]
- "src_pdax_pdaxclient_place_order": ".place_order()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1146 | neighbors=[PdaxClient, pdax_error_message(), .current_session()]
- "src_pdax_pdaxclient_verify_otp": ".verify_otp()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L526 | neighbors=[PdaxClient, pdax_error_message(), .from_tokens()]
- "src_pdax_pdaxloginoutcome": "PdaxLoginOutcome" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L390 | neighbors=[pdax.rs, PdaxSession, PdaxMfaChallenge]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-038.json

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
