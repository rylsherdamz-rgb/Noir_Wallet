# Node Description Batch 79 of 84

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

- "scripts_whitescan_y": "y" | kind=code-symbol | source=promotion/scripts/whitescan.mjs:L5 | neighbors=[whitescan.mjs]
- "services_api_apiservice_constructor": ".constructor()" | kind=code-symbol | source=frontend/src/services/api.ts:L8 | neighbors=[ApiService]
- "services_api_apiservice_settoken": ".setToken()" | kind=code-symbol | source=frontend/src/services/api.ts:L12 | neighbors=[ApiService]
- "services_biometrics_biometricavailability": "BiometricAvailability" | kind=code-symbol | source=frontend/src/services/biometrics.ts:L14 | neighbors=[biometrics.ts]
- "services_biometrics_biometricresult": "BiometricResult" | kind=code-symbol | source=frontend/src/services/biometrics.ts:L18 | neighbors=[biometrics.ts]
- "services_biometrics_unavailablereason": "UnavailableReason" | kind=code-symbol | source=frontend/src/services/biometrics.ts:L12 | neighbors=[biometrics.ts]
- "services_fxrates_fxrates": "FxRates" | kind=code-symbol | source=frontend/src/services/fxRates.ts:L3 | neighbors=[fxRates.ts]
- "services_fxrates_fxrateservice_getrates": ".getRates()" | kind=code-symbol | source=frontend/src/services/fxRates.ts:L15 | neighbors=[FxRateService]
- "services_nfc_nfcservice_available": ".available()" | kind=code-symbol | source=frontend/src/services/nfc.ts:L31 | neighbors=[NFCService]
- "services_nfc_nfcservice_cleanup": ".cleanup()" | kind=code-symbol | source=frontend/src/services/nfc.ts:L146 | neighbors=[NFCService]
- "services_nfc_nfcservice_gotosettings": ".goToSettings()" | kind=code-symbol | source=frontend/src/services/nfc.ts:L64 | neighbors=[NFCService]
- "services_nfc_nfcservice_initialize": ".initialize()" | kind=code-symbol | source=frontend/src/services/nfc.ts:L35 | neighbors=[NFCService]
- "services_nfc_nfcservice_isenabled": ".isEnabled()" | kind=code-symbol | source=frontend/src/services/nfc.ts:L55 | neighbors=[NFCService]
- "services_nfc_nfcservice_issupported": ".isSupported()" | kind=code-symbol | source=frontend/src/services/nfc.ts:L46 | neighbors=[NFCService]
- "services_nfc_nfcservice_readtag": ".readTag()" | kind=code-symbol | source=frontend/src/services/nfc.ts:L74 | neighbors=[NFCService]
- "services_nfc_nfcservice_writetag": ".writeTag()" | kind=code-symbol | source=frontend/src/services/nfc.ts:L120 | neighbors=[NFCService]
- "services_pinlock_argon2_params": "ARGON2_PARAMS" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L25 | neighbors=[pinLock.ts]
- "services_pinlock_lockoutstate": "LockoutState" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L38 | neighbors=[pinLock.ts]
- "services_pinlock_pinrecord": "PinRecord" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L32 | neighbors=[pinLock.ts]
- "services_pinlock_verifyresult": "VerifyResult" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L43 | neighbors=[pinLock.ts]
- "services_stellar_service_balanceresult": "BalanceResult" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L98 | neighbors=[stellar-service.ts]
- "services_stellar_service_cacheentry": "CacheEntry" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L53 | neighbors=[stellar-service.ts]
- "services_stellar_service_envelopetoxdr": "EnvelopeToXDR" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L37 | neighbors=[stellar-service.ts]
- "services_stellar_service_invokeparams": "InvokeParams" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L107 | neighbors=[stellar-service.ts]
- "services_stellar_service_patchenvelopetoxdr": "patchEnvelopeToXDR()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L38 | neighbors=[stellar-service.ts]
- "services_stellar_service_readparams": "ReadParams" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L116 | neighbors=[stellar-service.ts]
- "services_stellar_service_registerdeviceparams": "RegisterDeviceParams" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L123 | neighbors=[stellar-service.ts]
- "services_stellar_service_stellarservice_createkeypair": ".createKeypair()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L171 | neighbors=[StellarService]
- "services_stellar_service_stellarservice_devicehashscval": ".deviceHashScVal()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L388 | neighbors=[StellarService]
- "services_stellar_service_stellarservice_friendboturl": ".friendbotUrl()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L165 | neighbors=[StellarService]
- "services_stellar_service_stellarservice_networkname": ".networkName()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L149 | neighbors=[StellarService]
- "services_stellar_service_stellarservice_setnetwork": ".setNetwork()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L151 | neighbors=[StellarService]
- "services_stellar_service_stellarservice_walletaddressscval": ".walletAddressScVal()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L392 | neighbors=[StellarService]
- "services_stellar_service_stellarserviceoptions": "StellarServiceOptions" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L92 | neighbors=[stellar-service.ts]
- "services_stellar_stellarservice_constructor": ".constructor()" | kind=code-symbol | source=frontend/src/services/stellar.ts:L17 | neighbors=[StellarService]
- "services_stellar_stellarservice_createkeypair": ".createKeypair()" | kind=code-symbol | source=frontend/src/services/stellar.ts:L22 | neighbors=[StellarService]
- "services_txmonitor_stoptxmonitor": "stopTxMonitor()" | kind=code-symbol | source=frontend/src/services/txMonitor.ts:L72 | neighbors=[txMonitor.ts]
- "services_wallet_derivedagent": "DerivedAgent" | kind=code-symbol | source=frontend/src/services/wallet.ts:L31 | neighbors=[wallet.ts]
- "services_wallet_walletservice_clearkeys": ".clearKeys()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L138 | neighbors=[WalletService]
- "services_wallet_walletservice_generatemnemonic": ".generateMnemonic()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L42 | neighbors=[WalletService]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-078.json

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
