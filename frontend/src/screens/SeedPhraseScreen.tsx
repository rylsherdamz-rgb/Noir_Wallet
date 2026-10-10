import { colorWithOpacity } from '@/constants/designTokens'
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { Button } from '@/components/Button'
import { walletService, WalletKeys } from '@/services/wallet'
import { usePreventScreenCapture } from 'expo-screen-capture'
import { logger } from '@/lib/logger'
import { ProcessingOverlay, afterOverlayPaints, stepsAt } from '@/components/flow/ProcessingOverlay'

interface SeedPhraseScreenProps {
  onNext: (keys: WalletKeys) => void | Promise<void>
  onBack: () => void
}

export function SeedPhraseScreen({ onNext, onBack }: SeedPhraseScreenProps) {
  // Blocks screenshots and screen recording while this screen is mounted. The
  // recovery phrase is the wallet — a screenshot puts it in the photo library,
  // which syncs to the cloud.
  usePreventScreenCapture('seed-phrase')

  const [phrase, setPhrase] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    walletService.generateMnemonic().then((m) => setPhrase(m.split(' ')))
  }, [])

  const handleConfirm = async () => {
    // Guard against a double-tap firing this twice before React re-renders the
    // button into its disabled/loading state.
    if (loading) return
    setStage(0)
    setLoading(true)
    // Key derivation is CPU-heavy and blocks the JS thread — put the
    // full-screen progress up first so the app never looks frozen.
    await afterOverlayPaints()
    try {
      const keys = await walletService.deriveKeys(phrase.join(' '), 'My Wallet')
      setStage(1)
      await walletService.saveKeys(keys)
      await walletService.addWalletToList({
        label: keys.label || 'My Wallet',
        stellarPublic: keys.stellarPublic,
        createdAt: new Date().toISOString(),
      })
      setStage(2)
      await onNext(keys)
    } catch (e) {
      logger.error('Failed to save keys:', e)
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PressableScale onPress={onBack} style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </PressableScale>

        <Text style={styles.title}>Write down your recovery phrase</Text>
        <Text style={styles.subtitle}>
          These 12 words are the only way back into your wallet. Keep them offline, in order.
        </Text>

        <View style={styles.warningBox}>
          <Ionicons name="shield-outline" size={20} color={Colors.warning} />
          <Text style={styles.warningText}>
            Anyone with this phrase can take all your funds. Screenshots and copying are blocked here.
          </Text>
        </View>

        <View style={styles.phraseBox}>
          {!revealed ? (
            <PressableScale style={styles.revealBtn} onPress={() => setRevealed(true)}
              accessibilityLabel="Show"
            >
              <Ionicons name="eye-outline" size={24} color={Colors.gold} />
              <Text style={styles.revealText}>Tap to reveal phrase</Text>
            </PressableScale>
          ) : (
            <View style={styles.phraseGrid}>
              {phrase.map((word, i) => (
                <View key={i} style={styles.wordRow}>
                  <Text style={styles.wordNum}>{i + 1}.</Text>
                  <Text style={styles.word} numberOfLines={1}>{word}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {revealed && (
          <Text style={styles.copyNote}>
            Copying is disabled on purpose — the clipboard syncs across your devices and is
            readable by other apps. Write the words down instead.
          </Text>
        )}

        <View style={styles.actions}>
          <Button
            label="I’ve written it down"
            onPress={handleConfirm}
            loading={loading}
            disabled={!revealed}
          />
        </View>
      </ScrollView>

      <ProcessingOverlay
        visible={loading}
        title="Generating your wallet"
        subtitle="Creating your Stellar keys from your recovery phrase."
        steps={stepsAt(GENERATE_STEPS, stage)}
        footnote="Keep the app open — this happens on your phone, nothing is sent anywhere."
      />
    </SafeAreaView>
  )
}

const GENERATE_STEPS = ['Deriving your keys', 'Encrypting them on this phone', 'Getting your wallet ready']

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.md, flexGrow: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  title: { fontFamily: Fonts.display, fontSize: 24, color: Colors.cream, marginTop: Spacing.md },
  subtitle: { fontSize: FontSize.md - 1, color: Colors.mutedWhite, marginTop: Spacing.sm, lineHeight: 22 },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  warningText: { flex: 1, fontSize: FontSize.sm - 1, color: Colors.silver, lineHeight: 19 },
  phraseBox: { backgroundColor: Colors.midGrey, borderRadius: 14, padding: Spacing.md, marginTop: Spacing.lg, minHeight: 180, alignItems: 'center', justifyContent: 'center' },
  revealBtn: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  revealText: { fontSize: FontSize.md, color: Colors.gold, fontWeight: FontWeight.semibold },
  // Two columns: room for the longest BIP39 words (8 letters) — never wraps.
  phraseGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.sm, width: '100%' },
  wordRow: { flexDirection: 'row', alignItems: 'center', width: '50%', paddingVertical: 6, paddingRight: Spacing.sm },
  wordNum: { fontSize: FontSize.xs, color: Colors.mutedWhite, width: 24, textAlign: 'right', marginRight: 4 },
  word: { flex: 1, fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.medium },
  copyNote: { fontSize: FontSize.xs, color: Colors.mutedWhite, textAlign: 'center', marginTop: Spacing.md, lineHeight: 18 },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
})
