# Noir Wallet

x402 — Contactless payments powered by Stellar.

Tap any RFID sticker, NFC card, or wearable device to pay instantly. No app opens. No confirmation needed. Just tap and go.

## x402 Protocol

Noir Wallet implements the **x402 protocol** — a zero-interaction payment flow where the wallet is debited immediately upon hardware tap. The user never unlocks their phone, opens an app, or confirms a transaction. The payment terminal reads the device UID, resolves the linked Stellar wallet, and executes the transfer in under 2 seconds.

This makes it suitable for high-throughput environments: transit turnstiles, campus canteens, event gates, and retail checkout.

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

## Repo Structure

```
├── frontend/          React Native Expo app (consumer + merchant)
│   ├── src/
│   │   ├── screens/       Welcome, Dashboard, POS, Device Link
│   │   ├── components/    BalanceCard, NumericKeypad, ReadyToTap
│   │   ├── services/      NFC, Stellar SDK, API client
│   │   ├── store/         Zustand state
│   │   ├── hooks/         useNfc
│   │   └── navigation/    Tab + Stack navigators
│   ├── App.tsx
│   └── app.json
├── contracts/         Soroban smart contracts (Rust)
├── Cargo.toml         Rust workspace
└── backendtodo.md     Backend integration notes
```

## Frontend Quickstart

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS simulator.

## Environment

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_STELLAR_MASTER_KEY_ID` | Stellar master key ID |
| `EXPO_PUBLIC_CHANNEL_SECRET_KEY` | Fee channel secret |
| `EXPO_PUBLIC_ISSUER_ADDRESS` | Asset issuer address |
| `EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT` | Soroban contract ID |

## Stellar Integration

- **Network**: Stellar (testnet / mainnet)
- **Assets**: XLM, USDC, custom issuer assets
- **Smart Contracts**: Soroban `device_registry` for hardware-to-wallet mapping
- **Settlement**: Near-instant via Stellar consensus + optional PDAX fiat conversion

## License

MIT
