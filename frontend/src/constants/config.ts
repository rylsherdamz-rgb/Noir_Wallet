import Constants from 'expo-constants'

const ENV = {
  dev: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    apiBaseUrl: 'http://localhost:3000/api/v1',
    pdaxApiBaseUrl: 'https://api-sandbox.pdax.ph',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
  },
  prod: {
    horizonUrl: 'https://horizon.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    apiBaseUrl: 'https://api.noirwallet.com/api/v1',
    pdaxApiBaseUrl: 'https://api.pdax.ph',
    sorobanRpcUrl: 'https://soroban.stellar.org',
  },
}

const getEnvVars = () => {
  if (__DEV__) return ENV.dev
  return ENV.prod
}

export const Config = getEnvVars()

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
  limits: {
    defaultDailySpendCents: 500000,
    maxTapAmountCents: 5000000,
    minKycForHighLimits: 2,
  },
}
