# Node Description Batch 55 of 84

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

- "karpathywiki_main_waitfor2": "waitFor2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65371 | neighbors=[main.js, completeDeviceAuthorization2()]
- "karpathywiki_main_waitforcallback": "waitForCallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64986 | neighbors=[main.js, runLoopbackLogin()]
- "karpathywiki_main_wikicontexterrorhint": "wikiContextErrorHint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78112 | neighbors=[main.js, buildWikiContext()]
- "karpathywiki_main_wrapprovider": "wrapProvider()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L30271 | neighbors=[main.js, asProviderV3()]
- "karpathywiki_main_wrapreasoningcontent": "wrapReasoningContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43688 | neighbors=[main.js, prependReasoningForParse()]
- "karpathywiki_main_wrapwithadvancedsettings": "wrapWithAdvancedSettings()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55242 | neighbors=[main.js, createLLMClient()]
- "karpathywiki_main_xid2": "xid2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11231 | neighbors=[main.js, _xid()]
- "karpathywiki_main_yamlstringify": "yamlStringify()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67652 | neighbors=[main.js, serializeFrontmatter()]
- "metricscollector": "MetricsCollector" | kind=code-symbol | neighbors=[state.rs, AppState]
- "migrations_20260629000001_initial_schema_daily_spends": "daily_spends" | kind=code-symbol | source=unused/pdax-backend/migrations/20260629000001_initial_schema.sql:L17 | neighbors=[20260629000001_initial_schema.sql, devices]
- "migrations_20260629000001_initial_schema_fee_channels": "fee_channels" | kind=code-symbol | source=unused/pdax-backend/migrations/20260629000001_initial_schema.sql:L57 | neighbors=[20260629000001_initial_schema.sql, channel_transactions]
- "migrations_20260708000001_merchants_users_notification_cache_devices": "devices" | kind=code-symbol | source=unused/pdax-backend/migrations/20260708000001_merchants_users_notification_cache.sql:L78 | neighbors=[20260708000001_merchants_users_notifica…, transaction_notifications]
- "migrations_20260708000001_merchants_users_notification_cache_payment_transactions": "payment_transactions" | kind=code-symbol | source=unused/pdax-backend/migrations/20260708000001_merchants_users_notification_cache.sql:L79 | neighbors=[20260708000001_merchants_users_notifica…, transaction_notifications]
- "pdaxclient": "PdaxClient" | kind=code-symbol | neighbors=[state.rs, AppState]
- "rwlock": "RwLock" | kind=code-symbol | neighbors=[pdax.rs, PdaxClient]
- "scenes_architecture_architecture": "Architecture()" | kind=code-symbol | source=promotion/src/scenes/Architecture.tsx:L20 | neighbors=[Architecture.tsx, NoirPromo.tsx]
- "scenes_intro_intro": "Intro()" | kind=code-symbol | source=promotion/src/scenes/Intro.tsx:L12 | neighbors=[Intro.tsx, NoirPromo.tsx]
- "scenes_outro_outro": "Outro()" | kind=code-symbol | source=promotion/src/scenes/Outro.tsx:L10 | neighbors=[Outro.tsx, NoirPromo.tsx]
- "scenes_problem_problem": "Problem()" | kind=code-symbol | source=promotion/src/scenes/Problem.tsx:L19 | neighbors=[Problem.tsx, NoirPromo.tsx]
- "scenes_usecases_usecases": "UseCases()" | kind=code-symbol | source=promotion/src/scenes/UseCases.tsx:L52 | neighbors=[UseCases.tsx, NoirPromo.tsx]
- "scenes_x402_x402": "X402()" | kind=code-symbol | source=promotion/src/scenes/X402.tsx:L12 | neighbors=[X402.tsx, NoirPromo.tsx]
- "screens_agentdetailscreen_agentdetailscreen": "AgentDetailScreen()" | kind=code-symbol | source=frontend/src/screens/AgentDetailScreen.tsx:L21 | neighbors=[[id].tsx, AgentDetailScreen.tsx]
- "screens_agentlistscreen_agentlistscreen": "AgentListScreen()" | kind=code-symbol | source=frontend/src/screens/AgentListScreen.tsx:L29 | neighbors=[AgentListScreen.tsx, pos.tsx]
- "screens_cardsscreen_cardsscreen": "CardsScreen()" | kind=code-symbol | source=frontend/src/screens/CardsScreen.tsx:L27 | neighbors=[cards.tsx, CardsScreen.tsx]
- "screens_dashboardscreen_greetingforhour": "greetingForHour()" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L55 | neighbors=[DashboardScreen.tsx, DashboardScreen()]
- "screens_deviceprovisioningscreen_deviceprovisioningscreen": "DeviceProvisioningScreen()" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L36 | neighbors=[DeviceProvisioningScreen.tsx, devices.tsx]
- "screens_exportkeysscreen_exportkeysscreen": "ExportKeysScreen()" | kind=code-symbol | source=frontend/src/screens/ExportKeysScreen.tsx:L41 | neighbors=[ExportKeysScreen.tsx, export-keys.tsx]
- "screens_importwalletscreen_importwalletscreen": "ImportWalletScreen()" | kind=code-symbol | source=frontend/src/screens/ImportWalletScreen.tsx:L17 | neighbors=[import-wallet.tsx, ImportWalletScreen.tsx]
- "screens_merchantposscreen_merchantposscreen": "MerchantPosScreen()" | kind=code-symbol | source=frontend/src/screens/MerchantPosScreen.tsx:L22 | neighbors=[tap.tsx, MerchantPosScreen.tsx]
- "screens_notificationsscreen_notificationsscreen": "NotificationsScreen()" | kind=code-symbol | source=frontend/src/screens/NotificationsScreen.tsx:L39 | neighbors=[NotificationsScreen.tsx, notifications.tsx]
- "screens_profilescreen_profilescreen": "ProfileScreen()" | kind=code-symbol | source=frontend/src/screens/ProfileScreen.tsx:L17 | neighbors=[profile.tsx, ProfileScreen.tsx]
- "screens_receivescreen_receivescreen": "ReceiveScreen()" | kind=code-symbol | source=frontend/src/screens/ReceiveScreen.tsx:L24 | neighbors=[receive.tsx, ReceiveScreen.tsx]
- "screens_securityscreen_securityscreen": "SecurityScreen()" | kind=code-symbol | source=frontend/src/screens/SecurityScreen.tsx:L23 | neighbors=[SecurityScreen.tsx, security.tsx]
- "screens_seedphrasescreen_seedphrasescreen": "SeedPhraseScreen()" | kind=code-symbol | source=frontend/src/screens/SeedPhraseScreen.tsx:L19 | neighbors=[seed-phrase.tsx, SeedPhraseScreen.tsx]
- "screens_seedverifyscreen_seedverifyscreen": "SeedVerifyScreen()" | kind=code-symbol | source=frontend/src/screens/SeedVerifyScreen.tsx:L27 | neighbors=[seed-verify.tsx, SeedVerifyScreen.tsx]
- "screens_sendscreen_sendscreen": "SendScreen()" | kind=code-symbol | source=frontend/src/screens/SendScreen.tsx:L39 | neighbors=[send.tsx, SendScreen.tsx]
- "screens_transactiondetailscreen_transactiondetailscreen": "TransactionDetailScreen()" | kind=code-symbol | source=frontend/src/screens/TransactionDetailScreen.tsx:L14 | neighbors=[TransactionDetailScreen.tsx, [id].tsx]
- "screens_transactionhistoryscreen_transactionhistoryscreen": "TransactionHistoryScreen()" | kind=code-symbol | source=frontend/src/screens/TransactionHistoryScreen.tsx:L41 | neighbors=[transactions.tsx, TransactionHistoryScreen.tsx]
- "screens_welcomescreen_welcomescreen": "WelcomeScreen()" | kind=code-symbol | source=frontend/src/screens/WelcomeScreen.tsx:L33 | neighbors=[onboarding.tsx, WelcomeScreen.tsx]
- "scripts_stellar_cli_cmdbalance": "cmdBalance()" | kind=code-symbol | source=frontend/scripts/stellar-cli.ts:L24 | neighbors=[stellar-cli.ts, main()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-054.json

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
