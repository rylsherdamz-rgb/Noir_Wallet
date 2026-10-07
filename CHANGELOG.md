# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Open-source community docs: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- GitHub issue templates (bug report, feature request) and a pull request template.
- Web-based pubmat editor (`promo/pubmat/editor.html`) — live text editing, logo upload, accent-color and aspect-ratio controls, and PNG export.
- Brand-exact promotional material and a Playwright render pipeline under `promo/pubmat/`.

## [1.0.0] - 2026-07-25

### Added
- x402 zero-interaction tap-to-pay flow — wallet debited on hardware tap, no unlock/app/confirm.
- Three Soroban smart contracts: `device_registry`, `agent_registry`, `payment_escrow`.
- Wallet-authorized device registration via `wallet.require_auth()`.
- Per-device x402 agent wallets with independent balances.
- Escrow-based instant settlement with batch merchant claims.
- NFC device provisioning directly from the app.
- React Native (Expo 57) mobile app for iOS and Android with the noir/gold design system.
- PDAX fiat-bridge integration (optional PHP cash-out).
- Testnet deployment of all three contracts.

[Unreleased]: https://github.com/rylsherdamz-rgb/Noir_Wallet/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rylsherdamz-rgb/Noir_Wallet/releases/tag/v1.0.0
