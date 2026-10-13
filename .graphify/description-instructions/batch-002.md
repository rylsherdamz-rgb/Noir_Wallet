# Node Description Batch 3 of 84

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@698366edd38c266bbf9823fdf76867e7469a975c": "698366e feat(frontend): add Noir Wallet React Native Expo app with x402 tap-to-…" | kind=Commit | source=git | neighbors=[index.tsx, _layout.tsx, onboarding.tsx, feat/multi-agent, instaward, instaward-staging] | lang=en
- "karpathywiki_main_now": "now()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24353 | neighbors=[main.js, buildIngestedHashes(), clearHistory(), complete(), computeSlug(), convertPdfWithMineru()] | lang=en
- "screens_seedverifyscreen": "SeedVerifyScreen.tsx" | kind=code-symbol | source=frontend/src/screens/SeedVerifyScreen.tsx:L1 | neighbors=[seed-verify.tsx, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…] | lang=en
- "services_pinlock": "pinLock.ts" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L1 | neighbors=[_layout.tsx, lock.tsx, 16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, ExportKeysScreen.tsx] | lang=en
- "services_wallet": "wallet.ts" | kind=code-symbol | source=frontend/src/services/wallet.ts:L1 | neighbors=[import-wallet.tsx, seed-phrase.tsx, seed-verify.tsx, 1fe9de1 migrating workspace, 65d8450 feat(agents): support multiple …, bd5fbe7 fix issue and added mainet addr…] | lang=en
- "src_models": "models.rs" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, AppUser, AuthenticatedWallet, CashRequest, ChallengeRequest] | lang=en
- "components_button": "Button.tsx" | kind=code-symbol | source=frontend/src/components/Button.tsx:L1 | neighbors=[fiat.tsx, 1ddcf05 ci: add Google Cloud Run deploy…, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, bd5fbe7 fix issue and added mainet addr…, ff96a30 chore: rebuild frontend with Ex…] | lang=en
- "karpathywiki_main_createorupdatefile": "createOrUpdateFile()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76627 | neighbors=[main.js, appendAliases(), appendToReviewedPage(), createDissentStubs(), createNewPage(), checkCancelled()] | lang=en
- "screens_cardsscreen": "CardsScreen.tsx" | kind=code-symbol | source=frontend/src/screens/CardsScreen.tsx:L1 | neighbors=[cards.tsx, 16f1d4d Merge branch 'testing', 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…] | lang=en
- "src_pdax_pdaxclient": "PdaxClient" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L456 | neighbors=[pdax.rs, Arc, Client, Option, RwLock, .crypto_deposit_address()] | lang=en
- "string": "String" | kind=code-symbol | neighbors=[SessionAuth, SessionAuthService, Config, ErrorResponse, PaymentError, AppUser] | lang=en
- "tests_integration_random_bytes_32": "random_bytes_32()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L13 | neighbors=[integration.rs, setup(), test_check_payment_accepts_in_policy(), test_check_payment_rejects_after_expiry…, test_check_payment_rejects_nonpositive_…, test_check_payment_rejects_over_limit()] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@de00d309d80b744e24466043db99466ac8305c13": "de00d30 feat: promo — logo, scene shell, components, app screens" | kind=Commit | source=git | neighbors=[9cd9fb4 chore: add eas.json for EAS Bui…, AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx] | lang=nl
- "components_walletswitcher": "WalletSwitcher.tsx" | kind=code-symbol | source=frontend/src/components/WalletSwitcher.tsx:L1 | neighbors=[0c78c60 ui: replace hex-opacity concate…, 16f1d4d Merge branch 'testing', 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…] | lang=en
- "karpathywiki_main_createsummarypage": "createSummaryPage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76534 | neighbors=[main.js, applySectionLabels(), buildSystemPrompt(), cleanMarkdownResponse(), correctRelatedLinkPrefixes(), createOrUpdateFile()] | lang=en
- "tests_integration_deploy": "deploy()" | kind=code-symbol | source=backend/contracts/device_registry/tests/integration.rs:L21 | neighbors=[integration.rs, random_address(), test_check_payment_accepts_in_policy(), test_check_payment_rejects_after_expiry…, test_check_payment_rejects_nonpositive_…, test_check_payment_rejects_over_limit()] | lang=en
- "components_testnetfaucetbanner": "TestnetFaucetBanner.tsx" | kind=code-symbol | source=frontend/src/components/TestnetFaucetBanner.tsx:L1 | neighbors=[16f1d4d Merge branch 'testing', 22cce04 refactor: replace all StyleShee…, 29554f5 feat: remove Blockchain tab, ad…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…] | lang=en
- "karpathywiki_main_resolvemodelfortask": "resolveModelForTask()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69004 | neighbors=[main.js, analyzeSource(), appendToReviewedPage(), askTypeFromVocabulary(), callPerSectionAppend(), checkDedup()] | lang=en
- "services_wallet_walletservice": "WalletService" | kind=code-symbol | source=frontend/src/services/wallet.ts:L41 | neighbors=[seed-verify.tsx, WalletSwitcher.tsx, DeviceProvisioningScreen.tsx, ExportKeysScreen.tsx, ImportWalletScreen.tsx, SecurityScreen.tsx] | lang=en
- "app_index": "index.tsx" | kind=code-symbol | source=frontend/app/index.tsx:L1 | neighbors=[Index(), NOIR_MARK, styles, theme.ts, Colors, FontSize] | lang=en
- "brand_noirlogo": "NoirLogo.tsx" | kind=code-symbol | source=frontend/src/components/brand/NoirLogo.tsx:L1 | neighbors=[LOGO_FULL, LOGO_MARK, NoirLogo(), NoirLogoProps, NoirLogoVariant, styles] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@192bd8f979436b5032440cc15795cef1c8e2a35f": "192bd8f Cargo tests" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 07387d7 feat(db): initialize database s…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ff96a30f5908c143da28dd3415e6fa680137d612": "ff96a30 chore: rebuild frontend with Expo SDK 57, replace expo-av with expo-aud…" | kind=Commit | source=git | neighbors=[1fe9de1 migrating workspace, _layout.tsx, onboarding.tsx, feat/multi-agent, instaward, instaward-development] | lang=en
- "components_errormessage": "ErrorMessage.tsx" | kind=code-symbol | source=frontend/src/components/ErrorMessage.tsx:L1 | neighbors=[fiat.tsx, 0c78c60 ui: replace hex-opacity concate…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…] | lang=en
- "components_filterchips": "FilterChips.tsx" | kind=code-symbol | source=frontend/src/components/FilterChips.tsx:L1 | neighbors=[0c78c60 ui: replace hex-opacity concate…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…, 2c6012b Update README contract IDs to m…, 3381d81 Merge PR #7 (cGradying:main) 'A…] | lang=en
- "demo_scenes_titlescenes": "TitleScenes.tsx" | kind=code-symbol | source=promotion/src/demo-scenes/TitleScenes.tsx:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, IntroScene(), LogoTile(), OutroScene()] | lang=en
- "services_api_apiservice_request": ".request()" | kind=code-symbol | source=frontend/src/services/api.ts:L16 | neighbors=[ApiService, .batchPayments(), .getBalance(), .getDevices(), .getMerchantSettings(), .getNotifications()] | lang=en
- "src_db_repository": "Repository" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L14 | neighbors=[db.rs, PgPool, .apply_webhook_event(), .claim_order(), .consume_challenge(), .create_challenge()] | lang=en
- "src_main": "main.rs" | kind=code-symbol | source=unused/pdax-backend/src/main.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, RateLimiter, Repository, main(), 07387d7 feat(db): initialize database s…] | lang=en
- "store_useappstore_useappstore": "useAppStore" | kind=code-symbol | source=frontend/src/store/useAppStore.ts:L102 | neighbors=[import-wallet.tsx, index.tsx, _layout.tsx, lock.tsx, seed-phrase.tsx, seed-verify.tsx] | lang=en
- "tabs_layout": "_layout.tsx" | kind=code-symbol | source=frontend/app/(tabs)/_layout.tsx:L1 | neighbors=[042e052 feat(frontend): add Settings ta…, 0bba7fc feat: replace Tap-to-Pay with A…, 153ffb7 feat: persist store, fix testne…, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 22cce04 refactor: replace all StyleShee…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4d7a39e168922d06a37cba09ece4a96d56577908": "4d7a39e chore: merge frontend branch — TS fixes, soroban module, NFC improvemen…" | kind=Commit | source=git | neighbors=[1dd5d78 chore: merge backend branch int…, _layout.tsx, scan-qr.tsx, feat/multi-agent, instaward, instaward-development] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@b30c3edf2e9e5296bd221994494a4ca2d1a79786": "b30c3ed Merge pull request #5 from rylsherdamz-rgb/staging" | kind=Commit | source=git | neighbors=[372965a contracts: deploy all 3 to test…, index.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f8a4aa015d04870df6a57055ef52a89c5f3ad0e7": "f8a4aa0 feat: fill 14 gaps — QR scan, PIN lock, deep linking, push notification…" | kind=Commit | source=git | neighbors=[9313cd3 test: 108 tests across 9 suites…, fiat.tsx, _layout.tsx, lock.tsx, +not-found.tsx, scan-qr.tsx] | lang=pt
- "components_icon": "Icon.tsx" | kind=code-symbol | source=promotion/src/components/Icon.tsx:L1 | neighbors=[AgentsApp.tsx, BlockchainApp.tsx, DashboardApp.tsx, DevicesApp.tsx, ReceiveApp.tsx, RevokeApp.tsx] | lang=en
- "karpathywiki_main_ingestconversation": "ingestConversation()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74629 | neighbors=[main.js, doSave(), apiDelay(), applySectionLabels(), buildSystemPrompt(), callLlm()] | lang=en
- "services_nfc": "nfc.ts" | kind=code-symbol | source=frontend/src/services/nfc.ts:L1 | neighbors=[_layout.tsx, 16f1d4d Merge branch 'testing', 1fe9de1 migrating workspace, 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, 4d7a39e chore: merge frontend branch — …] | lang=en
- "src_config": "config.rs" | kind=code-symbol | source=unused/pdax-backend/src/config.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, Config, parse_env(), 0315f62 fix: sign soroban auth entries …, 07387d7 feat(db): initialize database s…] | lang=en
- "tests_integration_setup": "setup()" | kind=code-symbol | source=backend/contracts/payment_escrow/tests/integration.rs:L47 | neighbors=[integration.rs, create_token(), deploy_agent_registry(), deploy_device_registry(), random_address(), random_bytes_32()] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@1e2f9354f673238c551ab4ff820245d384eb3127": "1e2f935 Merge remote-tracking branch 'origin/backend'" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, e988d88 chore: fix root .gitignore for …] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-002.json

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
