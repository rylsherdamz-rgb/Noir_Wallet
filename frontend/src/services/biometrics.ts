/**
 * Device unlock: the phone's own fingerprint, face, PIN, pattern or passcode.
 *
 * Every caller has to distinguish "the user said no" from "this phone has no
 * lock to offer at all" — the first should leave the wallet password in front
 * of the user, the second should never show a prompt in the first place. So
 * the outcome is a tagged union rather than a boolean.
 *
 * The wallet password set during onboarding is always the alternative, so a
 * phone with nothing configured simply skips this and asks for the password.
 */
import { Platform } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'

export type UnavailableReason = 'unsupported-platform' | 'no-device-lock'

export type BiometricAvailability =
  | {
      available: true
      /** True when a fingerprint or face is enrolled, false for PIN / pattern / passcode only. */
      biometric: boolean
      types: LocalAuthentication.AuthenticationType[]
    }
  | { available: false; reason: UnavailableReason }

export type BiometricResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'failed' | 'lockout' | 'unavailable'; message: string }

/**
 * The system prompt can push the app to `inactive`/`background` while it is on
 * screen. The auto-lock listener asks this so the prompt that is unlocking the
 * wallet does not itself trigger a lock.
 */
let promptActive = false
let promptEndedAt = 0
const PROMPT_SETTLE_MS = 2_000

export function isSystemPromptActive(now: number = Date.now()): boolean {
  return promptActive || now - promptEndedAt < PROMPT_SETTLE_MS
}

/** Human sentence for an unavailable device, suitable for a settings row. */
export function unavailableMessage(reason: UnavailableReason): string {
  switch (reason) {
    case 'no-device-lock':
      return 'No fingerprint, face or screen lock is set on this phone. Use your wallet password instead.'
    case 'unsupported-platform':
      return 'Device unlock is not available in the web preview.'
  }
}

export async function checkAvailability(): Promise<BiometricAvailability> {
  if (Platform.OS === 'web') return { available: false, reason: 'unsupported-platform' }

  const level = await LocalAuthentication.getEnrolledLevelAsync()
  if (level === LocalAuthentication.SecurityLevel.NONE) {
    return { available: false, reason: 'no-device-lock' }
  }

  const biometric = level >= LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK
  const types = biometric ? await LocalAuthentication.supportedAuthenticationTypesAsync() : []
  return { available: true, biometric, types }
}

/**
 * Prompt for the phone's own unlock.
 *
 * Device fallback is allowed: if the user has no fingerprint/face, or chooses
 * not to use it, the phone's PIN / pattern / passcode is accepted. Cancelling
 * hands control back to the wallet password.
 */
export async function authenticate(promptMessage = 'Unlock Noir Wallet'): Promise<BiometricResult> {
  const availability = await checkAvailability()
  if (!availability.available) {
    return { ok: false, reason: 'unavailable', message: unavailableMessage(availability.reason) }
  }

  promptActive = true
  let result: LocalAuthentication.LocalAuthenticationResult
  try {
    result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Use password',
      disableDeviceFallback: false,
    })
  } finally {
    promptActive = false
    promptEndedAt = Date.now()
  }

  if (result.success) return { ok: true }

  const error = 'error' in result ? result.error : 'unknown'
  if (error === 'user_cancel' || error === 'system_cancel' || error === 'app_cancel' || error === 'user_fallback') {
    return { ok: false, reason: 'cancelled', message: 'Device unlock cancelled.' }
  }
  if (error === 'lockout') {
    return { ok: false, reason: 'lockout', message: 'Too many attempts. Use your wallet password.' }
  }
  if (error === 'not_available' || error === 'not_enrolled' || error === 'passcode_not_set') {
    return { ok: false, reason: 'unavailable', message: unavailableMessage('no-device-lock') }
  }
  return { ok: false, reason: 'failed', message: 'Device unlock failed. Use your wallet password.' }
}
