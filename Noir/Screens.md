---
tags: [frontend, screens]
---

# Screens

Part of [[Frontend]]. Full-page views in `frontend/src/screens/`, routed via `frontend/app/` (expo-router).

## Wallet core
- [[DashboardScreen]] — balance, activity, actions
- [[SendScreen]] · [[ReceiveScreen]]
- [[TransactionHistoryScreen]] · [[TransactionDetailScreen]]

## x402 / devices
- [[DeviceProvisioningScreen]] — NFC link + register ([[Flow - Device Provisioning]])
- [[AgentListScreen]] · [[AgentDetailScreen]] — per-device agent wallets
- [[MerchantPosScreen]] — POS tap ([[Flow - Tap to Pay]])
- [[CardsScreen]]

## Onboarding & security
- [[WelcomeScreen]] · [[ImportWalletScreen]]
- [[SeedPhraseScreen]] · [[SeedVerifyScreen]]
- [[SecurityScreen]] · [[ExportKeysScreen]] · [[ProfileScreen]]

## Misc
- [[NotificationsScreen]] · [[BlockchainScreen]]

Screens consume [[Services]], [[Components]], and [[useAppStore]].
