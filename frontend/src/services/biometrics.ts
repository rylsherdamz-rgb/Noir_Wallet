/**
 * Phone unlock: the phone's own fingerprint, face, PIN or pattern.
 *
 * Optional, and offered only when the user turned it on in Security settings
 * and the phone actually has a lock. The wallet password (appPassword.ts) is
 * always the alternative — cancelling the system prompt hands control back to
 * it. The app never sees or stores the phone's own secret.
 */
import { Platform } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'

let deviceAuthInProgress = false

/**
 * True while the system unlock sheet is up. On Android the device-credential
 * screen is a separate activity, so the app briefly goes to the background;
 * the auto-lock listener must ignore that or it would re-lock in a loop.
 */
export function isDeviceAuthInProgress(): boolean {
  return deviceAuthInProgress
}

/** Whether the phone has any screen lock (PIN, pattern, password or biometrics). */
export async function hasDeviceSecurity(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const level = await LocalAuthentication.getEnrolledLevelAsync()
  return level !== LocalAuthentication.SecurityLevel.NONE
}

/** True when a fingerprint or face is enrolled, not just a PIN / pattern. */
export async function hasDeviceBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const level = await LocalAuthentication.getEnrolledLevelAsync()
  return level >= LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK
}

export type DeviceAuthResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'failed' | 'lockout' | 'no-device-lock'; message: string }

const NO_DEVICE_LOCK = 'Set a screen lock on your phone to protect your wallet.'

/** Unlock with the phone's own screen lock (biometrics with PIN/pattern fallback). */
export async function authenticateWithDevice(promptMessage = 'Unlock Noir Wallet'): Promise<DeviceAuthResult> {
  if (!(await hasDeviceSecurity())) {
    return { ok: false, reason: 'no-device-lock', message: NO_DEVICE_LOCK }
  }
  deviceAuthInProgress = true
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Use password',
      disableDeviceFallback: false,
    })
    if (result.success) return { ok: true }
    const error = 'error' in result ? result.error : 'unknown'
    if (error === 'user_cancel' || error === 'system_cancel' || error === 'app_cancel' || error === 'user_fallback') {
      return { ok: false, reason: 'cancelled', message: 'Unlock cancelled.' }
    }
    if (error === 'lockout') {
      return { ok: false, reason: 'lockout', message: 'Too many attempts. Use your wallet password.' }
    }
    if (error === 'passcode_not_set' || error === 'not_enrolled') {
      return { ok: false, reason: 'no-device-lock', message: NO_DEVICE_LOCK }
    }
    return { ok: false, reason: 'failed', message: 'Could not unlock. Use your wallet password.' }
  } finally {
    // Clear after the activity transition settles so the returning
    // background→active AppState event is still recognised as ours.
    setTimeout(() => { deviceAuthInProgress = false }, 1000)
  }
}
