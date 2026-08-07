/**
 * App PIN storage and verification.
 *
 * The PIN is a 6-digit secret drawn from a 10^6 space, so the hash is the only
 * thing standing between a stolen device and the wallet. It is stretched with
 * argon2id (memory-hard) against a per-install random salt, and wrong attempts
 * are throttled with a persisted exponential backoff so the space cannot be
 * walked offline or at the keypad.
 *
 * The previous implementation used a 32-bit non-cryptographic `String.hashCode`
 * with no salt; records in that format are detected and migrated on the next
 * successful unlock.
 */
import { argon2idAsync } from '@noble/hashes/argon2.js'
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils.js'
import { getItem, setItem, removeItem } from './storage'

const PIN_KEY = 'app_pin_hash'
const ATTEMPTS_KEY = 'app_pin_attempts'

const SALT_BYTES = 16
const HASH_BYTES = 32

/** OWASP-recommended argon2id parameters (19 MiB, 2 passes, 1 lane). */
const ARGON2_PARAMS = { t: 2, m: 19456, p: 1, dkLen: HASH_BYTES } as const

/** Wrong attempts allowed before any lockout kicks in. */
export const FREE_ATTEMPTS = 3
const BASE_LOCKOUT_MS = 30_000
const MAX_LOCKOUT_MS = 900_000 // 15 minutes

interface PinRecord {
  v: 2
  salt: string
  hash: string
}

export interface LockoutState {
  failures: number
  lockedUntil: number
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'wrong'; failures: number; retryAfterMs: number }
  | { ok: false; reason: 'locked'; failures: number; retryAfterMs: number }
  | { ok: false; reason: 'no-pin'; failures: number; retryAfterMs: 0 }

function isPinRecord(value: unknown): value is PinRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as PinRecord).v === 2 &&
    typeof (value as PinRecord).salt === 'string' &&
    typeof (value as PinRecord).hash === 'string'
  )
}

/**
 * The pre-migration hash: 32-bit, unsalted, non-cryptographic. Kept only so an
 * existing PIN can be recognised once and immediately re-hashed with argon2id.
 */
function legacyHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash = hash & hash
  }
  return 'pin_' + Math.abs(hash).toString(36)
}

/** Length-independent, value-independent comparison of two hex digests. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function derive(pin: string, salt: Uint8Array): Promise<string> {
  return bytesToHex(await argon2idAsync(pin, salt, ARGON2_PARAMS))
}

/**
 * Lockout duration after `failures` consecutive wrong attempts. Doubles per
 * attempt past `FREE_ATTEMPTS` and saturates at 15 minutes.
 */
export function lockoutDurationMs(failures: number): number {
  if (failures <= FREE_ATTEMPTS) return 0
  const steps = failures - FREE_ATTEMPTS - 1
  return Math.min(BASE_LOCKOUT_MS * 2 ** steps, MAX_LOCKOUT_MS)
}

/** Milliseconds left on an active lockout; 0 when unlocked. */
export function lockoutRemainingMs(state: LockoutState, now: number = Date.now()): number {
  return Math.max(0, state.lockedUntil - now)
}

export async function getLockout(): Promise<LockoutState> {
  const stored = await getItem<LockoutState>(ATTEMPTS_KEY)
  if (!stored || typeof stored.failures !== 'number') return { failures: 0, lockedUntil: 0 }
  return { failures: stored.failures, lockedUntil: stored.lockedUntil ?? 0 }
}

async function setLockout(state: LockoutState): Promise<void> {
  await setItem(ATTEMPTS_KEY, state)
}

async function clearLockout(): Promise<void> {
  await removeItem(ATTEMPTS_KEY)
}

export async function hasPin(): Promise<boolean> {
  const stored = await getItem<unknown>(PIN_KEY)
  return stored !== null && stored !== undefined && stored !== ''
}

export async function setPin(pin: string): Promise<void> {
  const salt = randomBytes(SALT_BYTES)
  const hash = await derive(pin, salt)
  const record: PinRecord = { v: 2, salt: bytesToHex(salt), hash }
  await setItem(PIN_KEY, record)
  await clearLockout()
}

export async function clearPin(): Promise<void> {
  await removeItem(PIN_KEY)
  await clearLockout()
}

/**
 * Check a PIN, honouring and advancing the persisted lockout.
 *
 * A correct PIN stored in the legacy format is transparently re-hashed with
 * argon2id before returning, so the weak digest never survives a second unlock.
 */
export async function verifyPin(pin: string, now: number = Date.now()): Promise<VerifyResult> {
  const lockout = await getLockout()
  const remaining = lockoutRemainingMs(lockout, now)
  if (remaining > 0) {
    return { ok: false, reason: 'locked', failures: lockout.failures, retryAfterMs: remaining }
  }

  const stored = await getItem<unknown>(PIN_KEY)
  if (stored === null || stored === undefined || stored === '') {
    return { ok: false, reason: 'no-pin', failures: lockout.failures, retryAfterMs: 0 }
  }

  let matched = false
  let needsMigration = false

  if (isPinRecord(stored)) {
    matched = constantTimeEqual(await derive(pin, hexToBytes(stored.salt)), stored.hash)
  } else if (typeof stored === 'string') {
    matched = constantTimeEqual(legacyHash(pin), stored)
    needsMigration = matched
  }

  if (matched) {
    if (needsMigration) await setPin(pin)
    await clearLockout()
    return { ok: true }
  }

  const failures = lockout.failures + 1
  const duration = lockoutDurationMs(failures)
  await setLockout({ failures, lockedUntil: duration > 0 ? now + duration : 0 })
  return { ok: false, reason: 'wrong', failures, retryAfterMs: duration }
}
