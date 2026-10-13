# Node Description Batch 38 of 84

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

- "karpathywiki_main_validateremoteurl": "validateRemoteUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68707 | neighbors=[main.js, requestUpload(), waitForResult()]
- "karpathywiki_main_validateuimessages": "validateUIMessages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28133 | neighbors=[main.js, createAgentUIStream(), safeValidateUIMessages()]
- "karpathywiki_main_void": "_void()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9474 | neighbors=[main.js, normalizeParams(), _void2()]
- "karpathywiki_main_watchwrite": "watchWrite()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80954 | neighbors=[main.js, isWatched(), markRecentWrite()]
- "karpathywiki_main_wikirelativepagepath": "wikiRelativePagePath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74081 | neighbors=[main.js, mergePage(), writeContradictionRecords()]
- "karpathywiki_main_withtaskaccounting": "withTaskAccounting()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55303 | neighbors=[main.js, now(), recordTaskUsage()]
- "karpathywiki_main_withtransientretry": "withTransientRetry()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77569 | neighbors=[main.js, selectSeedsWithLLM(), maybeBackoff()]
- "karpathywiki_main_wrapgatewayerror": "wrapGatewayError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23815 | neighbors=[main.js, generateObject(), generateText()]
- "karpathywiki_main_wrapstorageerror": "wrapStorageError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87532 | neighbors=[main.js, clear(), save()]
- "karpathywiki_main_writetoserverresponse": "writeToServerResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L26229 | neighbors=[main.js, pipeTextStreamToResponse(), pipeUIMessageStreamToResponse()]
- "karpathywiki_main_writetypedecision": "writeTypeDecision()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73115 | neighbors=[main.js, applyClassificationDecision(), createOrUpdateFile()]
- "karpathywiki_main_xid": "_xid()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9210 | neighbors=[main.js, normalizeParams(), xid2()]
- "karpathywiki_main_zod3schema": "zod3Schema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18237 | neighbors=[main.js, jsonSchema(), zodSchema()]
- "karpathywiki_main_zod4schema": "zod4Schema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18253 | neighbors=[main.js, jsonSchema(), zodSchema()]
- "lib_soroban_invokecontract": "invokeContract()" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L97 | neighbors=[soroban.ts, getServer(), sourceAccountExists()]
- "lib_soroban_readcontract": "readContract()" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L37 | neighbors=[soroban.ts, getServer(), sourceAccountExists()]
- "lib_stellaraccount_isvalidstellaraddress": "isValidStellarAddress()" | kind=code-symbol | source=frontend/src/lib/stellarAccount.ts:L19 | neighbors=[stellarAccount.ts, SendScreen.tsx, 12-send.test.ts]
- "lib_stellarerrors_humanizestellarerror": "humanizeStellarError()" | kind=code-symbol | source=frontend/src/lib/stellarErrors.ts:L55 | neighbors=[stellarErrors.ts, SendScreen.tsx, 12-send.test.ts]
- "migrations_20260629000001_initial_schema_channel_transactions": "channel_transactions" | kind=code-symbol | source=unused/pdax-backend/migrations/20260629000001_initial_schema.sql:L71 | neighbors=[20260629000001_initial_schema.sql, fee_channels, payment_transactions]
- "migrations_20260629000001_initial_schema_devices": "devices" | kind=code-symbol | source=unused/pdax-backend/migrations/20260629000001_initial_schema.sql:L2 | neighbors=[20260629000001_initial_schema.sql, daily_spends, payment_transactions]
- "migrations_20260629000001_initial_schema_payment_transactions": "payment_transactions" | kind=code-symbol | source=unused/pdax-backend/migrations/20260629000001_initial_schema.sql:L30 | neighbors=[20260629000001_initial_schema.sql, channel_transactions, devices]
- "migrations_20260708000001_merchants_users_notification_cache_transaction_notifications": "transaction_notifications" | kind=code-symbol | source=unused/pdax-backend/migrations/20260708000001_merchants_users_notification_cache.sql:L76 | neighbors=[20260708000001_merchants_users_notifica…, devices, payment_transactions]
- "migrations_20260711000001_signed_envelope_xdr": "20260711000001_signed_envelope_xdr.sql" | kind=code-symbol | source=unused/pdax-backend/migrations/20260711000001_signed_envelope_xdr.sql:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, a2e2368 feat(backend): real non-custodi…]
- "migrations_20260711000002_device_custody": "20260711000002_device_custody.sql" | kind=code-symbol | source=unused/pdax-backend/migrations/20260711000002_device_custody.sql:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, 809f0cd feat(backend): custodial UID-au…]
- "migrations_20260711000003_device_pin": "20260711000003_device_pin.sql" | kind=code-symbol | source=unused/pdax-backend/migrations/20260711000003_device_pin.sql:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, 6fc251f feat(backend): card revoke + op…]
- "pgpool": "PgPool" | kind=code-symbol | neighbors=[db.rs, Repository, state.rs]
- "promotion_eslint_config": "eslint.config.mjs" | kind=code-symbol | source=promotion/eslint.config.mjs:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…]
- "pubmat_shoot": "shoot.js" | kind=code-symbol | source=promo/pubmat/shoot.js:L1 | neighbors=[61ef776 Add Noir Wallet pubmat: brand-e…, { chromium }, path]
- "ratelimiter": "RateLimiter" | kind=code-symbol | neighbors=[main.rs, state.rs, AppState]
- "screens_dashboardscreen_formatrelativetime": "formatRelativeTime()" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L45 | neighbors=[DashboardScreen.tsx, DashboardScreen(), 13-network-freshness.test.ts]
- "scripts_stellar_cli_cmdinvoke": "cmdInvoke()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L66 | neighbors=[stellar-cli.ts, parseScValArgs(), main()]
- "scripts_stellar_cli_cmdread": "cmdRead()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L97 | neighbors=[stellar-cli.ts, parseScValArgs(), main()]
- "scripts_stellar_cli_parsescvalargs": "parseScValArgs()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L41 | neighbors=[stellar-cli.ts, cmdInvoke(), cmdRead()]
- "services_pinlock_clearpin": "clearPin()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L126 | neighbors=[pinLock.ts, clearLockout(), 11-security.test.ts]
- "services_pinlock_derive": "derive()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L80 | neighbors=[pinLock.ts, setPin(), verifyPin()]
- "services_pinlock_lockoutdurationms": "lockoutDurationMs()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L88 | neighbors=[pinLock.ts, verifyPin(), 11-security.test.ts]
- "services_stellar_service_stellarservice_readcontract": ".readContract()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L684 | neighbors=[StellarService, .accountExists(), withTimeout()]
- "services_stellar_service_stellarservice_submitpayment": ".submitPayment()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L221 | neighbors=[StellarService, .accountExists(), withTimeout()]
- "services_stellar_service_stellarservice_waitforaccount": ".waitForAccount()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L326 | neighbors=[StellarService, .ensureAccountFunded(), .accountExists()]
- "services_txmonitor_poll": "poll()" | kind=code-symbol | source=frontend/src/services/txMonitor.ts:L18 | neighbors=[txMonitor.ts, notify(), startTxMonitor()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-037.json

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
