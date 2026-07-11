import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import { stellarService } from '@/services/stellar-service'
import { stellarNetwork } from '@/constants/config'
import {
  User,
  Device,
  Transaction,
  Balance,
  MerchantSettings,
  StellarNetwork,
  SecuritySettings,
  QueuedPayment,
} from '@/types'

interface AppState {
  user: User | null
  devices: Device[]
  transactions: Transaction[]
  pendingPayments: QueuedPayment[]
  balance: Balance
  merchantSettings: MerchantSettings | null
  isOnboarded: boolean
  isWalletCreated: boolean
  isScanning: boolean
  nfcSupported: boolean

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
  setIsScanning: (val: boolean) => void
  setNfcSupported: (val: boolean) => void
  setNetwork: (network: StellarNetwork) => void
  setBiometricLockEnabled: (val: boolean) => void
  setBackgroundLockTimeoutSec: (sec: number) => void
  addPendingPayment: (payment: QueuedPayment) => void
  removePendingPayment: (id: string) => void
  clearPendingPayments: () => void
  reset: () => void
}

const initialState = {
  user: null,
  devices: [] as Device[],
  transactions: [] as Transaction[],
  pendingPayments: [] as QueuedPayment[],
  balance: { php: 0, usdc: 0, xlm: 0, localTokens: {} } as Balance,
  merchantSettings: null as MerchantSettings | null,
  isOnboarded: false,
  isWalletCreated: false,
  isScanning: false,
  nfcSupported: false,
  network: stellarNetwork as StellarNetwork,
  security: {
    biometricLockEnabled: false,
    backgroundLockTimeoutSec: 60,
  } as SecuritySettings,
  balanceStale: false,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
      setIsScanning: (isScanning) => set({ isScanning }),
      setNfcSupported: (nfcSupported) => set({ nfcSupported }),
      setNetwork: (network) => {
        // Keep the on-chain service in lock-step with the UI toggle, otherwise
        // the app queries one network while the explorer link points at another.
        stellarService.setNetwork(network)
        set({ network })
      },
      setBiometricLockEnabled: (val) =>
        set((s) => ({ security: { ...s.security, biometricLockEnabled: val } })),
      setBackgroundLockTimeoutSec: (sec) =>
        set((s) => ({ security: { ...s.security, backgroundLockTimeoutSec: sec } })),
      addPendingPayment: (payment) =>
        set((s) => ({ pendingPayments: [...s.pendingPayments, payment] })),
      removePendingPayment: (id) =>
        set((s) => ({ pendingPayments: s.pendingPayments.filter((p) => p.id !== id) })),
      clearPendingPayments: () => set({ pendingPayments: [] }),
      reset: () => set(initialState),
    }),
    {
      name: 'noir-wallet',
      storage: createJSONStorage(() => ({
        getItem: (name) => SecureStore.getItemAsync(name),
        setItem: (name, value) => SecureStore.setItemAsync(name, value),
        removeItem: (name) => SecureStore.deleteItemAsync(name),
      })),
      partialize: (state) => ({
        user: state.user,
        devices: state.devices,
        pendingPayments: state.pendingPayments,
        isOnboarded: state.isOnboarded,
        isWalletCreated: state.isWalletCreated,
        network: state.network,
        security: state.security,
      }) as unknown as AppState,
      onRehydrateStorage: () => (state) => {
        // The persisted network must be re-applied to the singleton service,
        // which was constructed from env before this state was restored.
        if (state?.network) stellarService.setNetwork(state.network)
      },
    },
  ),
)
