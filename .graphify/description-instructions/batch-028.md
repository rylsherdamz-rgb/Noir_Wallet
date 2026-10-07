# Node Description Batch 29 of 84

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

- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@75116eb5ffae9b0f12b65bf5959b8416582abf36": "75116eb docs(readme): restyle header — centered Noir logo, status badges, quick…" | kind=Commit | source=git | neighbors=[100294c contracts: migrate events to #[…, instaward-development, c9a894c Merge origin/instaward (PR #10 …] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@84fd5a06f71b9ee414e8b73e04098979db682c3c": "84fd5a0 docs(progress): record CI status and the open WASM hash assertion" | kind=Commit | source=git | neighbors=[instaward-development, 6691b06 ci: make WASM hash check inform…, ac406d9 ci: pin rust toolchain to 1.98.…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@90c2a5d9be5ef9dee42f6439416dc835bc50f701": "90c2a5d docs(readme): correct contract method tables to match the Rust source" | kind=Commit | source=git | neighbors=[42df689 fix(x402): keep base reserve wh…, instaward-development, 5a72919 docs(guide): update contract bu…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9194edfd34c887903ceaa207a2e5246eee78045d": "9194edf Step 4 and Step 5" | kind=Commit | source=git | neighbors=[main, 727140c feat(contracts): deploy soroban…, fa86c2e Step 3: Write Initialize address] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@93170d6b60c4e527c7fdb256dd49f382b4a5a14b": "93170d6 docs(readme): link the architecture reference" | kind=Commit | source=git | neighbors=[instaward-development, 0836500 docs(evidence): add Week 1 evid…, a6fbd8c docs: add architecture referenc…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9b8bcad80ff37a5dc73fab1353d7522828de03f8": "9b8bcad docs(progress): record Week 1 documentation work and remaining gaps" | kind=Commit | source=git | neighbors=[0836500 docs(evidence): add Week 1 evid…, instaward-development, 7308666 ci: add Soroban contracts workf…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a6fbd8ca8f3c42209d4f41cf98ea96093ca99b42": "a6fbd8c docs: add architecture reference with Mermaid diagrams" | kind=Commit | source=git | neighbors=[5a72919 docs(guide): update contract bu…, instaward-development, 93170d6 docs(readme): link the architec…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ac406d9a3938687d8fe36f2d12caee17f4b21247": "ac406d9 ci: pin rust toolchain to 1.98.1 for reproducible WASM" | kind=Commit | source=git | neighbors=[0e994ab ci: run frontend workflow on th…, instaward-development, 84fd5a0 docs(progress): record CI statu…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ad018e36ee0272f7deff6c9f2651e5f071943cf6": "ad018e3 docs: align testnet contract IDs to the deployed set" | kind=Commit | source=git | neighbors=[instaward-development, 7839103 fix(soroban): preserve resource…, d315d3c docs(evidence): capture passing…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@c9a894c92951a6f3d9773cbd4c856fb646fba6f1": "c9a894c Merge origin/instaward (PR #10 merge) into instaward-development" | kind=Commit | source=git | neighbors=[75116eb docs(readme): restyle header — …, 914cc25 Merge pull request #10 from ryl…, instaward-development] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d315d3c56a960995641820fe7f667ca2f9dc37a6": "d315d3c docs(evidence): capture passing contract test run (41 tests)" | kind=Commit | source=git | neighbors=[14b8c4b chore(deploy): add contract red…, instaward-development, ad018e3 docs: align testnet contract ID…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@fa86c2e7d88ca118de9b45b57633883ca3cb3ed0": "fa86c2e Step 3: Write Initialize address" | kind=Commit | source=git | neighbors=[f8e86a9 Step 2 — Define contract storag…, main, 9194edf Step 4 and Step 5] | lang=en
- "components_confirmdialog_confirmdialog": "ConfirmDialog()" | kind=code-symbol | source=frontend/src/components/ConfirmDialog.tsx:L20 | neighbors=[ConfirmDialog.tsx, SecurityScreen.tsx, SendScreen.tsx] | lang=en
- "components_toastprovider_usetoast": "useToast()" | kind=code-symbol | source=frontend/src/components/ToastProvider.tsx:L75 | neighbors=[ToastProvider.tsx, SecurityScreen.tsx, SendScreen.tsx] | lang=en
- "components_transactionitem_transactionitem": "TransactionItem" | kind=code-symbol | source=frontend/src/components/TransactionItem.tsx:L17 | neighbors=[TransactionItem.tsx, AgentDetailScreen.tsx, TransactionHistoryScreen.tsx] | lang=en
- "constants_config_hascontractsconfigured": "hasContractsConfigured()" | kind=code-symbol | source=frontend/src/constants/config.ts:L86 | neighbors=[config.ts, DashboardScreen.tsx, 13-network-freshness.test.ts] | lang=en
- "constants_config_setactivecontractnetwork": "setActiveContractNetwork()" | kind=code-symbol | source=frontend/src/constants/config.ts:L77 | neighbors=[config.ts, useAppStore.ts, 13-network-freshness.test.ts] | lang=en
- "datetime": "DateTime" | kind=code-symbol | neighbors=[AppUser, PdaxOrder, PdaxSession] | lang=en
- "domain_x402_agentwallet": "AgentWallet" | kind=code-symbol | source=frontend/src/domain/x402.ts:L52 | neighbors=[x402.ts, AgentDetailScreen.tsx, AgentListScreen.tsx] | lang=en
- "domain_x402_legacybudgetkey": "legacyBudgetKey()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L37 | neighbors=[x402.ts, ensureLegacyAgentMigrated(), loadAgentMeta()] | lang=en
- "domain_x402_legacycreatedkey": "legacyCreatedKey()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L38 | neighbors=[x402.ts, ensureLegacyAgentMigrated(), loadAgentMeta()] | lang=en
- "domain_x402_legacylabelkey": "legacyLabelKey()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L39 | neighbors=[x402.ts, ensureLegacyAgentMigrated(), loadAgentMeta()] | lang=en
- "domain_x402_legacypublickey": "legacyPublicKey()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L36 | neighbors=[x402.ts, ensureLegacyAgentMigrated(), loadAgentMeta()] | lang=en
- "domain_x402_legacysecretkey": "legacySecretKey()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L35 | neighbors=[x402.ts, ensureLegacyAgentMigrated(), loadAgentMeta()] | lang=en
- "domain_x402_readindexes": "readIndexes()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L68 | neighbors=[x402.ts, addIndex(), removeIndex()] | lang=en
- "domain_x402_removeindex": "removeIndex()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L89 | neighbors=[x402.ts, readIndexes(), writeIndexes()] | lang=en
- "domain_x402_writeindexes": "writeIndexes()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L79 | neighbors=[x402.ts, addIndex(), removeIndex()] | lang=en
- "frontend_metro_config": "metro.config.js" | kind=code-symbol | source=frontend/metro.config.js:L1 | neighbors=[1fe9de1 migrating workspace, config, { getDefaultConfig }] | lang=en
- "karpathywiki_main_aborted": "aborted()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L1129 | neighbors=[main.js, handleIntersectionResults(), handlePipeResult()] | lang=en
- "karpathywiki_main_accessfrom": "accessFrom()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L65108 | neighbors=[main.js, getAccess(), refreshAfterUnauthorized()] | lang=en
- "karpathywiki_main_addcopybutton": "addCopyButton()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L77406 | neighbors=[main.js, renderHistoryMessage(), sendMessage()] | lang=en
- "karpathywiki_main_addimagemodelusage": "addImageModelUsage()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L24163 | neighbors=[main.js, addTokenCounts(), generateImage()] | lang=en
- "karpathywiki_main_addpattern": "addPattern()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L17723 | neighbors=[main.js, stringifyRegExpWithFlags(), parseStringDef()] | lang=en
- "karpathywiki_main_addretrievallabel": "addRetrievalLabel()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L78890 | neighbors=[main.js, renderRetrievalLabel(), sendMessage()] | lang=en
- "karpathywiki_main_aliaskey": "aliasKey()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L67363 | neighbors=[main.js, turkishCaseFold(), filterRedundantAliases()] | lang=en
- "karpathywiki_main_appendsuggestion": "appendSuggestion()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80387 | neighbors=[main.js, getSuggestionsPath(), suggestSchemaUpdate()] | lang=en
- "karpathywiki_main_applytaskpolicy": "applyTaskPolicy()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L55287 | neighbors=[main.js, resolveTaskPolicy(), thinkingEffort()] | lang=en
- "karpathywiki_main_array": "_array()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L9672 | neighbors=[main.js, normalizeParams(), _function()] | lang=en
- "karpathywiki_main_asembeddingmodelv3": "asEmbeddingModelV3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22798 | neighbors=[main.js, logV2CompatibilityWarning(), resolveEmbeddingModel()] | lang=en
- "karpathywiki_main_asimagemodelv3": "asImageModelV3()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L22814 | neighbors=[main.js, logV2CompatibilityWarning(), resolveImageModel()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-028.json

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
