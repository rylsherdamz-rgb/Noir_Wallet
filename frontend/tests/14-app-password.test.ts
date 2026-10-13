import { describe, it, expect, beforeEach } from 'vitest'
import {
  setPassword, verifyPassword, hasPassword, clearPassword, getLockout,
  passwordStrength, passwordProblem, lockoutDurationMs, FREE_ATTEMPTS,
} from '@/services/appPassword'

describe('app password (fallback unlock)', () => {
  beforeEach(async () => { await clearPassword() })

  it('rates strength', () => {
    expect(passwordStrength('short1')).toBe('weak')
    expect(passwordStrength('alllowercase')).toBe('weak')
    expect(passwordStrength('letters123')).toBe('fair')
    expect(passwordStrength('Letters123!xyz')).toBe('strong')
  })

  it('explains why a password is rejected', () => {
    expect(passwordProblem('abc')).toMatch(/at least 8/)
    expect(passwordProblem('abcdefgh')).toMatch(/Mix/)
    expect(passwordProblem('abcdefg1')).toBeNull()
  })

  it('refuses to store a weak password', async () => {
    await expect(setPassword('abc')).rejects.toThrow()
    expect(await hasPassword()).toBe(false)
  })

  it('stores a hash and verifies the right password only', async () => {
    await setPassword('correct-horse1')
    expect(await hasPassword()).toBe(true)
    expect(await verifyPassword('wrong-horse1')).toMatchObject({ ok: false, reason: 'wrong' })
    expect(await verifyPassword('correct-horse1')).toEqual({ ok: true })
  }, 30_000)

  it('locks out after repeated wrong attempts', async () => {
    await setPassword('correct-horse1')
    const t0 = 1_000_000
    for (let i = 0; i <= FREE_ATTEMPTS; i++) await verifyPassword('nope-nope1', t0)
    const lockout = await getLockout()
    expect(lockout.lockedUntil).toBe(t0 + lockoutDurationMs(FREE_ATTEMPTS + 1))
    expect(await verifyPassword('correct-horse1', t0 + 1)).toMatchObject({ ok: false, reason: 'locked' })
  }, 60_000)

  it('reports no password when none is set', async () => {
    expect(await verifyPassword('anything1')).toMatchObject({ ok: false, reason: 'no-password' })
  })
})
