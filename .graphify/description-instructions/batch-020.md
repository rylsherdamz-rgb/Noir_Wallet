# Node Description Batch 21 of 84

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "app_layout_eventtargetpolyfill": "EventTargetPolyfill" | kind=code-symbol | source=frontend/app/_layout.tsx:L24 | neighbors=[_layout.tsx, .addEventListener(), .dispatchEvent(), .removeEventListener()]
- "app_screens_receiveapp_qrcodepattern": "QRCodePattern()" | kind=code-symbol | source=promotion/src/app-screens/ReceiveApp.tsx:L30 | neighbors=[ReceiveApp.tsx, finderModule(), isFinder(), rand()]
- "app_tap": "tap.tsx" | kind=code-symbol | source=frontend/app/tap.tsx:L1 | neighbors=[TapRoute(), MerchantPosScreen.tsx, MerchantPosScreen(), 81a2931 feat(frontend): reachable Tap-t…]
- "brand_brandglyph_tapglyph": "TapGlyph()" | kind=code-symbol | source=frontend/src/components/brand/BrandGlyph.tsx:L13 | neighbors=[BrandGlyph.tsx, AgentListScreen.tsx, DashboardScreen.tsx, WelcomeScreen.tsx]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@15bf75e9a6772f9a3f2df2d71c602223566aed0f": "15bf75e docs(instaward): track SOW progress + update contract memory" | kind=Commit | source=git | neighbors=[09af30b feat(contracts): constrained de…, instaward-development, 14b8c4b chore(deploy): add contract red…, main.js]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@7839103cabea1f70fbcd914e5504cd6cab9a9626": "7839103 fix(soroban): preserve resource fee when rebuilding auth-signed invoke" | kind=Commit | source=git | neighbors=[instaward-development, 42df689 fix(x402): keep base reserve wh…, stellar-service.ts, ad018e3 docs: align testnet contract ID…]
- "components_avatar_avatar": "Avatar()" | kind=code-symbol | source=frontend/src/components/Avatar.tsx:L13 | neighbors=[Avatar.tsx, ProfileScreen.tsx, SendScreen.tsx, TransactionDetailScreen.tsx]
- "components_skeletonloader_skeletonloader": "SkeletonLoader()" | kind=code-symbol | source=frontend/src/components/SkeletonLoader.tsx:L12 | neighbors=[BalanceCard.tsx, SkeletonLoader.tsx, DashboardScreen.tsx, TransactionHistoryScreen.tsx]
- "components_statuspill_statuspill": "StatusPill()" | kind=code-symbol | source=frontend/src/components/StatusPill.tsx:L35 | neighbors=[StatusPill.tsx, AgentDetailScreen.tsx, AgentListScreen.tsx, TransactionDetailScreen.tsx]
- "constants_config_config": "Config" | kind=code-symbol | source=frontend/src/constants/config.ts:L32 | neighbors=[config.ts, soroban.ts, api.ts, stellar.ts]
- "constants_theme_fontscalecap": "FontScaleCap" | kind=code-symbol | source=frontend/src/constants/theme.ts:L89 | neighbors=[FilterChips.tsx, NumericKeypad.tsx, theme.ts, SendScreen.tsx]
- "domain_x402_addindex": "addIndex()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L84 | neighbors=[x402.ts, readIndexes(), writeIndexes(), ensureLegacyAgentMigrated()]
- "karpathywiki_main_aborterror3": "abortError3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65105 | neighbors=[main.js, completeLogin(), loginWithDeviceCode(), raceWithAbort()]
- "karpathywiki_main_activatequeryview": "activateQueryView()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84516 | neighbors=[main.js, resolve(), then(), queryWiki()]
- "karpathywiki_main_addtokencounts": "addTokenCounts()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24160 | neighbors=[main.js, addImageModelUsage(), addLanguageModelUsage(), asLanguageModelUsage()]
- "karpathywiki_main_apidelay": "apiDelay()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L76458 | neighbors=[main.js, ingestConversation(), ingestSource(), runBatchedWithRetry()]
- "karpathywiki_main_appendchip": "appendChip()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87091 | neighbors=[main.js, addTag(), createChild(), renderChips()]
- "karpathywiki_main_appendlintfix": "appendLintFix()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75324 | neighbors=[main.js, buildLogHeader(), timestamp(), logLintFix()]
- "karpathywiki_main_applycoveragethreshold": "applyCoverageThreshold()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69438 | neighbors=[main.js, linkedNames(), pruneDroppedNames(), ingestSource()]
- "karpathywiki_main_applyschemasuggestion": "applySchemaSuggestion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81875 | neighbors=[main.js, backupFilename(), rotateBackups(), spliceBody()]
- "karpathywiki_main_asgatewayerror": "asGatewayError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L19602 | neighbors=[main.js, createGatewayErrorFromResponse(), extractApiCallResponse(), isTimeoutError()]
- "karpathywiki_main_bedrockoidcbaseurl": "bedrockOidcBaseUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54843 | neighbors=[main.js, completeDeviceAuthorization2(), registerClient(), startDeviceAuthorization()]
- "karpathywiki_main_bedrockportalbaseurl": "bedrockPortalBaseUrl()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54846 | neighbors=[main.js, getRoleCredentials(), listAccountRoles(), listAccounts()]
- "karpathywiki_main_beginopenaicodexdevicelogin": "beginOpenAICodexDeviceLogin()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88329 | neighbors=[main.js, currentAccountId(), loginWithDeviceCode(), then()]
- "karpathywiki_main_buildactivetagvocabularysection": "buildActiveTagVocabularySection()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69963 | neighbors=[main.js, getActiveConceptTags(), getActiveEntityTags(), buildSystemPrompt()]
- "karpathywiki_main_builddissentstubcontent": "buildDissentStubContent()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69540 | neighbors=[main.js, localDateStamp(), selectDomains(), createDissentStubs()]
- "karpathywiki_main_buildingestedhashes": "buildIngestedHashes()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75683 | neighbors=[main.js, now(), checkRequirements(), createBatchContext()]
- "karpathywiki_main_buildlogheader": "buildLogHeader()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75238 | neighbors=[main.js, appendIngest(), appendLintFix(), migrateLogHeader()]
- "karpathywiki_main_buildrepetitionpenaltyhint": "buildRepetitionPenaltyHint()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67301 | neighbors=[main.js, getText(), repetitionPenaltyWireField(), ingestSource()]
- "karpathywiki_main_cancelresponsebody": "cancelResponseBody()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L16883 | neighbors=[main.js, downloadBlob(), fetchWithValidatedRedirects(), readResponseWithSizeLimit()]
- "karpathywiki_main_canonicalizesectionheaders": "canonicalizeSectionHeaders()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L71273 | neighbors=[main.js, createNewPage(), mergePage(), updateRelatedPage()]
- "karpathywiki_main_capmaxtokens": "capMaxTokens()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55128 | neighbors=[main.js, injectAdvancedSettings(), sendMessage(), suggestSchemaUpdate()]
- "karpathywiki_main_capturefinish": "captureFinish()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L43916 | neighbors=[main.js, appendToReviewedPage(), mergePage(), updateRelatedPage()]
- "karpathywiki_main_cleanupvocabularytags": "cleanupVocabularyTags()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88618 | neighbors=[main.js, normalizeVocabularyCsv(), saveSettings(), onload()]
- "karpathywiki_main_codexautherror": "codexAuthError()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87757 | neighbors=[main.js, getText(), copyOpenAICodexDeviceCode(), loginOpenAICodexBrowser()]
- "karpathywiki_main_collectcitedrawnotetargets": "collectCitedRawNoteTargets()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L82790 | neighbors=[main.js, extractMentionsSection(), splitMdExtension(), runProgrammaticPhase()]
- "karpathywiki_main_collectwikivocabulary": "collectWikiVocabulary()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65914 | neighbors=[main.js, collectActiveVocabulary(), fold(), isInFolderScope()]
- "karpathywiki_main_completedeviceauthorization": "completeDeviceAuthorization()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L64888 | neighbors=[main.js, exchangeAuthorizationCode(), pollAuthorizationCode(), throwIfAborted2()]
- "karpathywiki_main_completelogin": "completeLogin()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65256 | neighbors=[main.js, abortError3(), save(), loginWithBrowser()]
- "karpathywiki_main_computeconversationhash": "computeConversationHash()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78456 | neighbors=[main.js, evaluateAndSuggestSave(), evaluateWithLLM(), saveToWiki()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-020.json

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
