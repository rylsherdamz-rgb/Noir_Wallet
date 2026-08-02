/**
 * Biometric unlock.
 *
 * Every caller has to distinguish "the user said no" from "this device cannot
 * do biometrics at all" — the first should keep the PIN keypad in front of the
 * user, the second should stop advertising a capability that does not exist.
 * So the outcome is a tagged union rather than a boolean.
 */
import { Platform } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'

export type UnavailableReason = 'unsupported-platform' | 'no-hardware' | 'not-enrolled'

export type BiometricAvailability =
  | { available: true; types: LocalAuthentication.AuthenticationType[] }
  | { available: false; reason: UnavailableReason }

export type BiometricResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'failed' | 'lockout' | 'unavailable'; message: string }

/** Human sentence for an unavailable device, suitable for a settings row. */
export function unavailableMessage(reason: UnavailableReason): string {
  switch (reason) {
    case 'no-hardware':
      return 'This device has no biometric sensor.'
    case 'not-enrolled':
      return 'No fingerprint or face is enrolled. Add one in system settings first.'
    case 'unsupported-platform':
      return 'Biometric unlock is not available in the web preview.'
  }
}

export async function checkAvailability(): Promise<BiometricAvailability> {
  if (Platform.OS === 'web') return { available: false, reason: 'unsupported-platform' }

  const hasHardware = await LocalAuthentication.hasHardwareAsync()
  if (!hasHardware) return { available: false, reason: 'no-hardware' }

  const enrolled = await LocalAuthentication.isEnrolledAsync()
  if (!enrolled) return { available: false, reason: 'not-enrolled' }

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
  return { available: true, types }
}

/**
 * Prompt for biometric confirmation.
 *
 * `disableDeviceFallback` is on because this app already owns a PIN screen —
 * falling back to the *device* passcode would unlock the wallet with a secret
 * the wallet never verified.
 */
export async function authenticate(promptMessage = 'Unlock Noir Wallet'): Promise<BiometricResult> {
  const availability = await checkAvailability()
  if (!availability.available) {
    return { ok: false, reason: 'unavailable', message: unavailableMessage(availability.reason) }
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Use PIN',
    disableDeviceFallback: true,
  })

  if (result.success) return { ok: true }

  const error = 'error' in result ? result.error : 'unknown'
  if (error === 'user_cancel' || error === 'system_cancel' || error === 'app_cancel' || error === 'user_fallback') {
    return { ok: false, reason: 'cancelled', message: 'Biometric unlock cancelled.' }
  }
  if (error === 'lockout') {
    return { ok: false, reason: 'lockout', message: 'Too many biometric attempts. Use your PIN.' }
  }
  if (error === 'not_available' || error === 'not_enrolled') {
    return { ok: false, reason: 'unavailable', message: unavailableMessage('not-enrolled') }
  }
  return { ok: false, reason: 'failed', message: 'Biometric unlock failed. Use your PIN.' }
}
