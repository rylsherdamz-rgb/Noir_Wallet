# Node Description Batch 56 of 84

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

- "scripts_stellar_cli_cmdcreatewallet": "cmdCreateWallet()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L31 | neighbors=[stellar-cli.ts, main()]
- "scripts_stellar_cli_cmdfund": "cmdFund()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L9 | neighbors=[stellar-cli.ts, main()]
- "scripts_stellar_cli_cmdregisterdevice": "cmdRegisterDevice()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L78 | neighbors=[stellar-cli.ts, main()]
- "scripts_stellar_cli_cmdtxstatus": "cmdTxStatus()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L88 | neighbors=[stellar-cli.ts, main()]
- "services_api_apiservice_batchpayments": ".batchPayments()" | kind=code-symbol | source=frontend/src/services/api.ts:L209 | neighbors=[ApiService, .request()]
- "services_api_apiservice_getbalance": ".getBalance()" | kind=code-symbol | source=frontend/src/services/api.ts:L221 | neighbors=[ApiService, .request()]
- "services_api_apiservice_getdevices": ".getDevices()" | kind=code-symbol | source=frontend/src/services/api.ts:L69 | neighbors=[ApiService, .request()]
- "services_api_apiservice_getmerchantsettings": ".getMerchantSettings()" | kind=code-symbol | source=frontend/src/services/api.ts:L226 | neighbors=[ApiService, .request()]
- "services_api_apiservice_getnotifications": ".getNotifications()" | kind=code-symbol | source=frontend/src/services/api.ts:L238 | neighbors=[ApiService, .request()]
- "services_api_apiservice_getpaymentstatus": ".getPaymentStatus()" | kind=code-symbol | source=frontend/src/services/api.ts:L199 | neighbors=[ApiService, .request()]
- "services_api_apiservice_gettransactions": ".getTransactions()" | kind=code-symbol | source=frontend/src/services/api.ts:L216 | neighbors=[ApiService, .request()]
- "services_api_apiservice_initiatepayment": ".initiatePayment()" | kind=code-symbol | source=frontend/src/services/api.ts:L81 | neighbors=[ApiService, .request()]
- "services_api_apiservice_login": ".login()" | kind=code-symbol | source=frontend/src/services/api.ts:L54 | neighbors=[ApiService, .request()]
- "services_api_apiservice_payviabackend": ".payViaBackend()" | kind=code-symbol | source=frontend/src/services/api.ts:L170 | neighbors=[ApiService, .request()]
- "services_api_apiservice_pdaxbalance": ".pdaxBalance()" | kind=code-symbol | source=frontend/src/services/api.ts:L272 | neighbors=[ApiService, .request()]
- "services_api_apiservice_pdaxcashin": ".pdaxCashIn()" | kind=code-symbol | source=frontend/src/services/api.ts:L258 | neighbors=[ApiService, .request()]
- "services_api_apiservice_pdaxcashout": ".pdaxCashOut()" | kind=code-symbol | source=frontend/src/services/api.ts:L265 | neighbors=[ApiService, .request()]
- "services_api_apiservice_pdaxquote": ".pdaxQuote()" | kind=code-symbol | source=frontend/src/services/api.ts:L251 | neighbors=[ApiService, .request()]
- "services_api_apiservice_provisioncard": ".provisionCard()" | kind=code-symbol | source=frontend/src/services/api.ts:L102 | neighbors=[ApiService, .request()]
- "services_api_apiservice_registerdevice": ".registerDevice()" | kind=code-symbol | source=frontend/src/services/api.ts:L62 | neighbors=[ApiService, .request()]
- "services_api_apiservice_registerpaymentdevice": ".registerPaymentDevice()" | kind=code-symbol | source=frontend/src/services/api.ts:L158 | neighbors=[ApiService, .request()]
- "services_api_apiservice_registerpushtoken": ".registerPushToken()" | kind=code-symbol | source=frontend/src/services/api.ts:L243 | neighbors=[ApiService, .request()]
- "services_api_apiservice_revokecard": ".revokeCard()" | kind=code-symbol | source=frontend/src/services/api.ts:L150 | neighbors=[ApiService, .request()]
- "services_api_apiservice_signup": ".signup()" | kind=code-symbol | source=frontend/src/services/api.ts:L47 | neighbors=[ApiService, .request()]
- "services_api_apiservice_tappay": ".tapPay()" | kind=code-symbol | source=frontend/src/services/api.ts:L121 | neighbors=[ApiService, .request()]
- "services_api_apiservice_updatedevicestatus": ".updateDeviceStatus()" | kind=code-symbol | source=frontend/src/services/api.ts:L73 | neighbors=[ApiService, .request()]
- "services_api_apiservice_updatemerchantsettings": ".updateMerchantSettings()" | kind=code-symbol | source=frontend/src/services/api.ts:L230 | neighbors=[ApiService, .request()]
- "services_fxrates_fxrateservice": "FxRateService" | kind=code-symbol | source=frontend/src/services/fxRates.ts:L12 | neighbors=[fxRates.ts, .getRates()]
- "services_pinlock_constanttimeequal": "constantTimeEqual()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L73 | neighbors=[pinLock.ts, verifyPin()]
- "services_pinlock_ispinrecord": "isPinRecord()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L49 | neighbors=[pinLock.ts, verifyPin()]
- "services_pinlock_legacyhash": "legacyHash()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L63 | neighbors=[pinLock.ts, verifyPin()]
- "services_pinlock_setlockout": "setLockout()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L105 | neighbors=[pinLock.ts, verifyPin()]
- "services_stellar_service_createservice": "createService()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L770 | neighbors=[stellar-service.ts, StellarService]
- "services_stellar_service_makecache": "makeCache()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L58 | neighbors=[stellar-service.ts, .constructor()]
- "services_stellar_service_stellarservice_constructor": ".constructor()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L136 | neighbors=[StellarService, makeCache()]
- "services_stellar_service_stellarservice_getaccounttransactions": ".getAccountTransactions()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L722 | neighbors=[StellarService, withTimeout()]
- "services_stellar_service_stellarservice_getbalance": ".getBalance()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L198 | neighbors=[StellarService, withTimeout()]
- "services_stellar_service_stellarservice_getpaymentstatus": ".getPaymentStatus()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L669 | neighbors=[StellarService, withTimeout()]
- "services_stellar_service_stellarservice_gettransactionstatus": ".getTransactionStatus()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L652 | neighbors=[StellarService, withTimeout()]
- "services_stellar_service_stellarservice_loadsourceaccount": ".loadSourceAccount()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L665 | neighbors=[StellarService, withTimeout()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-055.json

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
