export type UserRole = 'consumer' | 'merchant'

export type StellarNetwork = 'testnet' | 'mainnet'

export interface SecuritySettings {
  biometricLockEnabled: boolean
  /** Auto-lock after this many seconds in the background. */
  backgroundLockTimeoutSec: number
}

export interface User {
  id: string
  email: string
  phoneNumber: string
  stellarPublicKey: string
  kycLevel: number
  role: UserRole
}

export interface Device {
  id: string
  userId: string
  deviceUidHash: string
  label: string
  status: 'active' | 'frozen' | 'lost' | 'deactivated'
  dailySpendLimitCents: number
  accumulatedTodayCents: number
  lastTapAt: string | null
  createdAt: string
}

export interface Transaction {
  id: string
  stellarTxHash: string | null
  merchantId: string
  merchantName: string
  userId: string
  deviceId: string
  amountCents: number
  assetCode: 'USDC' | 'XLM' | 'PHP'
  status: 'pending' | 'confirmed' | 'failed'
  errorMessage: string | null
  createdAt: string
}

export interface Balance {
  php: number
  usdc: number
  xlm: number
  localTokens: Record<string, number>
}

export interface MerchantSettings {
  autoConvertToFiat: boolean
  autoConvertThresholdCents: number
  dailyBankSweep: boolean
  payoutPreference: 'crypto_usdc' | 'crypto_xlm' | 'fiat_php'
}

export interface NFCTag {
  uid: string
  type: string
  isWritable: boolean
  maxCapacity: number
}
