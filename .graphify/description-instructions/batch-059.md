# Node Description Batch 60 of 84

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

- "app_layout_styles": "styles" | kind=code-symbol | source=frontend/app/_layout.tsx:L256 | neighbors=[_layout.tsx]
- "app_lock_styles": "styles" | kind=code-symbol | source=frontend/app/lock.tsx:L215 | neighbors=[lock.tsx]
- "app_not_found_notfoundscreen": "NotFoundScreen()" | kind=code-symbol | source=frontend/app/+not-found.tsx:L7 | neighbors=[+not-found.tsx]
- "app_not_found_styles": "styles" | kind=code-symbol | source=frontend/app/+not-found.tsx:L27 | neighbors=[+not-found.tsx]
- "app_onboarding_onboarding": "Onboarding()" | kind=code-symbol | source=frontend/app/onboarding.tsx:L4 | neighbors=[onboarding.tsx]
- "app_scan_qr_scanqrroute": "ScanQrRoute()" | kind=code-symbol | source=frontend/app/scan-qr.tsx:L8 | neighbors=[scan-qr.tsx]
- "app_scan_qr_styles": "styles" | kind=code-symbol | source=frontend/app/scan-qr.tsx:L71 | neighbors=[scan-qr.tsx]
- "app_screens_agentsapp_agents": "agents" | kind=code-symbol | source=promotion/src/app-screens/AgentsApp.tsx:L8 | neighbors=[AgentsApp.tsx]
- "app_screens_agentsapp_ease": "ease" | kind=code-symbol | source=promotion/src/app-screens/AgentsApp.tsx:L6 | neighbors=[AgentsApp.tsx]
- "app_screens_blockchainapp_activity": "activity" | kind=code-symbol | source=promotion/src/app-screens/BlockchainApp.tsx:L9 | neighbors=[BlockchainApp.tsx]
- "app_screens_blockchainapp_ease": "ease" | kind=code-symbol | source=promotion/src/app-screens/BlockchainApp.tsx:L7 | neighbors=[BlockchainApp.tsx]
- "app_screens_dashboardapp_actions": "actions" | kind=code-symbol | source=promotion/src/app-screens/DashboardApp.tsx:L14 | neighbors=[DashboardApp.tsx]
- "app_screens_dashboardapp_assets": "assets" | kind=code-symbol | source=promotion/src/app-screens/DashboardApp.tsx:L8 | neighbors=[DashboardApp.tsx]
- "app_screens_dashboardapp_ease": "ease" | kind=code-symbol | source=promotion/src/app-screens/DashboardApp.tsx:L6 | neighbors=[DashboardApp.tsx]
- "app_screens_devicesapp_ease": "ease" | kind=code-symbol | source=promotion/src/app-screens/DevicesApp.tsx:L7 | neighbors=[DevicesApp.tsx]
- "app_screens_receiveapp_assets": "assets" | kind=code-symbol | source=promotion/src/app-screens/ReceiveApp.tsx:L7 | neighbors=[ReceiveApp.tsx]
- "app_screens_receiveapp_ease": "ease" | kind=code-symbol | source=promotion/src/app-screens/ReceiveApp.tsx:L6 | neighbors=[ReceiveApp.tsx]
- "app_screens_revokeapp_clamp": "clamp" | kind=code-symbol | source=promotion/src/app-screens/RevokeApp.tsx:L20 | neighbors=[RevokeApp.tsx]
- "app_screens_revokeapp_ease": "ease" | kind=code-symbol | source=promotion/src/app-screens/RevokeApp.tsx:L6 | neighbors=[RevokeApp.tsx]
- "app_screens_sendapp_assets": "assets" | kind=code-symbol | source=promotion/src/app-screens/SendApp.tsx:L7 | neighbors=[SendApp.tsx]
- "app_screens_sendapp_keys": "KEYS" | kind=code-symbol | source=promotion/src/app-screens/SendApp.tsx:L6 | neighbors=[SendApp.tsx]
- "app_screens_transactionsapp_ease": "ease" | kind=code-symbol | source=promotion/src/app-screens/TransactionsApp.tsx:L6 | neighbors=[TransactionsApp.tsx]
- "app_screens_transactionsapp_filters": "filters" | kind=code-symbol | source=promotion/src/app-screens/TransactionsApp.tsx:L8 | neighbors=[TransactionsApp.tsx]
- "app_screens_transactionsapp_txs": "txs" | kind=code-symbol | source=promotion/src/app-screens/TransactionsApp.tsx:L10 | neighbors=[TransactionsApp.tsx]
- "app_screens_welcomeapp_ease": "ease" | kind=code-symbol | source=promotion/src/app-screens/WelcomeApp.tsx:L25 | neighbors=[WelcomeApp.tsx]
- "app_screens_welcomeapp_features": "features" | kind=code-symbol | source=promotion/src/app-screens/WelcomeApp.tsx:L7 | neighbors=[WelcomeApp.tsx]
- "app_seed_phrase_seedphraseroute": "SeedPhraseRoute()" | kind=code-symbol | source=frontend/app/seed-phrase.tsx:L8 | neighbors=[seed-phrase.tsx]
- "app_seed_verify_seedverifyroute": "SeedVerifyRoute()" | kind=code-symbol | source=frontend/app/seed-verify.tsx:L9 | neighbors=[seed-verify.tsx]
- "app_tap_taproute": "TapRoute()" | kind=code-symbol | source=frontend/app/tap.tsx:L4 | neighbors=[tap.tsx]
- "atomicu64": "AtomicU64" | kind=code-symbol | neighbors=[MetricsCollector]
- "brand_brandglyph_glyphprops": "GlyphProps" | kind=code-symbol | source=frontend/src/components/brand/BrandGlyph.tsx:L3 | neighbors=[BrandGlyph.tsx]
- "brand_brandglyph_sparkglyph": "SparkGlyph()" | kind=code-symbol | source=frontend/src/components/brand/BrandGlyph.tsx:L27 | neighbors=[BrandGlyph.tsx]
- "brand_noirlogo_logo_full": "LOGO_FULL" | kind=code-symbol | source=frontend/src/components/brand/NoirLogo.tsx:L15 | neighbors=[NoirLogo.tsx]
- "brand_noirlogo_logo_mark": "LOGO_MARK" | kind=code-symbol | source=frontend/src/components/brand/NoirLogo.tsx:L14 | neighbors=[NoirLogo.tsx]
- "brand_noirlogo_noirlogoprops": "NoirLogoProps" | kind=code-symbol | source=frontend/src/components/brand/NoirLogo.tsx:L6 | neighbors=[NoirLogo.tsx]
- "brand_noirlogo_noirlogovariant": "NoirLogoVariant" | kind=code-symbol | source=frontend/src/components/brand/NoirLogo.tsx:L4 | neighbors=[NoirLogo.tsx]
- "brand_noirlogo_styles": "styles" | kind=code-symbol | source=frontend/src/components/brand/NoirLogo.tsx:L75 | neighbors=[NoirLogo.tsx]
- "brand_noirlogo_wordmark": "Wordmark()" | kind=code-symbol | source=frontend/src/components/brand/NoirLogo.tsx:L60 | neighbors=[NoirLogo.tsx]
- "brand_pressablescale_animatedpressable": "AnimatedPressable" | kind=code-symbol | source=frontend/src/components/brand/PressableScale.tsx:L11 | neighbors=[PressableScale.tsx]
- "brand_pressablescale_default_hit_slop": "DEFAULT_HIT_SLOP" | kind=code-symbol | source=frontend/src/components/brand/PressableScale.tsx:L28 | neighbors=[PressableScale.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-059.json

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
