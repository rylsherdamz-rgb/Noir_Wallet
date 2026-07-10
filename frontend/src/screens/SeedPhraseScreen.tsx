import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Button } from '@/components/Button'
import { walletService, WalletKeys } from '@/services/wallet'
import * as Clipboard from 'expo-clipboard'

interface SeedPhraseScreenProps {
  onNext: (keys: WalletKeys) => void
  onBack: () => void
}

export function SeedPhraseScreen({ onNext, onBack }: SeedPhraseScreenProps) {
  const [phrase, setPhrase] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    walletService.generateMnemonic().then((m) => setPhrase(m.split(' ')))
  }, [])

  const handleCopy = async () => {
    await Clipboard.setStringAsync(phrase.join(' '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirm = async () => {
    const keys = await walletService.deriveKeys(phrase.join(' '))
    walletService.saveKeys(keys)
    onNext(keys)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <NoirLogo variant="mark" size={48} />
        <Text style={styles.title}>Your Recovery Phrase</Text>
        <Text style={styles.subtitle}>
          Write these 12 words down in order. Never share them with anyone. This is the only way to recover your wallet.
        </Text>

        <View style={styles.warningBox}>
          <Ionicons name="shield-outline" size={20} color={Colors.warning} />
          <Text style={styles.warningText}>
            Anyone with this phrase can access ALL your funds. Store it offline, never screenshot it.
          </Text>
        </View>

        <View style={styles.phraseBox}>
          {!revealed ? (
            <TouchableOpacity style={styles.revealBtn} onPress={() => setRevealed(true)}>
              <Ionicons name="eye-outline" size={24} color={Colors.gold} />
              <Text style={styles.revealText}>Tap to reveal phrase</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.phraseGrid}>
              {phrase.map((word, i) => (
                <View key={i} style={styles.wordRow}>
                  <Text style={styles.wordNum}>{i + 1}.</Text>
                  <Text style={styles.word}>{word}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {revealed && (
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={18} color={copied ? Colors.success : Colors.gold} />
            <Text style={[styles.copyText, copied && { color: Colors.success }]}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <Button
            label="I've Saved My Phrase"
            onPress={handleConfirm}
            disabled={!revealed}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.md, flexGrow: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  title: { fontSize: FontSize.xl, color: Colors.white, fontWeight: FontWeight.bold, textAlign: 'center', marginTop: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  warningBox: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.warning + '10', borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.warning + '25' },
  warningText: { flex: 1, fontSize: FontSize.xs, color: Colors.warning, lineHeight: 18 },
  phraseBox: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey, padding: Spacing.md, marginTop: Spacing.lg, minHeight: 180, alignItems: 'center', justifyContent: 'center' },
  revealBtn: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  revealText: { fontSize: FontSize.md, color: Colors.gold, fontWeight: FontWeight.semibold },
  phraseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, width: '100%' },
  wordRow: { flexDirection: 'row', alignItems: 'center', width: '33%', paddingVertical: Spacing.xs },
  wordNum: { fontSize: FontSize.xs, color: Colors.mutedWhite, width: 24, textAlign: 'right', marginRight: 4 },
  word: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.medium },
  copyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, marginTop: Spacing.md, paddingVertical: Spacing.sm },
  copyText: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.medium },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
})
