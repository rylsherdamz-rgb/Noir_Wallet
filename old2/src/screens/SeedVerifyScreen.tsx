import { useState, useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Button } from '@/components/Button'

interface SeedVerifyScreenProps {
  phrase: string[]
  onComplete: () => void
  onBack: () => void
}

export function SeedVerifyScreen({ phrase, onComplete, onBack }: SeedVerifyScreenProps) {
  const indices = useMemo(() => {
    const shuffled = [...Array(12).keys()].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 4)
  }, [])

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [shuffledWords, setShuffledWords] = useState<string[]>([])

  useEffect(() => {
    const all = [...phrase]
    const extra = ['abandon', 'ability', 'able', 'about', 'above', 'absent',
      'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
      'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
      'across', 'act', 'action', 'actor', 'actress', 'actual',
    ]
    const pool = [...all]
    while (pool.length < 20) {
      const pick = extra[Math.floor(Math.random() * extra.length)]
      if (!pool.includes(pick)) pool.push(pick)
    }
    setShuffledWords(pool.sort(() => Math.random() - 0.5))
  }, [phrase])

  const selectWord = (idx: number, word: string) => {
    setAnswers((prev) => {
      const next = { ...prev }
      if (next[idx] === word) delete next[idx]
      else next[idx] = word
      return next
    })
  }

  const allAnswered = indices.every((i) => answers[i])
  const isCorrect = indices.every((i) => answers[i] === phrase[i])

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>

      <View style={styles.content}>
        <NoirLogo variant="mark" size={40} />
        <Text style={styles.title}>Verify Your Phrase</Text>
        <Text style={styles.subtitle}>Select the correct word for each position</Text>

        <View style={styles.prompts}>
          {indices.map((idx) => (
            <View key={idx} style={[styles.promptRow, answers[idx] && styles.promptRowFilled]}>
              <Text style={styles.promptNum}>Word #{idx + 1}</Text>
              <Text style={[styles.promptAnswer, !answers[idx] && styles.promptEmpty]}>
                {answers[idx] || '______'}
              </Text>
              {answers[idx] && (
                <TouchableOpacity onPress={() => selectWord(idx, answers[idx])}>
                  <Ionicons name="close-circle" size={18} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.wordPool}>
          {shuffledWords.map((word) => {
            const used = Object.values(answers).includes(word)
            return (
              <TouchableOpacity
                key={word}
                style={[styles.wordChip, used && styles.wordChipUsed]}
                onPress={() => {
                  const slot = indices.find((i) => !answers[i])
                  if (slot && !used) selectWord(slot, word)
                }}
                disabled={used}
              >
                <Text style={[styles.wordChipText, used && styles.wordChipTextUsed]}>{word}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Button
          label={isCorrect ? 'Complete Verification' : 'Verify'}
          onPress={allAnswered && isCorrect ? onComplete : undefined}
          disabled={!allAnswered || !isCorrect}
        />

        {allAnswered && !isCorrect && (
          <Text style={styles.errorText}>Some words are incorrect. Try again.</Text>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, paddingTop: Spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.md },
  content: { flex: 1, padding: Spacing.lg },
  title: { fontSize: FontSize.xl, color: Colors.white, fontWeight: FontWeight.bold, textAlign: 'center', marginTop: Spacing.md },
  subtitle: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', marginTop: Spacing.xs },
  prompts: { gap: Spacing.sm, marginVertical: Spacing.xl },
  promptRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGrey, gap: Spacing.md },
  promptRowFilled: { borderColor: Colors.gold + '40' },
  promptNum: { fontSize: FontSize.xs, color: Colors.mutedWhite, width: 60 },
  promptAnswer: { flex: 1, fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.semibold },
  promptEmpty: { color: Colors.mutedWhite, letterSpacing: 2 },
  wordPool: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl, justifyContent: 'center' },
  wordChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.lightGrey, borderWidth: 1, borderColor: Colors.borderGrey },
  wordChipUsed: { opacity: 0.3, backgroundColor: Colors.midGrey },
  wordChipText: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  wordChipTextUsed: { color: Colors.mutedWhite },
  errorText: { fontSize: FontSize.sm, color: Colors.danger, textAlign: 'center', marginTop: Spacing.sm },
})
