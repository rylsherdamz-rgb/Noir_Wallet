import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Button } from '@/components/Button'
import { NewPasswordFields, isNewPasswordReady } from '@/components/NewPasswordFields'
import { hasPassword, setPassword, verifyPassword } from '@/services/appPassword'
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { ProcessingOverlay, afterOverlayPaints, stepsAt } from '@/components/flow/ProcessingOverlay'

/**
 * Create or change the wallet password.
 *
 * Reached from Security settings (create / change, can back out) and on open
 * for a wallet made before passwords existed (create only, cannot back out —
 * there is nothing else to unlock with). Changing requires the current one.
 */
export function CreatePasswordScreen({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  const [isChange, setIsChange] = useState<boolean | null>(null)
  const [current, setCurrent] = useState('')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    hasPassword().then((existing) => { if (!cancelled) setIsChange(existing) })
    return () => { cancelled = true }
  }, [])

  const canSave = isNewPasswordReady(pw, confirm) && (!isChange || current.length > 0) && !saving

  const save = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    // Password hashing blocks the JS thread — show the progress screen first.
    await afterOverlayPaints()
    try {
      if (isChange) {
        const result = await verifyPassword(current)
        if (!result.ok) {
          setCurrent('')
          setError(result.retryAfterMs > 0
            ? `Too many attempts. Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`
            : 'Current password is incorrect')
          setSaving(false)
          return
        }
      }
      await setPassword(pw)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      onDone()
    } catch (e: any) {
      setError(e?.message ?? 'Could not save your password. Try again.')
      setSaving(false)
    }
  }

  if (isChange === null) return <View style={styles.container} />

  return (
    <SafeAreaView style={styles.container}>
      {onBack ? <ScreenHeader title={isChange ? 'Change password' : 'Wallet password'} onBackPress={onBack} /> : null}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Ionicons name="key-outline" size={44} color={Colors.gold} style={styles.keyIcon} />
          <Text style={styles.title}>{isChange ? 'Change wallet password' : 'Create wallet password'}</Text>
          <Text style={styles.subtitle}>
            {isChange
              ? 'Enter your current password, then choose a new one.'
              : 'You’ll use this to unlock Noir. You can also turn on fingerprint or phone unlock in Security settings.'}
          </Text>

          {isChange && (
            <View style={[styles.field, !!current && styles.fieldActive]}>
              <Ionicons name="lock-open-outline" size={18} color={current ? Colors.gold : Colors.mutedWhite} />
              <TextInput
                style={styles.input}
                value={current}
                onChangeText={(v) => { setError(null); setCurrent(v) }}
                placeholder="Current password"
                placeholderTextColor={Colors.mutedWhite}
                secureTextEntry
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                accessibilityLabel="Current password"
              />
            </View>
          )}

          <NewPasswordFields
            pw={pw}
            confirm={confirm}
            onChangePw={(v) => { setError(null); setPw(v) }}
            onChangeConfirm={(v) => { setError(null); setConfirm(v) }}
            onSubmit={save}
            autoFocus={!isChange}
          />
          {!!error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}

          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.mutedWhite} />
            <Text style={styles.noteText}>
              This is not your recovery phrase. If you forget it, restore the wallet with your 12-word recovery phrase.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label={saving ? 'Securing…' : isChange ? 'Change password' : 'Save password'} onPress={save} disabled={!canSave} loading={saving} fullWidth />
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
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
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
  error: { color: Colors.danger, fontSize: FontSize.xs, marginTop: -Spacing.xs, marginBottom: Spacing.md },
  note: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  noteText: { flex: 1, color: Colors.mutedWhite, fontSize: FontSize.xs, lineHeight: 18 },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
})
