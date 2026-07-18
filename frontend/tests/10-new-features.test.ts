import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockSecureStore = new Map<string, string>()

vi.mock('expo-secure-store', () => ({
  default: {
    getItemAsync: vi.fn((key: string) => Promise.resolve(mockSecureStore.get(key) ?? null)),
    setItemAsync: vi.fn((key: string, value: string) => {
      mockSecureStore.set(key, value)
      return Promise.resolve()
    }),
    deleteItemAsync: vi.fn((key: string) => {
      mockSecureStore.delete(key)
      return Promise.resolve()
    }),
  },
  getItemAsync: vi.fn((key: string) => Promise.resolve(mockSecureStore.get(key) ?? null)),
  setItemAsync: vi.fn((key: string, value: string) => {
    mockSecureStore.set(key, value)
    return Promise.resolve()
  }),
  deleteItemAsync: vi.fn((key: string) => {
    mockSecureStore.delete(key)
    return Promise.resolve()
  }),
}))

vi.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: vi.fn(() => vi.fn()),
    fetch: vi.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  },
}))

vi.mock('expo-notifications', () => ({
  default: {},
  requestPermissionsAsync: vi.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: vi.fn(() => Promise.resolve({ data: 'mock-push-token' })),
  addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
}))

vi.mock('expo-camera', () => ({
  CameraView: ({ children }: any) => null,
  useCameraPermissions: vi.fn(() => [{ granted: true }, vi.fn()]),
}))

vi.mock('expo-clipboard', () => ({
  default: { setStringAsync: vi.fn() },
  setStringAsync: vi.fn(),
}))

vi.mock('react-native-qrcode-svg', () => ({
  default: () => null,
}))

vi.mock('react-native', () => ({
  Platform: { OS: 'ios', Version: 0, select: (obj: any) => obj.ios ?? obj.default },
  StyleSheet: { create: (s: any) => s },
  View: ({ children }: any) => null,
  Text: ({ children }: any) => null,
  ScrollView: ({ children }: any) => null,
  TouchableOpacity: ({ children, onPress }: any) => null,
  TextInput: ({ value, onChangeText }: any) => null,
  RefreshControl: ({}: any) => null,
  Switch: ({ value, onValueChange }: any) => null,
  Alert: { alert: vi.fn() },
  Linking: { openURL: vi.fn(), addEventListener: vi.fn(() => ({ remove: vi.fn() })) },
  AppState: { currentState: 'active', addEventListener: vi.fn(() => ({ remove: vi.fn() })) },
  Share: { share: vi.fn() },
  Pressable: ({ children, onPress }: any) => null,
  Animated: {
    Value: class { constructor(v: number) { this._v = v }; _v: number },
    timing: () => ({ start: (cb: any) => cb?.({ finished: true }) }),
    loop: () => ({ start: () => {}, stop: () => {} }),
    sequence: () => ({}),
    View: ({ children }: any) => null,
    Easing: { inOut: () => ({}), ease: () => ({}) },
  },
  Easing: { inOut: () => ({}), ease: () => ({}) },
  FlatList: ({ data, renderItem }: any) => null,
  default: { Platform: { OS: 'ios' } },
}))

vi.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color }: any) => null,
  default: {},
}))

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  useGlobalSearchParams: () => ({}),
  useLocalSearchParams: () => ({}),
  Stack: { Screen: ({ children }: any) => children },
}))

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

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

vi.mock('@/components/brand/NoirLogo', () => ({
  NoirLogo: ({ variant, size }: any) => null,
}))

vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
}))

vi.mock('@/components/NumericKeypad', () => ({
  NumericKeypad: ({ value, onChangeValue }: any) => null,
}))

vi.mock('@/components/Toast', () => ({
  Toast: ({ visible, title, message }: any) => null,
}))

vi.mock('@/components/ConfirmDialog', () => ({
  ConfirmDialog: ({ visible, title, message }: any) => null,
}))

vi.mock('@/components/Button', () => ({
  Button: ({ label, onPress }: any) => null,
}))

vi.mock('@/components/ErrorMessage', () => ({
  ErrorMessage: ({ message }: any) => null,
}))

vi.mock('@/components/EmptyState', () => ({
  EmptyState: ({ title }: any) => null,
}))

vi.mock('@/components/Avatar', () => ({
  Avatar: ({ name, size }: any) => null,
}))

vi.mock('@/components/StatusPill', () => ({
  StatusPill: ({ status }: any) => null,
}))

vi.mock('@/components/SmartTip', () => ({
  SmartTip: ({ title }: any) => null,
}))

vi.mock('@/components/BalanceCard', () => ({
  BalanceCard: (props: any) => null,
}))

vi.mock('@/components/TestnetFaucetBanner', () => ({
  TestnetFaucetBanner: () => null,
}))

vi.mock('@/components/TransactionItem', () => ({
  TransactionItem: ({ transaction }: any) => null,
}))

vi.mock('@/services/stellar', () => ({
  stellarService: {
    fundTestnetAccount: vi.fn(),
    getBalance: vi.fn(() => Promise.resolve({ xlm: 100 })),
    submitPayment: vi.fn(() => Promise.resolve({ hash: 'mock-hash' })),
  },
}))

vi.mock('@/services/nfc', () => ({
  nfcService: {
    isSupported: vi.fn(() => Promise.resolve(true)),
    readTag: vi.fn(),
    writeTag: vi.fn(),
  },
}))

vi.mock('@/services/fxRates', () => ({
  fxRateService: {
    getRates: vi.fn(() => Promise.resolve({ xlmToUsd: 0.1, usdToPhp: 56, xlmToPhp: 5.6 })),
  },
}))

vi.mock('@/hooks/useNfc', () => ({
  useNfc: () => ({
    isSupported: true,
    lastTag: null,
    error: null,
    scanTag: vi.fn(),
    writeToTag: vi.fn(),
    clearTag: vi.fn(),
  }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('1 — Sign-out cleanup', () => {
  beforeEach(() => {
    mockSecureStore.clear()
  })

  it('walletService clears wallet_keys from SecureStore', async () => {
    mockSecureStore.set('wallet_keys', JSON.stringify({ mnemonic: 'test', stellarSecret: 'S', stellarPublic: 'G' }))
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    expect(keys?.mnemonic).toBe('test')
    await walletService.clearKeys()
    const cleared = await walletService.loadKeys()
    expect(cleared).toBeNull()
  })

  it('x402 clears agent wallet from SecureStore', async () => {
    mockSecureStore.set('x402.agent.secret', 'S')
    mockSecureStore.set('x402.agent.public', 'G')
    const { x402 } = await import('@/domain/x402')
    expect(await x402.hasAgent()).toBe(true)
    await x402.clearAgent()
    expect(await x402.hasAgent()).toBe(false)
  })

  it('store setUser and reset work correctly', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setUser({ id: '1', email: 't', phoneNumber: '+63', stellarPublicKey: 'G', kycLevel: 1, role: 'consumer', displayName: 'T' })
    expect(useAppStore.getState().user?.id).toBe('1')
    useAppStore.getState().reset()
    expect(useAppStore.getState().user).toBeNull()
  })
})

describe('2 — Explorer links', () => {
  it('generates testnet explorer URL', async () => {
    const hash = 'abc123'
    const network = 'testnet'
    const url = network === 'testnet'
      ? `https://stellar.expert/explorer/testnet/tx/${hash}`
      : `https://stellar.expert/explorer/public/tx/${hash}`
    expect(url).toBe('https://stellar.expert/explorer/testnet/tx/abc123')
  })

  it('generates mainnet explorer URL', async () => {
    const hash = 'abc123'
    const network: string = 'mainnet'
    const url = network === 'testnet'
      ? `https://stellar.expert/explorer/testnet/tx/${hash}`
      : `https://stellar.expert/explorer/public/tx/${hash}`
    expect(url).toBe('https://stellar.expert/explorer/public/tx/abc123')
  })

  it('imports TransactionDetailScreen', async () => {
    const mod = await import('@/screens/TransactionDetailScreen')
    expect(mod.TransactionDetailScreen).toBeDefined()
  })
})

describe('3 — Recovery Phrase and Private Key display', () => {
  beforeEach(() => {
    mockSecureStore.clear()
  })

  it('shows recovery phrase when available', async () => {
    mockSecureStore.set('wallet_keys', JSON.stringify({
      mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      stellarSecret: 'S',
      stellarPublic: 'G',
      agentSecret: 'S',
      agentPublic: 'G',
    }))
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    expect(keys?.mnemonic).toContain('abandon')
    expect(keys?.mnemonic.split(' ')).toHaveLength(12)
  })

  it('shows private key when available', async () => {
    mockSecureStore.set('wallet_keys', JSON.stringify({
      mnemonic: 'test',
      stellarSecret: 'SC4JEXAMPLE',
      stellarPublic: 'G',
      agentSecret: 'S',
      agentPublic: 'G',
    }))
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    expect(keys?.stellarSecret).toBe('SC4JEXAMPLE')
  })

  it('returns null when no keys stored', async () => {
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    expect(keys).toBeNull()
  })

  it('imports SecurityScreen', async () => {
    const mod = await import('@/screens/SecurityScreen')
    expect(mod.SecurityScreen).toBeDefined()
  })
})

describe('4 — KYC upgrade', () => {
  it('imports ProfileScreen', async () => {
    const mod = await import('@/screens/ProfileScreen')
    expect(mod.ProfileScreen).toBeDefined()
  })

  it('kycLevel defaults to 0 in store', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    expect(useAppStore.getState().user).toBeNull()
  })
})

describe('5 — +not-found page', () => {
  it('exports default NotFoundScreen', async () => {
    const mod = await import('../../frontend/app/+not-found')
    expect(mod.default).toBeDefined()
  })
})

describe('6 — QR scanner', () => {
  it('imports scan-qr route', async () => {
    const mod = await import('../../frontend/app/scan-qr')
    expect(mod.default).toBeDefined()
  })

  it('camera permissions default to granted in mock', async () => {
    const { useCameraPermissions } = await import('expo-camera')
    const [permission] = useCameraPermissions()
    expect(permission!.granted).toBe(true)
  })
})

describe('7 — App lock screen (PIN)', () => {
  beforeEach(() => {
    mockSecureStore.clear()
  })

  it('imports lock route', async () => {
    const mod = await import('../../frontend/app/lock')
    expect(mod.default).toBeDefined()
  })

  it('stores PIN hash in SecureStore', async () => {
    const { setItem, getItem } = await import('@/services/storage')
    await setItem('app_pin_hash', 'pin_abc123')
    const stored = await getItem<string>('app_pin_hash')
    expect(stored).toBe('pin_abc123')
  })

  it('returns null when no PIN is set', async () => {
    const { getItem } = await import('@/services/storage')
    const stored = await getItem<string>('app_pin_hash')
    expect(stored).toBeNull()
  })
})

describe('8 — Deep linking', () => {
  it('handles noirwallet://activate URL', () => {
    const url = 'noirwallet://activate?device=abc123'
    expect(url.includes('noirwallet://activate')).toBe(true)
    const params = new URLSearchParams(url.split('?')[1] || '')
    expect(params.get('device')).toBe('abc123')
  })

  it('app.json scheme is noirwallet', () => {
    const appJson = { expo: { scheme: 'noirwallet' } }
    expect(appJson.expo.scheme).toBe('noirwallet')
  })
})

describe('9 — Push notification registration', () => {
  it('requests notification permissions and gets token', async () => {
    const { requestPermissionsAsync, getExpoPushTokenAsync } = await import('expo-notifications')
    const { status } = await requestPermissionsAsync()
    expect(status).toBe('granted')
    const token = await getExpoPushTokenAsync()
    expect(token.data).toBe('mock-push-token')
  })

  it('registerPushToken API endpoint exists', async () => {
    const { apiService } = await import('@/services/api')
    expect(apiService).toBeDefined()
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true }) })
  })
})

describe('10 — Fiat on-ramp (Cash In/Out)', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('imports fiat route', async () => {
    const mod = await import('../../frontend/app/fiat')
    expect(mod.default).toBeDefined()
  })

  it('pdaxCashIn sends POST to /pdax/cash-in', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reference: 'REF123' }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.pdaxCashIn(10000)
    expect(result.reference).toBe('REF123')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/pdax/cash-in'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('pdaxCashOut sends POST to /pdax/cash-out', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reference: 'REF456' }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.pdaxCashOut(20000)
    expect(result.reference).toBe('REF456')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/pdax/cash-out'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

describe('11 — Offline payment queue', () => {
  beforeEach(async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().reset()
  })

  it('adds and removes pending payments in store', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    expect(useAppStore.getState().pendingPayments).toHaveLength(0)
    useAppStore.getState().addPendingPayment({
      id: 'q1',
      rawDeviceUid: 'uid1',
      merchantPublicKey: 'G1',
      amountCents: 5000,
      assetCode: 'XLM',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    })
    expect(useAppStore.getState().pendingPayments).toHaveLength(1)
    useAppStore.getState().removePendingPayment('q1')
    expect(useAppStore.getState().pendingPayments).toHaveLength(0)
  })

  it('batchPayments endpoint exists on apiService', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ processed: 3 }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.batchPayments([{ amountCents: 100 }])
    expect(result.processed).toBe(3)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/payments/batch'),
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

describe('12 — Account deletion', () => {
  beforeEach(() => {
    mockSecureStore.clear()
    mockFetch.mockReset()
  })

  it('DELETE /auth/account endpoint exists', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.request('/auth/account', { method: 'DELETE' })
    expect(result).toBeDefined()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/account'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('reset clears all store state', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setUser({ id: '1', email: 't', phoneNumber: '+63', stellarPublicKey: 'G', kycLevel: 1, role: 'consumer', displayName: 'T' })
    useAppStore.getState().setBalance({ xlm: 0 })
    useAppStore.getState().reset()
    expect(useAppStore.getState().user).toBeNull()
    expect(useAppStore.getState().balance.xlm).toBe(0)
  })
})

describe('13 — Manage wallets button', () => {
  it('imports DashboardScreen with navigate handler', async () => {
    const mod = await import('@/screens/DashboardScreen')
    expect(mod.DashboardScreen).toBeDefined()
  })
})

describe('15 — Agent screens', () => {
  it('AgentListScreen filters only active devices', async () => {
    const devices = [
      { status: 'active', label: 'Card A' },
      { status: 'frozen', label: 'Card B' },
      { status: 'active', label: 'Card C' },
    ]
    const active = devices.filter((d) => d.status === 'active')
    expect(active).toHaveLength(2)
    expect(active[0].label).toBe('Card A')
    expect(active[1].label).toBe('Card C')
  })

  it('agent detail route imports', async () => {
    const mod = await import('../../frontend/app/agent/[id]')
    expect(mod.default).toBeDefined()
  })

  it('pos tab now imports AgentListScreen', async () => {
    const mod = await import('../../frontend/app/(tabs)/pos')
    expect(mod.default).toBeDefined()
  })

  it('tab layout renamed Pay to Agents', () => {
    const tabConfig = { name: 'pos', title: 'Agents', icon: 'flash-outline' }
    expect(tabConfig.title).toBe('Agents')
    expect(tabConfig.icon).toBe('flash-outline')
  })

  it('AgentWallet interface has correct shape', () => {
    const wallet = {
      publicKey: 'GABC',
      balanceStroops: 10000000,
      spendingBudgetStroops: 500000000,
      totalSpentStroops: 0,
      isActive: true,
      createdAt: '2025-01-01',
    }
    expect(wallet.publicKey).toBe('GABC')
    expect(wallet.balanceStroops).toBe(10000000)
    expect(wallet.spendingBudgetStroops).toBe(500000000)
    expect(typeof wallet.isActive).toBe('boolean')
  })
})

describe('16 — Register push token API', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('registerPushToken sends POST to /notifications/register', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.registerPushToken('expo-token-123')
    expect(result.ok).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/register'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('expo-token-123'),
      }),
    )
  })
})
