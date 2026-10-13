# Node Description Batch 10 of 84

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

- "karpathywiki_main_waitforresult": "waitForResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68788 | neighbors=[main.js, convertPdfWithMineru(), classifyMineruFailure(), mineruRequest(), now(), stringValue()] | lang=en
- "karpathywiki_main_writecontradictionrecords": "writeContradictionRecords()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74084 | neighbors=[main.js, mergePage(), buildContradictionRecord(), createOrUpdateFile(), existingViewOf(), getSectionLabels()] | lang=en
- "lib_stellarerrors": "stellarErrors.ts" | kind=code-symbol | source=frontend/src/lib/stellarErrors.ts:L1 | neighbors=[16f1d4d Merge branch 'testing', 3381d81 Merge PR #7 (cGradying:main) 'A…, 427833b Auditing and Fixing Backend and…, CODE_MESSAGES, CODES_BY_LENGTH, humanizeStellarError()] | lang=en
- "migrations_20260629000001_initial_schema": "20260629000001_initial_schema.sql" | kind=code-symbol | source=unused/pdax-backend/migrations/20260629000001_initial_schema.sql:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, channel_transactions, daily_spends, devices, fee_channels] | lang=en
- "migrations_20260802000001_pdax_bridge_only": "20260802000001_pdax_bridge_only.sql" | kind=code-symbol | source=unused/pdax-backend/migrations/20260802000001_pdax_bridge_only.sql:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, auth_challenges, pdax_orders, rate_limits, sessions] | lang=en
- "services_securestorage": "secureStorage.ts" | kind=code-symbol | source=frontend/src/services/secureStorage.ts:L1 | neighbors=[5cb7bcc chore(frontend): snapshot in-pr…, 8eca877 fix soroban auth signing, UI im…, 8fc098f chore(frontend): snapshot in-pr…, x402.ts, secureDeleteItem(), secureGetItem()] | lang=en
- "services_txmonitor": "txMonitor.ts" | kind=code-symbol | source=frontend/src/services/txMonitor.ts:L1 | neighbors=[bd5fbe7 fix issue and added mainet addr…, stellar-service.ts, StellarService, notify(), poll(), startTxMonitor()] | lang=en
- "src_lib_agentregistry": "AgentRegistry" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L41 | neighbors=[lib.rs, .check_payment(), .get_agent(), .get_policy(), .initialize(), .is_auth()] | lang=en
- "src_lib_paymentescrow": "PaymentEscrow" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L48 | neighbors=[lib.rs, .authorize(), .balance_of(), .claim(), .defund_escrow(), .fund_escrow()] | lang=en
- "src_metrics": "metrics.rs" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, MetricsCollector, MetricsSnapshot, 16f1d4d Merge branch 'testing', 1e2f935 Merge remote-tracking branch 'o…] | lang=en
- "tests_07_screens_test": "07-screens.test.ts" | kind=code-symbol | source=frontend/tests/07-screens.test.ts:L1 | neighbors=[0bba7fc feat: replace Tap-to-Pay with A…, 4d7a39e chore: merge frontend branch — …, 9313cd3 test: 108 tests across 9 suites…, bd5fbe7 fix issue and added mainet addr…, f52569d fix: type errors and add missin…, AgentDetailScreen.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@042630cbfef5f080bfed56d8605d5817e3636125": "042630c fix: correct Friendbot URL in fundTestnetAccount - was using wrong URLs…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, e4b078e fix: add missing cleanup() meth…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@0c6bda474c48b2033b83e98d2a6a585bb4ba0edd": "0c6bda4 Add web-based pubmat editor: live text edit, logo upload, accent/ratio …" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 63ffdf0 docs: add open-source community…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@18afb299fd12cfe6facb85548ee95dd4104c29af": "18afb29 feat: auto-fund testnet wallet via Friendbot + show balance in signing …" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 042630c fix: correct Friendbot URL in f…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@231b7b78f81039b57ed2517086b7faf5ed2de2e2": "231b7b7 fix: phone/card icon misalignment in NFC illustration" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, ca30f05 feat: realistic phone illustrat…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@2570dc46fc6ab2639fd288163ab22d79b11b322c": "2570dc4 optimize demo video to 2MB for reliable GitHub README playback" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 6f2b391 switch demo to YouTube embed wi…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@3d99c032a305e113834dec3f45f86fc4a2643575": "3d99c03 fix: center NFC antenna on phone body" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, f3fb27a feat: custom device name input …] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@455096ed4bfd068bc21daf3e3057c5e50efc6b02": "455096e feat: add EXPO_PUBLIC_API_BASE_URL for dev override to Cloud Run" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 5aa1e33 fix: commit Cargo.lock for repr…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@609f8e7f07034629ec79c6f47cec5e6ac9946b82": "609f8e7 fix: center phone screen, match phone & card size" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 3d99c03 fix: center NFC antenna on phon…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@61ef7767e413e8e3a7e70bf7f554450e6bff36e6": "61ef776 Add Noir Wallet pubmat: brand-exact HTML/SVG + Playwright render pipeli…" | kind=Commit | source=git | neighbors=[3abbb7b ci: use node 22 in frontend wor…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@6d69a2c9fa0ef58e1e8c0533ecefffb1c73fd4da": "6d69a2c fix: null-guard loadKeys() result in x402 tests to clear tsc --noEmit" | kind=Commit | source=git | neighbors=[51a44a4 Enhance landing page: GitHub st…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@78b6b5323ee1921da99d90d05baa6ed6833e3f3f": "78b6b53 Add screenshots, architecture diagrams, and community assets" | kind=Commit | source=git | neighbors=[6608b0d Add User Feedback section to RE…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@8484225d2bf9efa7f2bd9af8ed26b3227fdf1c9c": "8484225 revert: remove stellar-service mock — tests hit real network" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 2cb58fa fix: persistent storage for TTL…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@91942022f2612a0bee6a66ae49ccd2c4b8794292": "9194202 feat(brand): app icon, adaptive icons, splash + favicon from NOIR cat l…" | kind=Commit | source=git | neighbors=[81a2931 feat(frontend): reachable Tap-t…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@965a5cffb9513ac8e3b9741625863f82d6d05c16": "965a5cf feat: add Fund with Testnet XLM button to Blockchain screen" | kind=Commit | source=git | neighbors=[0354052 feat: remove all mock data, wir…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a4a92f613ba0391359aa7e32a29e15c41783ad1f": "a4a92f6 fix: NFC device illustration overflow on small screens" | kind=Commit | source=git | neighbors=[a043e33 fix: reduce portfolio value fon…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@b3e763cebab375aff93ca1a41a24369dc2041226": "b3e763c fix: onboarding screen responsiveness — ScrollView, useWindowDimensions…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 4a662d5 fix: disable EAS build cache to…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@c79f19c2b5773cfb7326c4457d5d9e6f3efdefae": "c79f19c fix: NFC readTag now uses registerTagEvent with callback instead of get…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 81efec3 fix: NFC provisioning now worki…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ca30f05fbd79d085aeaad1e868914b2a0cab9fef": "ca30f05 feat: realistic phone illustration in NFC scan UI" | kind=Commit | source=git | neighbors=[231b7b7 fix: phone/card icon misalignme…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@cf71cf2d17c00064a3d77df47236378cfba6b1ff": "cf71cf2 docs: add HISTORY.md — session changes, root causes, gotchas, and conte…" | kind=Commit | source=git | neighbors=[9194202 feat(brand): app icon, adaptive…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d2ad0982b014d57de587659af4adf9ab1e689695": "d2ad098 landing" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 22cce04 refactor: replace all StyleShee…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@dcf0a97f744a417e882586f20d1eee133e4a5dbd": "dcf0a97 use GIF preview as thumbnail placeholder instead of blank poster" | kind=Commit | source=git | neighbors=[d7c4861 use local poster JPG instead of…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e4b078ee93e77bfc17e6f01675deb512397bca41": "e4b078e fix: add missing cleanup() method to NFCService - useNfc hook called nf…" | kind=Commit | source=git | neighbors=[042630c fix: correct Friendbot URL in f…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e7539c9677b7fe60583b2b9e6e3aca488e972d8a": "e7539c9 Update landing page: centered phone mockups, new X demo video, GitHub P…" | kind=Commit | source=git | neighbors=[78b6b53 Add screenshots, architecture d…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e988d8888c3d4b8a2d8addcc2439f55b5ebc02c2": "e988d88 chore: fix root .gitignore for monorepo (backend + frontend)" | kind=Commit | source=git | neighbors=[1e2f935 Merge remote-tracking branch 'o…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f3fb27adbbc944f6ecd4d7c68155243febc27586": "f3fb27a feat: custom device name input via 'Other' chip" | kind=Commit | source=git | neighbors=[3d99c03 fix: center NFC antenna on phon…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "common_pdax_env_cache": "pdax_env_cache.rs" | kind=code-symbol | source=unused/pdax-backend/examples/common/pdax_env_cache.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, env_path(), save_session(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…] | lang=en
- "examples_pdax_firm_quote": "pdax_firm_quote.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_firm_quote.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), Utc, 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…] | lang=en
- "karpathywiki_main_applycomplementaryappends": "applyComplementaryAppends()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73832 | neighbors=[main.js, callPerSectionAppend(), getSectionLabels(), isListSection(), makeFallbackNewInfoSection(), resolveSectionAnchor()] | lang=en
- "karpathywiki_main_applyrelatedlinks": "applyRelatedLinks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72779 | neighbors=[main.js, buildVaultResolver(), correctRelatedLinkPrefixes(), getExistingWikiPages(), renderRelatedSections(), createNewPage()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-009.json

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
