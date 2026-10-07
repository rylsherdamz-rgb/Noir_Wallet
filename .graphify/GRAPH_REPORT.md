# Graph Report - Noir_Wallet  (2026-10-03)

## Corpus Check
- Large corpus: 480 files · ~2,324,712 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 3349 nodes · 9310 edges · 204 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 2680 · calls: 2487 · MODIFIES: 1350 · ON_BRANCH: 1005 · imports: 773 · imports_from: 478 · PARENT_OF: 239 · method: 196 · references: 92 · rationale_for: 9 · inherits: 1


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 480 · Candidates: 602
- Excluded: 28 untracked · 64632 ignored · 3 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `c9a894c`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `normalizeParams()` - 92 edges
2. `Colors` - 56 edges
3. `Spacing` - 50 edges
4. `FontSize` - 50 edges
5. `getText()` - 47 edges
6. `FontWeight` - 47 edges
7. `BorderRadius` - 46 edges
8. `ingestSource()` - 42 edges
9. `random_address()` - 39 edges
10. `PressableScale()` - 38 edges

## Surprising Connections (you probably didn't know these)
- `deploy()` --calls--> `random_address()`  [EXTRACTED]
  backend/contracts/device_registry/tests/integration.rs → backend/contracts/payment_escrow/tests/integration.rs
- `test_check_payment_accepts_in_policy()` --calls--> `deploy()`  [EXTRACTED]
  backend/contracts/agent_registry/tests/integration.rs → backend/contracts/device_registry/tests/integration.rs
- `test_check_payment_accepts_in_policy()` --calls--> `random_address()`  [EXTRACTED]
  backend/contracts/agent_registry/tests/integration.rs → backend/contracts/payment_escrow/tests/integration.rs
- `test_check_payment_accepts_in_policy()` --calls--> `random_bytes_32()`  [EXTRACTED]
  backend/contracts/agent_registry/tests/integration.rs → backend/contracts/payment_escrow/tests/integration.rs
- `test_check_payment_rejects_after_expiry()` --calls--> `deploy()`  [EXTRACTED]
  backend/contracts/agent_registry/tests/integration.rs → backend/contracts/device_registry/tests/integration.rs

## Communities

### Community 0 - "Community 0"
Cohesion: 0.00
Nodes (2): TODO: deprecate non-camelCase keys and remove in future major version, NOTE: We deliberately do NOT claim "task completed" in the Toast —

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (132): feat/multi-agent, instaward, instaward-staging, main, 0315f62 fix: sign soroban auth entries from simulation to fix require_auth() failure, 042630c fix: correct Friendbot URL in fundTestnetAccount - was using wrong URLs (friendbot.stellar.org, horizon-testnet.stellar.org) causing 30s+ hangs; now uses friendbot-testnet.stellar.org with 10s timeout and early existence check, 042e052 feat(frontend): add Settings tab/screen, gold tab tint (typecheck clean), 05f1c1d Revert "use video tag with poster fallback instead of YouTube link" (+124 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (59): styles, LOGO_FULL, LOGO_MARK, NoirLogo(), NoirLogoProps, NoirLogoVariant, styles, 0c78c60 ui: replace hex-opacity concatenation with colorWithOpacity in components (+51 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (61): BalanceEntry, BeneficiaryInfo, Mode, styles, NOIR_MARK, styles, styles, 3381d81 Merge PR #7 (cGradying:main) 'Auditing and Fixing Backend and Frontend' into testing (+53 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (50): styles, 0bba7fc feat: replace Tap-to-Pay with Agents view — per-device agent balances, tap-to-pay without amount entry, per-agent payment history, 1fe9de1 migrating workspace, 4d7a39e chore: merge frontend branch — TS fixes, soroban module, NFC improvements, 698366e feat(frontend): add Noir Wallet React Native Expo app with x402 tap-to-pay, a303810 Merge pull request #2 from rylsherdamz-rgb/frontend, f52569d fix: type errors and add missing soroban/useProfile modules, f8a4aa0 feat: fill 14 gaps — QR scan, PIN lock, deep linking, push notifications, fiat on-ramp, offline queue, account deletion, explorer links, sign-out cleanup, +not-found, KYC wiring, recovery phrase/private key display (+42 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (32): 07387d7 feat(db): initialize database schemas with optimized indexes on device cryptographic hashes (TSK-204), 18e752e feat(frontend): non-custodial fee-bump tap-to-pay + network-consistency fixes, 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch into main, 1e2f935 Merge remote-tracking branch 'origin/backend', 42e023f feat(backend): add /devices/register so devices reach the DB (contract sync still stubbed), 5c65d3b chore: merge backend branch into frontend, 6fc251f feat(backend): card revoke + optional PIN (server-side, required above threshold) (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (67): account_deletion_is_scoped_to_one_wallet(), challenge_can_only_be_consumed_once(), challenge_is_bound_to_its_wallet(), cleanup(), concurrent_claims_of_one_key_produce_exactly_one_order(), create_token(), deploy(), deploy_agent_registry() (+59 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (45): AnimatedPressable, DEFAULT_HIT_SLOP, PressableScale(), PressableScaleProps, 81efec3 fix: NFC provisioning now working — registerTagEvent event-based readTag resolves on tag detection, bd5fbe7 fix issue and added mainet address, ActionSheetAction, ActionSheetProps (+37 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (32): 16f1d4d Merge branch 'testing', 6cd6f70 fix: add Friendbot funding button when account not funded on testnet, AppConfig, Config, CONTRACTS, contractsFor(), ENV, getActiveContractNetwork() (+24 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (40): GlyphProps, TapGlyph(), SignalRipple(), SignalRippleProps, 0354052 feat: remove all mock data, wire to real API/Stellar services, 7b2e909 feat(frontend): Noir brand refinement — design foundation + Wallet tab, 7c7b9ab feat(frontend): Noir brand refinement — design foundation + Wallet tab, ff96a30 chore: rebuild frontend with Expo SDK 57, replace expo-av with expo-audio, fix polyfills and seed verify bug (+32 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (34): ease, features, WelcomeApp(), acb72a5 Merge branch 'staging-2' into staging, de00d30 feat: promo — logo, scene shell, components, app screens, f8751a9 feat: Remotion promo video — Noir Wallet x402 contactless payments, CatLogo(), CatLogoProps (+26 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (37): formatCountdown(), LockScreen(), styles, 5dc3574 feat(settings): add gated key export; remove KYC for now, ExportKeysScreen(), SecretItem, styles, authenticate() (+29 more)

### Community 12 - "Community 12"
Cohesion: 0.04
Nodes (50): _custom(), _discriminatedUnion(), _emoji2(), _endsWith(), _enum(), _enum2(), _file(), _float32() (+42 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (22): Address, BytesN, PaymentEscrowClient, AgentPolicy, AgentRegEvent, AgentRegistry, AgentRevEvent, AuthorizeEvent (+14 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (21): cmdBalance(), cmdCreateWallet(), cmdFund(), cmdInvoke(), cmdRead(), cmdRegisterDevice(), cmdTxStatus(), main() (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.05
Nodes (45): assembleWikiContext(), buildGraphFromContent(), buildWikiContext(), countTotalDegree(), detectHubs(), emptyWikiHint(), escapeRegex3(), extractSummaryFromPage() (+37 more)

### Community 16 - "Community 16"
Cohesion: 0.05
Nodes (43): adjustBatchSizeForResponse(), analyzeSource(), basenameNoExt(), buildDomainContext(), buildSourceAnalysis(), calculateBatchLimits(), calculateBatchStats(), checkCumulativeLimits() (+35 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (42): appendSourceSlugToFrontmatter(), appendToReviewedPage(), applySectionLabels(), assembleFinalContent(), buildContradictionRecord(), buildNewInfoSummary(), buildNoteExcerpt(), buildSectionLabelsHint() (+34 more)

### Community 18 - "Community 18"
Cohesion: 0.08
Nodes (26): 53f0009 fix(agents): show agents after login + add Playwright UI harness, 65d8450 feat(agents): support multiple HD-derived agents per wallet, one per card, addIndex(), AgentWallet, deviceNonces, ensureLegacyAgentMigrated(), legacyBudgetKey(), legacyCreatedKey() (+18 more)

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (41): instaward-development, 0836500 docs(evidence): add Week 1 evidence index, 09af30b feat(contracts): constrained delegated authorization + sweep-on-revoke, 0e994ab ci: run frontend workflow on the instaward branches, 100294c contracts: migrate events to #[contractevent], fix warnings, add tests; update testnet IDs across docs, 14b8c4b chore(deploy): add contract redeploy script + testnet deployment evidence, 15bf75e docs(instaward): track SOW progress + update contract memory, 1edd811 added latest changes (+33 more)

### Community 20 - "Community 20"
Cohesion: 0.07
Nodes (40): abortError(), abortError2(), close(), completeDeviceAuthorization(), createLoopbackServer(), decide(), decodeBase64Url(), exchangeAuthorizationCode() (+32 more)

### Community 21 - "Community 21"
Cohesion: 0.08
Nodes (32): Client, Option, PdaxSession, RwLock, PaginationQuery, ErrorResponse, AuthenticatedWallet, CashRequest (+24 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (27): clamp, ease, PosEscrowScene(), SceneProps, clamp, ease, SceneProps, TapToPayScene() (+19 more)

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (26): agents, AgentsApp(), ease, activity, BlockchainApp(), ease, actions, assets (+18 more)

### Community 24 - "Community 24"
Cohesion: 0.08
Nodes (34): aliasClaimsFromPages(), applyClassificationDecision(), assessWelcomeNeed(), buildOrphanLinkPrompt(), buildOrphanLinkUpdate(), cleanIncompletePages(), cleanWikiIndex(), createOrUpdateConceptPage() (+26 more)

### Community 25 - "Community 25"
Cohesion: 0.07
Nodes (33): addCopyButton(), addRetrievalLabel(), appendCustomQueryInstructions(), armDisplay(), bindWikiLinkClicks(), buildTurnIndicator(), capMaxTokens(), extractThinkingBlocks() (+25 more)

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (33): applyContradictionGates(), askTypeFromVocabulary(), buildSystemPrompt(), buildWikiLanguageDirective(), callLlm(), callPerSectionAppend(), checkDedup(), classifyLemmaType() (+25 more)

### Community 27 - "Community 27"
Cohesion: 0.09
Nodes (21): 00faebf fix: UI pass — greeting, splash, safe-area padding, responsive keypad, wallet rename/delete, KeyboardAvoidingView, 1ec631e fix: all CI workflows passing — fix TS errors, test mocks, broken soroban action, duplicate deploy.yml, 28b92cc fix native token address, fix UI overlap issues, fix test infrastructure, 372965a contracts: deploy all 3 to testnet, clean up orphan dir, update README, add mainnet cost estimate, 3da5eab fix: SendScreen imports unified stellar-service instead of legacy stellar, 64e0d4d chore: gitignore generated cost estimate, 7c52081 merge main into staging, resolve README conflicts, 9313cd3 test: 108 tests across 9 suites — full coverage (+13 more)

### Community 28 - "Community 28"
Cohesion: 0.09
Nodes (17): 3ea9e39 fix soroban auth signing (txTooLate, txMalformed), add screenshots, add team section, 8eca877 fix soroban auth signing, UI improvements, screenshots (#3), f895531 update video, outputDir, DEMO_AUDIO_FILES, NoirDemo(), NoirDemoPropsSchema, NoirPromo() (+9 more)

### Community 29 - "Community 29"
Cohesion: 0.08
Nodes (24): { buildSeed }, { chromium }, path, { spawn }, { buildSeed }, { chromium }, fs, OUT (+16 more)

### Community 30 - "Community 30"
Cohesion: 0.10
Nodes (30): abortError5(), buildUserText(), bytesToBase64(), bytesToHex(), classifyMineruFailure(), convertPdfToMarkdown(), convertPdfWithMineru(), createPdfCache() (+22 more)

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (30): apiDelay(), applyCoverageThreshold(), applyOutcomeTable(), applyRelatedLinks(), buildDissentStubContent(), buildStubIdentityResolver(), buildVaultResolver(), collectActiveVocabulary() (+22 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (30): appendAliases(), buildDefaultSchemaBody(), buildEmptyPagePrompt(), correctLinkPollution(), enforceFrontmatterConstraints(), ensureSchemaExists(), extractPassthroughLines(), fillEmptyPage() (+22 more)

### Community 33 - "Community 33"
Cohesion: 0.08
Nodes (30): asGatewayError(), convertDataContentToBase64String(), convertToAnthropicMessagesPrompt(), convertToBase64(), convertToOpenAIResponsesInput(), convertUint8ArrayToBase64(), createGatewayErrorFromResponse(), extractApiCallResponse() (+22 more)

### Community 34 - "Community 34"
Cohesion: 0.09
Nodes (30): buildIngestedHashes(), complete(), computeGlobalInsight(), createBatchContext(), dismissProgress(), enqueue(), findJob(), getRetryDelayInMs() (+22 more)

### Community 35 - "Community 35"
Cohesion: 0.08
Nodes (28): addTag(), appendChip(), $constructor(), createChild(), emitChange(), flashDuplicate(), getActiveSpan(), getSpan() (+20 more)

### Community 36 - "Community 36"
Cohesion: 0.14
Nodes (1): ApiService

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (16): auth_challenge(), auth_verify(), ensure_pdax_session(), execute_conversion(), map_event_status(), parse_direction(), pdax_balance(), pdax_cash_in() (+8 more)

### Community 38 - "Community 38"
Cohesion: 0.09
Nodes (26): addFormat(), addPattern(), decideAdditionalProperties(), emoji(), escapeLiteralCheckValue(), escapeNonAlphaNumeric(), parseAnyDef(), parseArrayDef() (+18 more)

### Community 39 - "Community 39"
Cohesion: 0.11
Nodes (26): bedrockAuthError(), buildRepetitionPenaltyHint(), cancelIngestion(), cancelLint(), codexAuthError(), copyBedrockUserCode(), copyCodexDeviceCode(), copyOpenAICodexDeviceCode() (+18 more)

### Community 40 - "Community 40"
Cohesion: 0.10
Nodes (26): cancelResponseBody(), convertBase64ToUint8Array(), convertPartToLanguageModelPart(), convertToLanguageModelV3DataContent(), convertToString(), detectFileMediaType(), detectMediaType(), downloadBlob() (+18 more)

### Community 41 - "Community 41"
Cohesion: 0.10
Nodes (24): buildDeadLinkReplacement(), buildStubContent(), checkContentRequirements(), checkRequirements(), contextAround(), deleteEmptyStubs(), extractBody(), fixDeadLink() (+16 more)

### Community 42 - "Community 42"
Cohesion: 0.12
Nodes (13): Arc, S, accepts_a_genuine_signature(), constant_time_eq(), hash_token(), keypair(), rejects_a_signature_from_a_different_key(), rejects_a_signature_over_a_different_message() (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.13
Nodes (23): buildOutputArgs(), createAnthropic(), createDownload(), createGatewayProvider(), createOpenAI(), createOpenAICompatible(), createProviderToolFactory(), createProviderToolFactoryWithOutputSchema() (+15 more)

### Community 44 - "Community 44"
Cohesion: 0.09
Nodes (1): Repository

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (2): pdax_error_message(), PdaxClient

### Community 46 - "Community 46"
Cohesion: 0.14
Nodes (16): ease, filters, TransactionsApp(), txs, NfcTagScene(), Subtitle(), SubtitleProps, AgentScene() (+8 more)

### Community 47 - "Community 47"
Cohesion: 0.10
Nodes (21): convertToModelMessages(), createAgentUIStream(), createAgentUIStreamResponse(), createTextStreamResponse(), createUIMessageStreamResponse(), getStaticToolName(), getToolName(), isDataUIPart() (+13 more)

### Community 48 - "Community 48"
Cohesion: 0.15
Nodes (3): SeedVerifyScreen(), toHex(), WalletService

### Community 49 - "Community 49"
Cohesion: 0.11
Nodes (19): aliasKey(), blockContentLength(), canonicalSectionBlocks(), classifyHeader(), findSection2(), folderOf(), footnotesOf(), keptEntries() (+11 more)

### Community 50 - "Community 50"
Cohesion: 0.13
Nodes (18): applyDiffModalClasses(), buildDiffCell(), buildFolderTree(), buildLeftPane(), el(), getSnapshot(), onOpen(), reasonLabelKey() (+10 more)

### Community 51 - "Community 51"
Cohesion: 0.17
Nodes (18): createWikiLink(), deltaChip(), renderCriticalKpiCards(), renderDeadLinkSection(), renderDeadLinkTable(), renderEntry(), renderFixDetails(), renderIngestDetails() (+10 more)

### Community 52 - "Community 52"
Cohesion: 0.19
Nodes (10): decrypt_at_rest(), encrypt_at_rest(), EncryptedPayload, LocalKeyManager, test_data_key_wrap_unwrap_roundtrip(), test_decrypt_fails_with_wrong_key_manager(), test_encrypt_decrypt_at_rest_roundtrip(), test_encrypted_blobs_are_not_deterministic() (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.20
Nodes (16): applySettingsMigrations(), commitSettingsMigrationV1_25_3(), createLLMClient(), createLLMClientFromSettingsSync(), hasCredential(), initializeLLMClient(), isLocalNoKeyProvider(), isProviderConfigured() (+8 more)

### Community 54 - "Community 54"
Cohesion: 0.17
Nodes (16): assertCryptoSubtle(), buildPayload(), canonicalJSON(), deriveSigningKey(), formatAmzDate(), fromBase64url(), hashInput(), hashSha256Hex() (+8 more)

### Community 55 - "Community 55"
Cohesion: 0.14
Nodes (16): buildIncomingLinkIndex(), buildLintAnalysisContext(), buildLintReport(), classifyTiers(), computeVerifyBatch(), detectRateLimitFailures(), formatContradictionReport(), formatRateLimitNotice() (+8 more)

### Community 56 - "Community 56"
Cohesion: 0.13
Nodes (15): aborted(), clone(), extend(), handleIntersectionResults(), handlePipeResult(), isAuthenticationForbidden(), isObject(), isPlainObject() (+7 more)

### Community 57 - "Community 57"
Cohesion: 0.14
Nodes (15): appendIngest(), appendLintFix(), buildLogHeader(), dedupPages(), formatBytes(), formatIngestMetricsSuffix(), getLogLabels(), isOldFormatLogHeader() (+7 more)

### Community 58 - "Community 58"
Cohesion: 0.17
Nodes (15): captureThinkingBlocks(), closeMismatchedBrackets(), closeUnterminatedLines(), countUnescapedQuotes(), escapeContentQuotes(), escapeLatexInMath(), extractBalancedJson(), fixCommonJsonIssues() (+7 more)

### Community 59 - "Community 59"
Cohesion: 0.14
Nodes (2): AtomicU64, MetricsCollector

### Community 60 - "Community 60"
Cohesion: 0.18
Nodes (14): applyCustomInstructions(), checkQueryHistoryForStaleFolders(), cleanupVocabularyTags(), clearCustomInstructions(), clearHistory(), detectStaleWikiFolders(), initializeLLMClientAfterModules(), invalidateCache() (+6 more)

### Community 61 - "Community 61"
Cohesion: 0.20
Nodes (14): bigrams(), bodyWordSet(), computeJaccard(), generateDuplicateCandidates(), normalizeForMatch(), partitionPagesMultiBucket(), resolveThreshold(), runBigramCrossLangSignal() (+6 more)

### Community 62 - "Community 62"
Cohesion: 0.16
Nodes (14): buildEntry(), classifyOperation(), classifySectionKind(), defaultSeverityForKind(), extractWikiLinks(), llmSeverityFor(), parseCountFromHeading(), parseDetailRows() (+6 more)

### Community 63 - "Community 63"
Cohesion: 0.18
Nodes (14): collectCitedRawNoteTargets(), detectAliasDeficiency(), detectPollutedPages(), extractMentionsSection(), extractSourceBody(), hasNonEmptyAliases(), isQuoteGrounded(), normalizeQuote() (+6 more)

### Community 64 - "Community 64"
Cohesion: 0.22
Nodes (13): asArray(), convertToLanguageModelPrompt(), downloadAssets(), generateText(), getChunkTimeoutMs(), getGlobalTelemetryIntegration(), getGlobalTelemetryIntegrations(), getStepTimeoutMs() (+5 more)

### Community 65 - "Community 65"
Cohesion: 0.19
Nodes (13): asSpeechModelV3(), convertDataContentToUint8Array(), experimental_generateVideo(), generateImage(), generateSpeech(), invokeModelMaxImagesPerCall(), invokeModelMaxVideosPerCall(), normalizeHeaders() (+5 more)

### Community 66 - "Community 66"
Cohesion: 0.22
Nodes (13): checkCancelled(), commitTempSettings(), flushApiKey(), flushBedrockIamKeys(), hide(), runDeadLinkFixes(), runDuplicateMerges(), runEmptyPageFixes() (+5 more)

### Community 67 - "Community 67"
Cohesion: 0.15
Nodes (11): h, idat, out, png, prev, raw, thresh, w (+3 more)

### Community 68 - "Community 68"
Cohesion: 0.18
Nodes (4): parse_decimal(), parse_json_amount(), round_trips(), to_decimal_string()

### Community 69 - "Community 69"
Cohesion: 0.32
Nodes (12): abortError4(), bedrockOidcBaseUrl(), beginDeviceLogin(), completeDeviceAuthorization2(), postJson(), raceWithBounds2(), registerClient(), requiredString3() (+4 more)

### Community 70 - "Community 70"
Cohesion: 0.21
Nodes (12): activateQueryView(), buildRangeSliderDesc(), clearPdfCache(), folderOf2(), performPdfCacheHousekeeping(), preloadLLMClientModules(), promiseAllObject(), queryWiki() (+4 more)

### Community 71 - "Community 71"
Cohesion: 0.21
Nodes (12): asSchema(), isApprovalNeeded(), isNonEmptyObject(), isSchema(), isZod4Schema(), jsonSchema(), prepareToolsAndToolChoice(), standardSchema() (+4 more)

### Community 72 - "Community 72"
Cohesion: 0.17
Nodes (12): buildWelcomeNote(), decideOnboardingAction(), ensureWelcomeNote(), getWelcomeFileName(), probeVaultState(), recreateWelcomeNote(), renderFrontmatter(), renderHowToUseSection() (+4 more)

### Community 73 - "Community 73"
Cohesion: 0.18
Nodes (12): callCompletionApi(), consumeStream(), createAsyncIterableStream(), createIdMap(), createStreamingUIMessageState(), createUIMessageStream(), getRuntimeEnvironmentUserAgent(), handleUIMessageStreamFinish() (+4 more)

### Community 74 - "Community 74"
Cohesion: 0.20
Nodes (12): decideProgressDisplay(), endLintOperation(), ingestActiveFile(), lintWiki(), requireLLMReady(), runSchemaAnalyze(), selectFolderToIngest(), selectMultipleFilesToIngest() (+4 more)

### Community 75 - "Community 75"
Cohesion: 0.17
Nodes (11): grid, h, idat, png, prev, raw, w, x0 (+3 more)

### Community 76 - "Community 76"
Cohesion: 0.24
Nodes (11): cancelLogin(), clear(), clearDebounce(), clearIamKeys(), clearPeriodicLint(), dispose(), onClose(), onunload() (+3 more)

### Community 77 - "Community 77"
Cohesion: 0.24
Nodes (11): chunkLength(), classifyCandidate(), isEnumerationChunk(), isGlossSpan(), lineAt(), linkedNames(), linkSpans(), needleOf() (+3 more)

### Community 78 - "Community 78"
Cohesion: 0.31
Nodes (10): accessFrom(), fetchCodexModelCatalog(), getAccess(), isAuthenticationForbidden2(), objectValue(), parseCatalog(), refresh(), refreshAfterUnauthorized() (+2 more)

### Community 79 - "Community 79"
Cohesion: 0.24
Nodes (10): asEmbeddingModelV3(), asImageModelV3(), asLanguageModelV3(), asTranscriptionModelV3(), getGlobalProvider(), logV2CompatibilityWarning(), resolveEmbeddingModel(), resolveImageModel() (+2 more)

### Community 80 - "Community 80"
Cohesion: 0.42
Nodes (10): assembleOperationName(), embed(), embedMany(), executeToolCall(), getBaseTelemetryAttributes(), getTracer(), recordSpan(), rerank() (+2 more)

### Community 81 - "Community 81"
Cohesion: 0.22
Nodes (10): bedrockCredentialPresence(), getBedrockAuthUiState(), getCodexAuthUiState(), hasIamKeys(), hasKeys(), hasSsoToken(), hasToken(), queueStaleCodexModelRefresh() (+2 more)

### Community 82 - "Community 82"
Cohesion: 0.29
Nodes (10): doParseToolCall(), fixJson(), parseAndValidateObjectResult(), parseAndValidateObjectResultWithRepair(), parseAuthMethod(), parsePartialJson(), parseProviderExecutedDynamicToolCall(), parseToolCall() (+2 more)

### Community 83 - "Community 83"
Cohesion: 0.28
Nodes (6): DateTime, AppUser, PdaxOrder, PdaxSession, session_expiry_tracks_expiry_seconds(), Utc

### Community 84 - "Community 84"
Cohesion: 0.36
Nodes (9): bedrockPortalBaseUrl(), discoverAccountRole(), getRoleCredentials(), listAccountRoles(), listAccounts(), loginBedrockSso(), parsePortalResponse(), portalHeaders() (+1 more)

### Community 85 - "Community 85"
Cohesion: 0.22
Nodes (9): bindModelCatalog(), cacheKeyOf(), getCredentials(), hasKey(), load(), migrateApiKeyToSettings(), parseStoredCredential(), parseStoredObject() (+1 more)

### Community 86 - "Community 86"
Cohesion: 0.33
Nodes (9): buildActiveTagVocabularySection(), firstActiveTag(), foldToVocabulary(), getActiveConceptTags(), getActiveEntityTags(), getActiveSourceTags(), incomingTypeTag(), repairTypesAgainstVocabulary() (+1 more)

### Community 87 - "Community 87"
Cohesion: 0.31
Nodes (9): buildModelsPaths(), cacheResolvedUrl(), delay2(), deriveBaseUrlFromModelsUrl(), fetchModelsWithFallback(), generateUrlCandidates(), getCachedUrl(), hasV1Segment() (+1 more)

### Community 88 - "Community 88"
Cohesion: 0.36
Nodes (7): assets, ease, finderModule(), isFinder(), QRCodePattern(), rand(), ReceiveApp()

### Community 89 - "Community 89"
Cohesion: 0.32
Nodes (8): buildKnownTargets(), extractRawSourcesEntries(), fixPollutedSources(), normalizeSourcePath(), normalizeSourcesField(), normalizeSourcesInFolder(), runPreparationPhase(), scanPollutedSources()

### Community 90 - "Community 90"
Cohesion: 0.39
Nodes (1): StellarService

### Community 91 - "Community 91"
Cohesion: 0.36
Nodes (4): degenerate_config_does_not_divide_by_zero(), prune_horizon_is_a_full_window_behind(), RateLimiter, snaps_to_stable_window_boundaries()

### Community 92 - "Community 92"
Cohesion: 0.29
Nodes (7): applyCodexModelPolicy(), loginOpenAICodexDevice(), openCodexExternalUrl(), openExternal(), preserveCodexRuntimeModelState(), runCodexDeviceAuth(), syncCodexModelsFromPlugin()

### Community 93 - "Community 93"
Cohesion: 0.29
Nodes (7): applyComplementaryAppends(), escapeRegex2(), findSectionInBody(), isListSection(), makeFallbackNewInfoSection(), resolveSectionAnchor(), spliceAfterSection()

### Community 94 - "Community 94"
Cohesion: 0.29
Nodes (7): asRecord(), createOpenAIStreamError(), getStatusCode(), getStringOrNumber(), isHttpErrorStatusCode(), parseStreamError(), throwIfOpenAIStreamErrorBeforeOutput()

### Community 95 - "Community 95"
Cohesion: 0.29
Nodes (7): beginOpenAICodexDeviceLogin(), clearOpenAICodexModelCache(), clearUnboundOpenAICodexModelCache(), currentAccountId(), isModelCatalogBound(), loadRaw(), resetOpenAICodexModelState()

### Community 96 - "Community 96"
Cohesion: 0.29
Nodes (7): canonical(), foldTypeUnion(), isObject2(), makeNullable(), normalizeNode(), normalizeStrictJsonSchema(), stripOptionalNulls()

### Community 97 - "Community 97"
Cohesion: 0.29
Nodes (7): handleArrayResult(), handleCheckPropertyResult(), handleMapResult(), handleObjectResult(), handleOptionalObjectResult(), handleTupleResult(), prefixIssues()

### Community 98 - "Community 98"
Cohesion: 0.29
Nodes (6): { chromium }, fs, http, MIME, path, server

### Community 99 - "Community 99"
Cohesion: 0.47
Nodes (6): abortError3(), completeLogin(), loginWithBrowser(), loginWithDeviceCode(), raceWithAbort(), startLogin()

### Community 100 - "Community 100"
Cohesion: 0.33
Nodes (6): delay(), getErrorMessage2(), handleFetchError(), isAbortError(), isBunNetworkError(), retryWithExponentialBackoffInternal()

### Community 101 - "Community 101"
Cohesion: 0.33
Nodes (6): errorToString(), ingestConversionSource(), inspectCauseChain(), isPdfRelatedLlmError(), rejectionNoticeKey(), reportSkip()

### Community 102 - "Community 102"
Cohesion: 0.40
Nodes (6): generateObject(), getOutputStrategy(), prepareCallSettings(), streamObject(), validateObjectGenerationInput(), wrapGatewayError()

### Community 103 - "Community 103"
Cohesion: 0.60
Nodes (5): channel_transactions, daily_spends, devices, fee_channels, payment_transactions

### Community 104 - "Community 104"
Cohesion: 0.40
Nodes (2): Config, parse_env()

### Community 105 - "Community 105"
Cohesion: 0.40
Nodes (5): assertNotReasoningOnly(), isReasoningRunaway(), normalizeFinishReason(), normalizeUsage(), reportFinish()

### Community 106 - "Community 106"
Cohesion: 0.40
Nodes (5): bedrockMantleChatCompletionsUrl(), bedrockMantleMessagesUrl(), createBedrockClient(), createSigV4SigningFetch(), resolveBedrockRegion()

### Community 107 - "Community 107"
Cohesion: 0.50
Nodes (5): buildBullets(), dedupAndSort(), formatMentionsSection(), isStructured(), renderCitation()

### Community 108 - "Community 108"
Cohesion: 0.40
Nodes (5): cascadeUnifiedModelChange(), markLLMConfigStale(), prefillPerTaskFromUnified(), setFieldValue(), setUseCustomFlag()

### Community 109 - "Community 109"
Cohesion: 0.40
Nodes (5): config(), en_default(), getErrorMap(), "node_modules/zod/v4/classic/external.js"(), setErrorMap()

### Community 110 - "Community 110"
Cohesion: 0.40
Nodes (5): createToolModelOutput(), getErrorMessage(), sortToolResultContentByToolCallOrder(), toJSONValue(), toResponseMessages()

### Community 111 - "Community 111"
Cohesion: 0.40
Nodes (5): dedupMentionsByProvenanceKey(), dedupStrings(), mentionKey(), mergeMentionsFields(), unionDomains()

### Community 112 - "Community 112"
Cohesion: 0.50
Nodes (5): folderScopePrefix(), isAtOrInFolderScope(), isExcludedFromSourcePicker(), isInFolderScope(), isIngestableSource()

### Community 113 - "Community 113"
Cohesion: 0.40
Nodes (5): getConstraintDescription(), isPlainObject2(), sanitizeDefinition(), sanitizeJsonSchema(), sanitizeSchema()

### Community 114 - "Community 114"
Cohesion: 0.50
Nodes (5): headersToObject(), isLocalBaseURL(), obsidianFetchBridge(), streamingObsidianFetch(), streamWithFallback()

### Community 115 - "Community 115"
Cohesion: 0.40
Nodes (5): _normalize(), _overwrite(), _toLowerCase(), _toUpperCase(), _trim()

### Community 116 - "Community 116"
Cohesion: 0.50
Nodes (5): runBedrockSignOut(), runCodexSignOut(), signOut(), signOutBedrock(), signOutOpenAICodex()

### Community 117 - "Community 117"
Cohesion: 0.40
Nodes (3): outputDir, Scene, SCENES

### Community 118 - "Community 118"
Cohesion: 0.70
Nodes (1): PaymentError

### Community 119 - "Community 119"
Cohesion: 0.60
Nodes (1): CryptoAsset

### Community 120 - "Community 120"
Cohesion: 0.50
Nodes (1): EventPolyfill

### Community 121 - "Community 121"
Cohesion: 0.50
Nodes (1): EventTargetPolyfill

### Community 122 - "Community 122"
Cohesion: 0.50
Nodes (4): addImageModelUsage(), addLanguageModelUsage(), addTokenCounts(), asLanguageModelUsage()

### Community 123 - "Community 123"
Cohesion: 0.50
Nodes (4): applySchemaSuggestion(), backupFilename(), rotateBackups(), spliceBody()

### Community 124 - "Community 124"
Cohesion: 0.50
Nodes (4): _array(), _function(), _tuple(), _unknown()

### Community 125 - "Community 125"
Cohesion: 0.50
Nodes (4): contextKeywords(), localKeywordMatch(), selectCandidateWindow(), selectDedupCandidates()

### Community 126 - "Community 126"
Cohesion: 0.67
Nodes (4): doSave(), getProgressCallback(), saveToWiki(), setProgressCallback()

### Community 127 - "Community 127"
Cohesion: 0.67
Nodes (4): isSpanContextValid(), isValidHex(), isValidSpanId(), isValidTraceId()

### Community 128 - "Community 128"
Cohesion: 0.50
Nodes (4): parseEntry(), reasoningLevels(), serviceTiers(), stringArray()

### Community 129 - "Community 129"
Cohesion: 0.50
Nodes (4): registerWikiCommands(), setIngestionCallbacks(), setLintCallbacks(), setStatusBarUpdateCallback()

### Community 130 - "Community 130"
Cohesion: 0.67
Nodes (2): config, { getDefaultConfig }

### Community 131 - "Community 131"
Cohesion: 0.67
Nodes (3): addressableForms(), chooseLinkpath(), retargetLinksToPage()

### Community 132 - "Community 132"
Cohesion: 0.67
Nodes (3): appendContradictedByMarker(), normalizeSource(), replaceOrInsertYamlListField()

### Community 133 - "Community 133"
Cohesion: 0.67
Nodes (3): applyTaskPolicy(), resolveTaskPolicy(), thinkingEffort()

### Community 134 - "Community 134"
Cohesion: 0.67
Nodes (3): asProviderV3(), customProvider(), wrapProvider()

### Community 135 - "Community 135"
Cohesion: 0.67
Nodes (3): check(), custom2(), superRefine()

### Community 136 - "Community 136"
Cohesion: 0.67
Nodes (3): collectCheckedFiles(), findFileByPath(), findFileInNode()

### Community 137 - "Community 137"
Cohesion: 0.67
Nodes (3): convertToOpenAIChatMessages(), getPromptCacheBreakpoint(), serializeToolCallArguments()

### Community 138 - "Community 138"
Cohesion: 0.67
Nodes (3): datetime(), time(), timeSource()

### Community 139 - "Community 139"
Cohesion: 0.67
Nodes (3): datetimeRegex(), timeRegex(), timeRegexSource()

### Community 140 - "Community 140"
Cohesion: 0.67
Nodes (3): extractBodyFromFull(), parseSchemaSuggestion(), stripCodeFence()

### Community 141 - "Community 141"
Cohesion: 0.67
Nodes (3): extractMineruMarkdown(), inflateSync(), unzipSync()

### Community 142 - "Community 142"
Cohesion: 0.67
Nodes (3): getCurrentModelValue(), resolveDisplayedModelForTask(), resolveModelTaskUiMode()

### Community 143 - "Community 143"
Cohesion: 1.00
Nodes (2): addAdditionalPropertiesToJsonSchema(), visit()

### Community 144 - "Community 144"
Cohesion: 1.00
Nodes (2): addIssueToContext(), getErrorMap2()

### Community 145 - "Community 145"
Cohesion: 1.00
Nodes (2): appendSuggestion(), getSuggestionsPath()

### Community 146 - "Community 146"
Cohesion: 1.00
Nodes (2): asRecord2(), isOpenAIChatCompletionChunk()

### Community 147 - "Community 147"
Cohesion: 1.00
Nodes (2): _base64(), base642()

### Community 148 - "Community 148"
Cohesion: 1.00
Nodes (2): _base64url(), base64url2()

### Community 149 - "Community 149"
Cohesion: 1.00
Nodes (2): bigint3(), _coercedBigint()

### Community 150 - "Community 150"
Cohesion: 1.00
Nodes (2): _bigint(), bigint2()

### Community 151 - "Community 151"
Cohesion: 1.00
Nodes (2): boolean3(), _coercedBoolean()

### Community 152 - "Community 152"
Cohesion: 1.00
Nodes (2): _boolean(), boolean2()

### Community 153 - "Community 153"
Cohesion: 1.00
Nodes (2): buildIngestStatusBarText(), composeStatusBarUpdate()

### Community 154 - "Community 154"
Cohesion: 1.00
Nodes (2): cached(), "node_modules/zod/v4/core/util.js"()

### Community 155 - "Community 155"
Cohesion: 1.00
Nodes (2): _cidrv4(), cidrv42()

### Community 156 - "Community 156"
Cohesion: 1.00
Nodes (2): _cidrv6(), cidrv62()

### Community 157 - "Community 157"
Cohesion: 1.00
Nodes (2): _coercedDate(), date4()

### Community 158 - "Community 158"
Cohesion: 1.00
Nodes (2): _coercedNumber(), number3()

### Community 159 - "Community 159"
Cohesion: 1.00
Nodes (2): _coercedString(), string3()

### Community 160 - "Community 160"
Cohesion: 1.00
Nodes (2): convertToOpenAICompatibleChatMessages(), getOpenAIMetadata()

### Community 161 - "Community 161"
Cohesion: 1.00
Nodes (2): createContextKey(), "node_modules/@opentelemetry/api/build/esm/trace/context-utils.js"()

### Community 162 - "Community 162"
Cohesion: 1.00
Nodes (2): createResolvablePromise(), createStitchableStream()

### Community 163 - "Community 163"
Cohesion: 1.00
Nodes (2): createZodEnum(), processCreateParams()

### Community 164 - "Community 164"
Cohesion: 1.00
Nodes (2): _cuid2(), cuid22()

### Community 165 - "Community 165"
Cohesion: 1.00
Nodes (2): _cuid(), cuid3()

### Community 166 - "Community 166"
Cohesion: 1.00
Nodes (2): date2(), _isoDate()

### Community 167 - "Community 167"
Cohesion: 1.00
Nodes (2): _date(), date3()

### Community 168 - "Community 168"
Cohesion: 1.00
Nodes (2): datetime2(), _isoDateTime()

### Community 169 - "Community 169"
Cohesion: 1.00
Nodes (2): duration2(), _isoDuration()

### Community 170 - "Community 170"
Cohesion: 1.00
Nodes (2): _e164(), e1642()

### Community 171 - "Community 171"
Cohesion: 1.00
Nodes (2): _email(), email2()

### Community 172 - "Community 172"
Cohesion: 1.00
Nodes (2): executeTool(), isAsyncIterable()

### Community 173 - "Community 173"
Cohesion: 1.00
Nodes (2): extractProviderMessage(), mapAiSdkError()

### Community 174 - "Community 174"
Cohesion: 1.00
Nodes (2): finalizeIssue(), unwrapMessage()

### Community 175 - "Community 175"
Cohesion: 1.00
Nodes (2): getGlobal(), logProxy()

### Community 176 - "Community 176"
Cohesion: 1.00
Nodes (2): _gte(), _nonnegative()

### Community 177 - "Community 177"
Cohesion: 1.00
Nodes (2): _gt(), _positive()

### Community 178 - "Community 178"
Cohesion: 1.00
Nodes (2): _guid(), guid2()

### Community 179 - "Community 179"
Cohesion: 1.00
Nodes (2): handleRefineResult(), issue()

### Community 180 - "Community 180"
Cohesion: 1.00
Nodes (2): _ipv4(), ipv42()

### Community 181 - "Community 181"
Cohesion: 1.00
Nodes (2): _ipv6(), ipv62()

### Community 182 - "Community 182"
Cohesion: 1.00
Nodes (2): isModelNotFound404(), isUrlError()

### Community 183 - "Community 183"
Cohesion: 1.00
Nodes (2): _isoTime(), time2()

### Community 184 - "Community 184"
Cohesion: 1.00
Nodes (2): isValidBase64(), isValidBase64URL()

### Community 185 - "Community 185"
Cohesion: 1.00
Nodes (2): _ksuid(), ksuid2()

### Community 186 - "Community 186"
Cohesion: 1.00
Nodes (2): _lte(), _nonpositive()

### Community 187 - "Community 187"
Cohesion: 1.00
Nodes (2): _lt(), _negative()

### Community 188 - "Community 188"
Cohesion: 1.00
Nodes (2): _makeCompatibilityCheck(), "node_modules/@opentelemetry/api/build/esm/internal/semver.js"()

### Community 189 - "Community 189"
Cohesion: 1.00
Nodes (2): _nanoid(), nanoid2()

### Community 190 - "Community 190"
Cohesion: 1.00
Nodes (2): "node_modules/zod/v4/core/registries.js"(), registry()

### Community 191 - "Community 191"
Cohesion: 1.00
Nodes (2): normalizeCodexRequest(), normalizeResponsesBody()

### Community 192 - "Community 192"
Cohesion: 1.00
Nodes (2): _null2(), _null3()

### Community 193 - "Community 193"
Cohesion: 1.00
Nodes (2): _number(), number2()

### Community 194 - "Community 194"
Cohesion: 1.00
Nodes (2): prependReasoningForParse(), wrapReasoningContent()

### Community 195 - "Community 195"
Cohesion: 1.00
Nodes (2): prettifyError(), toDotPath()

### Community 196 - "Community 196"
Cohesion: 1.00
Nodes (2): resolveProviderOptionsKey(), toCamelCase()

### Community 197 - "Community 197"
Cohesion: 1.00
Nodes (2): _string(), string2()

### Community 198 - "Community 198"
Cohesion: 1.00
Nodes (2): _symbol(), symbol15()

### Community 199 - "Community 199"
Cohesion: 1.00
Nodes (2): _ulid(), ulid2()

### Community 200 - "Community 200"
Cohesion: 1.00
Nodes (2): _undefined2(), _undefined3()

### Community 201 - "Community 201"
Cohesion: 1.00
Nodes (2): _uuid(), uuid2()

### Community 202 - "Community 202"
Cohesion: 1.00
Nodes (2): _void(), _void2()

### Community 203 - "Community 203"
Cohesion: 1.00
Nodes (2): _xid(), xid2()

## Knowledge Gaps
- **325 isolated node(s):** `TODO: deprecate non-camelCase keys and remove in future major version`, `NOTE: We deliberately do NOT claim "task completed" in the Toast —`, `Error`, `IoniconName`, `styles` (+320 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 0`** (2 nodes): `TODO: deprecate non-camelCase keys and remove in future major version`, `NOTE: We deliberately do NOT claim "task completed" in the Toast —`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `ApiService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `Repository`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `pdax_error_message()`, `PdaxClient`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (2 nodes): `AtomicU64`, `MetricsCollector`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (1 nodes): `StellarService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (2 nodes): `Config`, `parse_env()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (1 nodes): `PaymentError`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (1 nodes): `CryptoAsset`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (1 nodes): `EventPolyfill`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (1 nodes): `EventTargetPolyfill`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (2 nodes): `config`, `{ getDefaultConfig }`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 143`** (2 nodes): `addAdditionalPropertiesToJsonSchema()`, `visit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 144`** (2 nodes): `addIssueToContext()`, `getErrorMap2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 145`** (2 nodes): `appendSuggestion()`, `getSuggestionsPath()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 146`** (2 nodes): `asRecord2()`, `isOpenAIChatCompletionChunk()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 147`** (2 nodes): `_base64()`, `base642()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 148`** (2 nodes): `_base64url()`, `base64url2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 149`** (2 nodes): `bigint3()`, `_coercedBigint()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 150`** (2 nodes): `_bigint()`, `bigint2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 151`** (2 nodes): `boolean3()`, `_coercedBoolean()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 152`** (2 nodes): `_boolean()`, `boolean2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 153`** (2 nodes): `buildIngestStatusBarText()`, `composeStatusBarUpdate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 154`** (2 nodes): `cached()`, `"node_modules/zod/v4/core/util.js"()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 155`** (2 nodes): `_cidrv4()`, `cidrv42()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 156`** (2 nodes): `_cidrv6()`, `cidrv62()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 157`** (2 nodes): `_coercedDate()`, `date4()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 158`** (2 nodes): `_coercedNumber()`, `number3()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 159`** (2 nodes): `_coercedString()`, `string3()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 160`** (2 nodes): `convertToOpenAICompatibleChatMessages()`, `getOpenAIMetadata()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 161`** (2 nodes): `createContextKey()`, `"node_modules/@opentelemetry/api/build/esm/trace/context-utils.js"()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 162`** (2 nodes): `createResolvablePromise()`, `createStitchableStream()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 163`** (2 nodes): `createZodEnum()`, `processCreateParams()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 164`** (2 nodes): `_cuid2()`, `cuid22()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 165`** (2 nodes): `_cuid()`, `cuid3()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 166`** (2 nodes): `date2()`, `_isoDate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 167`** (2 nodes): `_date()`, `date3()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 168`** (2 nodes): `datetime2()`, `_isoDateTime()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 169`** (2 nodes): `duration2()`, `_isoDuration()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 170`** (2 nodes): `_e164()`, `e1642()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 171`** (2 nodes): `_email()`, `email2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 172`** (2 nodes): `executeTool()`, `isAsyncIterable()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 173`** (2 nodes): `extractProviderMessage()`, `mapAiSdkError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 174`** (2 nodes): `finalizeIssue()`, `unwrapMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 175`** (2 nodes): `getGlobal()`, `logProxy()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 176`** (2 nodes): `_gte()`, `_nonnegative()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 177`** (2 nodes): `_gt()`, `_positive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 178`** (2 nodes): `_guid()`, `guid2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 179`** (2 nodes): `handleRefineResult()`, `issue()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 180`** (2 nodes): `_ipv4()`, `ipv42()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 181`** (2 nodes): `_ipv6()`, `ipv62()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 182`** (2 nodes): `isModelNotFound404()`, `isUrlError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 183`** (2 nodes): `_isoTime()`, `time2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 184`** (2 nodes): `isValidBase64()`, `isValidBase64URL()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 185`** (2 nodes): `_ksuid()`, `ksuid2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 186`** (2 nodes): `_lte()`, `_nonpositive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 187`** (2 nodes): `_lt()`, `_negative()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 188`** (2 nodes): `_makeCompatibilityCheck()`, `"node_modules/@opentelemetry/api/build/esm/internal/semver.js"()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 189`** (2 nodes): `_nanoid()`, `nanoid2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 190`** (2 nodes): `"node_modules/zod/v4/core/registries.js"()`, `registry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 191`** (2 nodes): `normalizeCodexRequest()`, `normalizeResponsesBody()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 192`** (2 nodes): `_null2()`, `_null3()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 193`** (2 nodes): `_number()`, `number2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 194`** (2 nodes): `prependReasoningForParse()`, `wrapReasoningContent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 195`** (2 nodes): `prettifyError()`, `toDotPath()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 196`** (2 nodes): `resolveProviderOptionsKey()`, `toCamelCase()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 197`** (2 nodes): `_string()`, `string2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 198`** (2 nodes): `_symbol()`, `symbol15()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 199`** (2 nodes): `_ulid()`, `ulid2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 200`** (2 nodes): `_undefined2()`, `_undefined3()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 201`** (2 nodes): `_uuid()`, `uuid2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 202`** (2 nodes): `_void()`, `_void2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 203`** (2 nodes): `_xid()`, `xid2()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiService` connect `Community 36` to `Community 3`, `Community 4`, `Community 2`, `Community 9`, `Community 7`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Repository` connect `Community 44` to `Community 5`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `StellarService` connect `Community 14` to `Community 8`, `Community 7`, `Community 18`, `Community 4`, `Community 2`, `Community 9`, `Community 3`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `TODO: deprecate non-camelCase keys and remove in future major version`, `NOTE: We deliberately do NOT claim "task completed" in the Toast —`, `Error` to the rest of the system?**
  _325 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0044444444444444444 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06654696442599035 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.046192259675405745 - nodes in this community are weakly interconnected._