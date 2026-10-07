# UI Test Harness (Playwright + react-native-web)

Screenshot-based UI checks for the Expo app, driven through the
`react-native-web` build so Playwright can render real screens in Chromium.

## Scope & limitations

Playwright drives **browsers**, not native iOS/Android. This harness runs the
app's web build, which is good for:

- Layout / styling regressions
- Navigation and empty/populated states
- Verifying store hydration and agent reconstruction

It is **not** suitable for NFC, biometrics, or Keychain/Keystore behavior —
those are native-only (on web, `secureStorage` falls back to `localStorage`).
For true native UI automation use Maestro or Detox.

## Usage

```bash
cd frontend
npm install                       # playwright is a devDependency
npx playwright install chromium   # first time only

node uitest/harness.js            # boots web server, seeds state, screenshots
```

Screenshots land in `uitest/shots/` (gitignored).

## Files

| File | Purpose |
|------|---------|
| `harness.js` | Boots Expo web, seeds state, navigates tabs, screenshots each screen |
| `seed.js` | Builds deterministic wallet + agents + devices using the app's real HD derivation |
| `probe.js` | Dumps DOM text/roles — useful when a selector stops matching |
| `debug-store.js` | Prints the persisted store before/after hydration (routing/hydration debugging) |

## How seeding works

`seed.js` derives the main wallet at `m/44'/148'/0'` and agents at
`m/44'/148'/0'/N'` — the same paths the app uses — so each seeded device's
`agentPublicKey` matches what `x402.syncAgentsFromDevices()` re-derives.

The harness deliberately does **not** seed `x402.agent.*` keys. That reproduces
the "no agents after login" state and proves the self-heal path works: after
boot, `x402.agents.index` should contain the reconstructed agent indexes.

Note: the harness must navigate to `/` after seeding (not `reload()`), because
reloading a deep route skips the splash/router entry point.
