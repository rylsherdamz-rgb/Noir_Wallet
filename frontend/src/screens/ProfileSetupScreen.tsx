import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { PressableScale } from '@/components/brand/PressableScale'
import { Avatar } from '@/components/Avatar'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'
import { useAppStore } from '@/store/useAppStore'
import { setPassword } from '@/services/appPassword'
import { NewPasswordFields, isNewPasswordReady } from '@/components/NewPasswordFields'
import { Colors, Spacing, FontSize, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { Button } from '@/components/Button'
import { ProcessingOverlay, afterOverlayPaints, stepsAt } from '@/components/flow/ProcessingOverlay'

const MAX_NAME = 32

/**
 * Last onboarding step, after the wallet exists: a display name and the
 * wallet password. The name only lives on this phone (receipts, greeting).
 * The password is the default unlock; phone unlock is an opt-in extra.
 */
export function ProfileSetupScreen() {
  const router = useRouter()
  const { user, setUser } = useAppStore()
  const [step, setStep] = useState<'name' | 'password'>('name')
  const [name, setName] = useState(user?.displayName && user.displayName !== 'My Wallet' ? user.displayName : '')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = name.trim()
  const canFinish = isNewPasswordReady(pw, confirm) && !saving

  const continueToPassword = () => {
    if (!trimmed) return
    Haptics.selectionAsync().catch(() => {})
    setStep('password')
  }

  const finish = async () => {
    if (!canFinish) return
    setSaving(true)
    setError(null)
    // Password hashing blocks the JS thread — show the progress screen first.
    await afterOverlayPaints()
    try {
      await setPassword(pw)
      if (user) setUser({ ...user, displayName: trimmed })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      router.replace('/(tabs)')
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
              <Text style={styles.title}>Create wallet password</Text>
              <Text style={styles.subtitle}>
                You’ll use this to unlock Noir. You can also turn on fingerprint or phone unlock in Security settings.
              </Text>

              <NewPasswordFields
                pw={pw}
                confirm={confirm}
                onChangePw={(v) => { setError(null); setPw(v) }}
                onChangeConfirm={(v) => { setError(null); setConfirm(v) }}
                onSubmit={finish}
              />
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

      <ProcessingOverlay
        visible={saving}
        title="Securing your wallet"
        subtitle="Locking your wallet with your new password."
        steps={stepsAt(['Hardening your password', 'Saving on this phone'], 0)}
        footnote="Keep the app open — this takes a few seconds on your phone."
      />
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
  input: { flex: 1, color: Colors.white, fontSize: FontSize.md, paddingVertical: Spacing.md },
  counter: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  error: { color: Colors.danger, fontSize: FontSize.xs, marginTop: -Spacing.xs, marginBottom: Spacing.md },
  note: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  noteText: { flex: 1, color: Colors.mutedWhite, fontSize: FontSize.xs, lineHeight: 18 },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
})
