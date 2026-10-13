# Node Description Batch 75 of 84

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

- "karpathywiki_main_success": "_success()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9800 | neighbors=[main.js]
- "karpathywiki_main_sv_default": "sv_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L7812 | neighbors=[main.js]
- "karpathywiki_main_ta_default": "ta_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L7939 | neighbors=[main.js]
- "karpathywiki_main_tagleaf": "tagLeaf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67405 | neighbors=[main.js]
- "karpathywiki_main_th_default": "th_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L8065 | neighbors=[main.js]
- "karpathywiki_main_throwifaborted": "throwIfAborted()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54197 | neighbors=[main.js]
- "karpathywiki_main_tojsonschema": "toJSONSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L10034 | neighbors=[main.js]
- "karpathywiki_main_tool": "tool()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18392 | neighbors=[main.js]
- "karpathywiki_main_tr_default": "tr_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L8191 | neighbors=[main.js]
- "karpathywiki_main_transform": "_transform()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9766 | neighbors=[main.js]
- "karpathywiki_main_transformtexttouimessagestream": "transformTextToUiMessageStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30761 | neighbors=[main.js]
- "karpathywiki_main_treeifyerror": "treeifyError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1328 | neighbors=[main.js]
- "karpathywiki_main_ua_default": "ua_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L8315 | neighbors=[main.js]
- "karpathywiki_main_unregisterglobal": "unregisterGlobal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L21831 | neighbors=[main.js]
- "karpathywiki_main_ur_default": "ur_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L8441 | neighbors=[main.js]
- "karpathywiki_main_uriencode": "uriEncode()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54880 | neighbors=[main.js]
- "karpathywiki_main_vi_default": "vi_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L8567 | neighbors=[main.js]
- "karpathywiki_main_withabortsignal": "withAbortSignal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67501 | neighbors=[main.js]
- "karpathywiki_main_wordsof": "wordsOf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73166 | neighbors=[main.js]
- "karpathywiki_main_wrapspancontext": "wrapSpanContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22251 | neighbors=[main.js]
- "karpathywiki_main_zh_cn_default": "zh_CN_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L8692 | neighbors=[main.js]
- "karpathywiki_main_zh_tw_default": "zh_TW_default()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L8817 | neighbors=[main.js]
- "lib_logger_redact": "redact()" | kind=code-symbol | source=frontend/src/lib/logger.ts:L21 | neighbors=[logger.ts]
- "lib_logger_redactall": "redactAll()" | kind=code-symbol | source=frontend/src/lib/logger.ts:L26 | neighbors=[logger.ts]
- "lib_soroban_devicehashscval": "deviceHashScVal()" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L149 | neighbors=[soroban.ts]
- "lib_soroban_invokecontractparams": "InvokeContractParams" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L89 | neighbors=[soroban.ts]
- "lib_soroban_readcontractparams": "ReadContractParams" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L30 | neighbors=[soroban.ts]
- "lib_soroban_walletaddressscval": "walletAddressScVal()" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L153 | neighbors=[soroban.ts]
- "lib_stellarerrors_code_messages": "CODE_MESSAGES" | kind=code-symbol | source=frontend/src/lib/stellarErrors.ts:L9 | neighbors=[stellarErrors.ts]
- "lib_stellarerrors_codes_by_length": "CODES_BY_LENGTH" | kind=code-symbol | source=frontend/src/lib/stellarErrors.ts:L35 | neighbors=[stellarErrors.ts]
- "lib_stellarerrors_network_hints": "NETWORK_HINTS" | kind=code-symbol | source=frontend/src/lib/stellarErrors.ts:L37 | neighbors=[stellarErrors.ts]
- "migrations_20260708000001_merchants_users_notification_cache_app_users": "app_users" | kind=code-symbol | source=unused/pdax-backend/migrations/20260708000001_merchants_users_notification_cache.sql:L27 | neighbors=[20260708000001_merchants_users_notifica…]
- "migrations_20260708000001_merchants_users_notification_cache_merchants": "merchants" | kind=code-symbol | source=unused/pdax-backend/migrations/20260708000001_merchants_users_notification_cache.sql:L7 | neighbors=[20260708000001_merchants_users_notifica…]
- "migrations_20260802000001_pdax_bridge_only_auth_challenges": "auth_challenges" | kind=code-symbol | source=unused/pdax-backend/migrations/20260802000001_pdax_bridge_only.sql:L42 | neighbors=[20260802000001_pdax_bridge_only.sql]
- "migrations_20260802000001_pdax_bridge_only_pdax_orders": "pdax_orders" | kind=code-symbol | source=unused/pdax-backend/migrations/20260802000001_pdax_bridge_only.sql:L78 | neighbors=[20260802000001_pdax_bridge_only.sql]
- "migrations_20260802000001_pdax_bridge_only_rate_limits": "rate_limits" | kind=code-symbol | source=unused/pdax-backend/migrations/20260802000001_pdax_bridge_only.sql:L114 | neighbors=[20260802000001_pdax_bridge_only.sql]
- "migrations_20260802000001_pdax_bridge_only_sessions": "sessions" | kind=code-symbol | source=unused/pdax-backend/migrations/20260802000001_pdax_bridge_only.sql:L58 | neighbors=[20260802000001_pdax_bridge_only.sql]
- "paymentescrowclient": "PaymentEscrowClient" | kind=code-symbol | neighbors=[Fixture]
- "pdaxsession": "PdaxSession" | kind=code-symbol | neighbors=[PdaxLoginOutcome]
- "promo_eslint_config": "eslint.config.mjs" | kind=code-symbol | source=promo/eslint.config.mjs:L1 | neighbors=[f8751a9 feat: Remotion promo video — No…]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-074.json

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
