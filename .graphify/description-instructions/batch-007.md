# Node Description Batch 8 of 84

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

- "bytesn": "BytesN" | kind=code-symbol | neighbors=[AgentRegEvent, AgentRevEvent, AuthorizeEvent, DataKey, DefundEvent, FundEvent] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@0315f625eb8ced7bd8da7650a397c8e8b751a3cf": "0315f62 fix: sign soroban auth entries from simulation to fix require_auth() fa…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 3ea9e39 fix soroban auth signing (txToo…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@13265dd26e79ef3bb7f2ce20a6e8b3421f1822a7": "13265dd ui: remove merchant framing — neutral wallet language (To/name), person…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 6fc251f feat(backend): card revoke + op…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@1ddcf0546a437d3a7f3158215d11e144d8ad6c86": "1ddcf05 ci: add Google Cloud Run deploy job, remove render.yaml" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, cc2e817 fix: NFC provisioning flow — ad…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@338c78afe39f58ee55ffc4f783e92dff27861559": "338c78a feat(frontend): latest brand polish — Wallet 3D card, Agents & Welcome …" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, NoirLogo.tsx] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@42e023f5eaab1a6e10c8aad9c07fb063c206d8ca": "42e023f feat(backend): add /devices/register so devices reach the DB (contract …" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 18e752e feat(frontend): non-custodial f…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4ef66b2eca83208a4982448b0d739e998f356da4": "4ef66b2 feat(frontend): latest brand polish — Wallet 3D card, Agents & Welcome …" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, NoirLogo.tsx] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@5cb7bcc1f357e3cb79185a9069a737cae466d6f6": "5cb7bcc chore(frontend): snapshot in-progress services, store & web runtime deps" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 7b2e909 feat(frontend): Noir brand refi…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@8fc098fae39c5323d5e2efc5a3bbe3cce29ae2be": "8fc098f chore(frontend): snapshot in-progress services, store & web runtime deps" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 7c7b9ab feat(frontend): Noir brand refi…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@c901a33d2f92e4a864ebc6789b668e4ecc3742b8": "c901a33 fix(backend): use Horizon REST for account lookups instead of Soroban R…" | kind=Commit | source=git | neighbors=[9d7fb09 fix(tests): mock Platform expor…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@caa1381576c9c3a91b65c30e9ef88a7d74e9f872": "caa1381 ui: accessibility labels and haptic feedback on primary interactions" | kind=Commit | source=git | neighbors=[a11a087 ui: replace remaining hex-opaci…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@eb9ee4706dae867f755ac7edb5f6682d15cdc101": "eb9ee47 feat: X402 agent wallet for automatic NFC tap-to-pay" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 9313cd3 test: 108 tests across 9 suites…] | lang=en
- "components_toast_toast": "Toast()" | kind=code-symbol | source=frontend/src/components/Toast.tsx:L42 | neighbors=[fiat.tsx, Toast.tsx, ToastProvider.tsx, AgentDetailScreen.tsx, BlockchainScreen.tsx, ExportKeysScreen.tsx] | lang=en
- "hooks_usenfc": "useNfc.ts" | kind=code-symbol | source=frontend/src/hooks/useNfc.ts:L1 | neighbors=[4d7a39e chore: merge frontend branch — …, 698366e feat(frontend): add Noir Wallet…, a303810 Merge pull request #2 from ryls…, f52569d fix: type errors and add missin…, useNfc(), nfc.ts] | lang=en
- "karpathywiki_main_checkcancelled": "checkCancelled()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75630 | neighbors=[main.js, createOrUpdateFile(), ingestSource(), runAliasCompletion(), runBatchedWithRetry(), runDeadLinkFixes()] | lang=en
- "karpathywiki_main_cleanmarkdownresponse": "cleanMarkdownResponse()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43591 | neighbors=[main.js, appendToReviewedPage(), stripThinkingBlocks(), stripTrailingSeparators(), createNewPage(), createSummaryPage()] | lang=en
- "karpathywiki_main_constructor": "$constructor()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L681 | neighbors=[main.js, createChild(), normalizeEmptyMode(), recompute(), setValue(), "node_modules/zod/v4/classic/errors.js"…] | lang=en
- "karpathywiki_main_convertpdfwithmineru": "convertPdfWithMineru()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68721 | neighbors=[main.js, convertPdfToMarkdown(), createPdfCache(), downloadResult(), extractMineruMarkdown(), hashCacheKey()] | lang=en
- "karpathywiki_main_json": "json()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L11590 | neighbors=[main.js, isAuthenticationForbidden(), isAuthenticationForbidden2(), parseCatalog(), parsePortalResponse(), responseJson()] | lang=en
- "karpathywiki_main_onload": "onload()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88443 | neighbors=[main.js, checkQueryHistoryForStaleFolders(), cleanupVocabularyTags(), clearUnboundOpenAICodexModelCache(), initializeLLMClientAfterModules(), loadSettings()] | lang=en
- "karpathywiki_main_parsejsonresult": "parseJsonResult()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L52879 | neighbors=[main.js, analyzeSource(), parseJsonResponse(), captureThinkingBlocks(), escapeLatexInMath(), extractBalancedJson()] | lang=en
- "karpathywiki_main_renderprovidersection": "renderProviderSection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L86481 | neighbors=[main.js, display(), getBedrockAuthUiState(), getCodexAuthUiState(), getText(), hasCredential()] | lang=en
- "karpathywiki_main_withuseragentsuffix": "withUserAgentSuffix()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17246 | neighbors=[main.js, callCompletionApi(), embed(), embedMany(), experimental_generateVideo(), generateImage()] | lang=en
- "option": "Option" | kind=code-symbol | neighbors=[PaginationQuery, OrderResponse, PdaxOrder, CryptoWithdrawRequest, FiatDepositRequest, FiatUserInfoUploadRequest] | lang=en
- "promotion_generate_voiceover": "generate-voiceover.ts" | kind=code-symbol | source=promotion/generate-voiceover.ts:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, bd5fbe7 fix issue and added mainet addr…, dc5a97e video, f895531 update video] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@1edd811df015b042e86f6e80d1e2ad8dd476effe": "1edd811 added latest changes" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, 09af30b feat(contracts): constrained de…, 914cc25 Merge pull request #10 from ryl…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@29554f5382c8df74cd5dd18c5c94539ab5bc5207": "29554f5 feat: remove Blockchain tab, add Freighter-style faucet banner to Dashb…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, a043e33 fix: reduce portfolio value fon…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@2cb58fa9673b55015e619bfb122cb2c767e6ac26": "2cb58fa fix: persistent storage for TTL safety, x402 friendbot graceful, test m…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 429faf8 docs: update contract IDs after…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@372965a94db9f6b670bcd547fdb9bea91a5408ca": "372965a contracts: deploy all 3 to testnet, clean up orphan dir, update README,…" | kind=Commit | source=git | neighbors=[00faebf fix: UI pass — greeting, splash…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@95975dcfbbffcbfcdc32383f7700f8ed87cd1a1a": "95975dc feat: auto-fund account on wallet creation, improve friendbot reliabili…" | kind=Commit | source=git | neighbors=[153ffb7 feat: persist store, fix testne…, import-wallet.tsx, seed-phrase.tsx, feat/multi-agent, instaward, instaward-development] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a5e130be41adba52de0b1e12b1e6994f3518d33b": "a5e130b feat: premium onboarding with glow animations, AgentListScreen empty st…" | kind=Commit | source=git | neighbors=[0bba7fc feat: replace Tap-to-Pay with A…, index.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a86432c6223189de041676c7232d1c03506f449e": "a86432c fix: restore Horizon for account lookup, balance, and payments — RPC ke…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 3da5eab fix: SendScreen imports unified…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ef023d1cb10ef6622606a2c320caef6e3264d107": "ef023d1 fix: SafeAreaProvider in root layout, scrollable seed-verify with confi…" | kind=Commit | source=git | neighbors=[4a662d5 fix: disable EAS build cache to…, _layout.tsx, feat/multi-agent, instaward, instaward-development, instaward-staging] | lang=en
- "components_button_button": "Button()" | kind=code-symbol | source=frontend/src/components/Button.tsx:L29 | neighbors=[fiat.tsx, Button.tsx, WalletSwitcher.tsx, ImportWalletScreen.tsx, MerchantPosScreen.tsx, ProfileScreen.tsx] | lang=en
- "domain_x402_x402": "x402" | kind=code-symbol | source=frontend/src/domain/x402.ts:L165 | neighbors=[_layout.tsx, x402.ts, AgentDetailScreen.tsx, AgentListScreen.tsx, DeviceProvisioningScreen.tsx, ExportKeysScreen.tsx] | lang=en
- "frontend_vitest_config": "vitest.config.ts" | kind=code-symbol | source=frontend/vitest.config.ts:L1 | neighbors=[28b92cc fix native token address, fix U…, 8eca877 fix soroban auth signing, UI im…, 9313cd3 test: 108 tests across 9 suites…, 9d7fb09 fix(tests): mock Platform expor…, acb72a5 Merge branch 'staging-2' into s…, b30c3ed Merge pull request #5 from ryls…] | lang=en
- "karpathywiki_main_asschema": "asSchema()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L18199 | neighbors=[main.js, isSchema(), jsonSchema(), standardSchema(), zodSchema(), doParseToolCall()] | lang=en
- "karpathywiki_main_buildwikicontext": "buildWikiContext()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78996 | neighbors=[main.js, assembleWikiContext(), emptyWikiHint(), getOrBuildGraph(), getSectionLabels(), loadRelevantPagesForQuery()] | lang=en
- "karpathywiki_main_classifycandidate": "classifyCandidate()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69360 | neighbors=[main.js, chunkLength(), isEnumerationChunk(), isGlossSpan(), lineAt(), linkSpans()] | lang=en
- "karpathywiki_main_initializellmclient": "initializeLLMClient()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88657 | neighbors=[main.js, bedrockCredentialPresence(), createLLMClient(), hasCredential(), isProviderConfigured(), resolveProviderApiKey()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-007.json

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
