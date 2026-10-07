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

/**
 * Contract IDs per network.
 *
 * A contract deployed to testnet does not exist on mainnet. The network toggle
 * used to re-point the RPC while leaving a single set of contract IDs in place,
 * so switching to mainnet sent calls to addresses that resolve nowhere.
 *
 * `process.env` keys must be written out literally — Expo inlines them at build
 * time and cannot resolve a computed key.
 */
const CONTRACTS = {
  testnet: {
    issuerAddress: process.env.EXPO_PUBLIC_ISSUER_ADDRESS ?? '',
    deviceRegistryContract: process.env.EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT ?? '',
    agentRegistryContract: process.env.EXPO_PUBLIC_AGENT_REGISTRY_CONTRACT ?? '',
    paymentEscrowContract: process.env.EXPO_PUBLIC_PAYMENT_ESCROW_CONTRACT ?? '',
  },
  mainnet: {
    issuerAddress: process.env.EXPO_PUBLIC_ISSUER_ADDRESS_MAINNET ?? '',
    deviceRegistryContract: process.env.EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT_MAINNET ?? '',
    agentRegistryContract: process.env.EXPO_PUBLIC_AGENT_REGISTRY_CONTRACT_MAINNET ?? '',
    paymentEscrowContract: process.env.EXPO_PUBLIC_PAYMENT_ESCROW_CONTRACT_MAINNET ?? '',
  },
} as const

export type StellarNetworkName = keyof typeof CONTRACTS

export function contractsFor(network: StellarNetworkName) {
  return CONTRACTS[network]
}

/**
 * The network the app is currently pointed at. Held here rather than read from
 * the store so `config` stays free of a circular import; the store's
 * `setNetwork` is the single writer.
 */
let activeNetwork: StellarNetworkName = stellarNetwork

export function setActiveContractNetwork(network: StellarNetworkName): void {
  activeNetwork = network
}

export function getActiveContractNetwork(): StellarNetworkName {
  return activeNetwork
}

/** False when the given network has no deployment recorded for the contract chain. */
export function hasContractsConfigured(network: StellarNetworkName = activeNetwork): boolean {
  const c = CONTRACTS[network]
  return Boolean(c.deviceRegistryContract && c.agentRegistryContract && c.paymentEscrowContract)
}

export const AppConfig = {
  appName: 'Noir Wallet',
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
  // Getters, so every existing `AppConfig.stellar.x` read resolves against the
  // network that is live right now rather than the one present at import time.
  stellar: {
    get issuerAddress() {
      return CONTRACTS[activeNetwork].issuerAddress
    },
    get deviceRegistryContract() {
      return CONTRACTS[activeNetwork].deviceRegistryContract
    },
    get agentRegistryContract() {
      return CONTRACTS[activeNetwork].agentRegistryContract
    },
    get paymentEscrowContract() {
      return CONTRACTS[activeNetwork].paymentEscrowContract
    },
  },
  nfc: {
    readTimeout: 5000,
    writeTimeout: 10000,
  },
  terminal: {
    id: process.env.EXPO_PUBLIC_TERMINAL_ID ?? '',
    publicKey: process.env.EXPO_PUBLIC_TERMINAL_PUBLIC_KEY ?? '',
  },
  limits: {
    defaultDailySpendCents: 500000,
    maxTapAmountCents: 5000000,
  },
}
