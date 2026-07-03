import { create } from 'zustand'
import {
  User,
  Device,
  Transaction,
  Balance,
  MerchantSettings,
  UserRole,
  StellarNetwork,
  SecuritySettings,
} from '@/types'

interface AppState {
  user: User | null
  devices: Device[]
  transactions: Transaction[]
  balance: Balance
  merchantSettings: MerchantSettings | null
  isOnboarded: boolean
  isWalletCreated: boolean
  activeRole: UserRole
  isScanning: boolean
  nfcSupported: boolean

  // Settings
  network: StellarNetwork
  security: SecuritySettings
  balanceStale: boolean

  setUser: (user: User | null) => void
  setDevices: (devices: Device[]) => void
  addDevice: (device: Device) => void
  updateDevice: (id: string, updates: Partial<Device>) => void
  removeDevice: (id: string) => void
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  setBalance: (balance: Balance) => void
  updateBalance: (updates: Partial<Balance>) => void
  setBalanceStale: (val: boolean) => void
  setMerchantSettings: (settings: MerchantSettings | null) => void
  setIsOnboarded: (val: boolean) => void
  setIsWalletCreated: (val: boolean) => void
  setActiveRole: (role: UserRole) => void
  setIsScanning: (val: boolean) => void
  setNfcSupported: (val: boolean) => void
  setNetwork: (network: StellarNetwork) => void
  setBiometricLockEnabled: (val: boolean) => void
  setBackgroundLockTimeoutSec: (sec: number) => void
  reset: () => void
}

const initialState = {
  user: null,
  devices: [] as Device[],
  transactions: [] as Transaction[],
  balance: { php: 0, usdc: 0, xlm: 0, localTokens: {} } as Balance,
  merchantSettings: null as MerchantSettings | null,
  isOnboarded: false,
  isWalletCreated: false,
  activeRole: 'consumer' as UserRole,
  isScanning: false,
  nfcSupported: false,
  network: 'testnet' as StellarNetwork,
  security: {
    biometricLockEnabled: false,
    backgroundLockTimeoutSec: 60,
  } as SecuritySettings,
  balanceStale: false,
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setDevices: (devices) => set({ devices }),
  addDevice: (device) => set((s) => ({ devices: [...s.devices, device] })),
  updateDevice: (id, updates) =>
    set((s) => ({
      devices: s.devices.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  removeDevice: (id) =>
    set((s) => ({ devices: s.devices.filter((d) => d.id !== id) })),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((s) => ({ transactions: [transaction, ...s.transactions] })),
  setBalance: (balance) => set({ balance }),
  updateBalance: (updates) =>
    set((s) => ({ balance: { ...s.balance, ...updates } })),
  setBalanceStale: (balanceStale) => set({ balanceStale }),
  setMerchantSettings: (merchantSettings) => set({ merchantSettings }),
  setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
  setIsWalletCreated: (isWalletCreated) => set({ isWalletCreated }),
  setActiveRole: (activeRole) => set({ activeRole }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setNfcSupported: (nfcSupported) => set({ nfcSupported }),
  setNetwork: (network) => set({ network }),
  setBiometricLockEnabled: (val) =>
    set((s) => ({ security: { ...s.security, biometricLockEnabled: val } })),
  setBackgroundLockTimeoutSec: (sec) =>
    set((s) => ({ security: { ...s.security, backgroundLockTimeoutSec: sec } })),
  reset: () => set(initialState),
}))
