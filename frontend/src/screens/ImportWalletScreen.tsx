import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Button } from '@/components/Button'
import { ErrorMessage } from '@/components/ErrorMessage'
import { walletService, WalletKeys } from '@/services/wallet'

interface ImportWalletScreenProps {
  onComplete: (keys: WalletKeys) => void
  onBack: () => void
}

export function ImportWalletScreen({ onComplete, onBack }: ImportWalletScreenProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    setError(null)
    const phrase = input.trim().toLowerCase()

    if (!walletService.validateMnemonic(phrase)) {
      setError('Invalid recovery phrase. Check spelling and try again.')
      return
    }

    setLoading(true)
    try {
      const keys = await walletService.deriveKeys(phrase)
      walletService.saveKeys(keys)
      onComplete(keys)
    } catch (e: any) {
      setError(e.message || 'Failed to import wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <NoirLogo variant="mark" size={48} />
        <Text style={styles.title}>Import Wallet</Text>
        <Text style={styles.subtitle}>Enter your 12 or 24-word recovery phrase</Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={(t) => { setInput(t); setError(null) }}
            placeholder="Paste or type your recovery phrase..."
            placeholderTextColor={Colors.mutedWhite}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            textAlignVertical="top"
          />
          <Text style={styles.wordCount}>{input.trim().split(/\s+/).filter(Boolean).length} words</Text>
        </View>

        {error && <ErrorMessage message={error} variant="card" onRetry={handleImport} />}

        <Button
          label={loading ? 'Importing...' : 'Import Wallet'}
          onPress={handleImport}
          disabled={input.trim().split(/\s+/).filter(Boolean).length < 12 || loading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.md, flexGrow: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  title: { fontSize: FontSize.xl, color: Colors.white, fontWeight: FontWeight.bold, textAlign: 'center', marginTop: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', marginTop: Spacing.sm },
  inputBox: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey, marginTop: Spacing.xl, overflow: 'hidden' },
  input: { padding: Spacing.md, fontSize: FontSize.md, color: Colors.white, minHeight: 120, fontFamily: 'monospace', lineHeight: 24 },
  wordCount: { fontSize: FontSize.xs, color: Colors.mutedWhite, textAlign: 'right', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
})
