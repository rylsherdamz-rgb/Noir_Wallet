# Node Description Batch 18 of 84

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

- "uitest_seed_buildseed": "buildSeed()" | kind=code-symbol | source=frontend/uitest/seed.js:L21 | neighbors=[debug-store.js, harness.js, probe.js, seed.js, deriveAt(), toHex()]
- "agent_id": "[id].tsx" | kind=code-symbol | source=frontend/app/agent/[id].tsx:L1 | neighbors=[AgentDetailRoute(), AgentDetailScreen.tsx, AgentDetailScreen(), 0bba7fc feat: replace Tap-to-Pay with A…, 10-new-features.test.ts]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@425ba4450551f0e018a66e740f3e36ce331026f6": "425ba44 fix(x402): remove double sequence increment in device+agent registration" | kind=Commit | source=git | neighbors=[instaward-development, 100294c contracts: migrate events to #[…, x402.ts, 01-x402.test.ts, f6a15ab refactor(backend): flatten to b…]
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@42df68991e9d51f34ed0f599253c2a28271be221": "42df689 fix(x402): keep base reserve when sweeping agent funds on revoke" | kind=Commit | source=git | neighbors=[instaward-development, 90c2a5d docs(readme): correct contract …, x402.ts, 01-x402.test.ts, 7839103 fix(soroban): preserve resource…]
- "components_card_card": "Card()" | kind=code-symbol | source=frontend/src/components/Card.tsx:L12 | neighbors=[Card.tsx, WalletSwitcher.tsx, BlockchainScreen.tsx, ProfileScreen.tsx, settings.tsx]
- "components_numerickeypad_numerickeypad": "NumericKeypad()" | kind=code-symbol | source=frontend/src/components/NumericKeypad.tsx:L26 | neighbors=[fiat.tsx, lock.tsx, NumericKeypad.tsx, MerchantPosScreen.tsx, SendScreen.tsx]
- "karpathywiki_main_addtag": "addTag()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L87040 | neighbors=[main.js, appendChip(), emitChange(), flashDuplicate(), handleKeydown()]
- "karpathywiki_main_appendcontradictedbymarker": "appendContradictedByMarker()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73298 | neighbors=[main.js, normalizeSource(), parseFrontmatter(), replaceOrInsertYamlListField(), mergePage()]
- "karpathywiki_main_applyclassificationdecision": "applyClassificationDecision()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73070 | neighbors=[main.js, parseFrontmatter(), tryReadFile(), writeTypeDecision(), resolvePagePath()]
- "karpathywiki_main_applycontradictiongates": "applyContradictionGates()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73436 | neighbors=[main.js, normalizeStatement(), statementOnPage(), verifySourceStance(), classifyMergeNeed()]
- "karpathywiki_main_applyoutcometable": "applyOutcomeTable()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69453 | neighbors=[main.js, gateProfileFor(), linkedNames(), pruneDroppedNames(), ingestSource()]
- "karpathywiki_main_bedrockcredentialpresence": "bedrockCredentialPresence()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88537 | neighbors=[main.js, hasIamKeys(), hasSsoToken(), initializeLLMClient(), loadSettings()]
- "karpathywiki_main_buildleftpane": "buildLeftPane()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L79618 | neighbors=[main.js, getText(), refreshRowStates(), renderTreeNode(), onOpen()]
- "karpathywiki_main_buildvaultresolver": "buildVaultResolver()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69058 | neighbors=[main.js, applyRelatedLinks(), correctRelatedLinkPrefixes(), ingestSource(), repointFolderTypedLinks()]
- "karpathywiki_main_callpersectionappend": "callPerSectionAppend()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L73785 | neighbors=[main.js, applyComplementaryAppends(), buildSystemPrompt(), resolveModelForTask(), stripThinkingBlocks()]
- "karpathywiki_main_checkqueryhistoryforstalefolders": "checkQueryHistoryForStaleFolders()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88517 | neighbors=[main.js, detectStaleWikiFolders(), getText(), onload(), saveSettings()]
- "karpathywiki_main_clearopenaicodexmodelcache": "clearOpenAICodexModelCache()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88367 | neighbors=[main.js, resetOpenAICodexModelState(), clearUnboundOpenAICodexModelCache(), loginOpenAICodexBrowser(), refreshOpenAICodexModels()]
- "karpathywiki_main_clearpdfcache": "clearPdfCache()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81380 | neighbors=[main.js, clear(), getText(), resolve(), then()]
- "karpathywiki_main_clearunboundopenaicodexmodelcache": "clearUnboundOpenAICodexModelCache()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88373 | neighbors=[main.js, clearOpenAICodexModelCache(), currentAccountId(), isModelCatalogBound(), onload()]
- "karpathywiki_main_complete": "complete()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66252 | neighbors=[main.js, findJob(), notify(), now(), runBatchIngest()]
- "karpathywiki_main_createagentuistream": "createAgentUIStream()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L28149 | neighbors=[main.js, convertToModelMessages(), validateUIMessages(), createAgentUIStreamResponse(), pipeAgentUIStreamToResponse()]
- "karpathywiki_main_createdissentstubs": "createDissentStubs()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69572 | neighbors=[main.js, buildDissentStubContent(), createOrUpdateFile(), stubPath(), ingestSource()]
- "karpathywiki_main_createllmclientfromsettingssync": "createLLMClientFromSettingsSync()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55070 | neighbors=[main.js, createLLMClient(), createBedrockClient(), resolveProviderApiKey(), usesBedrockAwsCredentials()]
- "karpathywiki_main_dismissprogress": "dismissProgress()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88702 | neighbors=[main.js, hide(), onAutoIngestDone(), onIngestDoneDispatch(), runBatchIngest()]
- "karpathywiki_main_dispose": "dispose()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65209 | neighbors=[main.js, cancelLogin(), clear(), onClose(), onunload()]
- "karpathywiki_main_enqueue": "enqueue()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L66208 | neighbors=[main.js, mintId(), notify(), now(), runBatchIngest()]
- "karpathywiki_main_ensureschemaexists": "ensureSchemaExists()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80264 | neighbors=[main.js, buildDefaultSchemaBody(), getSchemaPath(), localDateStamp(), ensureWikiStructure()]
- "karpathywiki_main_escaperegex2": "escapeRegex2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69986 | neighbors=[main.js, findSection(), findSectionInBody(), fixPollutedPage(), injectMentionsSection()]
- "karpathywiki_main_fetchwithvalidatedredirects": "fetchWithValidatedRedirects()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17030 | neighbors=[main.js, downloadBlob(), cancelResponseBody(), isBrowserRuntime(), validateDownloadUrl()]
- "karpathywiki_main_filterredundantaliases": "filterRedundantAliases()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67370 | neighbors=[main.js, appendAliases(), createSummaryPage(), enforceFrontmatterConstraints(), aliasKey()]
- "karpathywiki_main_fixcommonjsonissues": "fixCommonJsonIssues()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L53109 | neighbors=[main.js, escapeContentQuotes(), parseJsonResult(), repairKnownDefects(), tryParseFromThinkingBlocks()]
- "karpathywiki_main_formatratelimitnotice": "formatRateLimitNotice()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L69036 | neighbors=[main.js, getText(), ingestSource(), runAliasCompletion(), runDedupPhase()]
- "karpathywiki_main_generatespeech": "generateSpeech()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L29335 | neighbors=[main.js, detectMediaType(), prepareRetries(), resolveSpeechModel(), withUserAgentSuffix()]
- "karpathywiki_main_getrolecredentials": "getRoleCredentials()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65533 | neighbors=[main.js, getCredentials(), bedrockPortalBaseUrl(), parsePortalResponse(), portalHeaders()]
- "karpathywiki_main_hashinput": "hashInput()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24554 | neighbors=[main.js, canonicalJSON(), toBase64url(), signToolApproval(), verifyToolApprovalSignature()]
- "karpathywiki_main_hasiamkeys": "hasIamKeys()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65593 | neighbors=[main.js, bedrockCredentialPresence(), hasKeys(), renderProviderSection(), testLLMConnection()]
- "karpathywiki_main_hmacsha256": "hmacSha256()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L54868 | neighbors=[main.js, deriveSigningKey(), assertCryptoSubtle(), importKey(), signRequest()]
- "karpathywiki_main_ingestactivefile": "ingestActiveFile()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L84596 | neighbors=[main.js, getText(), ingestSource(), requireLLMReady(), showProgressFor()]
- "karpathywiki_main_invalidatepagecaches": "invalidatePageCaches()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75701 | neighbors=[main.js, createOrUpdateFile(), deleteFile(), invalidate(), updateSettings()]
- "karpathywiki_main_isauthenticationforbidden2": "isAuthenticationForbidden2()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L88264 | neighbors=[main.js, fetchCodexModelCatalog(), clone(), json(), objectValue()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-017.json

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
