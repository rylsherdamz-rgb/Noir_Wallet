# Wallet create / import — Android evidence (2026-10-09)

Release build of `instaward-development` (`a6cdcac`+) on the Android emulator (Pixel 10 AVD, Android 17).

| # | Screen | What it shows |
|---|--------|---------------|
| 1 | `01-import-wallet.png` | Import from a 12/24-word recovery phrase |
| 2 | `02-profile-name.png` | Import accepted → profile setup (display name, stays on the phone) |
| 3 | `03-create-wallet-password.png` | Wallet password (Argon2id), strength meter, confirmation matched |
| 4 | `04-wallet-after-import.png` | Wallet opened for `GCDL…LBVY` — the key derived independently from the same throwaway Testnet phrase (`GCDLFLDOTEAAFGN6YXXWV34E47YR7QE7HKJ3R6TMYZZ2DGEA2B53LBVY`) |
| 5 | `05-lock-password-first.png` | Cold start → lock asks for the wallet password (phone unlock is opt-in; this emulator has no screen lock, so it is not offered) |
| 6 | `06-unlocked.png` | Password accepted → wallet |

Notes

- **Create wallet**: the recovery-phrase and verify screens set Android's `FLAG_SECURE`
  (`usePreventScreenCapture`), so screenshots of them come out black — by design. The
  create path is evidenced on-chain instead: `deploy-evidence/week2-testnet-flow-*.md`
  step 1 (phrase generated, re-imported to the same keys, account funded on Testnet).
- The phrase typed in step 1 was a throwaway Testnet phrase and is not stored anywhere;
  the screenshot with the phrase visible was deliberately not kept.
- The balance reads 0 because this emulator image does not trust the Sectigo chain used
  by `*.stellar.org` (`SSLHandshakeException: Trust anchor for certification path not
  found` on Friendbot/Horizon). That is an emulator trust-store issue, not app behaviour;
  funding works from Node and on hardware.
