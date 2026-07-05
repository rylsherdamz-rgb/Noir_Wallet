import * as SecureStore from 'expo-secure-store'

export const StorageKeys = {
  WALLET_KEYS: 'wallet_keys',
  IS_ONBOARDED: 'is_onboarded',
  WALLET_CREATED: 'wallet_created',
  NETWORK: 'network',
  SECURITY: 'security',
  DEVICES: 'devices',
  USER: 'user',
} as const

export async function getItem<T>(key: string): Promise<T | null> {
  const data = await SecureStore.getItemAsync(key)
  if (!data) return null
  try { return JSON.parse(data) as T } catch { return data as unknown as T }
}

export async function setItem(key: string, value: any): Promise<void> {
  await SecureStore.setItemAsync(key, typeof value === 'string' ? value : JSON.stringify(value))
}

export async function removeItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key)
}
