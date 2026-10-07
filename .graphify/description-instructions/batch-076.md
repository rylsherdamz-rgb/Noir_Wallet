# Node Description Batch 77 of 84

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

- "screens_dashboardscreen_activityrow": "ActivityRow" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L582 | neighbors=[DashboardScreen.tsx]
- "screens_dashboardscreen_device_status": "DEVICE_STATUS" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L26 | neighbors=[DashboardScreen.tsx]
- "screens_dashboardscreen_device_status_fallback": "DEVICE_STATUS_FALLBACK" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L32 | neighbors=[DashboardScreen.tsx]
- "screens_dashboardscreen_noir_mark": "NOIR_MARK" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L24 | neighbors=[DashboardScreen.tsx]
- "screens_dashboardscreen_quickaction": "QuickAction" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L564 | neighbors=[DashboardScreen.tsx]
- "screens_dashboardscreen_quickactionprops": "QuickActionProps" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L555 | neighbors=[DashboardScreen.tsx]
- "screens_dashboardscreen_sourceflags": "SourceFlags" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L35 | neighbors=[DashboardScreen.tsx]
- "screens_dashboardscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/DashboardScreen.tsx:L615 | neighbors=[DashboardScreen.tsx]
- "screens_deviceprovisioningscreen_labels": "LABELS" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L33 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_step": "Step" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L31 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_stepdot": "stepDot" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L575 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_stepdotactive": "stepDotActive" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L577 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_stepdotdone": "stepDotDone" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L576 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_stepdotinner": "stepDotInner" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L578 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_steplabel": "stepLabel" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L579 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_steplabelactive": "stepLabelActive" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L580 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_steprow": "StepRow()" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L559 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_deviceprovisioningscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/DeviceProvisioningScreen.tsx:L582 | neighbors=[DeviceProvisioningScreen.tsx]
- "screens_exportkeysscreen_maskvalue": "maskValue()" | kind=code-symbol | source=frontend/src/screens/ExportKeysScreen.tsx:L355 | neighbors=[ExportKeysScreen.tsx]
- "screens_exportkeysscreen_pinerrormessage": "pinErrorMessage()" | kind=code-symbol | source=frontend/src/screens/ExportKeysScreen.tsx:L344 | neighbors=[ExportKeysScreen.tsx]
- "screens_exportkeysscreen_secretitem": "SecretItem" | kind=code-symbol | source=frontend/src/screens/ExportKeysScreen.tsx:L32 | neighbors=[ExportKeysScreen.tsx]
- "screens_exportkeysscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/ExportKeysScreen.tsx:L366 | neighbors=[ExportKeysScreen.tsx]
- "screens_importwalletscreen_importwalletscreenprops": "ImportWalletScreenProps" | kind=code-symbol | source=frontend/src/screens/ImportWalletScreen.tsx:L12 | neighbors=[ImportWalletScreen.tsx]
- "screens_importwalletscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/ImportWalletScreen.tsx:L90 | neighbors=[ImportWalletScreen.tsx]
- "screens_merchantposscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/MerchantPosScreen.tsx:L301 | neighbors=[MerchantPosScreen.tsx]
- "screens_notificationsscreen_notificationrow": "NotificationRow" | kind=code-symbol | source=frontend/src/screens/NotificationsScreen.tsx:L118 | neighbors=[NotificationsScreen.tsx]
- "screens_notificationsscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/NotificationsScreen.tsx:L147 | neighbors=[NotificationsScreen.tsx]
- "screens_notificationsscreen_timeago": "timeAgo()" | kind=code-symbol | source=frontend/src/screens/NotificationsScreen.tsx:L27 | neighbors=[NotificationsScreen.tsx]
- "screens_notificationsscreen_type_colors": "TYPE_COLORS" | kind=code-symbol | source=frontend/src/screens/NotificationsScreen.tsx:L20 | neighbors=[NotificationsScreen.tsx]
- "screens_notificationsscreen_type_icons": "TYPE_ICONS" | kind=code-symbol | source=frontend/src/screens/NotificationsScreen.tsx:L13 | neighbors=[NotificationsScreen.tsx]
- "screens_profilescreen_profilerow": "ProfileRow()" | kind=code-symbol | source=frontend/src/screens/ProfileScreen.tsx:L149 | neighbors=[ProfileScreen.tsx]
- "screens_profilescreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/ProfileScreen.tsx:L171 | neighbors=[ProfileScreen.tsx]
- "screens_receivescreen_receivemode": "ReceiveMode" | kind=code-symbol | source=frontend/src/screens/ReceiveScreen.tsx:L22 | neighbors=[ReceiveScreen.tsx]
- "screens_receivescreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/ReceiveScreen.tsx:L370 | neighbors=[ReceiveScreen.tsx]
- "screens_securityscreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/SecurityScreen.tsx:L315 | neighbors=[SecurityScreen.tsx]
- "screens_securityscreen_timeout_options": "TIMEOUT_OPTIONS" | kind=code-symbol | source=frontend/src/screens/SecurityScreen.tsx:L21 | neighbors=[SecurityScreen.tsx]
- "screens_seedphrasescreen_seedphrasescreenprops": "SeedPhraseScreenProps" | kind=code-symbol | source=frontend/src/screens/SeedPhraseScreen.tsx:L14 | neighbors=[SeedPhraseScreen.tsx]
- "screens_seedphrasescreen_styles": "styles" | kind=code-symbol | source=frontend/src/screens/SeedPhraseScreen.tsx:L115 | neighbors=[SeedPhraseScreen.tsx]
- "screens_seedverifyscreen_seedverifyscreenprops": "SeedVerifyScreenProps" | kind=code-symbol | source=frontend/src/screens/SeedVerifyScreen.tsx:L12 | neighbors=[SeedVerifyScreen.tsx]
- "screens_seedverifyscreen_shuffle": "shuffle()" | kind=code-symbol | source=frontend/src/screens/SeedVerifyScreen.tsx:L18 | neighbors=[SeedVerifyScreen.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-076.json

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
