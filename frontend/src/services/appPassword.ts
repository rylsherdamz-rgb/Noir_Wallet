/**
 * App password — the fallback unlock for phones with no screen lock.
 *
 * Unlocking normally goes through the phone's own screen lock (see
 * biometrics.ts). A phone without one still needs something between a thief
 * and the wallet, so onboarding sets this password. It is stretched with
 * argon2id (memory-hard) against a per-install random salt, and wrong attempts
 * are throttled with a persisted exponential backoff.
 */
import { argon2idAsync } from '@noble/hashes/argon2.js'
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils.js'
import { getItem, setItem, removeItem } from './storage'

const PASSWORD_KEY = 'app_password_hash'
const ATTEMPTS_KEY = 'app_password_attempts'

export const MIN_PASSWORD_LENGTH = 8

const SALT_BYTES = 16
const HASH_BYTES = 32
/** OWASP-recommended argon2id parameters (19 MiB, 2 passes, 1 lane). */
const ARGON2_PARAMS = { t: 2, m: 19456, p: 1, dkLen: HASH_BYTES } as const

/** Wrong attempts allowed before any lockout kicks in. */
export const FREE_ATTEMPTS = 3
const BASE_LOCKOUT_MS = 30_000
const MAX_LOCKOUT_MS = 900_000 // 15 minutes

interface PasswordRecord {
  v: 1
  salt: string
  hash: string
}

export interface LockoutState {
  failures: number
  lockedUntil: number
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'wrong' | 'locked'; failures: number; retryAfterMs: number }
  | { ok: false; reason: 'no-password'; failures: number; retryAfterMs: 0 }

export type PasswordStrength = 'weak' | 'fair' | 'strong'

/** Rough strength for the onboarding meter: length plus character variety. */
export function passwordStrength(pw: string): PasswordStrength {
  if (pw.length < MIN_PASSWORD_LENGTH) return 'weak'
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  if (pw.length >= 12 && classes >= 3) return 'strong'
  return classes >= 2 ? 'fair' : 'weak'
}

/** Why a candidate password can't be used, or null when it's acceptable. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters`
  if (passwordStrength(pw) === 'weak') return 'Mix letters with numbers or symbols'
  return null
}

function isRecord(value: unknown): value is PasswordRecord {
  return (
    typeof value === 'object' && value !== null &&
    (value as PasswordRecord).v === 1 &&
    typeof (value as PasswordRecord).salt === 'string' &&
    typeof (value as PasswordRecord).hash === 'string'
  )
}

/** Length-independent, value-independent comparison of two hex digests. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/**
 * Yield a real macrotask before the CPU-heavy hash so a "Checking…" state set
 * just before the call actually paints (noble's internal yields are
 * microtasks, which drain before React Native commits a render).
 */
function yieldToRenderer(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function derive(pw: string, salt: Uint8Array): Promise<string> {
  return bytesToHex(await argon2idAsync(pw, salt, ARGON2_PARAMS))
}

/** Lockout after `failures` consecutive wrong attempts: doubles, capped at 15 min. */
export function lockoutDurationMs(failures: number): number {
  if (failures <= FREE_ATTEMPTS) return 0
  return Math.min(BASE_LOCKOUT_MS * 2 ** (failures - FREE_ATTEMPTS - 1), MAX_LOCKOUT_MS)
}

export function lockoutRemainingMs(state: LockoutState, now: number = Date.now()): number {
  return Math.max(0, state.lockedUntil - now)
}

export async function getLockout(): Promise<LockoutState> {
  const stored = await getItem<LockoutState>(ATTEMPTS_KEY)
  if (!stored || typeof stored.failures !== 'number') return { failures: 0, lockedUntil: 0 }
  return { failures: stored.failures, lockedUntil: stored.lockedUntil ?? 0 }
}

export async function hasPassword(): Promise<boolean> {
  return isRecord(await getItem<unknown>(PASSWORD_KEY))
}

export async function setPassword(pw: string): Promise<void> {
  const problem = passwordProblem(pw)
  if (problem) throw new Error(problem)
  await yieldToRenderer()
  const salt = randomBytes(SALT_BYTES)
  const record: PasswordRecord = { v: 1, salt: bytesToHex(salt), hash: await derive(pw, salt) }
  await setItem(PASSWORD_KEY, record)
  await removeItem(ATTEMPTS_KEY)
}

export async function clearPassword(): Promise<void> {
  await removeItem(PASSWORD_KEY)
  await removeItem(ATTEMPTS_KEY)
}

/** Check a password, honouring and advancing the persisted lockout. */
export async function verifyPassword(pw: string, now: number = Date.now()): Promise<VerifyResult> {
  const lockout = await getLockout()
  const remaining = lockoutRemainingMs(lockout, now)
  if (remaining > 0) return { ok: false, reason: 'locked', failures: lockout.failures, retryAfterMs: remaining }

  const stored = await getItem<unknown>(PASSWORD_KEY)
  if (!isRecord(stored)) return { ok: false, reason: 'no-password', failures: lockout.failures, retryAfterMs: 0 }

  await yieldToRenderer()
  if (constantTimeEqual(await derive(pw, hexToBytes(stored.salt)), stored.hash)) {
    await removeItem(ATTEMPTS_KEY)
    return { ok: true }
  }

  const failures = lockout.failures + 1
  const duration = lockoutDurationMs(failures)
  await setItem(ATTEMPTS_KEY, { failures, lockedUntil: duration > 0 ? now + duration : 0 })
  return { ok: false, reason: 'wrong', failures, retryAfterMs: duration }
}
