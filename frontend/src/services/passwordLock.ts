/**
 * Wallet password storage and verification.
 *
 * The password is created during onboarding and is the one unlock method that
 * every wallet is guaranteed to have: it works on a phone with no fingerprint,
 * face or screen lock, and it is always offered as the alternative when the
 * user would rather not use the phone's own unlock.
 *
 * It is stored exactly like the app PIN — argon2id against a per-install
 * random salt — and wrong attempts share the PIN's backoff schedule, tracked
 * under their own key so a mistyped PIN never locks out the password.
 */
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils.js'
import { getItem, setItem, removeItem } from './storage'
import {
  constantTimeEqual,
  deriveSecret,
  lockoutDurationMs,
  lockoutRemainingMs,
  type LockoutState,
} from './pinLock'

const PASSWORD_KEY = 'app_password_hash'
const ATTEMPTS_KEY = 'app_password_attempts'

const SALT_BYTES = 16

export const MIN_PASSWORD_LENGTH = 8

interface PasswordRecord {
  v: 1
  salt: string
  hash: string
}

export type PasswordVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'wrong'; failures: number; retryAfterMs: number }
  | { ok: false; reason: 'locked'; failures: number; retryAfterMs: number }
  | { ok: false; reason: 'no-password'; failures: number; retryAfterMs: 0 }

function isPasswordRecord(value: unknown): value is PasswordRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as PasswordRecord).v === 1 &&
    typeof (value as PasswordRecord).salt === 'string' &&
    typeof (value as PasswordRecord).hash === 'string'
  )
}

/**
 * The same characters can arrive as different code points depending on the
 * keyboard (composed vs decomposed accents). Normalise so the password the
 * user set is the password that unlocks.
 */
function normalize(password: string): string {
  return password.normalize('NFKC')
}

/** A sentence describing what is wrong with a new password, or null if it is acceptable. */
export function validatePassword(password: string): string | null {
  if (normalize(password).length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (password.trim().length === 0) return 'Password cannot be only spaces.'
  return null
}

export async function getPasswordLockout(): Promise<LockoutState> {
  const stored = await getItem<LockoutState>(ATTEMPTS_KEY)
  if (!stored || typeof stored.failures !== 'number') return { failures: 0, lockedUntil: 0 }
  return { failures: stored.failures, lockedUntil: stored.lockedUntil ?? 0 }
}

export async function hasPassword(): Promise<boolean> {
  return isPasswordRecord(await getItem<unknown>(PASSWORD_KEY))
}

export async function setPassword(password: string): Promise<void> {
  const problem = validatePassword(password)
  if (problem) throw new Error(problem)
  const salt = randomBytes(SALT_BYTES)
  const hash = await deriveSecret(normalize(password), salt)
  const record: PasswordRecord = { v: 1, salt: bytesToHex(salt), hash }
  await setItem(PASSWORD_KEY, record)
  await removeItem(ATTEMPTS_KEY)
}

export async function clearPassword(): Promise<void> {
  await removeItem(PASSWORD_KEY)
  await removeItem(ATTEMPTS_KEY)
}

/** Check the wallet password, honouring and advancing the persisted lockout. */
export async function verifyPassword(
  password: string,
  now: number = Date.now()
): Promise<PasswordVerifyResult> {
  const lockout = await getPasswordLockout()
  const remaining = lockoutRemainingMs(lockout, now)
  if (remaining > 0) {
    return { ok: false, reason: 'locked', failures: lockout.failures, retryAfterMs: remaining }
  }

  const stored = await getItem<unknown>(PASSWORD_KEY)
  if (!isPasswordRecord(stored)) {
    return { ok: false, reason: 'no-password', failures: lockout.failures, retryAfterMs: 0 }
  }

  const candidate = await deriveSecret(normalize(password), hexToBytes(stored.salt))
  if (constantTimeEqual(candidate, stored.hash)) {
    await removeItem(ATTEMPTS_KEY)
    return { ok: true }
  }

  const failures = lockout.failures + 1
  const duration = lockoutDurationMs(failures)
  await setItem(ATTEMPTS_KEY, { failures, lockedUntil: duration > 0 ? now + duration : 0 })
  return { ok: false, reason: 'wrong', failures, retryAfterMs: duration }
}
