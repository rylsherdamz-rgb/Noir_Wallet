# Node Description Batch 61 of 84

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

- "brand_pressablescale_pressablescaleprops": "PressableScaleProps" | kind=code-symbol | source=frontend/src/components/brand/PressableScale.tsx:L13 | neighbors=[PressableScale.tsx]
- "brand_signalripple_ring": "Ring()" | kind=code-symbol | source=frontend/src/components/brand/SignalRipple.tsx:L61 | neighbors=[SignalRipple.tsx]
- "brand_signalripple_signalrippleprops": "SignalRippleProps" | kind=code-symbol | source=frontend/src/components/brand/SignalRipple.tsx:L15 | neighbors=[SignalRipple.tsx]
- "components_actionsheet_actionsheet": "ActionSheet()" | kind=code-symbol | source=frontend/src/components/ActionSheet.tsx:L38 | neighbors=[ActionSheet.tsx]
- "components_actionsheet_actionsheetaction": "ActionSheetAction" | kind=code-symbol | source=frontend/src/components/ActionSheet.tsx:L20 | neighbors=[ActionSheet.tsx]
- "components_actionsheet_actionsheetprops": "ActionSheetProps" | kind=code-symbol | source=frontend/src/components/ActionSheet.tsx:L28 | neighbors=[ActionSheet.tsx]
- "components_actionsheet_height_screen_height": "{ height: SCREEN_HEIGHT }" | kind=code-symbol | source=frontend/src/components/ActionSheet.tsx:L18 | neighbors=[ActionSheet.tsx]
- "components_actionsheet_styles": "styles" | kind=code-symbol | source=frontend/src/components/ActionSheet.tsx:L197 | neighbors=[ActionSheet.tsx]
- "components_amountinput_amountinput": "AmountInput()" | kind=code-symbol | source=frontend/src/components/AmountInput.tsx:L21 | neighbors=[AmountInput.tsx]
- "components_amountinput_amountinputprops": "AmountInputProps" | kind=code-symbol | source=frontend/src/components/AmountInput.tsx:L9 | neighbors=[AmountInput.tsx]
- "components_amountinput_styles": "styles" | kind=code-symbol | source=frontend/src/components/AmountInput.tsx:L153 | neighbors=[AmountInput.tsx]
- "components_avatar_avatarprops": "AvatarProps" | kind=code-symbol | source=frontend/src/components/Avatar.tsx:L6 | neighbors=[Avatar.tsx]
- "components_avatar_styles": "styles" | kind=code-symbol | source=frontend/src/components/Avatar.tsx:L54 | neighbors=[Avatar.tsx]
- "components_balancecard_balancecardprops": "BalanceCardProps" | kind=code-symbol | source=frontend/src/components/BalanceCard.tsx:L47 | neighbors=[BalanceCard.tsx]
- "components_balancecard_herofacets": "HeroFacets()" | kind=code-symbol | source=frontend/src/components/BalanceCard.tsx:L20 | neighbors=[BalanceCard.tsx]
- "components_balancecard_styles": "styles" | kind=code-symbol | source=frontend/src/components/BalanceCard.tsx:L192 | neighbors=[BalanceCard.tsx]
- "components_button_buttonprops": "ButtonProps" | kind=code-symbol | source=frontend/src/components/Button.tsx:L12 | neighbors=[Button.tsx]
- "components_button_buttonsize": "ButtonSize" | kind=code-symbol | source=frontend/src/components/Button.tsx:L10 | neighbors=[Button.tsx]
- "components_button_buttonvariant": "ButtonVariant" | kind=code-symbol | source=frontend/src/components/Button.tsx:L9 | neighbors=[Button.tsx]
- "components_button_styles": "styles" | kind=code-symbol | source=frontend/src/components/Button.tsx:L146 | neighbors=[Button.tsx]
- "components_card_cardprops": "CardProps" | kind=code-symbol | source=frontend/src/components/Card.tsx:L4 | neighbors=[Card.tsx]
- "components_card_styles": "styles" | kind=code-symbol | source=frontend/src/components/Card.tsx:L18 | neighbors=[Card.tsx]
- "components_catlogo_catlogoprops": "CatLogoProps" | kind=code-symbol | source=promotion/src/components/CatLogo.tsx:L5 | neighbors=[CatLogo.tsx]
- "components_chatbubble_chatbubble": "ChatBubble()" | kind=code-symbol | source=frontend/src/components/ChatBubble.tsx:L11 | neighbors=[ChatBubble.tsx]
- "components_chatbubble_chatbubbleprops": "ChatBubbleProps" | kind=code-symbol | source=frontend/src/components/ChatBubble.tsx:L7 | neighbors=[ChatBubble.tsx]
- "components_chatbubble_styles": "styles" | kind=code-symbol | source=frontend/src/components/ChatBubble.tsx:L45 | neighbors=[ChatBubble.tsx]
- "components_confirmdialog_confirmdialogprops": "ConfirmDialogProps" | kind=code-symbol | source=frontend/src/components/ConfirmDialog.tsx:L7 | neighbors=[ConfirmDialog.tsx]
- "components_confirmdialog_styles": "styles" | kind=code-symbol | source=frontend/src/components/ConfirmDialog.tsx:L65 | neighbors=[ConfirmDialog.tsx]
- "components_emptystate_emptystateprops": "EmptyStateProps" | kind=code-symbol | source=frontend/src/components/EmptyState.tsx:L7 | neighbors=[EmptyState.tsx]
- "components_emptystate_styles": "styles" | kind=code-symbol | source=frontend/src/components/EmptyState.tsx:L47 | neighbors=[EmptyState.tsx]
- "components_errormessage_errormessageprops": "ErrorMessageProps" | kind=code-symbol | source=frontend/src/components/ErrorMessage.tsx:L7 | neighbors=[ErrorMessage.tsx]
- "components_errormessage_styles": "styles" | kind=code-symbol | source=frontend/src/components/ErrorMessage.tsx:L72 | neighbors=[ErrorMessage.tsx]
- "components_filterchips_filterchip": "FilterChip" | kind=code-symbol | source=frontend/src/components/FilterChips.tsx:L7 | neighbors=[FilterChips.tsx]
- "components_filterchips_filterchipsprops": "FilterChipsProps" | kind=code-symbol | source=frontend/src/components/FilterChips.tsx:L12 | neighbors=[FilterChips.tsx]
- "components_filterchips_styles": "styles" | kind=code-symbol | source=frontend/src/components/FilterChips.tsx:L51 | neighbors=[FilterChips.tsx]
- "components_icon_iconname": "IconName" | kind=code-symbol | source=promotion/src/components/Icon.tsx:L3 | neighbors=[Icon.tsx]
- "components_icon_iconprops": "IconProps" | kind=code-symbol | source=promotion/src/components/Icon.tsx:L29 | neighbors=[Icon.tsx]
- "components_icon_paths": "PATHS" | kind=code-symbol | source=promotion/src/components/Icon.tsx:L37 | neighbors=[Icon.tsx]
- "components_keyboardawarescreen_keyboardawarescreenprops": "KeyboardAwareScreenProps" | kind=code-symbol | source=frontend/src/components/KeyboardAwareScreen.tsx:L13 | neighbors=[KeyboardAwareScreen.tsx]
- "components_keyboardawarescreen_styles": "styles" | kind=code-symbol | source=frontend/src/components/KeyboardAwareScreen.tsx:L60 | neighbors=[KeyboardAwareScreen.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-060.json

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
