import { create } from 'zustand'
import { User, Device, Transaction, Balance, MerchantSettings, UserRole } from '@/types'

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

  setUser: (user: User | null) => void
  setDevices: (devices: Device[]) => void
  addDevice: (device: Device) => void
  updateDevice: (id: string, updates: Partial<Device>) => void
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  setBalance: (balance: Balance) => void
  updateBalance: (updates: Partial<Balance>) => void
  setMerchantSettings: (settings: MerchantSettings | null) => void
  setIsOnboarded: (val: boolean) => void
  setIsWalletCreated: (val: boolean) => void
  setActiveRole: (role: UserRole) => void
  setIsScanning: (val: boolean) => void
  setNfcSupported: (val: boolean) => void
  reset: () => void
}

const initialState = {
  user: null,
  devices: [],
  transactions: [],
  balance: { php: 0, usdc: 0, xlm: 0, localTokens: {} },
  merchantSettings: null,
  isOnboarded: false,
  isWalletCreated: false,
  activeRole: 'consumer' as UserRole,
  isScanning: false,
  nfcSupported: false,
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
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((s) => ({ transactions: [transaction, ...s.transactions] })),
  setBalance: (balance) => set({ balance }),
  updateBalance: (updates) =>
    set((s) => ({ balance: { ...s.balance, ...updates } })),
  setMerchantSettings: (merchantSettings) => set({ merchantSettings }),
  setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
  setIsWalletCreated: (isWalletCreated) => set({ isWalletCreated }),
  setActiveRole: (activeRole) => set({ activeRole }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setNfcSupported: (nfcSupported) => set({ nfcSupported }),
  reset: () => set(initialState),
}))
