# Noir — browser extension

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
- **Everything the app does with money.** Send XLM (with memo, reserve check,
  and opening new accounts), receive with a SEP-7 QR and payment link,
  Activity with sent/received filters and transaction details.
- **Noir cards, linked from the browser.** Link an NTAG213 card (scan it with
  Web NFC where the browser has a reader, or type its UID: it is hashed
  exactly as the app does, `sha256(UID)`), set its agent policy, add funds to
  and withdraw from its escrow, rename it, and unlink it without stranding
  funds (revoke agent → sweep escrow → revoke device → sweep agent wallet).
- **Agents.** Each card's agent is derived from your phrase at
  `m/44'/148'/0'/n'`, the same keys the app uses, so cards linked on either
  side work on both. See its balance and policy, top it up, edit its policy.
- **Settings like the app.** Auto-lock time, change password, show the
  recovery phrase, export the secret key, connected sites, and a directory of
  Stellar apps.

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
npm test               # unit: SEP-5 + agent vectors, vault, signing, UIDs, SEP-7, activity
npm run test:testnet   # live Testnet: link → fund → withdraw → top up → policy → pay → unlink
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
| `src/popup/` | Onboarding (with phrase check), Wallet, Send, Receive, Cards, Agents, Activity, Settings |
| `src/shared/noir.ts` | Card, agent, escrow and payment logic the service worker runs |
| `src/approve/` | Approval window |
| `src/shared/` | SEP-5 derivation, vault crypto, signing, transaction descriptions |
| `kit-module/` | Stellar Wallets Kit module, its Deno test and a ready-to-apply patch |

Not in this version: multiple wallets, paying by tapping a card (that needs
the phone's NFC radio; desktop browsers can't reach NFC readers), the
merchant POS, fiat cash-out, hardware keys, and Firefox. The Noir contracts
run on Testnet; payments and dApp signing work on Mainnet too, but cards and
agents are Testnet-only.
