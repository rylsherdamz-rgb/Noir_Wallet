import { useRef, useState } from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { passwordStrength, passwordProblem, MIN_PASSWORD_LENGTH } from '@/services/appPassword'
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'

const STRENGTH = {
  weak: { label: 'Weak', color: Colors.danger, segments: 1 },
  fair: { label: 'Good', color: Colors.warning, segments: 2 },
  strong: { label: 'Strong', color: Colors.success, segments: 3 },
} as const

/** True once the new password is acceptable and both fields match. */
export function isNewPasswordReady(pw: string, confirm: string): boolean {
  return pw.length > 0 && !passwordProblem(pw) && confirm === pw
}

/**
 * New password + confirmation with a strength meter. Shared by onboarding
 * (profile setup) and the create / change password screen.
 */
export function NewPasswordFields({ pw, confirm, onChangePw, onChangeConfirm, onSubmit, autoFocus = true }: {
  pw: string
  confirm: string
  onChangePw: (v: string) => void
  onChangeConfirm: (v: string) => void
  onSubmit: () => void
  autoFocus?: boolean
}) {
  const [showPw, setShowPw] = useState(false)
  const confirmRef = useRef<TextInput>(null)
  const strength = passwordStrength(pw)
  const problem = pw ? passwordProblem(pw) : null
  const mismatch = confirm.length > 0 && confirm !== pw
  const matched = confirm.length > 0 && confirm === pw

  return (
    <>
      <View style={[styles.field, !!pw && (problem ? styles.fieldWarn : styles.fieldActive)]}>
        <Ionicons name="lock-closed-outline" size={18} color={pw && !problem ? Colors.gold : Colors.mutedWhite} />
        <TextInput
          key={`pw-${showPw}`}
          style={styles.input}
          value={pw}
          onChangeText={onChangePw}
          placeholder={`Password (${MIN_PASSWORD_LENGTH}+ characters)`}
          placeholderTextColor={Colors.mutedWhite}
          secureTextEntry={!showPw}
          autoFocus={autoFocus}
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

      <View style={[styles.field, mismatch ? styles.fieldWarn : matched ? styles.fieldActive : null]}>
        <Ionicons
          name={matched ? 'checkmark-circle' : 'lock-closed-outline'}
          size={18}
          color={matched ? Colors.success : Colors.mutedWhite}
        />
        <TextInput
          key={`confirm-${showPw}`}
          ref={confirmRef}
          style={styles.input}
          value={confirm}
          onChangeText={onChangeConfirm}
          placeholder="Confirm password"
          placeholderTextColor={Colors.mutedWhite}
          secureTextEntry={!showPw}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          accessibilityLabel="Confirm password"
        />
      </View>
      {mismatch && <Text style={styles.error}>Passwords don’t match</Text>}
    </>
  )
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.midGrey, borderRadius: 14, borderWidth: 1, borderColor: 'transparent',
    paddingHorizontal: Spacing.md, minHeight: 54, marginBottom: Spacing.md,
  },
  fieldActive: { borderColor: colorWithOpacity(Colors.gold, 0.6) },
  fieldWarn: { borderColor: colorWithOpacity(Colors.danger, 0.6) },
  input: { flex: 1, color: Colors.white, fontSize: FontSize.md, paddingVertical: Spacing.md },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -Spacing.xs, marginBottom: Spacing.md },
  meterSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.borderGrey },
  meterLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginLeft: Spacing.sm, minWidth: 90, textAlign: 'right' },
  error: { color: Colors.danger, fontSize: FontSize.xs, marginTop: -Spacing.xs, marginBottom: Spacing.md },
})
