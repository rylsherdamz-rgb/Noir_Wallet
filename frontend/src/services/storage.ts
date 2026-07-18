import { secureGetItem, secureSetItem, secureDeleteItem } from './secureStorage'

export const StorageKeys = {
  WALLET_KEYS: 'wallet_keys',
  WALLET_LIST: 'wallet_list',
  ACTIVE_WALLET_INDEX: 'active_wallet_index',
  IS_ONBOARDED: 'is_onboarded',
  WALLET_CREATED: 'wallet_created',
  NETWORK: 'network',
  SECURITY: 'security',
  DEVICES: 'devices',
  USER: 'user',
} as const

export interface WalletListItem {
  label: string
  stellarPublic: string
  createdAt: string
}

export async function getItem<T>(key: string): Promise<T | null> {
  const data = await secureGetItem(key)
  if (!data) return null
  try { return JSON.parse(data) as T } catch { return data as unknown as T }
}

export async function setItem(key: string, value: any): Promise<void> {
  await secureSetItem(key, typeof value === 'string' ? value : JSON.stringify(value))
}

export async function removeItem(key: string): Promise<void> {
  await secureDeleteItem(key)
}
