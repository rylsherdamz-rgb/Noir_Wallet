import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authenticateWithDevice, hasDeviceSecurity, isDeviceAuthInProgress } from '@/services/biometrics'
import * as LocalAuthentication from 'expo-local-authentication'

// The app keeps no PIN of its own — unlock is delegated to the phone's screen lock.
describe('device unlock (phone screen lock)', () => {
  beforeEach(() => {
    vi.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(LocalAuthentication.SecurityLevel.SECRET)
    vi.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({ success: true } as any)
  })

  it('reports a secured phone when any screen lock is set', async () => {
    expect(await hasDeviceSecurity()).toBe(true)
  })

  it('reports an unsecured phone when no screen lock is set', async () => {
    vi.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(LocalAuthentication.SecurityLevel.NONE)
    expect(await hasDeviceSecurity()).toBe(false)
  })

  it('succeeds when the system prompt succeeds', async () => {
    expect(await authenticateWithDevice()).toEqual({ ok: true })
  })

  it('allows the phone PIN / pattern as a fallback to biometrics', async () => {
    await authenticateWithDevice()
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ disableDeviceFallback: false })
    )
  })

  it('refuses to unlock and never prompts when the phone has no screen lock', async () => {
    vi.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(LocalAuthentication.SecurityLevel.NONE)
    vi.mocked(LocalAuthentication.authenticateAsync).mockClear()
    const result = await authenticateWithDevice()
    expect(result).toMatchObject({ ok: false, reason: 'no-device-lock' })
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled()
  })

  it('treats a user cancel as cancelled, not as a failure', async () => {
    vi.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({ success: false, error: 'user_cancel' } as any)
    expect(await authenticateWithDevice()).toMatchObject({ ok: false, reason: 'cancelled' })
  })

  it('surfaces a lockout distinctly', async () => {
    vi.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({ success: false, error: 'lockout' } as any)
    expect(await authenticateWithDevice()).toMatchObject({ ok: false, reason: 'lockout' })
  })

  it('flags the prompt as in progress so auto-lock ignores the round-trip', async () => {
    vi.useFakeTimers()
    try {
      let seenDuring = false
      vi.mocked(LocalAuthentication.authenticateAsync).mockImplementation(async () => {
        seenDuring = isDeviceAuthInProgress()
        return { success: true } as any
      })
      await authenticateWithDevice()
      expect(seenDuring).toBe(true)
      expect(isDeviceAuthInProgress()).toBe(true)
      vi.advanceTimersByTime(1000)
      expect(isDeviceAuthInProgress()).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })
})
