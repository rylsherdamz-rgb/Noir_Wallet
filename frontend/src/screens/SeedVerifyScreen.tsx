import { useState, useEffect, useMemo, useCallback } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Button } from '@/components/Button'

interface SeedVerifyScreenProps {
  phrase: string[]
  onComplete: () => void
  onBack: () => void
}

function shuffle(arr: string[]): string[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function SeedVerifyScreen({ phrase, onComplete, onBack }: SeedVerifyScreenProps) {
  const indices = useMemo(() => {
    const shuffled = [...Array(12).keys()].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 4)
  }, [])

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [shuffledWords, setShuffledWords] = useState<string[]>([])

  useEffect(() => {
    const extra = ['abandon', 'ability', 'able', 'about', 'above', 'absent',
      'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
      'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
      'across', 'act', 'action', 'actor', 'actress', 'actual',
    ]
    const pool = [...phrase]
    while (pool.length < 20) {
      const pick = extra[Math.floor(Math.random() * extra.length)]
      if (!pool.includes(pick)) pool.push(pick)
    }
    setShuffledWords(shuffle(pool))
  }, [phrase])

  const handleWordPress = useCallback((word: string) => {
    setAnswers((prev) => {
      const usedValues = Object.values(prev)
      if (usedValues.includes(word)) return prev
      const slot = indices.find((i) => !prev[i])
      if (slot === undefined) return prev
      return { ...prev, [slot]: word }
    })
  }, [indices])

  const removeAnswer = useCallback((idx: number) => {
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[idx]
      return next
    })
  }, [])

  const allAnswered = indices.every((i) => answers[i])
  const isCorrect = indices.every((i) => answers[i] === phrase[i])

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <PressableScale className="w-10 h-10 items-center justify-center ml-4 mt-2" onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </PressableScale>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <NoirLogo variant="mark" size={40} />
        <Text className="text-xl text-white font-bold text-center mt-4">Verify Your Phrase</Text>
        <Text className="text-sm text-mutedWhite text-center mt-1">Select the correct word for each position</Text>

        <View className="gap-2 my-8">
          {indices.map((idx) => (
            <View
              key={idx}
              className="flex-row items-center bg-cardBg rounded-xl p-4 border gap-4"
              style={answers[idx] ? { borderColor: '#C6A15B66' } : { borderColor: '#3A3A3A' }}
            >
              <Text className="text-xs text-mutedWhite w-[60]">Word #{idx + 1}</Text>
              <Text
                className={`flex-1 text-base ${answers[idx] ? 'text-white font-semibold' : 'text-mutedWhite tracking-[2]'}`}
              >
                {answers[idx] || '______'}
              </Text>
              {answers[idx] && (
                <PressableScale onPress={() => removeAnswer(idx)}>
                  <Ionicons name="close-circle" size={18} color="#FF5A5F" />
                </PressableScale>
              )}
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap gap-2 mb-8 justify-center">
          {shuffledWords.map((word, i) => {
            const used = Object.values(answers).includes(word)
            return (
              <PressableScale
                key={`${word}-${i}`}
                className={`px-4 py-2 rounded-full border ${used ? 'opacity-30 bg-midGrey' : 'bg-[#2C2C2C]'} border-borderGrey`}
                onPress={() => !used && handleWordPress(word)}
                disabled={used}
              >
                <Text className={`text-sm font-medium ${used ? 'text-mutedWhite' : 'text-white'}`}>{word}</Text>
              </PressableScale>
            )
          })}
        </View>

        {allAnswered && !isCorrect && (
          <Text className="text-sm text-[#FF5A5F] text-center mb-4">Some words are incorrect. Try again.</Text>
        )}

        <Button
          label={isCorrect ? 'Complete Verification' : 'Confirm'}
          onPress={onComplete}
          disabled={!allAnswered || !isCorrect}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
