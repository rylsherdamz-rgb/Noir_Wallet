# Node Description Batch 12 of 84

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
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

- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@394403a9cc158ddda536bc6742b566c1bd659e9a": "394403a feat: abstract Stellar operations into a unified service (src/services/…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, af806bd ci: add Cloud Run deploy workfl…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@3abbb7bd10aba14e7d5f723ac3effff3410be50d": "3abbb7b ci: use node 22 in frontend workflow (stellar-sdk v16 requires >=22)" | kind=Commit | source=git | neighbors=[341371b docs: mark resolved items in UI…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@429faf8a4e6f52a71bda26a7bc02e34abcede492": "429faf8 docs: update contract IDs after redeploy with persistent storage fix" | kind=Commit | source=git | neighbors=[2cb58fa fix: persistent storage for TTL…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4347048985354d803f9230ff922d84e1d60960c1": "4347048 ci: add frontend workflow (typecheck + vitest, path-filtered)" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 4c23040 ui: use surfaceBg consistently …] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4447f2a8487365ac1aed54ddd9eb2caffb3f26d4": "4447f2a enlarge screenshots to 80% width" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 4d5634c style demo video with border-ra…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@48fa7e79a7d2c762c407d84892c4272fa3b6eca8": "48fa7e7 ci: fix Cloud Run deploy (dev env to pass validate, correct secret mapp…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 79f5d6a ci: deploy a single pinned imag…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4a662d511d515cd2bb3108d31143a86a21eb1802": "4a662d5 fix: disable EAS build cache to clear stale expo-av artifacts, clean an…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, ef023d1 fix: SafeAreaProvider in root l…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4bd94c39fce0ec33390430e7e13addf6729b930b": "4bd94c3 add pitch deck link to readme" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 4447f2a enlarge screenshots to 80% width] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4c6ed1d82d85a4667ee820cee0f5ecaccbd8905d": "4c6ed1d fix: pin Rust 1.85 in Dockerfile (once_cell compat), fix backend CI cra…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, ebc715b fix: all CI checks — clippy/fmt…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4c7abaf64c6ffce64a8fa666a2af223b46b2efb1": "4c7abaf feat: implement Phase 2d fee channel management and topup automation" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, 13af4e9 feat: implement Phase 2e API en…, 7ec45fc feat: implement Phase 2c transa…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@4d5634cd1e0fcbd376e467b8433a84ac3146e535": "4d5634c style demo video with border-radius and shadow" | kind=Commit | source=git | neighbors=[4447f2a enlarge screenshots to 80% width, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@5aa1e33004f3f062b77f99d0648409aed87e3bf0": "5aa1e33 fix: commit Cargo.lock for reproducible CI builds" | kind=Commit | source=git | neighbors=[455096e feat: add EXPO_PUBLIC_API_BASE_…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@5aac25cfbabe35c1d2e0f899f588c26b8be56872": "5aac25c use video tag with poster fallback instead of YouTube link" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 05f1c1d Revert "use video tag with post…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@63ffdf02fcc1d37472c067b8c98008f1256364c5": "63ffdf0 docs: add open-source community docs (contributing, CoC, security, chan…" | kind=Commit | source=git | neighbors=[0c6bda4 Add web-based pubmat editor: li…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@64e0d4daadd7053ee82417a4989230b4c64554a9": "64e0d4d chore: gitignore generated cost estimate" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, d724606 fix: mock stellar-service in te…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@6608b0dc6f90da230c0f5782625bfd0a943872fa": "6608b0d Add User Feedback section to README with form, spreadsheet, and Excel e…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 78b6b53 Add screenshots, architecture d…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@6d7bfda3df4b02405e7a1abf29fa77b11da48996": "6d7bfda ci: path-filter Cloud Run deploy, add preflight guard and concurrency" | kind=Commit | source=git | neighbors=[6d69a2c fix: null-guard loadKeys() resu…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@6e489721bba292955b3150b971468843c4fe9dff": "6e48972 chore: stop tracking target/ build artifacts" | kind=Commit | source=git | neighbors=[07f1e72 Confis, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@6f2b391088f55186d0fe37ae83ead17c72821fb9": "6f2b391 switch demo to YouTube embed with clickable poster thumbnail" | kind=Commit | source=git | neighbors=[2570dc4 optimize demo video to 2MB for …, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@79e53ca73562b8845c680569771af959f255f16a": "79e53ca use YouTube thumbnail URL so thumbnail edits reflect automatically" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 8098330 embed X/Twitter post instead of…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@79f5d6a679e93ab0db11796e2d9dca2e3f00398d": "79f5d6a ci: deploy a single pinned image tag (metadata emits multiple)" | kind=Commit | source=git | neighbors=[48fa7e7 ci: fix Cloud Run deploy (dev e…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@7ec45fc531c6cfa93491ae4905ee071514eb4bf0": "7ec45fc feat: implement Phase 2c transaction signing and submission" | kind=Commit | source=git | neighbors=[1f374ba Gitignore, feat/multi-agent, instaward, instaward-staging, main, 4c7abaf feat: implement Phase 2d fee ch…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@7f4367731128cfd3ef4e3bb88600d99ca1c7a94a": "7f43677 chore: add CODEOWNERS and document main branch protection" | kind=Commit | source=git | neighbors=[63ffdf0 docs: add open-source community…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@80983306da8b69a2d04792fa0f6e112358a56456": "8098330 embed X/Twitter post instead of YouTube link" | kind=Commit | source=git | neighbors=[79e53ca use YouTube thumbnail URL so th…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@81d3d33538d96421f79376983e68582ad0a08c7c": "81d3d33 Fix Stellar Expert explorer URLs in README" | kind=Commit | source=git | neighbors=[2c6012b Update README contract IDs to m…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@82d33ed077c2b39aa9bdc208acb7d1bb00346208": "82d33ed fix: track Cargo.lock in git (binary crate needs pinned deps)" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 261c148 ci: single deploy workflow to C…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@852c8d2eab778f2a2b212026db6177ee49a93213": "852c8d2 fix: point app icon/splash directly at noir-mark.png — no ImageMagick p…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 195c6ec fix: proper 1024x1024 icon per …] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@870a0cfcff16b8d69425fb14a68f264fe8292c15": "870a0cf Merge pull request #1 from rylsherdamz-rgb/backend" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-staging, main, 698366e feat(frontend): add Noir Wallet…, a303810 Merge pull request #2 from ryls…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@8a1cda92392a10c48d233a73c588d52c244bce3d": "8a1cda9 cleanup: remove old/ and old2/ directories, update README to dMessage s…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, ab5659f docs: remove Remotion/promo ref…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@8ca7f10c68829310c9c29da6d9072a6ec3601fe2": "8ca7f10 fix: use exact noir-mark.png as app icon (byte-for-byte identical to We…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, cb11d16 fix: proper square app/splash i…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9630a0d7e62f146407f744eec9a091768e1368d3": "9630a0d update README with agent_registry, payment_escrow, and escrow payment f…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 28b92cc fix native token address, fix U…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@9cd9fb475a37390d555eff36399686b2a3b04663": "9cd9fb4 chore: add eas.json for EAS Build config" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, de00d30 feat: promo — logo, scene shell…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a11024d81c58d2f3875a9305f2b91137332df03e": "a11024d ci: add backend CI/CD with Docker build/push to GHCR; add render.yaml f…" | kind=Commit | source=git | neighbors=[feat/multi-agent, instaward, instaward-development, instaward-staging, main, 1ddcf05 ci: add Google Cloud Run deploy…] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@a49fa4041e71c1eb90b17d4318929ea872cb6ec2": "a49fa40 docs: update payment_escrow contract ID after redeploy with persistent …" | kind=Commit | source=git | neighbors=[429faf8 docs: update contract IDs after…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ab5659fdadba319abdbce00c1dc36cc788cdbe09": "ab5659f docs: remove Remotion/promo references from README" | kind=Commit | source=git | neighbors=[8a1cda9 cleanup: remove old/ and old2/ …, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@af806bd6f54901aee7fb317a653e8ca12d14cca7": "af806bd ci: add Cloud Run deploy workflow" | kind=Commit | source=git | neighbors=[394403a feat: abstract Stellar operatio…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@b187753d7fe1bc0562c3c5568cd4758b8e5f5b0e": "b187753 feat: implement Phase 2h — Docker, CI pipeline, integration tests" | kind=Commit | source=git | neighbors=[2ee3cbf feat: implement Phase 2g — migr…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@b7a5f206480f8f55755dc0ee82b10ffa3f919a3a": "b7a5f20 chore: remove accidentally committed gguf model" | kind=Commit | source=git | neighbors=[9303402 fix: fetch balance via raw RPC …, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@ba03a5cc91da086479ea387d844239dd47d2936a": "ba03a5c fix: backend CI workspace root (backend/asset), not crate dir" | kind=Commit | source=git | neighbors=[1ec631e fix: all CI workflows passing —…, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=pt
- "commit:repo:github.com/rylsherdamz-rgb/Noir_Wallet@bf8431fd9dd3cd9bb15d07d2c262e5d5d0764272": "bf8431f PDAX Usage" | kind=Commit | source=git | neighbors=[14aca0e PDAX Credentials, feat/multi-agent, instaward, instaward-development, instaward-staging, main] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-011.json

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
