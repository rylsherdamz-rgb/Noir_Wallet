import { vi } from 'vitest'

// Mock expo-secure-store
const secureStore = new Map<string, string>()
vi.mock('expo-secure-store', () => ({
  default: {
    getItemAsync: vi.fn((key: string) => Promise.resolve(secureStore.get(key) ?? null)),
    setItemAsync: vi.fn((key: string, value: string) => {
      secureStore.set(key, value)
      return Promise.resolve()
    }),
    deleteItemAsync: vi.fn((key: string) => {
      secureStore.delete(key)
      return Promise.resolve()
    }),
  },
  getItemAsync: vi.fn((key: string) => {
    if (key === 'x402.agent.secret') return Promise.resolve(secureStore.get(key) ?? null)
    return Promise.resolve(secureStore.get(key) ?? null)
  }),
  setItemAsync: vi.fn((key: string, value: string) => {
    secureStore.set(key, value)
    return Promise.resolve()
  }),
  deleteItemAsync: vi.fn((key: string) => {
    secureStore.delete(key)
    return Promise.resolve()
  }),
}))

// Mock expo-constants
vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { version: '1.0.0' },
    manifest: { extra: {} },
  },
}))

// Mock @stellar/stellar-sdk
vi.mock('@stellar/stellar-sdk', async () => {
  const actual = await vi.importActual('@stellar/stellar-sdk')
  const { Keypair } = actual as any
  return {
    ...(actual as any),
    Keypair,
    BASE_FEE: '100',
    Networks: { TESTNET: 'Test SDF Network ; September 2015', PUBLIC: 'Public Global Stellar Network ; September 2015' },
    Asset: class MockAsset {
      constructor(code: string, issuer: string) {
        (this as any).code = code
        ;(this as any).issuer = issuer
      }
      static native() { return new MockAsset('XLM', '') as any }
      getAssetType() { return (this as any).code === 'XLM' ? 'native' : 'credit_alphanum4' }
      getCode() { return (this as any).code }
    },
    Horizon: {
      Server: class MockHorizonServer {
        constructor(url: string) {}
        loadAccount = vi.fn().mockResolvedValue({
          id: 'G...',
          sequence: '1',
          balances: [{ asset_type: 'native', balance: '10000.0000000' }],
        })
        submitTransaction = vi.fn().mockResolvedValue({ hash: 'test-hash' })
      },
    },
    rpc: {
      Server: class MockRpcServer {
        constructor(url: string) {}
        getAccount = vi.fn().mockResolvedValue({
          id: 'G...',
          sequence: '1',
          balance: '100000000000',
        })
        sendTransaction = vi.fn().mockResolvedValue({ status: 'SUCCESS', hash: 'test-tx-hash' })
        getTransaction = vi.fn().mockResolvedValue({ status: 'SUCCESS' })
        simulateTransaction = vi.fn().mockResolvedValue({})
        prepareTransaction = vi.fn().mockImplementation((tx: any) => Promise.resolve(tx))
      },
    },
    TransactionBuilder: class MockTxBuilder {
      constructor(source: any, opts: any) {}
      addOperation = vi.fn().mockReturnThis()
      setTimeout = vi.fn().mockReturnThis()
      build = vi.fn().mockReturnValue({ sign: () => {}, toEnvelope: () => 'xdr' })
    },
    Operation: {
      payment: vi.fn().mockReturnValue({ type: 'payment' }),
    },
  }
})

// Mock expo-haptics
vi.mock('expo-haptics', () => ({
  default: {
    notificationAsync: vi.fn().mockResolvedValue(undefined),
    impactAsync: vi.fn().mockResolvedValue(undefined),
    NotificationFeedbackType: { Success: 0, Error: 1, Warning: 2 },
  },
  notificationAsync: vi.fn().mockResolvedValue(undefined),
  impactAsync: vi.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 0, Error: 1, Warning: 2 },
}))

// Mock react-native-safe-area-context
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

// Mock expo-router
vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  Tabs: { Screen: ({ children }: any) => children },
  Stack: { Screen: ({ children }: any) => children },
}))

// Mock react-native
vi.mock('react-native', () => {
  const Platform = { OS: 'ios', Version: 0, select: (obj: any) => obj.ios ?? obj.default }
  return {
    Platform,
    StyleSheet: { create: (s: any) => s, absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } },
    View: ({ children }: any) => null,
    Text: ({ children }: any) => null,
    ScrollView: ({ children }: any) => null,
    TouchableOpacity: ({ children, onPress }: any) => null,
    TextInput: ({ value, onChangeText }: any) => null,
    RefreshControl: ({}: any) => null,
    Animated: {
      Value: class { constructor(v: number) { this._v = v }; _v: number },
      timing: () => ({ start: () => {} }),
      loop: () => ({ start: () => {}, stop: () => {} }),
      sequence: () => ({}),
      View: ({ children }: any) => null,
      Easing: { inOut: () => ({}), ease: () => ({}) },
    },
    Easing: { inOut: () => ({}), ease: () => ({}) },
    default: { Platform },
  }
})

// Mock @expo/vector-icons
vi.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color }: any) => null,
  default: {},
}))

// Mock NoirLogo component (used by screens, requires jpg assets)
vi.mock('@/components/brand/NoirLogo', () => ({
  NoirLogo: ({ variant, size }: any) => null,
}))

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch
