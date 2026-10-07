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
import { authenticateWithDevice, hasDeviceSecurity } from '@/services/biometrics'
import { hasPassword, verifyPassword, getLockout, lockoutRemainingMs } from '@/services/appPassword'

const NOIR_MARK = require('../assets/noir-mark.png')

type Method = 'device' | 'password' | 'none'

function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

/**
 * App lock. Normally delegates to the phone's own screen lock (fingerprint /
 * face, or the device PIN / pattern), the way banking wallets like Maya do.
 * When the phone has no screen lock, it falls back to the backup password set
 * during onboarding.
 */
export default function LockScreen() {
  const router = useRouter()
  const [method, setMethod] = useState<Method | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const autoPrompted = useRef(false)

  const remainingMs = Math.max(0, lockedUntil - now)
  const isLockedOut = remainingMs > 0

  const resolveMethod = useCallback(async () => {
    if (await hasDeviceSecurity()) return setMethod('device')
    if (await hasPassword()) {
      setLockedUntil((await getLockout()).lockedUntil)
      return setMethod('password')
    }
    setMethod('none')
  }, [])

  useEffect(() => { resolveMethod() }, [resolveMethod])

  // Re-check when returning from system settings (e.g. a screen lock was added).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') resolveMethod() })
    return () => sub.remove()
  }, [resolveMethod])

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
      if (result.reason === 'no-device-lock') resolveMethod()
      else if (result.reason !== 'cancelled') setError(result.message)
    } finally {
      setBusy(false)
    }
  }, [busy, router, resolveMethod])

  // Open the system prompt by itself once the screen is up.
  useEffect(() => {
    if (method !== 'device' || autoPrompted.current) return
    autoPrompted.current = true
    unlockWithDevice()
  }, [method, unlockWithDevice])

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
      if (result.reason === 'no-password') return resolveMethod()
      setError(result.retryAfterMs > 0
        ? `Too many attempts. Try again in ${formatCountdown(lockoutRemainingMs(lockout))}.`
        : 'Incorrect password')
    } catch {
      setError('Something went wrong checking your password. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (method === null) return <View style={styles.container} />

  const copy = {
    device: { icon: 'lock-closed' as const, title: 'Welcome back', body: 'Unlock with your fingerprint, face or phone PIN.' },
    password: { icon: 'key-outline' as const, title: 'Enter your password', body: 'Your phone has no screen lock, so use the backup password you created during setup.' },
    none: { icon: 'shield-outline' as const, title: 'Protect your wallet', body: 'Your phone has no screen lock. Create a backup password so nobody else can open this wallet.' },
  }[method]

  return (
    <View style={styles.container}>
      <BrandBackdrop />
      <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Image source={NOIR_MARK} style={styles.mark} resizeMode="contain" accessibilityLabel="Noir" />
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.body}</Text>

          {method === 'password' && (
            <View style={[styles.field, !!error && styles.fieldError]}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.mutedWhite} />
              <TextInput
                style={styles.input}
                value={pw}
                onChangeText={(v) => { setError(''); setPw(v) }}
                placeholder="Password"
                placeholderTextColor={Colors.mutedWhite}
                secureTextEntry={!showPw}
                autoFocus
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
          )}

          {busy ? (
            <View style={styles.busyRow} accessibilityLiveRegion="polite">
              <VerifyingPulse size={18} color={Colors.gold} />
              <Text style={styles.busyText}>{method === 'password' ? 'Checking…' : 'Waiting for unlock…'}</Text>
            </View>
          ) : isLockedOut ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">Too many attempts. Try again in {formatCountdown(remainingMs)}.</Text>
          ) : error ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          {method === 'device' && (
            <PrimaryButton icon="finger-print-outline" label="Unlock" onPress={unlockWithDevice} disabled={busy} />
          )}
          {method === 'password' && (
            <PrimaryButton icon="lock-open-outline" label="Unlock" onPress={unlockWithPassword} disabled={busy || !pw || isLockedOut} />
          )}
          {method === 'none' && (
            <PrimaryButton icon="key-outline" label="Create a password" onPress={() => router.replace('/setup-profile')} />
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
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
})
