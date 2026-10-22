# Changelog

## 0.2.0

First release on npm as `@noirx402/agent-sdk`.

- `noirExtensionSigner()` connects to the Noir browser extension; `walletSigner(wallet, address)` wraps any SEP-43 wallet (Stellar Wallets Kit, Freighter, `window.noir.stellar`).
- `toStroops` / `fromStroops`: exact 7-decimal amount conversion, no floats.
- `execute(signer, op)` runs every Noir write (`authorize`, `claim`, `registerAgent`, `revokeAgent`, `fundEscrow`, `defundEscrow`); `prepare` / `submit` split signing out.
- `listDevices(wallet)` reads a wallet's registered device hashes.
- Runs in Node 20+, browsers and React Native (no `Buffer`).
- `@stellar/stellar-sdk` is a peer dependency, so your app and the SDK share one copy.

## 0.1.0

- `NoirAgentClient`: read policies, device owners, escrow and pending balances; `checkPayment` through the contract's own `check_payment`.
- `authorizePayment` / `claim` for the tap-to-pay flow, with typed `NoirContractError`s.
- Typed contract events, `watch` / `pastEvents`, and an HMAC-signed webhook relay with `verifyWebhookSignature`.
