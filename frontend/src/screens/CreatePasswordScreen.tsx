/**
 * Create (or change) the wallet password.
 *
 * Shown at the end of onboarding, so every wallet has an unlock method that
 * does not depend on the phone: it works with no fingerprint, face or screen
 * lock set, and it is always there for a user who would rather not use them.
 */
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen'
import { PressableScale } from '@/components/brand/PressableScale'
import { Button } from '@/components/Button'
import { useAppStore } from '@/store/useAppStore'
import {
  hasPassword,
  setPassword,
  verifyPassword,
  validatePassword,
  MIN_PASSWORD_LENGTH,
} from '@/services/passwordLock'
import { authenticate, checkAvailability } from '@/services/biometrics'

interface CreatePasswordScreenProps {
  onDone: () => void
  /** Present only when leaving is allowed (changing from settings). */
  onBack?: () => void
}

export function CreatePasswordScreen({ onDone, onBack }: CreatePasswordScreenProps) {
  const setDeviceUnlockEnabled = useAppStore((s) => s.setBiometricLockEnabled)
  const deviceUnlockEnabled = useAppStore((s) => s.security.biometricLockEnabled)

  const [isChange, setIsChange] = useState<boolean | null>(null)
  const [deviceAvailable, setDeviceAvailable] = useState(false)
  const [useDevice, setUseDevice] = useState(false)
  const [current, setCurrent] = useState('')
  const [password, setPasswordValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([hasPassword(), checkAvailability()]).then(([existing, availability]) => {
      if (cancelled) return
      setIsChange(existing)
      setDeviceAvailable(availability.available)
      // Default the phone's own unlock on for a new wallet when the phone has
      // one; the user can turn it off here or later in Security settings.
      setUseDevice(existing ? useAppStore.getState().security.biometricLockEnabled : availability.available)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    setError('')
    const problem = validatePassword(password)
    if (problem) {
      setError(problem)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      if (isChange) {
        const result = await verifyPassword(current)
        if (!result.ok) {
          setError(
            result.reason === 'locked'
              ? 'Too many attempts. Try again later.'
              : 'Current password is incorrect.'
          )
          setCurrent('')
          return
        }
      }

      await setPassword(password)

      if (!deviceAvailable || !useDevice) {
        setDeviceUnlockEnabled(false)
      } else if (!deviceUnlockEnabled) {
        // Prove the person holding the phone owns its unlock before turning it
        // on. Declining is fine — the password alone still unlocks the wallet.
        const confirmed = await authenticate('Confirm to unlock Noir Wallet with this phone')
        setDeviceUnlockEnabled(confirmed.ok)
      }

      onDone()
    } finally {
      setBusy(false)
    }
  }

  if (isChange === null) return null

  return (
    <KeyboardAwareScreen scroll contentContainerStyle={styles.content}>
      {onBack && (
        <PressableScale
          onPress={onBack}
          style={styles.back}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
      )}

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="key-outline" size={36} color={Colors.gold} />
        </View>
        <Text style={styles.title}>{isChange ? 'Change Password' : 'Create Wallet Password'}</Text>
        <Text style={styles.body}>
          {isChange
            ? 'Enter your current password, then choose a new one.'
            : 'You will use this password to unlock Noir Wallet. It works even if your phone has no fingerprint, face or screen lock.'}
        </Text>
      </View>

      {isChange && (
        <TextInput
          style={styles.input}
          value={current}
          onChangeText={setCurrent}
          placeholder="Current password"
          placeholderTextColor={Colors.mutedWhite}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          accessibilityLabel="Current password"
        />
      )}
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPasswordValue}
        placeholder={`New password (min ${MIN_PASSWORD_LENGTH} characters)`}
        placeholderTextColor={Colors.mutedWhite}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        accessibilityLabel="New password"
      />
      <TextInput
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Confirm password"
        placeholderTextColor={Colors.mutedWhite}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSave}
        accessibilityLabel="Confirm password"
      />

      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      {deviceAvailable && (
        <View style={styles.deviceRow}>
          <View style={styles.deviceText}>
            <Text style={styles.deviceLabel}>Also unlock with this phone</Text>
            <Text style={styles.deviceDesc}>Fingerprint, face or your phone's PIN / pattern</Text>
          </View>
          <Switch
            value={useDevice}
            onValueChange={setUseDevice}
            trackColor={{ false: Colors.lightGrey, true: colorWithOpacity(Colors.gold, 0.38) }}
            thumbColor={useDevice ? Colors.gold : Colors.mutedWhite}
            accessibilityRole="switch"
            accessibilityLabel="Also unlock with this phone"
            accessibilityState={{ checked: useDevice }}
          />
        </View>
      )}

      <Button
        label={isChange ? 'Save Password' : 'Create Password'}
        onPress={handleSave}
        loading={busy}
        disabled={!password || !confirm || (isChange && !current)}
        fullWidth
        style={styles.save}
      />
    </KeyboardAwareScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  back: { alignSelf: 'flex-start' },
  hero: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, marginTop: Spacing.lg },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorWithOpacity(Colors.gold, 0.1),
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white, textAlign: 'center' },
  body: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 20 },
  input: {
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  error: { fontSize: FontSize.sm, color: Colors.danger },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  deviceText: { flex: 1 },
  deviceLabel: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.medium },
  deviceDesc: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: 2 },
  save: { marginTop: Spacing.md },
})
