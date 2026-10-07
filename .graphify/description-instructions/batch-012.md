# Node Description Batch 13 of 84

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

- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@cb11d16b453ed4b81e429566b4fda027ab60eb6a": "cb11d16 fix: proper square app/splash icons from noir-mark logo; delete stale a…" | kind=Commit | source=git | neighbors=[8ca7f10 fix: use exact noir-mark.png as…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@cb4564a44fc2de60db4c998f0476156a9c4967ed": "cb4564a Update README.md" | kind=Commit | source=git | neighbors=[05f1c1d Revert "use video tag with post…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@cf3806b4c6ca814619fdbe42b2160f6baab9039a": "cf3806b gitignore added" | kind=Commit | source=git | neighbors=[6e48972 chore: stop tracking target/ bu…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@cfb4bb4de93e28da74373faa24b526676206506a": "cfb4bb4 fix issue and added mainet address" | kind=Commit | source=git | neighbors=[bd5fbe7 fix issue and added mainet addr…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d13abf692800c839786daaf2618a3f8bcbab0f1b": "d13abf6 docs: add Noir Wallet product demo video and player to README" | kind=Commit | source=git | neighbors=[5aa1e33 fix: commit Cargo.lock for repr…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d16ed594be22bebddeb71385b18297592558b54c": "d16ed59 rearrange screenshots, add hackathon track" | kind=Commit | source=git | neighbors=[3ea9e39 fix soroban auth signing (txToo…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@d7c4861c52e0a3e68c1e37002761f6779d93bfa0": "d7c4861 use local poster JPG instead of YouTube thumbnail URL" | kind=Commit | source=git | neighbors=[8098330 embed X/Twitter post instead of…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@dcb66d1aa41c613a7827df9ca4f14bbf59690ab0": "dcb66d1 fix: add STELLAR_RPC_URL env var to Cloud Run deploy workflow" | kind=Commit | source=git | neighbors=[22cce04 refactor: replace all StyleShee…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e0574fbc07822ffa2d599a19c6debd0b8fe84f0d": "e0574fb add pitch deck ppt" | kind=Commit | source=git | neighbors=[8eca877 fix soroban auth signing, UI im…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e20a4d4cb62dbf90865b181dd2ec2548cd32e950": "e20a4d4 fix: scale down app icon (55%) and splash (40%) so cat fits within icon…" | kind=Commit | source=git | neighbors=[cb11d16 fix: proper square app/splash i…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e2439bf435864468afd5f8f946590afcf74718d6": "e2439bf feat: implement Phase 2f resilience — rate limiting, idempotency, retry…" | kind=Commit | source=git | neighbors=[13af4e9 feat: implement Phase 2e API en…, feat/multi-agent, instaward, instaward-staging, main, 2ee3cbf feat: implement Phase 2g — migr…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e47c8543d3bb76b7ba85069e856dabc0feef15c5": "e47c854 fix: reduce app icon cat to 30% of canvas — better fit for small icon" | kind=Commit | source=git | neighbors=[e20a4d4 fix: scale down app icon (55%) …, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@e55f3666ce17af549d6d169f41bb456ed7daafdd": "e55f366 chore: remove accidentally committed contract Cargo.lock" | kind=Commit | source=git | neighbors=[b7a5f20 chore: remove accidentally comm…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@eba96f9d135671279acad83f49d63630b1327bd4": "eba96f9 fix: hoist @noble/hashes to ^2.2.0, regenerate lockfile, add lockfile C…" | kind=Commit | source=git | neighbors=[de00d30 feat: promo — logo, scene shell…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@f284dc7e41b53bbfc661f85973c2ad89a331a868": "f284dc7 fix: replace app icon with actual NOIR cat logo from noir-mark.png" | kind=Commit | source=git | neighbors=[4ef66b2 feat(frontend): latest brand po…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@fba6f3e4537fb0591a728d52a99896892ca29b4a": "fba6f3e ci: remove EAS Android/iOS build jobs from frontend CI" | kind=Commit | source=git | neighbors=[27c2c59 fix: resolve all TS errors, add…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@fdca06e52e176088417709607118064a0ed92c90": "fdca06e presentation" | kind=Commit | source=git | neighbors=[cfb4bb4 fix issue and added mainet addr…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ff9700bca53c99be0d152fec3f123d07f5dc1a63": "ff9700b fix: replace all icon/splash assets with NOIR cat logo from noir-mark.p…" | kind=Commit | source=git | neighbors=[f284dc7 fix: replace app icon with actu…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "demo_scenes_subtitle": "Subtitle.tsx" | kind=code-symbol | source=promotion/src/demo-scenes/Subtitle.tsx:L1 | neighbors=[dc5a97e video, Subtitle(), SubtitleProps, DemoShell.tsx, theme.ts, withAlpha()] | lang=en
- "domain_x402_ensurelegacyagentmigrated": "ensureLegacyAgentMigrated()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L107 | neighbors=[x402.ts, addIndex(), legacyBudgetKey(), legacyCreatedKey(), legacyLabelKey(), legacyPublicKey()] | lang=en
- "domain_x402_loadagentmeta": "loadAgentMeta()" | kind=code-symbol | source=frontend/src/domain/x402.ts:L134 | neighbors=[x402.ts, legacyBudgetKey(), legacyCreatedKey(), legacyDeviceKey(), legacyLabelKey(), legacyPublicKey()] | lang=en
- "examples_pdax_balances": "pdax_balances.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_balances.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_crypto_deposit": "pdax_crypto_deposit.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_crypto_deposit.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_crypto_transactions": "pdax_crypto_transactions.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_crypto_transactions.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_crypto_withdraw": "pdax_crypto_withdraw.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_crypto_withdraw.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_fiat_deposit": "pdax_fiat_deposit.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_fiat_deposit.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_fiat_transactions": "pdax_fiat_transactions.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_fiat_transactions.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_fiat_withdraw": "pdax_fiat_withdraw.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_fiat_withdraw.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_indicative_price": "pdax_indicative_price.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_indicative_price.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_order_details": "pdax_order_details.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_order_details.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_orders": "pdax_orders.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_orders.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_place_order": "pdax_place_order.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_place_order.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "examples_pdax_user_info_upload": "pdax_user_info_upload.rs" | kind=code-symbol | source=unused/pdax-backend/examples/pdax_user_info_upload.rs:L1 | neighbors=[914cc25 Merge pull request #10 from ryl…, f6a15ab refactor(backend): flatten to b…, main(), 192bd8f Cargo tests, 1dd5d78 chore: merge backend branch int…, 5c65d3b chore: merge backend branch int…] | lang=en
- "karpathywiki_main_appendaliases": "appendAliases()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L72906 | neighbors=[main.js, createOrUpdateFile(), filterRedundantAliases(), parseFrontmatter(), resolveMinAliasLength(), tryReadFile()] | lang=en
- "karpathywiki_main_appendingest": "appendIngest()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L75297 | neighbors=[main.js, buildLogHeader(), formatIngestMetricsSuffix(), getLogLabels(), pageLinks(), timestamp()] | lang=en
- "karpathywiki_main_applycodexmodelpolicy": "applyCodexModelPolicy()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L81426 | neighbors=[main.js, display(), preserveCodexRuntimeModelState(), refreshOpenAICodexModels(), resetOpenAICodexModelState(), syncCodexModelsFromPlugin()] | lang=en
- "karpathywiki_main_assembleoperationname": "assembleOperationName()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L23839 | neighbors=[main.js, embed(), embedMany(), executeToolCall(), generateObject(), generateText()] | lang=en
- "karpathywiki_main_buildwelcomenote": "buildWelcomeNote()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L80462 | neighbors=[main.js, renderFrontmatter(), renderHowToUseSection(), renderQuickStartSection(), renderStructureSection(), renderVerifySection()] | lang=en
- "karpathywiki_main_checkdedup": "checkDedup()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L74853 | neighbors=[main.js, buildSystemPrompt(), callLlm(), parseJsonResponse(), renderTemplate(), resolveModelForTask()] | lang=en
- "karpathywiki_main_converttomodelmessages": "convertToModelMessages()" | kind=code-symbol | source=Noir/.obsidian/plugins/karpathywiki/main.js:L27776 | neighbors=[main.js, isDataUIPart(), isFileUIPart(), isReasoningUIPart(), isTextUIPart(), isToolUIPart()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-012.json

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
