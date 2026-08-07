import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  setPin,
  verifyPin,
  clearPin,
  hasPin,
  getLockout,
  lockoutDurationMs,
  lockoutRemainingMs,
  FREE_ATTEMPTS,
} from '@/services/pinLock'
import { setItem, getItem, removeItem } from '@/services/storage'
import { checkAvailability, authenticate, unavailableMessage } from '@/services/biometrics'
import * as LocalAuthentication from 'expo-local-authentication'

const PIN_KEY = 'app_pin_hash'
const ATTEMPTS_KEY = 'app_pin_attempts'

describe('pinLock — lockout schedule', () => {
  it('allows the first attempts without any lockout', () => {
    for (let i = 1; i <= FREE_ATTEMPTS; i++) {
      expect(lockoutDurationMs(i)).toBe(0)
    }
  })

  it('doubles the lockout for each attempt past the free allowance', () => {
    expect(lockoutDurationMs(FREE_ATTEMPTS + 1)).toBe(30_000)
    expect(lockoutDurationMs(FREE_ATTEMPTS + 2)).toBe(60_000)
    expect(lockoutDurationMs(FREE_ATTEMPTS + 3)).toBe(120_000)
  })

  it('saturates at 15 minutes instead of growing without bound', () => {
    expect(lockoutDurationMs(FREE_ATTEMPTS + 20)).toBe(900_000)
    expect(lockoutDurationMs(FREE_ATTEMPTS + 100)).toBe(900_000)
  })

  it('reports remaining time relative to now and never goes negative', () => {
    expect(lockoutRemainingMs({ failures: 5, lockedUntil: 1_000 }, 400)).toBe(600)
    expect(lockoutRemainingMs({ failures: 5, lockedUntil: 1_000 }, 5_000)).toBe(0)
  })
})

describe('pinLock — storage and verification', () => {
  beforeEach(async () => {
    await removeItem(PIN_KEY)
    await removeItem(ATTEMPTS_KEY)
  })

  it('round-trips a PIN through argon2id', async () => {
    expect(await hasPin()).toBe(false)
    await setPin('123456')
    expect(await hasPin()).toBe(true)
    expect(await verifyPin('123456')).toEqual({ ok: true })
  })

  it('never stores the PIN in plaintext, and salts each install', async () => {
    await setPin('123456')
    const record = await getItem<{ v: number; salt: string; hash: string }>(PIN_KEY)
    expect(record?.v).toBe(2)
    expect(record?.salt).toMatch(/^[0-9a-f]{32}$/)
    expect(record?.hash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(record)).not.toContain('123456')

    const firstHash = record!.hash
    await setPin('123456')
    const second = await getItem<{ salt: string; hash: string }>(PIN_KEY)
    // Same PIN, fresh salt — the digest must differ.
    expect(second?.hash).not.toBe(firstHash)
  })

  it('rejects a wrong PIN and counts the failure', async () => {
    await setPin('123456')
    const result = await verifyPin('000000')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('wrong')
    expect((await getLockout()).failures).toBe(1)
  })

  it('locks out after repeated wrong attempts and refuses even the correct PIN', async () => {
    await setPin('123456')
    const now = 1_000_000
    for (let i = 0; i < FREE_ATTEMPTS + 1; i++) {
      await verifyPin('000000', now)
    }

    const locked = await verifyPin('123456', now)
    expect(locked.ok).toBe(false)
    if (!locked.ok) {
      expect(locked.reason).toBe('locked')
      expect(locked.retryAfterMs).toBeGreaterThan(0)
    }

    // Once the window passes, the correct PIN works again.
    const after = await verifyPin('123456', now + 31_000)
    expect(after).toEqual({ ok: true })
  })

  it('clears the failure counter after a successful unlock', async () => {
    await setPin('123456')
    await verifyPin('000000')
    expect((await getLockout()).failures).toBe(1)
    await verifyPin('123456')
    expect((await getLockout()).failures).toBe(0)
  })

  it('migrates a legacy unsalted hash on the next correct unlock', async () => {
    // The pre-migration format: 'pin_' + base36 of a 32-bit String.hashCode.
    let hash = 0
    for (const ch of '123456') {
      hash = (hash << 5) - hash + ch.charCodeAt(0)
      hash = hash & hash
    }
    await setItem(PIN_KEY, 'pin_' + Math.abs(hash).toString(36))

    expect(await verifyPin('123456')).toEqual({ ok: true })

    const migrated = await getItem<{ v: number; salt: string }>(PIN_KEY)
    expect(migrated?.v).toBe(2)
    expect(migrated?.salt).toMatch(/^[0-9a-f]{32}$/)
    // The new record still verifies.
    expect(await verifyPin('123456')).toEqual({ ok: true })
  })

  it('reports no-pin rather than a wrong PIN when none is set', async () => {
    const result = await verifyPin('123456')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('no-pin')
  })

  it('clearPin removes both the record and the lockout', async () => {
    await setPin('123456')
    await verifyPin('000000')
    await clearPin()
    expect(await hasPin()).toBe(false)
    expect(await getLockout()).toEqual({ failures: 0, lockedUntil: 0 })
  })
})

describe('biometrics', () => {
  beforeEach(() => {
    vi.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true)
    vi.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(true)
    vi.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({ success: true } as any)
  })

  it('reports availability when hardware is present and enrolled', async () => {
    expect(await checkAvailability()).toMatchObject({ available: true })
  })

  it('distinguishes missing hardware from a missing enrolment', async () => {
    vi.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false)
    expect(await checkAvailability()).toEqual({ available: false, reason: 'no-hardware' })

    vi.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true)
    vi.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(false)
    expect(await checkAvailability()).toEqual({ available: false, reason: 'not-enrolled' })
  })

  it('succeeds when the prompt succeeds', async () => {
    expect(await authenticate()).toEqual({ ok: true })
  })

  it('treats a user cancel as cancelled, not as a failure', async () => {
    vi.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({
      success: false,
      error: 'user_cancel',
    } as any)
    const result = await authenticate()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('cancelled')
  })

  it('surfaces a biometric lockout distinctly so the UI can fall back to the PIN', async () => {
    vi.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({
      success: false,
      error: 'lockout',
    } as any)
    const result = await authenticate()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('lockout')
  })

  it('never falls back to the device passcode', async () => {
    await authenticate()
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ disableDeviceFallback: true })
    )
  })

  it('gives a distinct sentence for each unavailable reason', () => {
    const messages = [
      unavailableMessage('no-hardware'),
      unavailableMessage('not-enrolled'),
      unavailableMessage('unsupported-platform'),
    ]
    expect(new Set(messages).size).toBe(3)
    messages.forEach((m) => expect(m.length).toBeGreaterThan(0))
  })
})
