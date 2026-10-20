# Chrome Web Store listing — Noir

Copy these into the Developer Dashboard (https://chrome.google.com/webstore/devconsole).
Upload `noir-wallet-extension-0.1.0.zip` (from `npm run zip` or the GitHub release).

## Store listing

**Name:** Noir

**Summary** (≤132 chars):
> Stellar wallet for dApps. Connect sites, approve every signature in plain words, and see your Noir tap-to-pay cards.

**Category:** Tools (or Productivity) · **Language:** English

**Description:**
```
Noir brings your Stellar wallet to the browser.

• Same wallet as the Noir app — import your 12-word recovery phrase (SEP-5) and get the same address, or create a new wallet.
• Connect to Stellar dApps — sites ask once; you can disconnect any of them from the wallet.
• Approve every signature in plain words — payments, contract calls and their arguments, Soroban authorizations and messages, with warnings when something looks risky.
• Network-safe — requests for a different network are refused, and authorizations are checked against your network before signing.
• Your Noir cards — see the NFC cards linked to your wallet, their escrow balance and per-tap limit.
• Works with the Stellar Wallets Kit and any app that supports SEP-43 wallets (window.noir.stellar).

Security: your recovery phrase is encrypted with your password (AES-256-GCM, PBKDF2 600k) and never leaves your device. The wallet locks itself after 15 minutes. No account, no analytics, no tracking.

Open source (MIT): https://github.com/rylsherdamz-rgb/Noir_Wallet
Noir runs on Stellar Testnet today; Mainnet signing is available for any dApp.
```

**Graphics** (`store/assets/`):
| Field | File |
|---|---|
| Store icon (128×128) | `icon-128.png` |
| Screenshots (1280×800, upload in this order) | `1-approve-tx.png`, `2-home.png`, `3-connect.png`, `4-auth.png`, `5-welcome.png` |
| Small promo tile (440×280) | `promo-small-440x280.png` |
| Marquee (1400×560, optional) | `marquee-1400x560.png` |

**Homepage URL:** https://rylsherdamz-rgb.github.io/Noir_Wallet/docs/extension/
**Support URL:** https://github.com/rylsherdamz-rgb/Noir_Wallet/issues

## Privacy practices tab

**Single purpose:**
> A Stellar cryptocurrency wallet: it holds the user's Stellar key and lets websites request the user's address and signatures, each approved by the user.

**Permission justifications:**
| Permission | Justification |
|---|---|
| `storage` | Stores the password-encrypted recovery phrase, public address, network choice and the list of sites the user connected. The unlocked key is kept in session storage only. |
| `alarms` | Locks the wallet automatically after 15 minutes without use. |
| Host permissions (`horizon.stellar.org`, `horizon-testnet.stellar.org`, `soroban-testnet.stellar.org`, `friendbot.stellar.org`) | Reads the user's balance and Noir card data from public Stellar network services, and funds Testnet accounts via Friendbot when the user asks. |
| Content scripts on `https://*/*` (and localhost) | Injects the `window.noir.stellar` wallet interface so any Stellar website can request a connection or a signature. The script holds no data and only relays requests to the wallet, which asks the user to approve each one. |

**Remote code:** No, I am not using remote code. (All JavaScript is bundled in the package.)

**Data usage:** The extension does not collect or transmit user data to the developer. Check none of the data-type boxes, then certify:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://rylsherdamz-rgb.github.io/Noir_Wallet/privacy/
(live once PR #14 is merged and GitHub Pages redeploys)

## Distribution

Visibility: Public (or Unlisted while you test with real users). Regions: all.
Review usually takes a few days; content scripts on all https sites can trigger a longer, in-depth review.
