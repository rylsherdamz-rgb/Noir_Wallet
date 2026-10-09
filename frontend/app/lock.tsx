import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, AppState, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'
import { BrandBackdrop } from '@/components/brand/BrandBackdrop'
import { Button } from '@/components/Button'
import { TextAction } from '@/components/ui/List'
import { authenticateWithDevice } from '@/services/biometrics'
import { verifyPassword, getLockout, lockoutRemainingMs } from '@/services/appPassword'
import { getUnlockOptions, type UnlockOptions } from '@/services/appLock'
import { useAppStore } from '@/store/useAppStore'

const NOIR_MARK = require('../assets/noir-mark.png')

function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

/**
 * App lock. The wallet password is the default. Phone unlock (fingerprint,
 * face, or the phone's own PIN / pattern) is offered first only when it is
 * turned on in Security settings and the phone actually has a lock;
 * cancelling it leaves the password in front of the user.
 */
export default function LockScreen() {
  const router = useRouter()
  const deviceUnlockEnabled = useAppStore((s) => s.security.deviceUnlockEnabled)
  const [options, setOptions] = useState<UnlockOptions | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const autoPrompted = useRef(false)

  const remainingMs = Math.max(0, lockedUntil - now)
  const isLockedOut = remainingMs > 0

  const resolveOptions = useCallback(async () => {
    const next = await getUnlockOptions(deviceUnlockEnabled)
    // Never strand the user on a prompt for a secret that does not exist: a
    // wallet created before the password existed is sent to create one.
    if (!next.password) return router.replace('/create-password')
    setLockedUntil((await getLockout()).lockedUntil)
    setOptions(next)
  }, [deviceUnlockEnabled, router])

  useEffect(() => { resolveOptions() }, [resolveOptions])

  // Re-check when returning from system settings (e.g. a screen lock was added).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') resolveOptions() })
    return () => sub.remove()
  }, [resolveOptions])

  useEffect(() => {
    if (!isLockedOut) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [isLockedOut])

  const unlockWithDevice = useCallback(async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const result = await authenticateWithDevice()
      if (result.ok) return router.replace('/(tabs)')
      if (result.reason === 'no-device-lock') resolveOptions()
      // A cancel is a deliberate choice to use the password instead — not an error.
      else if (result.reason !== 'cancelled') setError(result.message)
    } finally {
      setBusy(false)
    }
  }, [busy, router, resolveOptions])

  // Offer phone unlock by itself once, when it is on and available.
  useEffect(() => {
    if (!options?.device || autoPrompted.current) return
    autoPrompted.current = true
    unlockWithDevice()
  }, [options, unlockWithDevice])

  const unlockWithPassword = async () => {
    if (busy || !pw || isLockedOut) return
    setBusy(true)
    setError('')
    try {
      const result = await verifyPassword(pw)
      setPw('')
      if (result.ok) return router.replace('/(tabs)')
      const lockout = await getLockout()
      setLockedUntil(lockout.lockedUntil)
      setNow(Date.now())
      if (result.reason === 'no-password') return resolveOptions()
      setError(result.retryAfterMs > 0
        ? `Too many attempts. Try again in ${formatCountdown(lockoutRemainingMs(lockout))}.`
        : 'Incorrect password')
    } catch {
      setError('Something went wrong checking your password. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (options === null) return <View style={styles.container} />

  return (
    <View style={styles.container}>
      <BrandBackdrop />
      <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Image source={NOIR_MARK} style={styles.mark} resizeMode="contain" accessibilityLabel="Noir" />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your wallet password to unlock.</Text>

          <View style={[styles.field, !!error && styles.fieldError]}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.mutedWhite} />
            <TextInput
              style={styles.input}
              value={pw}
              onChangeText={(v) => { setError(''); setPw(v) }}
              placeholder="Password"
              placeholderTextColor={Colors.mutedWhite}
              secureTextEntry={!showPw}
              autoFocus={!options.device}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={unlockWithPassword}
              editable={!busy && !isLockedOut}
              accessibilityLabel="Password"
            />
            <TouchableOpacity onPress={() => setShowPw((v) => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel={showPw ? 'Hide password' : 'Show password'}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.mutedWhite} />
            </TouchableOpacity>
          </View>

          {busy ? (
            <View style={styles.busyRow} accessibilityLiveRegion="polite">
              <VerifyingPulse size={18} color={Colors.gold} />
              <Text style={styles.busyText}>{pw ? 'Checking…' : 'Waiting for unlock…'}</Text>
            </View>
          ) : isLockedOut ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">Too many attempts. Try again in {formatCountdown(remainingMs)}.</Text>
          ) : error ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <PrimaryButton icon="lock-open-outline" label="Unlock" onPress={unlockWithPassword} disabled={busy || !pw || isLockedOut} />
          {options.device && (
            <TextAction
              label={options.deviceBiometric ? 'Use fingerprint or face' : 'Use phone screen lock'}
              onPress={unlockWithDevice}
              disabled={busy}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

function PrimaryButton({ icon, label, onPress, disabled }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; disabled?: boolean }) {
  return <Button icon={icon} label={label} onPress={onPress} disabled={disabled} fullWidth />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  flex: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  mark: { width: 84, height: 88, marginBottom: Spacing.lg },
  title: { fontFamily: Fonts.display, fontSize: FontSize.xl, color: Colors.cream, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: Colors.silver, textAlign: 'center', lineHeight: 20 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, alignSelf: 'stretch',
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.md, minHeight: 56, marginTop: Spacing.md,
  },
  fieldError: { borderColor: colorWithOpacity(Colors.danger, 0.6) },
  input: { flex: 1, color: Colors.white, fontSize: FontSize.md, paddingVertical: Spacing.md },
  error: { fontSize: FontSize.sm, color: Colors.danger, textAlign: 'center' },
  busyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  busyText: { fontSize: FontSize.sm, color: Colors.gold },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.md },
})
