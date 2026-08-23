import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme'
import { NumericKeypad } from '@/components/NumericKeypad'
import { useAppStore } from '@/store/useAppStore'
import {
  hasPin as hasStoredPin,
  setPin as storePin,
  verifyPin,
  getLockout,
  lockoutRemainingMs,
} from '@/services/pinLock'
import { authenticate, checkAvailability } from '@/services/biometrics'

const MAX_LENGTH = 6

function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

export default function LockScreen() {
  const router = useRouter()
  const biometricEnabled = useAppStore((s) => s.security.biometricLockEnabled)

  const [pin, setPin] = useState('')
  const [mode, setMode] = useState<'setup' | 'unlock' | 'confirm'>('unlock')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const biometricTried = useRef(false)

  const remainingMs = Math.max(0, lockedUntil - now)
  const isLocked = remainingMs > 0

  useEffect(() => {
    let cancelled = false
    async function init() {
      const [existing, lockout, availability] = await Promise.all([
        hasStoredPin(),
        getLockout(),
        checkAvailability(),
      ])
      if (cancelled) return
      setHasPin(existing)
      setMode(existing ? 'unlock' : 'setup')
      setLockedUntil(lockout.lockedUntil)
      setBiometricAvailable(availability.available)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  // Drive the countdown only while a lockout is actually running.
  useEffect(() => {
    if (!isLocked) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isLocked])

  const unlock = useCallback(() => {
    router.replace('/(tabs)')
  }, [router])

  const promptBiometric = useCallback(async () => {
    setError('')
    const result = await authenticate()
    if (result.ok) {
      unlock()
      return
    }
    // A cancel is a deliberate choice to use the PIN instead — not an error.
    if (result.reason !== 'cancelled') setError(result.message)
  }, [unlock])

  // Offer biometrics once per mount, before the user starts typing.
  useEffect(() => {
    if (mode !== 'unlock' || !biometricEnabled || !biometricAvailable || isLocked) return
    if (biometricTried.current) return
    biometricTried.current = true
    promptBiometric()
  }, [mode, biometricEnabled, biometricAvailable, isLocked, promptBiometric])

  const handleVerify = useCallback(
    async (candidate: string) => {
      setBusy(true)
      const result = await verifyPin(candidate)
      setBusy(false)
      setPin('')
      if (result.ok) {
        setLockedUntil(0)
        unlock()
        return
      }
      const lockout = await getLockout()
      setLockedUntil(lockout.lockedUntil)
      setNow(Date.now())
      if (result.reason === 'locked' || result.retryAfterMs > 0) {
        setError(`Too many attempts. Try again in ${formatCountdown(lockoutRemainingMs(lockout))}.`)
      } else if (result.reason === 'no-pin') {
        setError('No PIN is set on this device.')
        setHasPin(false)
        setMode('setup')
      } else {
        setError('Incorrect PIN')
      }
    },
    [unlock]
  )

  const handleSave = useCallback(
    async (candidate: string) => {
      if (pin !== candidate) {
        setError('PINs do not match')
        setPin('')
        setConfirmPin('')
        setMode('setup')
        return
      }
      setBusy(true)
      await storePin(candidate)
      setBusy(false)
      unlock()
    },
    [pin, unlock]
  )

  const handleChange = (next: string) => {
    if (busy || isLocked) return
    setError('')
    if (mode === 'confirm') {
      setConfirmPin(next)
      if (next.length === MAX_LENGTH) handleSave(next)
      return
    }
    setPin(next)
    if (next.length !== MAX_LENGTH) return
    if (mode === 'unlock') handleVerify(next)
    else setMode('confirm')
  }

  const displayPin = mode === 'confirm' ? confirmPin : pin

  if (hasPin === null) return null

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.gold} />
        <Text style={styles.title}>
          {mode === 'setup' ? 'Set App PIN' : mode === 'confirm' ? 'Confirm PIN' : 'Enter PIN'}
        </Text>
        {isLocked ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            Too many attempts. Try again in {formatCountdown(remainingMs)}.
          </Text>
        ) : error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <View
          style={styles.dots}
          accessibilityRole="progressbar"
          accessibilityLabel={`${displayPin.length} of ${MAX_LENGTH} digits entered`}
        >
          {Array.from({ length: MAX_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.dot, i < displayPin.length && styles.dotFilled]} />
          ))}
        </View>

        <NumericKeypad value={displayPin} onChangeValue={handleChange} maxDigits={MAX_LENGTH} />

        {mode === 'unlock' && biometricEnabled && biometricAvailable && !isLocked && (
          <TouchableOpacity
            onPress={promptBiometric}
            style={styles.biometricBtn}
            accessibilityRole="button"
            accessibilityLabel="Unlock with biometrics"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="finger-print-outline" size={22} color={Colors.gold} />
            <Text style={styles.biometricLabel}>Use biometrics</Text>
          </TouchableOpacity>
        )}

        {mode === 'setup' && (
          <TouchableOpacity
            onPress={unlock}
            style={styles.skipBtn}
            accessibilityRole="button"
            accessibilityLabel="Skip PIN setup"
            accessibilityHint="Continues without a PIN. Your wallet will not be locked."
          >
            <Text style={styles.skipLabel}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white },
  error: { fontSize: FontSize.sm, color: Colors.danger, textAlign: 'center' },
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
  biometricBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  biometricLabel: { fontSize: FontSize.md, color: Colors.gold, fontWeight: FontWeight.medium },
  skipBtn: { paddingVertical: Spacing.md },
  skipLabel: { fontSize: FontSize.md, color: Colors.mutedWhite },
})
