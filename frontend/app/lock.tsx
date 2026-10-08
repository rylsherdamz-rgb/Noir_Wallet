import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NumericKeypad } from '@/components/NumericKeypad'
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen'
import { Button } from '@/components/Button'
import { useAppStore } from '@/store/useAppStore'
import { verifyPin, getLockout, lockoutRemainingMs, type LockoutState } from '@/services/pinLock'
import { verifyPassword, getPasswordLockout } from '@/services/passwordLock'
import { getUnlockMethods, type UnlockMethods } from '@/services/appLock'
import { authenticate } from '@/services/biometrics'

const PIN_LENGTH = 6

type Method = 'password' | 'pin'

function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

export default function LockScreen() {
  const router = useRouter()
  const deviceUnlockEnabled = useAppStore((s) => s.security.biometricLockEnabled)

  const [methods, setMethods] = useState<UnlockMethods | null>(null)
  const [method, setMethod] = useState<Method>('password')
  const [pin, setPin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lockouts, setLockouts] = useState<Record<Method, number>>({ password: 0, pin: 0 })
  const [now, setNow] = useState(Date.now())
  const deviceTried = useRef(false)

  const remainingMs = Math.max(0, lockouts[method] - now)
  const isLocked = remainingMs > 0
  const canUseDevice = !!methods?.device && deviceUnlockEnabled

  const unlock = useCallback(() => {
    router.replace('/(tabs)')
  }, [router])

  useEffect(() => {
    let cancelled = false
    async function init() {
      const [available, pinLockout, passwordLockout] = await Promise.all([
        getUnlockMethods(),
        getLockout(),
        getPasswordLockout(),
      ])
      if (cancelled) return
      // Nothing of the wallet's own to unlock with: never strand the user on a
      // prompt for a secret that does not exist — send them to create one.
      if (!available.password && !available.pin) {
        router.replace('/create-password')
        return
      }
      setMethods(available)
      setMethod(available.password ? 'password' : 'pin')
      setLockouts({ password: passwordLockout.lockedUntil, pin: pinLockout.lockedUntil })
    }
    init()
    return () => {
      cancelled = true
    }
  }, [router])

  // Drive the countdown only while a lockout is actually running.
  useEffect(() => {
    if (!isLocked) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isLocked])

  const promptDevice = useCallback(async () => {
    setError('')
    const result = await authenticate()
    if (result.ok) {
      unlock()
      return
    }
    // A cancel is a deliberate choice to use the password instead — not an error.
    if (result.reason !== 'cancelled') setError(result.message)
  }, [unlock])

  // Offer the phone's own unlock once per mount, and only when it is both
  // turned on in settings and actually configured on this phone.
  useEffect(() => {
    if (!methods || !canUseDevice || deviceTried.current) return
    deviceTried.current = true
    promptDevice()
  }, [methods, canUseDevice, promptDevice])

  const applyFailure = useCallback(
    (which: Method, lockout: LockoutState, wrongMessage: string) => {
      setLockouts((prev) => ({ ...prev, [which]: lockout.lockedUntil }))
      setNow(Date.now())
      const remaining = lockoutRemainingMs(lockout)
      setError(remaining > 0 ? `Too many attempts. Try again in ${formatCountdown(remaining)}.` : wrongMessage)
    },
    []
  )

  const handlePin = useCallback(
    async (candidate: string) => {
      setBusy(true)
      const result = await verifyPin(candidate)
      setBusy(false)
      setPin('')
      if (result.ok) {
        unlock()
        return
      }
      applyFailure('pin', await getLockout(), 'Incorrect PIN')
    },
    [unlock, applyFailure]
  )

  const handlePassword = useCallback(async () => {
    if (!password || busy || isLocked) return
    setBusy(true)
    const result = await verifyPassword(password)
    setBusy(false)
    if (result.ok) {
      setPassword('')
      unlock()
      return
    }
    setPassword('')
    applyFailure('password', await getPasswordLockout(), 'Incorrect password')
  }, [password, busy, isLocked, unlock, applyFailure])

  const handlePinChange = (next: string) => {
    if (busy || isLocked) return
    setError('')
    setPin(next)
    if (next.length === PIN_LENGTH) handlePin(next)
  }

  const switchMethod = (next: Method) => {
    setError('')
    setPin('')
    setPassword('')
    setMethod(next)
  }

  if (!methods) return null

  return (
    <KeyboardAwareScreen scroll contentContainerStyle={styles.content}>
      <Ionicons name="lock-closed-outline" size={48} color={Colors.gold} />
      <Text style={styles.title}>{method === 'password' ? 'Enter Password' : 'Enter PIN'}</Text>
      {isLocked ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          Too many attempts. Try again in {formatCountdown(remainingMs)}.
        </Text>
      ) : error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {method === 'password' ? (
        <View style={styles.passwordBlock}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={(t) => {
              setError('')
              setPassword(t)
            }}
            placeholder="Wallet password"
            placeholderTextColor={Colors.mutedWhite}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handlePassword}
            editable={!busy && !isLocked}
            autoFocus={!canUseDevice}
            accessibilityLabel="Wallet password"
          />
          <Button
            label="Unlock"
            onPress={handlePassword}
            loading={busy}
            disabled={!password || isLocked}
            fullWidth
          />
        </View>
      ) : (
        <>
          <View
            style={styles.dots}
            accessibilityRole="progressbar"
            accessibilityLabel={`${pin.length} of ${PIN_LENGTH} digits entered`}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
            ))}
          </View>
          <NumericKeypad value={pin} onChangeValue={handlePinChange} maxDigits={PIN_LENGTH} />
        </>
      )}

      {canUseDevice && (
        <TouchableOpacity
          onPress={promptDevice}
          style={styles.linkBtn}
          accessibilityRole="button"
          accessibilityLabel={methods.deviceBiometric ? 'Unlock with biometrics' : 'Unlock with phone screen lock'}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={methods.deviceBiometric ? 'finger-print-outline' : 'phone-portrait-outline'}
            size={22}
            color={Colors.gold}
          />
          <Text style={styles.linkLabel}>
            {methods.deviceBiometric ? 'Use biometrics' : 'Use phone screen lock'}
          </Text>
        </TouchableOpacity>
      )}

      {method === 'password' && methods.pin && (
        <TouchableOpacity onPress={() => switchMethod('pin')} style={styles.linkBtn} accessibilityRole="button">
          <Text style={styles.secondaryLabel}>Use PIN instead</Text>
        </TouchableOpacity>
      )}
      {method === 'pin' && methods.password && (
        <TouchableOpacity onPress={() => switchMethod('password')} style={styles.linkBtn} accessibilityRole="button">
          <Text style={styles.secondaryLabel}>Use password instead</Text>
        </TouchableOpacity>
      )}
    </KeyboardAwareScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white },
  error: { fontSize: FontSize.sm, color: Colors.danger, textAlign: 'center' },
  passwordBlock: { alignSelf: 'stretch', gap: Spacing.md, marginTop: Spacing.lg },
  passwordInput: {
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  dots: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.lg },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  dotFilled: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  linkLabel: { fontSize: FontSize.md, color: Colors.gold, fontWeight: FontWeight.medium },
  secondaryLabel: { fontSize: FontSize.md, color: Colors.mutedWhite },
})
