import { Modal, View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { NfcScanPulse } from '@/components/brand/NfcScanPulse'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'

export interface ProcessingStep {
  label: string
  state: 'done' | 'active' | 'pending'
}

interface ProcessingOverlayProps {
  visible: boolean
  /** "nfc" while waiting for a card tap; "verify" while talking to the chain. */
  variant?: 'nfc' | 'verify'
  title: string
  subtitle?: string
  steps?: ProcessingStep[]
}

/**
 * Full-screen, blocking progress state for anything that signs or submits —
 * the user sees one clear "this is happening" screen instead of a spinner
 * appended under a form they can still poke at.
 */
export function ProcessingOverlay({ visible, variant = 'verify', title, subtitle, steps }: ProcessingOverlayProps) {
  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={() => { /* not dismissible */ }}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surfaceBg }]} />
      <SafeAreaView style={styles.container}>
        <View style={styles.stage} accessibilityLiveRegion="polite">
          {variant === 'nfc' ? <NfcScanPulse size={200} /> : <VerifyingPulse size={200} />}
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {steps && steps.length > 0 && (
          <View style={styles.steps}>
            {steps.map((s) => (
              <View key={s.label} style={styles.stepRow}>
                <View style={[styles.stepDot, s.state === 'done' && styles.stepDotDone, s.state === 'active' && styles.stepDotActive]}>
                  {s.state === 'done' && <Ionicons name="checkmark" size={16} color={Colors.gold} />}
                  {s.state === 'active' && <VerifyingPulse size={14} />}
                </View>
                <Text style={[styles.stepLabel, s.state === 'pending' && styles.stepLabelPending]}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footnote}>Keep the app open — this takes a few seconds on Stellar.</Text>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  title: { fontFamily: Fonts.display, fontSize: FontSize.xl, color: Colors.white, textAlign: 'center', marginTop: Spacing.lg },
  subtitle: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  steps: { gap: 18, paddingHorizontal: Spacing.sm, marginBottom: Spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepDot: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  stepDotDone: {},
  stepDotActive: {},
  stepSpinner: { transform: [{ scale: 0.7 }] },
  stepLabel: { fontSize: FontSize.md - 1, color: Colors.white, fontWeight: FontWeight.medium },
  stepLabelPending: { color: Colors.mutedWhite },
  footnote: { fontSize: FontSize.xs, color: Colors.mutedWhite, textAlign: 'center' },
})
