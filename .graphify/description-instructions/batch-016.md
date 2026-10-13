# Node Description Batch 17 of 84

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

- "karpathywiki_main_resolveproviderapikey": "resolveProviderApiKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54782 | neighbors=[main.js, createLLMClientFromSettingsSync(), initializeLLMClient(), loadSettings(), probeLlm(), testLLMConnection()]
- "karpathywiki_main_runaliascompletion": "runAliasCompletion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82038 | neighbors=[main.js, checkCancelled(), detectRateLimitFailures(), formatRateLimitNotice(), hide(), now()]
- "karpathywiki_main_runbigramcrosslangsignal": "runBigramCrossLangSignal()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83481 | neighbors=[main.js, bigrams(), computeJaccard(), normalizeForMatch(), yieldForComparison(), runSignalsForBucket()]
- "karpathywiki_main_runcontradictionphase": "runContradictionPhase()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83877 | neighbors=[main.js, formatContradictionReport(), getOpenContradictions(), getText(), updateStatusBar(), runLintWiki()]
- "karpathywiki_main_runschemaanalyze": "runSchemaAnalyze()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81583 | neighbors=[main.js, endLintOperation(), hide(), requireLLMReady(), startLintOperation(), suggestSchemaUpdate()]
- "karpathywiki_main_save": "save()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65306 | neighbors=[main.js, completeLogin(), flushApiKey(), loadRaw(), wrapStorageError(), saveIamKeys()]
- "karpathywiki_main_scansourcedrift": "scanSourceDrift()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82918 | neighbors=[main.js, runProgrammaticPhase(), extractBody(), hashBody(), originNoteRefs(), parseFrontmatter()]
- "karpathywiki_main_scantagviolations": "scanTagViolations()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82884 | neighbors=[main.js, runProgrammaticPhase(), getActiveConceptTags(), getActiveEntityTags(), getActiveSourceTags(), parseFrontmatter()]
- "karpathywiki_main_securejsonparse": "secureJsonParse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17361 | neighbors=[main.js, convertToAnthropicMessagesPrompt(), extractApiCallResponse(), parseJSON(), safeParseJSON(), _parse2()]
- "karpathywiki_main_signtoolapproval": "signToolApproval()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24570 | neighbors=[main.js, maybeSignApproval(), buildPayload(), hashInput(), importKey(), toBase64url()]
- "karpathywiki_main_snapheadertocanonical": "snapHeaderToCanonical()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71241 | neighbors=[main.js, classifyHeader(), findSection2(), resolveSectionAnchor(), levenshtein(), stripUnknownSections()]
- "karpathywiki_main_start": "start()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64944 | neighbors=[main.js, runBatchIngest(), runLoopbackLogin(), findJob(), notify(), now()]
- "karpathywiki_main_stripmentionssection": "stripMentionsSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L70341 | neighbors=[main.js, assembleFinalContent(), preserveExistingSections(), stampSourcePageHead(), findSection(), updateRelatedPage()]
- "karpathywiki_main_throwifaborted4": "throwIfAborted4()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65353 | neighbors=[main.js, completeDeviceAuthorization2(), raceWithBounds2(), registerClient(), startDeviceAuthorization(), abortError4()]
- "karpathywiki_main_toimagemodelv3file": "toImageModelV3File()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28706 | neighbors=[main.js, normalizePrompt(), convertBase64ToUint8Array(), convertDataContentToUint8Array(), detectMediaType(), splitDataUrl()]
- "karpathywiki_main_updatestatusbar": "updateStatusBar()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75542 | neighbors=[main.js, notifyProgress(), runContradictionPhase(), runDedupPhase(), runPreparationPhase(), runProgrammaticPhase()]
- "karpathywiki_main_verifysourcestance": "verifySourceStance()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73375 | neighbors=[main.js, applyContradictionGates(), normalizeStatement(), parseJsonResponse(), renderTemplate(), resolveModelForTask()]
- "karpathywiki_main_verifytoolapprovalsignature": "verifyToolApprovalSignature()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24583 | neighbors=[main.js, validateApprovedToolApprovals(), buildPayload(), fromBase64url(), hashInput(), importKey()]
- "karpathywiki_main_withdeadline": "withDeadline()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68683 | neighbors=[main.js, downloadResult(), mineruRequest(), uploadPdf(), waitForResult(), throwIfAborted5()]
- "promo_generate_voiceover": "generate-voiceover.ts" | kind=code-symbol | source=promo/generate-voiceover.ts:L1 | neighbors=[bd5fbe7 fix issue and added mainet addr…, f8751a9 feat: Remotion promo video — No…, generateAll(), outputDir, Scene, SCENES]
- "scenes_sceneshell_usephoneentrance": "usePhoneEntrance()" | kind=code-symbol | source=promotion/src/scenes/SceneShell.tsx:L105 | neighbors=[Architecture.tsx, Intro.tsx, Problem.tsx, SceneShell.tsx, UseCases.tsx, X402.tsx]
- "services_biometrics_checkavailability": "checkAvailability()" | kind=code-symbol | source=frontend/src/services/biometrics.ts:L34 | neighbors=[lock.tsx, ExportKeysScreen.tsx, SecurityScreen.tsx, biometrics.ts, authenticate(), 11-security.test.ts]
- "services_pinlock_setpin": "setPin()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L118 | neighbors=[lock.tsx, pinLock.ts, clearLockout(), derive(), verifyPin(), 11-security.test.ts]
- "services_stellar_service_stellarservice_accountexists": ".accountExists()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L176 | neighbors=[StellarService, .ensureAccountFunded(), .fundAccount(), .readContract(), .submitPayment(), .waitForAccount()]
- "src_auth_keypair": "keypair()" | kind=code-symbol | source=unused/pdax-backend/src/auth.rs:L241 | neighbors=[auth.rs, accepts_a_genuine_signature(), rejects_a_signature_from_a_different_ke…, rejects_a_signature_over_a_different_me…, rejects_malformed_input(), validates_wallet_addresses()]
- "src_config_config": "Config" | kind=code-symbol | source=unused/pdax-backend/src/config.rs:L10 | neighbors=[config.rs, .from_env(), .is_production(), .pdax_base_url(), .validate(), String]
- "src_crypto_encrypt_at_rest": "encrypt_at_rest()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L141 | neighbors=[crypto.rs, .to_bytes(), .generate_data_key(), test_decrypt_fails_with_wrong_key_manag…, test_encrypt_decrypt_at_rest_roundtrip(), test_encrypted_blobs_are_not_determinis…]
- "src_crypto_localkeymanager": "LocalKeyManager" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L35 | neighbors=[crypto.rs, .cipher(), .generate_data_key(), .key_version(), .new(), .unwrap_data_key()]
- "src_crypto_test_key_manager": "test_key_manager()" | kind=code-symbol | source=unused/pdax-backend/src/crypto.rs:L180 | neighbors=[crypto.rs, test_data_key_wrap_unwrap_roundtrip(), test_decrypt_fails_with_wrong_key_manag…, test_encrypt_decrypt_at_rest_roundtrip(), test_encrypted_blobs_are_not_determinis…, .new()]
- "src_demoshell_darkbg": "DarkBG()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L103 | neighbors=[NfcTagScene.tsx, PosEscrowScene.tsx, TapToPayScene.tsx, TitleScenes.tsx, WalkthroughScenes.tsx, DemoShell.tsx]
- "src_demoshell_usescenefade": "useSceneFade()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L45 | neighbors=[NfcTagScene.tsx, PosEscrowScene.tsx, TapToPayScene.tsx, TitleScenes.tsx, WalkthroughScenes.tsx, DemoShell.tsx]
- "src_demoshell_watermark": "Watermark()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L546 | neighbors=[NfcTagScene.tsx, PosEscrowScene.tsx, TapToPayScene.tsx, TitleScenes.tsx, WalkthroughScenes.tsx, DemoShell.tsx]
- "src_errors_paymenterror": "PaymentError" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L11 | neighbors=[errors.rs, .error_response(), .error_type(), .public_message(), .status_code(), String]
- "src_index": "index.ts" | kind=code-symbol | source=promotion/src/index.ts:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, f8751a9 feat: Remotion promo video — No…, Root.tsx, RemotionRoot()]
- "tabs_index": "index.tsx" | kind=code-symbol | source=frontend/app/(tabs)/index.tsx:L1 | neighbors=[1fe9de1 migrating workspace, 698366e feat(frontend): add Noir Wallet…, a303810 Merge pull request #2 from ryls…, DashboardScreen.tsx, DashboardScreen(), TabIndex()]
- "tests_05_store_test": "05-store.test.ts" | kind=code-symbol | source=frontend/tests/05-store.test.ts:L1 | neighbors=[4d7a39e chore: merge frontend branch — …, 9313cd3 test: 108 tests across 9 suites…, bd5fbe7 fix issue and added mainet addr…, f52569d fix: type errors and add missin…, useAppStore.ts, index.ts]
- "tests_integration_test_claim_payments": "test_claim_payments()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L127 | neighbors=[integration.rs, random_address(), setup(), create_token(), deploy_agent_registry(), random_bytes_32()]
- "tests_integration_test_defund_escrow_returns_funds": "test_defund_escrow_returns_funds()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L145 | neighbors=[integration.rs, setup(), create_token(), deploy_agent_registry(), random_address(), random_bytes_32()]
- "tests_integration_test_fund_escrow_increases_balance": "test_fund_escrow_increases_balance()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L103 | neighbors=[integration.rs, setup(), create_token(), deploy_agent_registry(), random_address(), random_bytes_32()]
- "types_index_device": "Device" | kind=code-symbol | source=frontend/src/types/index.ts:L31 | neighbors=[_layout.tsx, CardsScreen.tsx, DeviceProvisioningScreen.tsx, api.ts, useAppStore.ts, index.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-016.json

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
