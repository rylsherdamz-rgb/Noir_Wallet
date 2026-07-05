# Noir Wallet

**x402 — Contactless payments powered by Stellar. No app opens. No confirmation. Just tap and go.**

**Live preview:** *Coming soon*

## Project Description

Noir Wallet implements the **x402 protocol** — a zero-interaction payment flow where the wallet is debited immediately upon hardware tap. The user never unlocks their phone, opens an app, or confirms a transaction. The payment terminal reads the device UID, resolves the linked Stellar wallet, and executes the transfer in under 2 seconds.

Built for high-throughput environments: transit turnstiles, campus canteens, event gates, and retail checkout.

## Project Vision

A world where:
- Your wallet is your identity — linked to an RFID sticker, NFC card, or wearable
- Payments happen without friction — no app, no confirmation, no delay
- Settlement is instant — powered by Stellar consensus
- Merchants settle in their preferred currency — via the PDAX fiat bridge

## Key Features

- **Zero-Interaction Payments**: Tap any RFID sticker, NFC card, or wearable to pay instantly
- **x402 Protocol**: Wallet debited on hardware tap — no unlock, no app, no confirmation
- **Stellar-Powered**: Fast, low-cost settlement via the Stellar network
- **Soroban Smart Contracts**: `device_registry` for hardware-to-wallet mapping
- **PDAX Fiat Bridge**: Optional PHP cash-out via PDAX integration
- **Custom Agents**: Per-device agent wallets with independent balances
- **NFC Provisioning**: Link new devices directly from the app
- **Dark Theme**: Premium noir aesthetic with gold accents
- **Cross-Platform**: React Native Expo app for iOS and Android

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Stellar (testnet / mainnet) |
| Smart Contracts | Soroban (Rust) |
| Frontend | React Native, Expo 57, TypeScript |
| Styling | NativeWind, Tailwind CSS |
| State | Zustand |
| NFC | react-native-nfc-manager |
| Wallet SDK | @stellar/stellar-sdk |
| Testing | Vitest |

## Architecture

```
RFID / NFC Tag
    |
    v
POS Terminal / NFC Phone (Reader)
    |
    v
IoT Payment Gateway API  ──>  device_registry (Soroban)
    |                              |
    v                              v
Stellar Network  ──>  Merchant Settlement
    |
    v
PDAX Fiat Bridge (PHP Cash-out)
```

### Smart Contracts

| Contract | Description | Location |
|----------|-------------|----------|
| **device_registry** | Maps hardware device UIDs to Stellar wallet addresses | `frontend/contracts/device_registry/` |

### Frontend Architecture

```
frontend/
├── app/              Expo Router pages (tabs, onboarding, settings)
├── src/
│   ├── screens/      Welcome, Dashboard, POS, Device Link, Agents
│   ├── components/   BalanceCard, NumericKeypad, ReadyToTap, etc.
│   ├── services/     NFC, Stellar SDK, API client, wallet
│   ├── store/        Zustand state management
│   ├── hooks/        useNfc, custom hooks
│   └── constants/    Theme (black/gold), config
└── contracts/        Soroban device registry smart contract
```

## Getting Started

### Prerequisites
- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Stellar testnet wallet (Freighter extension or custom)

### Setup

```bash
# Clone and install
git clone https://github.com/rylsherdamz-rgb/Noir_Wallet.git
cd Noir_Wallet/frontend
npm install
```

### Environment

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_STELLAR_MASTER_KEY_ID` | Stellar master key ID |
| `EXPO_PUBLIC_CHANNEL_SECRET_KEY` | Fee channel secret |
| `EXPO_PUBLIC_ISSUER_ADDRESS` | Asset issuer address |
| `EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT` | Soroban contract ID |

### Run Development Server

```bash
cd frontend
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS simulator.

### Smart Contract Development

```bash
cd frontend/contracts/device_registry
cargo build --release --target wasm32-unknown-unknown
cargo test
```

### Run Tests

```bash
cd frontend
npm test
```

## Screenshots

*Screenshots coming soon.*

## License

MIT
