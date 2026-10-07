import { useRef, useState } from 'react'
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { PressableScale } from '@/components/brand/PressableScale'
import { Avatar } from '@/components/Avatar'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'
import { useAppStore } from '@/store/useAppStore'
import { setPassword, passwordStrength, passwordProblem, MIN_PASSWORD_LENGTH } from '@/services/appPassword'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { Button } from '@/components/Button'

const MAX_NAME = 32

const STRENGTH = {
  weak: { label: 'Weak', color: Colors.danger, segments: 1 },
  fair: { label: 'Good', color: Colors.warning, segments: 2 },
  strong: { label: 'Strong', color: Colors.success, segments: 3 },
} as const

/**
 * Last onboarding step, after the wallet exists: a display name and a backup
 * password. The name only lives on this phone (receipts, greeting). The
 * password is the unlock fallback for phones without a screen lock.
 */
export function ProfileSetupScreen() {
  const router = useRouter()
  const { user, setUser } = useAppStore()
  const [step, setStep] = useState<'name' | 'password'>('name')
  const [name, setName] = useState(user?.displayName && user.displayName !== 'My Wallet' ? user.displayName : '')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmRef = useRef<TextInput>(null)

  const trimmed = name.trim()
  const strength = passwordStrength(pw)
  const problem = pw ? passwordProblem(pw) : null
  const mismatch = confirm.length > 0 && confirm !== pw
  const canFinish = !problem && pw.length > 0 && confirm === pw && !saving

  const continueToPassword = () => {
    if (!trimmed) return
    Haptics.selectionAsync().catch(() => {})
    setStep('password')
  }

  const finish = async () => {
    if (!canFinish) return
    setSaving(true)
    setError(null)
    try {
      await setPassword(pw)
      if (user) setUser({ ...user, displayName: trimmed })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      router.replace('/lock')
    } catch (e: any) {
      setError(e?.message ?? 'Could not save your password. Try again.')
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          {step === 'password' ? (
            <PressableScale onPress={() => setStep('name')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </PressableScale>
          ) : <View style={styles.iconSpacer} />}
          <View style={styles.progress} accessibilityLabel={`Step ${step === 'name' ? 1 : 2} of 2`}>
            <View style={[styles.progressBar, styles.progressOn]} />
            <View style={[styles.progressBar, step === 'password' && styles.progressOn]} />
          </View>
          <View style={styles.iconSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 'name' ? (
            <>
              <View style={styles.avatarStage}>
                <Avatar name={trimmed || undefined} size={72} />
              </View>
              <Text style={styles.title}>What should we call you?</Text>
              <Text style={styles.subtitle}>Shown on your receipts and home screen. It stays on this phone — never on the blockchain.</Text>

              <View style={[styles.field, !!trimmed && styles.fieldActive]}>
                <Ionicons name="person-outline" size={18} color={trimmed ? Colors.gold : Colors.mutedWhite} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Display name"
                  placeholderTextColor={Colors.mutedWhite}
                  maxLength={MAX_NAME}
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={continueToPassword}
                  accessibilityLabel="Display name"
                />
                <Text style={styles.counter}>{name.length}/{MAX_NAME}</Text>
              </View>
            </>
          ) : (
            <>
              <Ionicons name="key-outline" size={44} color={Colors.gold} style={styles.keyIcon} />
              <Text style={styles.title}>Create a backup password</Text>
              <Text style={styles.subtitle}>
                You’ll normally unlock with your fingerprint or phone PIN. This password is only asked for if your phone has no screen lock.
              </Text>

              <View style={[styles.field, !!pw && (problem ? styles.fieldWarn : styles.fieldActive)]}>
                <Ionicons name="lock-closed-outline" size={18} color={pw && !problem ? Colors.gold : Colors.mutedWhite} />
                <TextInput
                  key={`pw-${showPw}`}
                  style={styles.input}
                  value={pw}
                  onChangeText={(v) => { setError(null); setPw(v) }}
                  placeholder={`Password (${MIN_PASSWORD_LENGTH}+ characters)`}
                  placeholderTextColor={Colors.mutedWhite}
                  secureTextEntry={!showPw}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  accessibilityLabel="Password"
                />
                <PressableScale onPress={() => setShowPw((v) => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel={showPw ? 'Hide password' : 'Show password'}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.mutedWhite} />
                </PressableScale>
              </View>

              {pw.length > 0 && (
                <View style={styles.meterRow} accessibilityLabel={`Password strength: ${STRENGTH[strength].label}`}>
                  {[1, 2, 3].map((i) => (
                    <View key={i} style={[styles.meterSeg, i <= STRENGTH[strength].segments && { backgroundColor: STRENGTH[strength].color }]} />
                  ))}
                  <Text style={[styles.meterLabel, { color: STRENGTH[strength].color }]}>{problem ?? STRENGTH[strength].label}</Text>
                </View>
              )}

              <View style={[styles.field, mismatch ? styles.fieldWarn : confirm && confirm === pw ? styles.fieldActive : null]}>
                <Ionicons
                  name={confirm && confirm === pw ? 'checkmark-circle' : 'lock-closed-outline'}
                  size={18}
                  color={confirm && confirm === pw ? Colors.success : Colors.mutedWhite}
                />
                <TextInput
                  key={`confirm-${showPw}`}
                  ref={confirmRef}
                  style={styles.input}
                  value={confirm}
                  onChangeText={(v) => { setError(null); setConfirm(v) }}
                  placeholder="Confirm password"
                  placeholderTextColor={Colors.mutedWhite}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={finish}
                  accessibilityLabel="Confirm password"
                />
              </View>
              {mismatch && <Text style={styles.error}>Passwords don’t match</Text>}
              {!!error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.note}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.mutedWhite} />
                <Text style={styles.noteText}>
                  This is not your recovery phrase. If you forget it, restore the wallet with your 12-word recovery phrase.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step === 'name' ? (
            <Button label="Continue" onPress={continueToPassword} disabled={!trimmed} fullWidth />
          ) : (
            <Button label={saving ? 'Securing…' : 'Finish setup'} onPress={finish} disabled={!canFinish} loading={saving} fullWidth />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  iconSpacer: { width: 24 },
  progress: { flexDirection: 'row', gap: 6 },
  progressBar: { width: 32, height: 4, borderRadius: 2, backgroundColor: Colors.borderGrey },
  progressOn: { backgroundColor: Colors.gold },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  avatarStage: { alignItems: 'center', marginBottom: Spacing.lg },
  keyIcon: { alignSelf: 'center', marginBottom: Spacing.lg },
  title: { fontFamily: Fonts.display, fontSize: 24, color: Colors.cream, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 21, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.midGrey, borderRadius: 14, borderWidth: 1, borderColor: 'transparent',
    paddingHorizontal: Spacing.md, minHeight: 54, marginBottom: Spacing.md,
  },
  fieldActive: { borderColor: colorWithOpacity(Colors.gold, 0.6) },
  fieldWarn: { borderColor: colorWithOpacity(Colors.danger, 0.6) },
  input: { flex: 1, color: Colors.white, fontSize: FontSize.md, paddingVertical: Spacing.md },
  counter: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -Spacing.xs, marginBottom: Spacing.md },
  meterSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderGrey },
  meterLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginLeft: Spacing.sm, minWidth: 90, textAlign: 'right' },
  error: { color: Colors.danger, fontSize: FontSize.xs, marginTop: -Spacing.xs, marginBottom: Spacing.md },
  note: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  noteText: { flex: 1, color: Colors.mutedWhite, fontSize: FontSize.xs, lineHeight: 18 },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
})
