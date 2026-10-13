# Node Description Batch 62 of 84

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

- "components_numerickeypad_key_gap": "KEY_GAP" | kind=code-symbol | source=frontend/src/components/NumericKeypad.tsx:L10 | neighbors=[NumericKeypad.tsx]
- "components_numerickeypad_key_size": "KEY_SIZE" | kind=code-symbol | source=frontend/src/components/NumericKeypad.tsx:L9 | neighbors=[NumericKeypad.tsx]
- "components_numerickeypad_keys": "keys" | kind=code-symbol | source=frontend/src/components/NumericKeypad.tsx:L19 | neighbors=[NumericKeypad.tsx]
- "components_numerickeypad_numerickeypadprops": "NumericKeypadProps" | kind=code-symbol | source=frontend/src/components/NumericKeypad.tsx:L12 | neighbors=[NumericKeypad.tsx]
- "components_numerickeypad_styles": "styles" | kind=code-symbol | source=frontend/src/components/NumericKeypad.tsx:L110 | neighbors=[NumericKeypad.tsx]
- "components_phoneframe_phoneframeprops": "PhoneFrameProps" | kind=code-symbol | source=promotion/src/components/PhoneFrame.tsx:L4 | neighbors=[PhoneFrame.tsx]
- "components_progressindicator_progressindicator": "ProgressIndicator()" | kind=code-symbol | source=frontend/src/components/ProgressIndicator.tsx:L13 | neighbors=[ProgressIndicator.tsx]
- "components_progressindicator_progressindicatorprops": "ProgressIndicatorProps" | kind=code-symbol | source=frontend/src/components/ProgressIndicator.tsx:L5 | neighbors=[ProgressIndicator.tsx]
- "components_progressindicator_styles": "styles" | kind=code-symbol | source=frontend/src/components/ProgressIndicator.tsx:L104 | neighbors=[ProgressIndicator.tsx]
- "components_readytotapindicator_readytotapindicator": "ReadyToTapIndicator()" | kind=code-symbol | source=frontend/src/components/ReadyToTapIndicator.tsx:L17 | neighbors=[ReadyToTapIndicator.tsx]
- "components_readytotapindicator_readytotapindicatorprops": "ReadyToTapIndicatorProps" | kind=code-symbol | source=frontend/src/components/ReadyToTapIndicator.tsx:L9 | neighbors=[ReadyToTapIndicator.tsx]
- "components_readytotapindicator_styles": "styles" | kind=code-symbol | source=frontend/src/components/ReadyToTapIndicator.tsx:L280 | neighbors=[ReadyToTapIndicator.tsx]
- "components_screenheader_screenheaderprops": "ScreenHeaderProps" | kind=code-symbol | source=frontend/src/components/ScreenHeader.tsx:L10 | neighbors=[ScreenHeader.tsx]
- "components_screenheader_styles": "styles" | kind=code-symbol | source=frontend/src/components/ScreenHeader.tsx:L88 | neighbors=[ScreenHeader.tsx]
- "components_searchbar_searchbarprops": "SearchBarProps" | kind=code-symbol | source=frontend/src/components/SearchBar.tsx:L6 | neighbors=[SearchBar.tsx]
- "components_searchbar_styles": "styles" | kind=code-symbol | source=frontend/src/components/SearchBar.tsx:L46 | neighbors=[SearchBar.tsx]
- "components_sectionheader_sectionheaderprops": "SectionHeaderProps" | kind=code-symbol | source=frontend/src/components/SectionHeader.tsx:L5 | neighbors=[SectionHeader.tsx]
- "components_sectionheader_styles": "styles" | kind=code-symbol | source=frontend/src/components/SectionHeader.tsx:L29 | neighbors=[SectionHeader.tsx]
- "components_skeletonloader_skeletonloaderprops": "SkeletonLoaderProps" | kind=code-symbol | source=frontend/src/components/SkeletonLoader.tsx:L6 | neighbors=[SkeletonLoader.tsx]
- "components_skeletonloader_styles": "styles" | kind=code-symbol | source=frontend/src/components/SkeletonLoader.tsx:L112 | neighbors=[SkeletonLoader.tsx]
- "components_smarttip_smarttipprops": "SmartTipProps" | kind=code-symbol | source=frontend/src/components/SmartTip.tsx:L8 | neighbors=[SmartTip.tsx]
- "components_smarttip_styles": "styles" | kind=code-symbol | source=frontend/src/components/SmartTip.tsx:L79 | neighbors=[SmartTip.tsx]
- "components_smarttip_variant_styles": "VARIANT_STYLES" | kind=code-symbol | source=frontend/src/components/SmartTip.tsx:L17 | neighbors=[SmartTip.tsx]
- "components_statuspill_config": "CONFIG" | kind=code-symbol | source=frontend/src/components/StatusPill.tsx:L12 | neighbors=[StatusPill.tsx]
- "components_statuspill_fallback_config": "FALLBACK_CONFIG" | kind=code-symbol | source=frontend/src/components/StatusPill.tsx:L25 | neighbors=[StatusPill.tsx]
- "components_statuspill_statuspillprops": "StatusPillProps" | kind=code-symbol | source=frontend/src/components/StatusPill.tsx:L8 | neighbors=[StatusPill.tsx]
- "components_statuspill_styles": "styles" | kind=code-symbol | source=frontend/src/components/StatusPill.tsx:L48 | neighbors=[StatusPill.tsx]
- "components_statuspill_txstatus": "TxStatus" | kind=code-symbol | source=frontend/src/components/StatusPill.tsx:L6 | neighbors=[StatusPill.tsx]
- "components_testnetfaucetbanner_styles": "styles" | kind=code-symbol | source=frontend/src/components/TestnetFaucetBanner.tsx:L53 | neighbors=[TestnetFaucetBanner.tsx]
- "components_toast_colors": "COLORS" | kind=code-symbol | source=frontend/src/components/Toast.tsx:L28 | neighbors=[Toast.tsx]
- "components_toast_haptic_types": "HAPTIC_TYPES" | kind=code-symbol | source=frontend/src/components/Toast.tsx:L35 | neighbors=[Toast.tsx]
- "components_toast_icons": "ICONS" | kind=code-symbol | source=frontend/src/components/Toast.tsx:L21 | neighbors=[Toast.tsx]
- "components_toast_styles": "styles" | kind=code-symbol | source=frontend/src/components/Toast.tsx:L157 | neighbors=[Toast.tsx]
- "components_toast_toastprops": "ToastProps" | kind=code-symbol | source=frontend/src/components/Toast.tsx:L10 | neighbors=[Toast.tsx]
- "components_toastprovider_toastapi": "ToastApi" | kind=code-symbol | source=frontend/src/components/ToastProvider.tsx:L20 | neighbors=[ToastProvider.tsx]
- "components_toastprovider_toastcontext": "ToastContext" | kind=code-symbol | source=frontend/src/components/ToastProvider.tsx:L27 | neighbors=[ToastProvider.tsx]
- "components_transactionitem_styles": "styles" | kind=code-symbol | source=frontend/src/components/TransactionItem.tsx:L84 | neighbors=[TransactionItem.tsx]
- "components_transactionitem_transactionitemprops": "TransactionItemProps" | kind=code-symbol | source=frontend/src/components/TransactionItem.tsx:L11 | neighbors=[TransactionItem.tsx]
- "components_walletswitcher_styles": "styles" | kind=code-symbol | source=frontend/src/components/WalletSwitcher.tsx:L183 | neighbors=[WalletSwitcher.tsx]
- "components_walletswitcher_walletswitcherprops": "WalletSwitcherProps" | kind=code-symbol | source=frontend/src/components/WalletSwitcher.tsx:L11 | neighbors=[WalletSwitcher.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-061.json

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
