import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Button } from '@/components/Button'
import { walletService, WalletKeys } from '@/services/wallet'
import * as Clipboard from 'expo-clipboard'

interface SeedPhraseScreenProps {
  onNext: (keys: WalletKeys) => void | Promise<void>
  onBack: () => void
}

export function SeedPhraseScreen({ onNext, onBack }: SeedPhraseScreenProps) {
  const [phrase, setPhrase] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    walletService.generateMnemonic().then((m) => setPhrase(m.split(' ')))
  }, [])

  const handleCopy = async () => {
    await Clipboard.setStringAsync(phrase.join(' '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const keys = await walletService.deriveKeys(phrase.join(' '), 'My Wallet')
      await walletService.saveKeys(keys)
      await walletService.addWalletToList({
        label: keys.label || 'My Wallet',
        stellarPublic: keys.stellarPublic,
        createdAt: new Date().toISOString(),
      })
      await onNext(keys)
    } catch (e) {
      console.error('Failed to save keys:', e)
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 16, flexGrow: 1 }}>
        <PressableScale className="w-10 h-10 items-center justify-center mb-4" onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </PressableScale>

        <NoirLogo variant="mark" size={48} />
        <Text className="text-xl text-white font-bold text-center mt-4">Your Recovery Phrase</Text>
        <Text className="text-sm text-mutedWhite text-center mt-2 leading-5">
          Write these 12 words down in order. Never share them with anyone. This is the only way to recover your wallet.
        </Text>

        <View className="flex-row gap-2 rounded-xl p-4 mt-6 border" style={{ backgroundColor: '#F0B42910', borderColor: '#F0B42925' }}>
          <Ionicons name="shield-outline" size={20} color="#F0B429" />
          <Text className="flex-1 text-xs text-[#F0B429] leading-[18]">
            Anyone with this phrase can access ALL your funds. Store it offline, never screenshot it.
          </Text>
        </View>

        <View className="bg-cardBg rounded-2xl border border-borderGrey p-4 mt-6 min-h-[180] items-center justify-center">
          {!revealed ? (
            <PressableScale className="items-center gap-2 py-8" onPress={() => setRevealed(true)}>
              <Ionicons name="eye-outline" size={24} color="#C6A15B" />
              <Text className="text-base text-gold font-semibold">Tap to reveal phrase</Text>
            </PressableScale>
          ) : (
            <View className="flex-row flex-wrap gap-1 w-full">
              {phrase.map((word, i) => (
                <View key={i} className="flex-row items-center w-[33%] py-1">
                  <Text className="text-xs text-mutedWhite w-6 text-right mr-1">{i + 1}.</Text>
                  <Text className="text-base text-white font-medium">{word}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {revealed && (
          <PressableScale className="flex-row items-center justify-center gap-1 mt-4 py-2" onPress={handleCopy}>
            <Ionicons name="copy-outline" size={18} color={copied ? '#3ED598' : '#C6A15B'} />
            <Text className="text-sm text-gold font-medium" style={copied ? { color: '#3ED598' } : {}}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Text>
          </PressableScale>
        )}

        <View className="mt-8 gap-4">
          <Button
            label={loading ? "Creating Account..." : "I've Saved My Phrase"}
            onPress={handleConfirm}
            disabled={!revealed || loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
