import { useRef, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { PressableScale } from '@/components/brand/PressableScale'
import { NfcScanPulse } from '@/components/brand/NfcScanPulse'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { Button } from '@/components/Button'

const NOIR_MARK = require('../../assets/noir-mark.png')

interface Slide {
  key: string
  eyebrow: string
  title: string
  body: string
  art: () => React.ReactElement
}

const SLIDES: Slide[] = [
  {
    key: 'keys',
    eyebrow: 'Self-custody',
    title: 'Your keys,\nyour wallet',
    body: 'Your Stellar keys are created and kept on this phone, behind your phone’s own screen lock. No one — not even Noir — can move your funds.',
    art: () => (
      <View style={styles.artStage}>
        <Image source={NOIR_MARK} style={styles.mark} resizeMode="contain" />
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.gold} />
          <Text style={styles.badgeText}>ON THIS PHONE</Text>
        </View>
      </View>
    ),
  },
  {
    key: 'tap',
    eyebrow: 'NFC + agents',
    title: 'Tap a card\nto pay',
    body: 'Link an NFC card and it gets its own agent wallet. Tap the card on a phone and the agent signs the payment — no app, no QR code.',
    art: () => (
      <View style={styles.artStage}>
        <NfcScanPulse size={220} />
      </View>
    ),
  },
  {
    key: 'limits',
    eyebrow: 'On-chain rules',
    title: 'You stay\nin control',
    body: 'Every card pays through its own agent, enforced by a Stellar smart contract. Revoke a card anytime and its funds come back to you.',
    art: () => (
      <View style={styles.artStage}>
        <View style={styles.policyCard}>
          <PolicyLine icon="flash-outline" label="Pays your taps" value="Its own agent" />
          <PolicyLine icon="close-circle-outline" label="Revoke" value="Anytime" last />
        </View>
      </View>
    ),
  },
]

function PolicyLine({ icon, label, value, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.policyLine, !last && styles.policyLineBorder]}>
      <Ionicons name={icon} size={18} color={Colors.gold} />
      <Text style={styles.policyLabel}>{label}</Text>
      <Text style={styles.policyValue}>{value}</Text>
    </View>
  )
}

/** First-launch walkthrough shown before create / import. */
export function IntroScreen({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions()
  const scroller = useRef<ScrollView>(null)
  const [index, setIndex] = useState(0)
  const last = index === SLIDES.length - 1

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width)
    if (i !== index) {
      setIndex(i)
      Haptics.selectionAsync().catch(() => {})
    }
  }

  const next = () => {
    if (last) return onDone()
    scroller.current?.scrollTo({ x: width * (index + 1), animated: true })
    setIndex(index + 1)
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Text style={styles.step}>{index + 1} / {SLIDES.length}</Text>
          {!last && (
            <PressableScale onPress={onDone} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel="Skip introduction">
              <Text style={styles.skip}>Skip</Text>
            </PressableScale>
          )}
        </View>

        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={styles.pager}
        >
          {SLIDES.map((s) => (
            <View key={s.key} style={[styles.slide, { width }]} accessibilityLabel={`${s.title.replace('\n', ' ')}. ${s.body}`}>
              <View style={styles.artWrap}>{s.art()}</View>
              <Text style={styles.eyebrow}>{s.eyebrow.toUpperCase()}</Text>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots} accessibilityElementsHidden>
            {SLIDES.map((s, i) => (
              <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
          <Button label={last ? 'Get started' : 'Next'} icon="arrow-forward" iconPosition="right" onPress={next} fullWidth />
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, minHeight: 48 },
  step: { fontSize: FontSize.xs, color: Colors.mutedWhite, letterSpacing: 2 },
  skip: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.semibold },
  pager: { flex: 1 },
  slide: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center' },
  artWrap: { alignItems: 'center', justifyContent: 'center', height: 260, marginBottom: Spacing.xl },
  artStage: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 104, height: 110 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.lg,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.midGrey,
  },
  policyCard: { width: 260 },
  badgeText: { fontFamily: Fonts.displayMd, fontSize: 11, letterSpacing: 1, color: Colors.gold },
  policyLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  policyLineBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderGrey },
  policyLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.mutedWhite },
  policyValue: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.semibold },
  eyebrow: { fontSize: FontSize.xs, color: Colors.gold, letterSpacing: 3, marginBottom: Spacing.sm },
  title: { fontFamily: Fonts.display, fontSize: 34, lineHeight: 40, color: Colors.cream },
  body: { fontSize: FontSize.md, color: Colors.silver, lineHeight: 24, marginTop: Spacing.md },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.borderGrey },
  dotActive: { width: 22, backgroundColor: Colors.gold },
})
