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
import { checkAvailability, authenticate, unavailableMessage, isSystemPromptActive } from '@/services/biometrics'
import {
  setPassword,
  verifyPassword,
  clearPassword,
  hasPassword,
  validatePassword,
  getPasswordLockout,
  MIN_PASSWORD_LENGTH,
} from '@/services/passwordLock'
import { hasAppLock, getUnlockMethods } from '@/services/appLock'
import * as LocalAuthentication from 'expo-local-authentication'

const PIN_KEY = 'app_pin_hash'
const ATTEMPTS_KEY = 'app_pin_attempts'
const PASSWORD_KEY = 'app_password_hash'

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

describe('device unlock', () => {
  beforeEach(() => {
    vi.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
      LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG
    )
    vi.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({ success: true } as any)
  })

  it('reports biometric availability when a fingerprint or face is enrolled', async () => {
    expect(await checkAvailability()).toMatchObject({ available: true, biometric: true })
  })

  it("is available with only the phone's PIN / pattern set", async () => {
    vi.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(LocalAuthentication.SecurityLevel.SECRET)
    expect(await checkAvailability()).toMatchObject({ available: true, biometric: false })
  })

  it('is unavailable when the phone has no lock of any kind — and never prompts', async () => {
    vi.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(LocalAuthentication.SecurityLevel.NONE)
    vi.mocked(LocalAuthentication.authenticateAsync).mockClear()
    expect(await checkAvailability()).toEqual({ available: false, reason: 'no-device-lock' })

    const result = await authenticate()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('unavailable')
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled()
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

  it('surfaces a lockout distinctly so the UI can fall back to the password', async () => {
    vi.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({
      success: false,
      error: 'lockout',
    } as any)
    const result = await authenticate()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('lockout')
  })

  it("accepts the phone's own PIN / pattern as a fallback", async () => {
    await authenticate()
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ disableDeviceFallback: false, cancelLabel: 'Use password' })
    )
  })

  it('marks the system prompt as active so auto-lock ignores it', async () => {
    let seenDuring = false
    vi.mocked(LocalAuthentication.authenticateAsync).mockImplementation(async () => {
      seenDuring = isSystemPromptActive()
      return { success: true } as any
    })
    await authenticate()
    expect(seenDuring).toBe(true)
    // Still settling immediately after, then clear.
    expect(isSystemPromptActive()).toBe(true)
    expect(isSystemPromptActive(Date.now() + 5_000)).toBe(false)
  })

  it('gives a distinct sentence for each unavailable reason', () => {
    const messages = [unavailableMessage('no-device-lock'), unavailableMessage('unsupported-platform')]
    expect(new Set(messages).size).toBe(2)
    messages.forEach((m) => expect(m.length).toBeGreaterThan(0))
  })
})

describe('wallet password', () => {
  beforeEach(async () => {
    await clearPassword()
    await clearPin()
  })

  it('rejects passwords that are too short', () => {
    expect(validatePassword('short')).not.toBeNull()
    expect(validatePassword('x'.repeat(MIN_PASSWORD_LENGTH))).toBeNull()
    expect(validatePassword(' '.repeat(MIN_PASSWORD_LENGTH))).not.toBeNull()
  })

  it('refuses to store an invalid password', async () => {
    await expect(setPassword('short')).rejects.toThrow()
    expect(await hasPassword()).toBe(false)
  })

  it('round-trips through argon2id and never stores plaintext', async () => {
    expect(await hasPassword()).toBe(false)
    await setPassword('correct horse')
    expect(await hasPassword()).toBe(true)
    const record = await getItem<{ v: number; salt: string; hash: string }>(PASSWORD_KEY)
    expect(record?.salt).toMatch(/^[0-9a-f]{32}$/)
    expect(record?.hash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(record)).not.toContain('correct horse')
    expect(await verifyPassword('correct horse')).toEqual({ ok: true })
  })

  it('rejects a wrong password and locks out after repeated attempts', async () => {
    await setPassword('correct horse')
    const now = 2_000_000
    const first = await verifyPassword('wrong password', now)
    expect(first.ok).toBe(false)
    if (!first.ok) expect(first.reason).toBe('wrong')

    for (let i = 1; i < FREE_ATTEMPTS + 1; i++) await verifyPassword('wrong password', now)
    const locked = await verifyPassword('correct horse', now)
    expect(locked.ok).toBe(false)
    if (!locked.ok) expect(locked.reason).toBe('locked')

    expect(await verifyPassword('correct horse', now + 31_000)).toEqual({ ok: true })
    expect((await getPasswordLockout()).failures).toBe(0)
  })

  it('keeps its lockout separate from the PIN', async () => {
    await setPassword('correct horse')
    await setPin('123456')
    await verifyPin('000000')
    expect((await getPasswordLockout()).failures).toBe(0)
  })

  it('reports no-password rather than wrong when none is set', async () => {
    const result = await verifyPassword('anything at all')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('no-password')
  })

  it('only counts as an app lock once a password or PIN exists', async () => {
    expect(await hasAppLock()).toBe(false)
    await setPassword('correct horse')
    expect(await hasAppLock()).toBe(true)
    await clearPassword()
    await setPin('123456')
    expect(await hasAppLock()).toBe(true)
  })

  it('lists only the unlock methods that are actually set up', async () => {
    await setPassword('correct horse')
    vi.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(LocalAuthentication.SecurityLevel.NONE)
    expect(await getUnlockMethods()).toEqual({ password: true, pin: false, device: false, deviceBiometric: false })
  })
})
