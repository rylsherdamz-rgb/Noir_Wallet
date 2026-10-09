# Noir Wallet — Design System

The single source of truth for how every screen looks and behaves.
**Onboarding (`WelcomeScreen`, `IntroScreen`) is the reference
implementation**: when in doubt, make a screen look like those. Token values
live in `src/constants/designTokens.ts` (re-exported by `src/constants/theme.ts`);
this file says *how* to use them. Never hardcode a hex, font size, or radius
in a screen.

Visual mockups of the core screens live in the "Noir Wallet Screens" design
canvas (private claude.ai artifact, link in the PR description).

---

## 1. Brand in one line

A calm Stellar wallet in the MetaMask / Phantom / Freighter tradition: warm
near-black surfaces, one metal accent (gold) reserved for the brand and the
primary action, Jost for names and numbers, and the Noir cat only at brand
moments. Flat, quiet, list-based — no decoration for decoration's sake.

## 2. Logo

- The cat appears **only at brand moments**: app icon, splash, Welcome, intro,
  lock ("Welcome back"), loading (`VerifyingPulse`), empty states and the 404.
- Always **flat on the background** — no ring, hexagon, frame or glow.
- The **NOIR wordmark** (+ "TAP INTO TRUST") only on splash and Welcome
  (`brand/BrandMark`).
- Working screens show the **account**, not the logo (Wallet home header).
- Receipts carry a small "Noir Wallet" mark because they leave the app.

## 3. Color

| Role | Token (`Colors.*`) | Hex | Use |
|---|---|---|---|
| App background | `surfaceBg` | `#0A0A0A` | Every screen |
| Filled control | `midGrey` | `#1E1E1E` | Inputs, chips, action discs, secret boxes |
| Raised surface | `Gradient.elevated` | `#191919` | Popups, sheets, menus |
| Divider | `Gradient.panel` | `#242424` | Hairlines between list rows |
| Primary text | `white` | `#FFFFFF` | Values, amounts, row titles |
| Heading text | `cream` | `#EDE4D0` | Titles, names |
| Body / secondary | `silver` / `mutedWhite` | `#CECCD0` / `#A9A9A9` | Paragraphs / captions, labels |
| Brand accent | `gold` | `#C6A15B` | Primary button, active tab, links, brand icons |
| On gold | `onGold` | `#151107` | Text on a gold fill |
| Network | `testnet` / `mainnet` | `#7C93B5` / `#3ED598` | **Only** in the network chip & menu |
| Status | `success` / `warning` / `danger` | | Status text, never decoration |

Gold is never a network colour and never decoration. ~70/20/10: neutral
surfaces, white/cream text, gold only where the eye should go.

## 4. Typography

Jost for names and numbers (titles, amounts, buttons, the wordmark); system
font for reading. Sentence case everywhere (no Title Case, no shouted
uppercase labels). Numbers use tabular figures.

| Style | Font | Size | Colour |
|---|---|---|---|
| Tab-root title (`PageTitle`) | Jost SemiBold | 28 | cream |
| Screen title (`ScreenHeader`) | Jost SemiBold | 17, centred | cream |
| Hero amount | Jost SemiBold | 40–52 + asset in Jost Medium muted | white |
| Section label (`SectionLabel`) | system 500 | 13 | mutedWhite |
| Row title / value | system 500 | 15 | white |
| Caption | system | 12–13 | mutedWhite |
| Button | Jost SemiBold | 16, sentence case | onGold / white |
| Mono | `Fonts.mono` | 12–14 | addresses, keys, hashes |

Never put `fontWeight` on a Jost style — the weight is in the font file.

## 5. Layout

- 20px side gutters; list rows ≥ 60px; key/value rows 52px.
- **Flat lists, not cards**: rows separated by hairlines (`ui/List`). A
  container must earn its boundary (QR card, secret box, sheet).
- **One primary action per screen**, a gold pill pinned at the bottom;
  secondary actions are quiet text (`TextAction`).
- Headers: back chevron / ✕ left, centred title (`ScreenHeader`); tab roots
  use a large left `PageTitle`.

## 6. Components (use these, don't restyle locally)

| Need | Component |
|---|---|
| Buttons | `Button` — solid pill; `primary` gold, `secondary` filled grey, `ghost` quiet text, `danger` red. No gradients, no glow. |
| Lists | `ui/List`: `PageTitle`, `SectionLabel`, `ListRow`, `KeyValueRow`, `TextAction` |
| Errors / blocked states | `ui/ErrorState` (+ `NetworkTag`) |
| Network | `NetworkPicker` — chip + dropdown, always confirms the switch |
| Popups | `popup/Popup`: `Dialog`, `Sheet`, `SignSheet`, `popup.confirm()`, `popup.sign()`, `popup.notice()` — never `Alert.alert` |
| Amounts | `AmountText`, `AssetChip` (SendScreen), `flow/AmountEntry`, flat `NumericKeypad` |
| Loading | `brand/VerifyingPulse` (breathing cat) — never a bare spinner |
| Brand moment | `brand/BrandMark`, `brand/BrandBackdrop` |

Icons: Ionicons outline, drawn **inline** — never inside a tinted circle or
square (avatars and the round action discs on Wallet/Agent are buttons).

### Popups

Plain elevated card, hairline border. Dialog = question as the title, one
line of context, optional detail rows, one button + quiet "Cancel". Sheets
close by swipe-down or backdrop tap (no ✕, no Cancel).

**Signing is always a bottom sheet** (`SignSheet` / `popup.sign()`), never a
centred dialog: anything that signs a Stellar transaction (send, withdraw,
revoke, link) rises from the bottom with what is being signed and a
fingerprint "Sign…" button + quiet "Cancel" at thumb reach. Dialogs are for
decisions that sign nothing (remove from this phone, reveal, switch network).

## 7. Patterns

- **Money screens**: asset chip → big amount → Available / Max → quick chips →
  keypad → one button.
- **Review**: "You're sending X" → `KeyValueRow`s → note → Confirm.
- **Errors** (`ErrorState`): icon · title · one sentence on what happened and
  what to do · one primary · quiet secondary · "Technical details".
  Network-aware: an unfunded wallet gets free test XLM on Testnet, but on
  Mainnet the screen shows the address to fund (Friendbot is Testnet-only).
- **Status** is coloured text, not a boxed pill.

## 8. Motion

150–300ms, purposeful only (press feedback, sheet slide, dialog fade). No
entrance animations on content. The loading cat breathes. Honour
`useReducedMotion()`.

## 9. Touch-only payment rules

### 9.1 Interaction Rules

#### 9.1.1 The "Tap-and-Go" Principle
- **Zero Confirmation**: For transactions under a set threshold (e.g., ₱500), no user confirmation is required on the phone. The hardware tap *is* the confirmation.
- **Immediate Feedback**: Haptic feedback (long vibration) and a visual "Success" animation must occur within 500ms of a successful tap.
- **Always Ready**: The Merchant POS screen should default to a "Ready to Tap" state. The numeric keypad should be secondary or auto-triggered.

#### 9.1.2 NFC Persistence
- The app should maintain an active NFC session whenever it is in the foreground on the "Pay" or "POS" screens.
- Avoid "Scan" buttons. The user should just hold the device near the reader/tag.

### 9.2 Visual Specs (Noir Mood)

#### 9.2.1 The Gold Glow
- Use a radial gradient or shadow (`gold` with 0.5 opacity) around the `ReadyToTapIndicator`.
- When a device is detected, the glow should "pulse" or expand.

#### 9.2.2 Typography for Amounts
- Use `Fonts.display` for transaction amounts (no `fontWeight` — see §4).
- Primary Currency: **PHP (₱)**. Secondary (dimmed): **XLM**.

#### 9.2.3 Animations
- **Radar**: A continuous ripple effect centered on the cat logo when waiting for a tap.
- **Success**: A circular progress bar that completes and transforms into a `gold` checkmark.

### 9.3 Component Specs

#### 9.3.1 `ReadyToTapIndicator`
- **Idle**: Muted silver cat logo.
- **Searching**: Pulsing gold ring.
- **Success**: Solid gold logo + haptic pulse.

#### 9.3.2 `NumericKeypad`
- Integrated directly into the POS screen, not a modal.
- Large, tactile keys with `midGrey` background and `white` text.
- `gold` "Charge" button that only appears/activates after an amount > 0 is entered.

### 9.4 State Management
- `isNfcActive`: Global boolean in `useAppStore`.
- `lastTransaction`: Store the last successful tap for immediate display on the "Success" screen.
- `tapTimeout`: 30 seconds of inactivity on the Pay screen should trigger a "Still there?" prompt or return to Home.

### 9.5 Security Specs
- **Biometric Unlock**: Required only when the app is first opened or after 10 minutes of inactivity.
- **Daily Limit**: Each linked device has a hard limit managed via the Soroban contract. The app should fetch and display "Remaining Today" on the Home screen.

## 10. Status

Implemented 2026-10-07 across all screens, matching the "Noir Wallet Screens"
design canvas (claude.ai artifact). Card PIN removed — any NFC card or sticker
works and the phone's screen lock is the only PIN. History moved from a tab to
"See all activity"; the fourth tab is Browse (in-app browser, browsing only —
websites get no wallet bridge).
