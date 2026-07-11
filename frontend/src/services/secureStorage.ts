/**
 * Platform-aware secure key-value storage.
 *
 * Native (iOS/Android): backed by expo-secure-store (Keychain / Keystore).
 * Web: expo-secure-store has no working implementation, so we fall back to
 * the browser's localStorage. Web is used only for UI preview/development —
 * it is NOT hardware-backed secure storage, so real secrets should never be
 * relied upon in a browser build.
 */
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const isWeb = Platform.OS === 'web'

export async function secureGetItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null
    } catch {
      return null
    }
  }
  return SecureStore.getItemAsync(key)
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.setItem(key, value)
    } catch {
      // Storage may be unavailable (private mode / quota); ignore on web preview.
    }
    return
  }
  await SecureStore.setItemAsync(key, value)
}

export async function secureDeleteItem(key: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.removeItem(key)
    } catch {
      // ignore on web preview
    }
    return
  }
  await SecureStore.deleteItemAsync(key)
}
