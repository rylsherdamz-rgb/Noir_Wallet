import Constants from 'expo-constants'

const ENV = {
  dev: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    apiBaseUrl: 'http://localhost:8080',
    pdaxApiBaseUrl: 'https://api-sandbox.pdax.ph',
    // Use Stellar's public RPC. A third-party indexer can lag Horizon or omit
    // classic-account entries, even when the account is confirmed on testnet.
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
  },
  prod: {
    horizonUrl: 'https://horizon.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    apiBaseUrl: 'https://noir-backend-646705730224.us-central1.run.app',
    pdaxApiBaseUrl: 'https://api.pdax.ph',
    sorobanRpcUrl: 'https://soroban.stellar.org',
  },
}

const getEnvVars = () => {
  const env = process.env.EXPO_PUBLIC_STELLAR_NETWORK === 'mainnet' ? ENV.prod
    : process.env.EXPO_PUBLIC_STELLAR_NETWORK === 'testnet' ? ENV.dev
    : __DEV__ ? ENV.dev : ENV.prod
  return {
    ...env,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || env.apiBaseUrl,
  }
}

export const Config = getEnvVars()

export const stellarNetwork: 'testnet' | 'mainnet' =
  process.env.EXPO_PUBLIC_STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'

export const apiKey = process.env.EXPO_PUBLIC_API_KEY ?? ''

export const AppConfig = {
  appName: 'Noir Wallet',
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
  stellar: {
    masterKeyId: process.env.EXPO_PUBLIC_STELLAR_MASTER_KEY_ID ?? '',
    channelSecretKey: process.env.EXPO_PUBLIC_CHANNEL_SECRET_KEY ?? '',
    issuerAddress: process.env.EXPO_PUBLIC_ISSUER_ADDRESS ?? '',
    deviceRegistryContract: process.env.EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT ?? '',
  },
  nfc: {
    readTimeout: 5000,
    writeTimeout: 10000,
  },
  pdax: {
    apiKey: process.env.EXPO_PUBLIC_PDAX_API_KEY ?? '',
    webhookSecret: process.env.EXPO_PUBLIC_PDAX_WEBHOOK_SECRET ?? '',
  },
  terminal: {
    id: process.env.EXPO_PUBLIC_TERMINAL_ID ?? '',
    apiKey: process.env.EXPO_PUBLIC_TERMINAL_API_KEY ?? '',
    publicKey: process.env.EXPO_PUBLIC_TERMINAL_PUBLIC_KEY ?? '',
  },
  limits: {
    defaultDailySpendCents: 500000,
    maxTapAmountCents: 5000000,
    minKycForHighLimits: 2,
  },
}
