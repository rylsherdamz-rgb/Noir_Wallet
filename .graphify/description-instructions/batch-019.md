# Node Description Batch 20 of 84

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

- "karpathywiki_main_stripunknownsections": "stripUnknownSections()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71403 | neighbors=[main.js, createNewPage(), mergePage(), snapHeaderToCanonical(), updateRelatedPage()]
- "karpathywiki_main_synccodexmodelsfromplugin": "syncCodexModelsFromPlugin()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87760 | neighbors=[main.js, loginOpenAICodexBrowser(), loginOpenAICodexDevice(), signOutOpenAICodex(), applyCodexModelPolicy()]
- "karpathywiki_main_transcribe": "transcribe()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30512 | neighbors=[main.js, convertDataContentToUint8Array(), prepareRetries(), resolveTranscriptionModel(), withUserAgentSuffix()]
- "karpathywiki_main_validateapprovedtoolapprovals": "validateApprovedToolApprovals()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24608 | neighbors=[main.js, asSchema(), isApprovalNeeded(), safeValidateTypes(), verifyToolApprovalSignature()]
- "karpathywiki_main_validatedownloadurl": "validateDownloadUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L16893 | neighbors=[main.js, fetchWithValidatedRedirects(), isIPv4(), isPrivateIPv4(), isPrivateIPv6()]
- "karpathywiki_main_withouttrailingslash": "withoutTrailingSlash()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18531 | neighbors=[main.js, createGatewayProvider(), createOpenAI(), createOpenAICompatible(), normalizeBaseURL()]
- "karpathywiki_main_zodschema": "zodSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18276 | neighbors=[main.js, asSchema(), isZod4Schema(), zod3Schema(), zod4Schema()]
- "lib_stellaraccount_minimumbalance": "minimumBalance()" | kind=code-symbol | source=frontend/src/lib/stellarAccount.ts:L27 | neighbors=[x402.ts, stellarAccount.ts, spendableBalance(), SendScreen.tsx, 12-send.test.ts]
- "lib_stellaraccount_spendablebalance": "spendableBalance()" | kind=code-symbol | source=frontend/src/lib/stellarAccount.ts:L35 | neighbors=[x402.ts, stellarAccount.ts, minimumBalance(), SendScreen.tsx, 12-send.test.ts]
- "repository": "Repository" | kind=code-symbol | neighbors=[main.rs, rate_limiter.rs, state.rs, AppState, integration.rs]
- "scenes_sceneshell_eyebrow": "Eyebrow()" | kind=code-symbol | source=promotion/src/scenes/SceneShell.tsx:L23 | neighbors=[Architecture.tsx, Problem.tsx, SceneShell.tsx, UseCases.tsx, X402.tsx]
- "services_pinlock_haspin": "hasPin()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L113 | neighbors=[_layout.tsx, lock.tsx, ExportKeysScreen.tsx, pinLock.ts, 11-security.test.ts]
- "services_stellar_service_stellarservice_ensureaccountfunded": ".ensureAccountFunded()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L396 | neighbors=[StellarService, .accountExists(), .fundAccount(), .waitForAccount(), .invokeContract()]
- "services_stellar_stellarservice_loadaccount": ".loadAccount()" | kind=code-symbol | source=frontend/src/services/stellar.ts:L188 | neighbors=[StellarService, .buildSignedPaymentXdr(), .fundTestnetAccount(), .getBalance(), .submitPayment()]
- "services_storage_getitem": "getItem()" | kind=code-symbol | source=frontend/src/services/storage.ts:L21 | neighbors=[fxRates.ts, pinLock.ts, storage.ts, wallet.ts, 11-security.test.ts]
- "services_storage_setitem": "setItem()" | kind=code-symbol | source=frontend/src/services/storage.ts:L27 | neighbors=[fxRates.ts, pinLock.ts, storage.ts, wallet.ts, 11-security.test.ts]
- "services_wallet_walletkeys": "WalletKeys" | kind=code-symbol | source=frontend/src/services/wallet.ts:L11 | neighbors=[import-wallet.tsx, seed-phrase.tsx, ImportWalletScreen.tsx, SeedPhraseScreen.tsx, wallet.ts]
- "src_api_pdax_quote": "pdax_quote()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L205 | neighbors=[api.rs, ensure_pdax_session(), parse_direction(), side_for(), validate_php_amount()]
- "src_api_run_conversion": "run_conversion()" | kind=code-symbol | source=unused/pdax-backend/src/api.rs:L259 | neighbors=[api.rs, pdax_cash_in(), pdax_cash_out(), execute_conversion(), validate_php_amount()]
- "src_auth_sessionauth": "SessionAuth" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L101 | neighbors=[auth.rs, Arc, .new(), .new_transform(), String]
- "src_composition": "Composition.tsx" | kind=code-symbol | source=promotion/src/Composition.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, f8751a9 feat: Remotion promo video — No…, MyComposition()]
- "src_demoshell_g": "G" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L22 | neighbors=[NfcTagScene.tsx, PosEscrowScene.tsx, TapToPayScene.tsx, TitleScenes.tsx, DemoShell.tsx]
- "src_demoshell_kicker": "Kicker()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L133 | neighbors=[PosEscrowScene.tsx, TapToPayScene.tsx, TitleScenes.tsx, DemoShell.tsx, useReveal()]
- "src_demoshell_particles": "Particles()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L259 | neighbors=[NfcTagScene.tsx, PosEscrowScene.tsx, TapToPayScene.tsx, TitleScenes.tsx, DemoShell.tsx]
- "src_demoshell_pulserings": "PulseRings()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L298 | neighbors=[NfcTagScene.tsx, PosEscrowScene.tsx, TapToPayScene.tsx, TitleScenes.tsx, DemoShell.tsx]
- "src_get_audio_duration": "get-audio-duration.ts" | kind=code-symbol | source=promotion/src/get-audio-duration.ts:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, f8751a9 feat: Remotion promo video — No…, getAudioDuration()]
- "src_models_cryptoasset": "CryptoAsset" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L70 | neighbors=[models.rs, .as_str(), .parse(), .trade_code(), .withdraw_code()]
- "src_models_pdaxorder": "PdaxOrder" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L139 | neighbors=[models.rs, DateTime, Option, String, Utc]
- "src_pdax_pdaxlogintokens": "PdaxLoginTokens" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L314 | neighbors=[pdax.rs, PdaxLoginResponse, Option, String, Vec]
- "src_rate_limiter_ratelimiter": "RateLimiter" | kind=code-symbol | source=unused/pdax-backend/src/rate_limiter.rs:L12 | neighbors=[rate_limiter.rs, .check(), .new(), .prune_before(), .window_start()]
- "src_voiceover_script": "voiceover-script.ts" | kind=code-symbol | source=promotion/src/voiceover-script.ts:L1 | neighbors=[dc5a97e video, generate-voiceover.ts, NoirDemo.tsx, SCENE_SCRIPT, SceneScript]
- "tabs_devices": "devices.tsx" | kind=code-symbol | source=frontend/app/(tabs)/devices.tsx:L1 | neighbors=[698366e feat(frontend): add Noir Wallet…, a303810 Merge pull request #2 from ryls…, DeviceProvisioningScreen.tsx, DeviceProvisioningScreen(), DevicesScreen()]
- "tests_14_logger_test": "14-logger.test.ts" | kind=code-symbol | source=frontend/tests/14-logger.test.ts:L1 | neighbors=[16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, logger.ts, logger]
- "tests_integration_fixture": "Fixture" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L37 | neighbors=[integration.rs, Address, BytesN, PaymentEscrowClient, StellarAssetClient]
- "tests_integration_test_claim_nothing_fails": "test_claim_nothing_fails()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L247 | neighbors=[integration.rs, random_address(), setup(), create_token(), deploy_agent_registry()]
- "tests_integration_test_initialize_double_init_guard": "test_initialize_double_init_guard()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L84 | neighbors=[integration.rs, deploy(), random_address(), setup(), deploy_agent_registry()]
- "types_index_toasttype": "ToastType" | kind=code-symbol | source=frontend/src/types/index.ts:L5 | neighbors=[Toast.tsx, ToastProvider.tsx, ExportKeysScreen.tsx, SecurityScreen.tsx, index.ts]
- "utc": "Utc" | kind=code-symbol | neighbors=[pdax_firm_quote.rs, api.rs, AppUser, PdaxOrder, PdaxSession]
- "app_cards": "cards.tsx" | kind=code-symbol | source=frontend/app/cards.tsx:L1 | neighbors=[CardsRoute(), CardsScreen.tsx, CardsScreen(), 81a2931 feat(frontend): reachable Tap-t…]
- "app_layout_eventpolyfill": "EventPolyfill" | kind=code-symbol | source=frontend/app/_layout.tsx:L11 | neighbors=[_layout.tsx, .constructor(), .preventDefault(), .stopPropagation()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-019.json

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
