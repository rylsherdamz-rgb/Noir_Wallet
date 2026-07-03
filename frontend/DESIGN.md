# Noir Wallet — UI Design

> **Tap into Trust.** A minimal, premium, NFC-enabled crypto wallet on Stellar.
> The brand promise is *invisible technology*: payments that just work with a tap.

## 1. Product Overview

Noir is a mobile crypto wallet (Expo React Native + expo-router) that lets people
pay and get paid by tapping NFC/RFID cards and stickers, settled on the **Stellar**
network (XLM / USDC) with PHP fiat on/off-ramps via the backend.

Two roles share one app:

- **Consumer** — holds balances, links NFC devices (cards/stickers/keyfobs), taps to pay, cashes in/out.
- **Merchant** — runs a POS terminal, enters an amount, accepts a customer tap, tracks sales.

The Rust/Stellar backend handles auth, device registry (Soroban `device_registry`
contract), payment initiation/settlement, channels, and PDAX fiat rails. The app talks
to it through `src/services/api.ts` and reads chain data through `src/services/stellar.ts`.

## 2. Brand & Design System

### 2.1 Principles
- **Invisible** — the UI recedes; content and the tap moment are the heroes.
- **Trusted** — clear states, honest confirmations, visible security.
- **Premium** — generous spacing, restrained color, precise geometry.
- **Effortless** — one primary action per screen, large tap targets.

### 2.2 Color palette (dark-first, always on black)

| Token | Hex | Use |
|---|---|---|
| `black` | `#000000` | App background |
| `surfaceBg` | `#0A0A0A` | Elevated base |
| `cardBg` | `#141414` | Cards, sheets |
| `midGrey` | `#1E1E1E` | Inputs, secondary surfaces |
| `lightGrey` | `#2C2C2C` | Pressed/hover |
| `borderGrey` | `#3A3A3A` | Hairline borders |
| `mutedWhite` | `#A9A9A9` | Secondary text |
| `white` | `#FFFFFF` | Primary text |
| `cream` | `#EDE4D0` | Primary brand / headings on dark |
| `gold` | `#C6A15B` | **Primary accent** (CTAs, active, highlights) |
| `goldDim` | `#A98A43` | Pressed gold, gradients |
| `silver` | `#CECCD0` | Secondary accent, monochrome states |
| `success` | `#3ED598` | Confirmed / positive |
| `warning` | `#F0B429` | Pending |
| `danger` | `#FF5A5F` | Failed / destructive |

Gold is the single hero accent (replacing the old neon green). Semantic colors are
reserved strictly for transaction status.

### 2.3 Logo
- Geometric **cat head** mark + `NOIR` wordmark with `TAP INTO TRUST` tagline.
- Always on black/very dark surfaces; keep clear space = mark height.
- App icon / small sizes: cat mark only.
- Implemented as `components/brand/NoirLogo.tsx` (mark, wordmark, and `lockup` variants).
  The faceted cat is rendered with `react-native-svg`; a raster fallback lives in `assets/`.

### 2.4 Typography
- System font stack (SF Pro / Roboto). Wordmark uses wide letter-spacing (`NOIR` = +8).
- Scale (`FontSize`): xs 12, sm 14, md 16, lg 20, xl 24, xxl 32, xxxl 48, hero 64.
- Weights: regular 400, medium 500, semibold 600, bold 700, heavy 800.
- Balances/amounts use `heavy`; labels use `medium` uppercase with letter-spacing.

### 2.5 Spacing, radius, elevation
- Spacing scale: 4 / 8 / 16 / 24 / 32 / 48.
- Radius: sm 8, md 12, lg 16, xl 24, full.
- Cards: `cardBg` + 1px `borderGrey`, radius lg. No heavy shadows (flat premium look);
  gold glow only on the active tap surface.

### 2.6 Iconography
- `@expo/vector-icons` Ionicons, 1.5–2px equivalent weight, `silver`/`mutedWhite`
  default, `gold` when active.

## 3. Navigation / Information Architecture

```
Root (Stack)
├─ index            → boot/splash → route by { isOnboarded, isLocked }
├─ onboarding       → WelcomeScreen (brand, role choose, create/import wallet)
├─ lock             → app lock (biometric / passcode) [added]
└─ (tabs)
   ├─ index         → Wallet (consumer) | Terminal (merchant)
   ├─ pay/pos       → Pay (consumer tap) | Sales (merchant)
   ├─ devices       → NFC device provisioning & management
   └─ settings      → profile, security, role switch, network [added]
```

Role is a global toggle (`useAppStore.activeRole`) that reskins tab titles/icons and
swaps the home + second tab between consumer and merchant surfaces.

## 4. Screens

### 4.1 Splash / Boot (`app/index.tsx`)
- Black screen, centered animated **cat mark** (subtle fade + scale), gold activity ring.
- Routes to `onboarding`, `lock`, or `(tabs)`.

### 4.2 Onboarding — `WelcomeScreen`
- Full-bleed black, large cat lockup, tagline `TAP INTO TRUST`.
- Value props carousel: *Invisible · Trusted · Connected · Effortless*.
- Primary CTA (gold): **Create Wallet** → generates Stellar keypair, funds on testnet.
- Secondary (ghost): **I already have a wallet** (import).
- Role hint: segmented `Consumer / Merchant` (defaults Consumer).

### 4.3 Wallet Home (consumer) — `DashboardScreen`
- Header: greeting + truncated Stellar address (mono), role switch chip, notifications.
- **BalanceCard**: total in ₱ (hero, cream), ≈ USD sub; asset rows XLM / USDC / PHP with
  gold/silver accents; stale indicator when balance fetch fails.
- Quick actions (4): Cash In, Cash Out, Link Device, Pay — gold-tinted circular icons.
- Linked devices strip (status + remaining daily limit).
- Recent transactions (`TransactionItem`): status color, amount sign, tx hash when confirmed.
- Pull-to-refresh.

### 4.4 Pay (consumer) — tap-to-pay
- `ReadyToTapIndicator` radar animation (gold), amount display.
- Flow: choose asset → confirm terms → **hold near reader** → success/fail result.
- Uses `useNfc` + `nfcService`; session always closed; cancel returns to prior screen.

### 4.5 Merchant Terminal / POS — `MerchantPosScreen`
- `NumericKeypad` amount entry (₱), `ReadyToTapIndicator`, **Tap Card Here** CTA.
- Processing → success (checkmark, gold) / failed (danger). Recent taps list.

### 4.6 Devices — `DeviceProvisioningScreen`
- List of `PairedDevice`s with label, status (active/frozen/lost), daily limit.
- **Link a device**: scan NFC → confirm UID hash → name it → set daily limit → register.
- Per-device actions: freeze/unfreeze, rename, remove.

### 4.7 Settings [new]
- Profile (email, address, KYC level), Security (biometric lock toggle, background-lock
  timeout), Network (testnet/mainnet), Role switch, About/legal.

## 5. Reusable Components
`NoirLogo`, `BalanceCard`, `AssetRow`, `TransactionItem`, `NumericKeypad`,
`ReadyToTapIndicator`, `PrimaryButton` (gold), `GhostButton`, `Card`, `SectionHeader`,
`StatusPill`, `StaleBanner`, `EmptyState`, `ScreenHeader`.

## 6. Interaction & States
- **NFC**: capability checked at boot (`nfcSupported`); unsupported → clear message + no
  tap entry. Every scan session is explicitly ended (success, cancel, decode error, timeout).
- Every list/data surface defines **loading / empty / error(stale)** states.
- Money is handled in integer **cents**; display formatting only at the edge.
- Result feedback uses haptics (`expo-haptics`) + color + icon.

## 7. Accessibility
- Minimum 44×44 tap targets; gold-on-black and cream-on-black meet WCAG AA for text sizes used.
- All actionable icons have `accessibilityLabel`; status conveyed by icon + text, not color alone.

## 8. Implementation Notes
- Theme lives in `src/constants/theme.ts` (add `gold`, `goldDim`, `cream`, `silver`,
  `success`, `warning`, `danger`; migrate former `accentGreen` usages to `gold`).
- Keep existing architecture: `app/` routes, `src/screens`, `src/components`,
  `src/services`, `src/store/useAppStore`, `src/constants`.
- No secret keys in the bundle beyond what already exists; signing/settlement stays
  server-side via `api.ts` where possible.
- Target: TypeScript compiles clean (`tsc --noEmit`), app boots to onboarding.
