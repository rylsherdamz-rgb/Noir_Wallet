# Noir Wallet — Touch-Only Rules & Specs

This document defines the core interaction rules for the "Touch-Only" payment experience of Noir Wallet.

## 1. Interaction Rules

### 1.1 The "Tap-and-Go" Principle
- **Zero Confirmation**: For transactions under a set threshold (e.g., ₱500), no user confirmation is required on the phone. The hardware tap *is* the confirmation.
- **Immediate Feedback**: Haptic feedback (long vibration) and a visual "Success" animation must occur within 500ms of a successful tap.
- **Always Ready**: The Merchant POS screen should default to a "Ready to Tap" state. The numeric keypad should be secondary or auto-triggered.

### 1.2 NFC Persistence
- The app should maintain an active NFC session whenever it is in the foreground on the "Pay" or "POS" screens.
- Avoid "Scan" buttons. The user should just hold the device near the reader/tag.

## 2. Visual Specs (Noir Mood)

### 2.1 The Gold Glow
- Use a radial gradient or shadow (`gold` with 0.5 opacity) around the `ReadyToTapIndicator`.
- When a device is detected, the glow should "pulse" or expand.

### 2.2 Typography for Amounts
- Use `FontWeight.heavy` and `FontSize.hero` for transaction amounts.
- Primary Currency: **PHP (₱)**. Secondary (dimmed): **XLM**.

### 2.3 Animations
- **Radar**: A continuous ripple effect centered on the cat logo when waiting for a tap.
- **Success**: A circular progress bar that completes and transforms into a `gold` checkmark.

## 3. Component Specs

### 3.1 `ReadyToTapIndicator`
- **Idle**: Muted silver cat logo.
- **Searching**: Pulsing gold ring.
- **Success**: Solid gold logo + haptic pulse.

### 3.2 `NumericKeypad`
- Integrated directly into the POS screen, not a modal.
- Large, tactile keys with `midGrey` background and `white` text.
- `gold` "Charge" button that only appears/activates after an amount > 0 is entered.

## 4. State Management
- `isNfcActive`: Global boolean in `useAppStore`.
- `lastTransaction`: Store the last successful tap for immediate display on the "Success" screen.
- `tapTimeout`: 30 seconds of inactivity on the Pay screen should trigger a "Still there?" prompt or return to Home.

## 5. Security Specs
- **Biometric Unlock**: Required only when the app is first opened or after 10 minutes of inactivity.
- **Daily Limit**: Each linked device has a hard limit managed via the Soroban contract. The app should fetch and display "Remaining Today" on the Home screen.
