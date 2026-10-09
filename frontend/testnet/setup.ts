import { vi } from 'vitest'

// Only the native modules are stubbed — the Stellar SDK, RPC and Horizon are
// real, so this exercises the app's own code against Testnet.
const store = new Map<string, string>()
const secureStore = {
  getItemAsync: async (k: string) => store.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => { store.set(k, v) },
  deleteItemAsync: async (k: string) => { store.delete(k) },
}
vi.mock('expo-secure-store', () => ({ default: secureStore, ...secureStore }))
vi.mock('expo-constants', () => ({ default: { expoConfig: { version: '1.0.0' }, manifest: { extra: {} } } }))
vi.mock('react-native', () => {
  const Platform = { OS: 'android', Version: 34, select: (o: any) => o.android ?? o.default }
  return { Platform, default: { Platform } }
})
