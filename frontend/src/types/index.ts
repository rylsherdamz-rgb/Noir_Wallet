export type UserRole = 'consumer' | 'merchant'

export type StellarNetwork = 'testnet' | 'mainnet'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type TxFilter = 'all' | 'pending' | 'confirmed' | 'failed'

export type AssetCode = 'USDC' | 'XLM' | 'PHP'

export interface SecuritySettings {
  biometricLockEnabled: boolean
  backgroundLockTimeoutSec: number
}

export interface User {
  id: string
  email: string
  phoneNumber: string
  stellarPublicKey: string
  kycLevel: number
  role: UserRole
  displayName: string
  avatarUrl?: string
}

export interface Device {
  id: string
  userId: string
  deviceUidHash: string
  label: string
  agentPublicKey?: string
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
  assetCode: AssetCode
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

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
  isTyping?: boolean
}

export interface SmartTip {
  id: string
  title: string
  description: string
  icon: string
  action?: { label: string; route: string }
  dismissible: boolean
}

export interface Notification {
  id: string
  title: string
  body: string
  type: 'transaction' | 'security' | 'system' | 'promo'
  read: boolean
  createdAt: string
  data?: Record<string, string>
}

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export interface X402Agent {
  publicKey: string
  privateKeyEncrypted?: string
  balanceStroops: number
  spendingBudgetStroops: number
  totalSpentStroops: number
  isActive: boolean
  createdAt: string
}

export interface Registration {
  deviceUid: string
  stellarPublicKey: string
  agentPublicKey: string
  deviceLabel: string
  createdAt: string
}

export interface QueuedPayment {
  id: string
  rawDeviceUid: string
  merchantPublicKey: string
  amountCents: number
  assetCode: AssetCode
  terminalId?: string
  nonce?: string
  createdAt: string
  retryCount: number
}
