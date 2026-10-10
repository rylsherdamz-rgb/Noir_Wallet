import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useReducedMotion } from 'react-native-reanimated'
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme'
import { TapGlyph } from '@/components/brand/BrandGlyph'
import { BrandMark } from '@/components/brand/BrandMark'
import { Button } from '@/components/Button'
import { TextAction } from '@/components/ui/List'

interface WelcomeScreenProps {
  onCreateWallet: () => void
  onImportWallet: () => void
}

const POINTS: { title: string; desc: string; icon: React.ReactNode }[] = [
  { title: 'Any NFC card or sticker', desc: 'Link it once — it becomes your tap-to-pay key.', icon: <TapGlyph size={22} color={Colors.gold} /> },
  { title: 'Agents pay for you', desc: 'Each card has its own agent that signs the tap.', icon: <Ionicons name="flash-outline" size={22} color={Colors.gold} /> },
  { title: 'Your keys stay here', desc: 'Kept on this phone, behind your wallet password.', icon: <Ionicons name="key-outline" size={22} color={Colors.gold} /> },
]

/** Welcome: a brand moment — the cat + wordmark, three plain points, one action. */
export function WelcomeScreen({ onCreateWallet, onImportWallet }: WelcomeScreenProps) {
  const reduced = useReducedMotion()
  const fade = useRef(new Animated.Value(reduced ? 1 : 0)).current

  useEffect(() => {
    if (reduced) return
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start()
  }, [reduced, fade])

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        <Animated.View style={[styles.content, { opacity: fade }]}>
          <BrandMark size={88} />
          <Text style={styles.subtitle}>A Stellar wallet you pay with by tapping an NFC card.</Text>
          <View style={styles.points}>
            {POINTS.map((p) => (
              <View key={p.title} style={styles.point}>
                <View style={styles.pointIcon}>{p.icon}</View>
                <View style={styles.pointText}>
                  <Text style={styles.pointTitle}>{p.title}</Text>
                  <Text style={styles.pointDesc}>{p.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Create a wallet" onPress={onCreateWallet} fullWidth accessibilityLabel="Create a wallet" />
        <TextAction label="I already have a wallet" color={Colors.cream} onPress={onImportWallet} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: Spacing.xl },
  content: { alignItems: 'center' },
  subtitle: { fontSize: FontSize.md, color: Colors.silver, textAlign: 'center', lineHeight: 24, marginTop: 28 },
  points: { alignSelf: 'stretch', gap: 20, marginTop: 36 },
  point: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  pointIcon: { width: 24, alignItems: 'center', paddingTop: 2 },
  pointText: { flex: 1 },
  pointTitle: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.cream },
  pointDesc: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, lineHeight: 19, marginTop: 2 },
  actions: { paddingHorizontal: 24, paddingBottom: Spacing.lg, gap: 4 },
})
