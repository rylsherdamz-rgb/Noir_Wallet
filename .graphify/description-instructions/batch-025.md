# Node Description Batch 26 of 84

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

- "karpathywiki_main_standardizeprompt": "standardizePrompt()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23749 | neighbors=[main.js, generateText(), asArray(), safeValidateTypes()]
- "karpathywiki_main_stopwatching": "stopWatching()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80869 | neighbors=[main.js, stop(), clear(), clearDebounce()]
- "karpathywiki_main_streamwithfallback": "streamWithFallback()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L288 | neighbors=[main.js, isLocalBaseURL(), obsidianFetchBridge(), streamingObsidianFetch()]
- "karpathywiki_main_stripthinkingblocks": "stripThinkingBlocks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43588 | neighbors=[main.js, callPerSectionAppend(), cleanMarkdownResponse(), extractThinkingBlocks()]
- "karpathywiki_main_stubpath": "stubPath()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69568 | neighbors=[main.js, createDissentStubs(), ingestSource(), slugify()]
- "karpathywiki_main_throwifaborted3": "throwIfAborted3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64918 | neighbors=[main.js, raceWithLoginBounds(), runLoopbackLogin(), abortError2()]
- "karpathywiki_main_timestamp": "timestamp()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75375 | neighbors=[main.js, appendIngest(), appendLintFix(), localDateStamp()]
- "karpathywiki_main_tobase64url": "toBase64url()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24538 | neighbors=[main.js, hashInput(), signToolApproval(), convertUint8ArrayToBase64()]
- "karpathywiki_main_tokenclaims": "tokenClaims()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64729 | neighbors=[main.js, explicitAccountId(), organizationAccountId(), decodeBase64Url()]
- "karpathywiki_main_tokenizequery": "tokenizeQuery()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76990 | neighbors=[main.js, lexMatch(), lexMatchByTitleAndAliases(), selectPprSeeds()]
- "karpathywiki_main_tryparsefromthinkingblocks": "tryParseFromThinkingBlocks()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53079 | neighbors=[main.js, parseJsonResult(), extractBalancedJson(), fixCommonJsonIssues()]
- "karpathywiki_main_turkishcasefold": "turkishCaseFold()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67346 | neighbors=[main.js, aliasKey(), slugKeys(), sourceKey()]
- "karpathywiki_main_uniondomains": "unionDomains()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65879 | neighbors=[main.js, mergeFrontmatter(), mergeMentionsFields(), fold()]
- "karpathywiki_main_updatecounter": "updateCounter()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79907 | neighbors=[main.js, onOpen(), renderCustomInstructionsPanel(), getSnapshot()]
- "karpathywiki_main_updatelog": "updateLog()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76865 | neighbors=[main.js, ingestConversation(), ingestSource(), appendIngest()]
- "karpathywiki_main_updatesettings": "updateSettings()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75658 | neighbors=[main.js, saveSettings(), invalidateCache(), invalidatePageCaches()]
- "karpathywiki_main_uploadpdf": "uploadPdf()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L68775 | neighbors=[main.js, convertPdfWithMineru(), throwIfAborted5(), withDeadline()]
- "karpathywiki_main_yieldforcomparison": "yieldForComparison()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L83441 | neighbors=[main.js, runBigramCrossLangSignal(), runSharedIncomingSignal(), runSharedLinksSignal()]
- "lib_soroban_getserver": "getServer()" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L23 | neighbors=[soroban.ts, invokeContract(), readContract(), sourceAccountExists()]
- "lib_soroban_sourceaccountexists": "sourceAccountExists()" | kind=code-symbol | source=frontend/src/lib/soroban.ts:L77 | neighbors=[soroban.ts, invokeContract(), readContract(), getServer()]
- "lib_stellaraccount_isvalidmemotext": "isValidMemoText()" | kind=code-symbol | source=frontend/src/lib/stellarAccount.ts:L49 | neighbors=[stellarAccount.ts, memoByteLength(), SendScreen.tsx, 12-send.test.ts]
- "lib_stellaraccount_memobytelength": "memoByteLength()" | kind=code-symbol | source=frontend/src/lib/stellarAccount.ts:L44 | neighbors=[stellarAccount.ts, isValidMemoText(), SendScreen.tsx, 12-send.test.ts]
- "lib_stellaraccount_tostellaramount": "toStellarAmount()" | kind=code-symbol | source=frontend/src/lib/stellarAccount.ts:L57 | neighbors=[x402.ts, stellarAccount.ts, SendScreen.tsx, 12-send.test.ts]
- "migrations_20260630000001_phase_2g_idempotency_and_indexes": "20260630000001_phase_2g_idempotency_and_indexes.sql" | kind=code-symbol | source=unused/pdax-backend/migrations/20260630000001_phase_2g_idempotency_and_indexes.sql:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, 1e2f935 Merge remote-tracking branch 'o…, c2d1154 Restructure: move repo contents…]
- "promotion_remotion_config": "remotion.config.ts" | kind=code-symbol | source=promotion/remotion.config.ts:L1 | neighbors=[3ea9e39 fix soroban auth signing (txToo…, 8eca877 fix soroban auth signing, UI im…, acb72a5 Merge branch 'staging-2' into s…, f895531 update video]
- "screens_dashboardscreen_dashboardscreen": "DashboardScreen()" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L62 | neighbors=[DashboardScreen.tsx, formatRelativeTime(), greetingForHour(), index.tsx]
- "services_biometrics_unavailablemessage": "unavailableMessage()" | kind=code-symbol | source=frontend/src/services/biometrics.ts:L23 | neighbors=[SecurityScreen.tsx, biometrics.ts, authenticate(), 11-security.test.ts]
- "services_pinlock_clearlockout": "clearLockout()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L109 | neighbors=[pinLock.ts, clearPin(), setPin(), verifyPin()]
- "services_pinlock_getlockout": "getLockout()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L99 | neighbors=[lock.tsx, pinLock.ts, verifyPin(), 11-security.test.ts]
- "services_pinlock_lockoutremainingms": "lockoutRemainingMs()" | kind=code-symbol | source=frontend/src/services/pinLock.ts:L95 | neighbors=[lock.tsx, pinLock.ts, verifyPin(), 11-security.test.ts]
- "services_securestorage_securedeleteitem": "secureDeleteItem()" | kind=code-symbol | source=frontend/src/services/secureStorage.ts:L38 | neighbors=[x402.ts, secureStorage.ts, storage.ts, useAppStore.ts]
- "services_securestorage_securegetitem": "secureGetItem()" | kind=code-symbol | source=frontend/src/services/secureStorage.ts:L15 | neighbors=[x402.ts, secureStorage.ts, storage.ts, useAppStore.ts]
- "services_securestorage_securesetitem": "secureSetItem()" | kind=code-symbol | source=frontend/src/services/secureStorage.ts:L26 | neighbors=[x402.ts, secureStorage.ts, storage.ts, useAppStore.ts]
- "services_stellar_service_stellarservice_fundaccount": ".fundAccount()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L335 | neighbors=[StellarService, .ensureAccountFunded(), .accountExists(), withTimeout()]
- "services_stellar_service_stellarservice_invokecontract": ".invokeContract()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L406 | neighbors=[StellarService, .ensureAccountFunded(), withTimeout(), .invokeContractAndWait()]
- "services_stellar_service_stellarservice_invokecontractandwait": ".invokeContractAndWait()" | kind=code-symbol | source=frontend/src/services/stellar-service.ts:L620 | neighbors=[StellarService, .invokeContract(), withTimeout(), .registerDevice()]
- "services_storage_removeitem": "removeItem()" | kind=code-symbol | source=frontend/src/services/storage.ts:L31 | neighbors=[pinLock.ts, storage.ts, wallet.ts, 11-security.test.ts]
- "services_wallet_walletservice_allocateagentindex": ".allocateAgentIndex()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L99 | neighbors=[WalletService, .deriveAgentAt(), .loadKeys(), .saveKeys()]
- "services_wallet_walletservice_loadkeys": ".loadKeys()" | kind=code-symbol | source=frontend/src/services/wallet.ts:L134 | neighbors=[WalletService, .allocateAgentIndex(), .isAgentIndexRetired(), .retireAgentIndex()]
- "settings_export_keys": "export-keys.tsx" | kind=code-symbol | source=frontend/app/settings/export-keys.tsx:L1 | neighbors=[5dc3574 feat(settings): add gated key e…, ExportKeysScreen.tsx, ExportKeysScreen(), 10-new-features.test.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-025.json

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
