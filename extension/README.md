# Noir Wallet — browser extension

A Chrome (Manifest V3) Stellar wallet that lets any dApp connect to Noir and
ask for signatures, through a [SEP-43](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md)
provider at `window.noir.stellar`. It ships with a
[Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) module
(`kit-module/`) so dApps using the kit get Noir in their wallet list.

- **Same wallet as the app.** Import the Noir app's 12-word phrase: SEP-5
  derivation (`m/44'/148'/0'`) gives the same address.
- **Encrypted at rest.** The phrase is sealed with AES-256-GCM under a
  PBKDF2-SHA256 (600k) key from your password. The unlocked key lives only in
  `chrome.storage.session` and auto-locks after 15 minutes.
- **Every request is approved.** Connecting and each signature open a Noir
  window that shows the site, the network and what is being signed
  (payments, contract calls with arguments, auth entries, messages) with
  warnings for risky operations.
- **Network-safe.** Requests for another network are refused; auth entries
  for another network are refused before signing.
- **Noir cards.** The popup lists NFC cards linked to the wallet, with their
  escrow and per-tap cap, read from Noir's Soroban contracts.

## Build and load

```bash
npm ci
npm run build          # → dist/
```

Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → `dist/`.
`npm run zip` produces `noir-wallet-extension.zip` for the Chrome Web Store.

## For dApps

```js
const noir = window.noir?.stellar          // present once the extension is installed
const { address, error } = await noir.requestAccess()
const { signedTxXdr } = await noir.signTransaction(xdr, { networkPassphrase })
const { signedAuthEntry } = await noir.signAuthEntry(preimageXdr, { networkPassphrase })
const { signedMessage } = await noir.signMessage('Sign in to example.com')   // SEP-53
const { network, networkPassphrase } = await noir.getNetwork()
```

Methods never reject; they resolve with the SEP-43 result or `{ error: { code, message } }`.
Codes: `-1` internal / not connected / locked, `-2` invalid input, `-3` wrong
network or unsupported, `-4` the user rejected. Also: `isConnected()`,
`isAllowed()`, `getAddress()` (no prompt once the site is connected), and a
`noir#initialized` window event.

With the Stellar Wallets Kit, use `NoirModule` (see `kit-module/README.md`).

## Tests

```bash
npm test               # unit: SEP-5 vectors, vault, signing, descriptions
npm run test:e2e       # builds, loads dist/ in Chromium and drives onboarding,
                       # connect, every signing method and the kit module
npm run typecheck
```

## Layout

| Path | What |
|---|---|
| `src/background.ts` | Service worker: vault, auto-lock, site permissions, approval queue, signing |
| `src/inpage.ts` | `window.noir.stellar` provider (page world) |
| `src/content.ts` | Relay between the page and the service worker |
| `src/popup/` | Onboarding, unlock, balance, Noir cards, connected sites, settings |
| `src/approve/` | Approval window |
| `src/shared/` | SEP-5 derivation, vault crypto, signing, transaction descriptions |
| `kit-module/` | Stellar Wallets Kit module, its Deno test and a ready-to-apply patch |

Not in this version: sending payments from the popup, multiple accounts,
hardware keys, and Firefox. The Noir contracts run on Testnet; Mainnet signing
works for any dApp but cards only show on Testnet.
