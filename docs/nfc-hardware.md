# Supported NFC Hardware

Noir's reference implementation supports exactly **one** tag type: **NXP NTAG213**, read by an **Android** phone with NFC. Other tags may work, but they are not validated and are out of scope for this sprint.

## NTAG213 at a glance

| Property | Value |
|----------|-------|
| Standard | ISO/IEC 14443 Type A, NFC Forum Type 2 Tag |
| UID | 7 bytes, factory-programmed, read-only |
| User memory | 144 bytes (NDEF) — **not used by Noir** |
| Read range | A few centimetres (phone antenna dependent) |
| Formats | Stickers, cards, key fobs, wristbands, all with the same chip |
| Cost | Commodity; widely sold in packs |

Buy tags labelled "NTAG213". Mifare Classic tags are a different chip family, and many Android phones cannot read them.

## What Noir reads and what it stores

**The tag is only an identifier.** Noir reads the tag's UID and nothing else. It does not write to the tag during provisioning or payment, and the tag never holds:

- Stellar secret keys or seed phrases
- signing credentials of any kind
- balances or policy data

A cloned UID cannot spend anything on its own. Spending needs the agent key, which stays in the phone's SecureStore. The agent can only spend inside its on-chain policy (asset, per-payment cap, expiry), and the owner can revoke it at any time. See [Architecture → Trust boundaries](architecture.md#7-trust-boundaries).

## How a tag becomes a `device_hash`

1. **Read.** [`frontend/src/services/nfc.ts`](../frontend/src/services/nfc.ts) uses `react-native-nfc-manager` and requests `NfcA`, `Ndef` or `IsoDep`. It returns the tag's `id` as a hex string: the library's string form as-is, or a byte array converted to lowercase hex.
2. **Hash.** The app computes `SHA-256` over the **UTF-8 bytes of that UID string** (not the raw 7 bytes):

   ```ts
   // frontend/src/lib/cardTap.ts — also used by DeviceProvisioningScreen and MerchantPosScreen
   import { sha256 } from '@noble/hashes/sha2.js'
   const hash = Buffer.from(sha256(new TextEncoder().encode(uid))).toString('hex')
   ```

3. **On-chain.** The 32-byte digest is passed as `device_hash: BytesN<32>` to `device_registry.register`, `agent_registry.register_agent` and `payment_escrow.*`. The raw UID never leaves the phone.

> [!IMPORTANT]
> Every reader of a tag must format the UID string **identically**, or it will compute a different hash and the tag will look unregistered. If you build your own terminal, use the same library or reproduce the exact string, then hash its UTF-8 bytes.

Reproduce a hash on the command line:

```bash
printf '%s' '<UID string exactly as read>' | sha256sum
```

## Android setup

- **Permission.** [`frontend/app.json`](../frontend/app.json) declares only `android.permission.NFC` for NFC. Nothing else is needed.
- **Phone.** NFC must be switched on (Settings → Connected devices → NFC). The app detects it is off and offers to open the setting (`nfcService.isEnabled()` / `goToSettings()`).
- **Build.** NFC needs native code, so use a development build or the release APK. Expo Go and the Android emulator have no NFC.
- **Timeouts.** Reads time out after 5–10 seconds depending on the screen. Hold the tag flat against the phone's NFC antenna, usually the upper back.

## Validated scenarios

| Scenario | Where it is tested |
|----------|--------------------|
| UID read → SHA-256 → registration | `DeviceProvisioningScreen`; unit tests in `frontend/tests/03-nfc.test.ts`. Live Testnet registration with a simulated 7-byte NTAG213 UID, hashed the same way: [`week2-testnet-flow-*.md`](../deploy-evidence/week2-testnet-flow-20261009T044804Z.md) |
| Tag already owned by another wallet is refused | Live Testnet run, step 5 (`DeviceOwnedByOtherWalletError`, nothing signed) |
| Duplicate registration rejected on-chain | `device_registry` returns `AlreadyRegistered = 4`; `agent_registry` returns `AlreadyRegistered = 3` (`test_duplicate_registration_rejected`) |
| Revoked tag can be registered again | `test_revoke_removes_entry_enabling_re_registration` |
| Physical NTAG213 on a real phone | ⏳ To do: on-device run still pending (see [to-do](README.md#still-to-do)) |

## Not supported in this sprint

iOS (Core NFC), Mifare Classic, NTAG215/216 (likely to work, since they share the UID behaviour, but unvalidated), HCE phone-as-card, wearables, and writing data to tags.

Related: [Walkthrough](walkthrough.md) · [Architecture](architecture.md)
