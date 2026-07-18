import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { secureGetItem, secureSetItem, secureDeleteItem } from '@/services/secureStorage'
import { stellarService } from '@/services/stellar-service'
import { stellarNetwork, AppConfig } from '@/constants/config'
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

// Bump this when contracts are redeployed to invalidate stale local state.
// Computed from the current contract IDs so a config change auto-clears old data.
const STORE_VERSION_HASH = hashContractIds()

function hashContractIds(): string {
  const ids = [
    AppConfig.stellar.deviceRegistryContract,
    AppConfig.stellar.agentRegistryContract,
  ].filter(Boolean).join('|')
  // Simple short hash — not cryptographic, just a cache-buster
  let h = 0
  for (let i = 0; i < ids.length; i++) {
    const c = ids.charCodeAt(i)
    h = ((h << 5) - h) + c
    h |= 0
  }
  return 'v1_' + Math.abs(h).toString(36)
}

interface AppState {
  user: User | null
  devices: Device[]
  transactions: Transaction[]
  pendingPayments: QueuedPayment[]
  pendingTxHashes: string[]
  balance: Balance
  merchantSettings: MerchantSettings | null
  isOnboarded: boolean
  isWalletCreated: boolean
  isScanning: boolean
  nfcSupported: boolean

  network: StellarNetwork
  security: SecuritySettings
  balanceStale: boolean
  storeVersion: string

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
  addPendingTxHash: (hash: string) => void
  removePendingTxHash: (hash: string) => void
  clearDeviceData: () => void
  reset: () => void
}

const initialState = {
  user: null,
  devices: [] as Device[],
  transactions: [] as Transaction[],
  pendingPayments: [] as QueuedPayment[],
  pendingTxHashes: [] as string[],
  balance: { xlm: 0 } as Balance,
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
  storeVersion: STORE_VERSION_HASH,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      setDevices: (devices) => set({ devices }),
      addDevice: (device) =>
        set((s) => {
          const idx = s.devices.findIndex(
            (d) => d.id === device.id || d.deviceUidHash === device.deviceUidHash
          )
          if (idx >= 0) {
            return { devices: s.devices.map((d, i) => (i === idx ? { ...d, ...device } : d)) }
          }
          return { devices: [...s.devices, device] }
        }),
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
      addPendingTxHash: (hash) =>
        set((s) => ({ pendingTxHashes: s.pendingTxHashes.includes(hash) ? s.pendingTxHashes : [...s.pendingTxHashes, hash] })),
      removePendingTxHash: (hash) =>
        set((s) => ({ pendingTxHashes: s.pendingTxHashes.filter((h) => h !== hash) })),
      clearDeviceData: () => set({ devices: [], transactions: [], pendingPayments: [], pendingTxHashes: [] }),
      reset: () => set(initialState),
    }),
    {
      name: 'noir-wallet',
      storage: createJSONStorage(() => ({
        getItem: (name) => secureGetItem(name),
        setItem: (name, value) => secureSetItem(name, value),
        removeItem: (name) => secureDeleteItem(name),
      })),
      partialize: (state) => ({
        user: state.user,
        devices: state.devices,
        pendingPayments: state.pendingPayments,
        pendingTxHashes: state.pendingTxHashes,
        isOnboarded: state.isOnboarded,
        isWalletCreated: state.isWalletCreated,
        network: state.network,
        security: state.security,
        storeVersion: state.storeVersion,
      }) as unknown as AppState,
      onRehydrateStorage: () => (state) => {
        if (state?.network) stellarService.setNetwork(state.network)
        if (state && state.storeVersion !== STORE_VERSION_HASH) {
          useAppStore.setState({
            devices: [],
            transactions: [],
            pendingPayments: [],
            pendingTxHashes: [],
            storeVersion: STORE_VERSION_HASH,
          })
        } else if (state) {
          // Deduplicate devices by deviceUidHash — keep the last entry for each hash
          const seen = new Set<string>()
          const deduped = state.devices.filter((d) => {
            if (seen.has(d.deviceUidHash)) return false
            seen.add(d.deviceUidHash)
            return true
          })
          if (deduped.length !== state.devices.length) {
            useAppStore.setState({ devices: deduped })
          }
        }
      },
    },
  ),
)
