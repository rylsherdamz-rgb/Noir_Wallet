import { useState } from 'react'
import { View, Text, TextInput, ScrollView } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Button } from '@/components/Button'
import { ErrorMessage } from '@/components/ErrorMessage'
import { walletService, WalletKeys } from '@/services/wallet'

interface ImportWalletScreenProps {
  onComplete: (keys: WalletKeys) => void | Promise<void>
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
      const label = `Wallet ${1 + (await walletService.getWalletList()).length}`
      const keys = await walletService.deriveKeys(phrase, label)
      await walletService.saveKeys(keys)
      await walletService.addWalletToList({
        label: keys.label || 'Imported Wallet',
        stellarPublic: keys.stellarPublic,
        createdAt: new Date().toISOString(),
      })
      await onComplete(keys)
    } catch (e: any) {
      setError(e.message || 'Failed to import wallet')
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 16, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <PressableScale className="w-10 h-10 items-center justify-center mb-4" onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </PressableScale>

        <NoirLogo variant="mark" size={48} />
        <Text className="text-xl text-white font-bold text-center mt-4">Import Wallet</Text>
        <Text className="text-sm text-mutedWhite text-center mt-2">Enter your 12 or 24-word recovery phrase</Text>

        <View className="bg-cardBg rounded-2xl border border-borderGrey mt-8 overflow-hidden">
          <TextInput
            className="p-4 text-base text-white min-h-[120] font-mono leading-6"
            value={input}
            onChangeText={(t) => { setInput(t); setError(null) }}
            placeholder="Paste or type your recovery phrase..."
            placeholderTextColor="#A9A9A9"
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            textAlignVertical="top"
          />
          <Text className="text-xs text-mutedWhite text-right px-4 pb-2">{input.trim().split(/\s+/).filter(Boolean).length} words</Text>
        </View>

        {error ? <ErrorMessage message={error} variant="card" onRetry={handleImport} /> : null}

        <Button
          style={{ marginTop: 20 }}
          label={loading ? 'Importing...' : 'Import Wallet'}
          onPress={handleImport}
          disabled={input.trim().split(/\s+/).filter(Boolean).length < 12 || loading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
