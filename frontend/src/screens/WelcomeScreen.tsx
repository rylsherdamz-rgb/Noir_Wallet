import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Button } from '@/components/Button'

interface WelcomeScreenProps {
  onCreateWallet: () => void
  onImportWallet: () => void
}

const features = [
  { icon: 'radio-outline' as const, label: 'NFC Wallet Cards', desc: 'Link a physical NFC tag as your hardware wallet key' },
  { icon: 'flash-outline' as const, label: 'x402 Agent Payments', desc: 'AI-powered agents sign transactions when you tap' },
  { icon: 'cube-outline' as const, label: 'Stellar Blockchain', desc: 'Fast, low-cost global payments on the Stellar network' },
]

export function WelcomeScreen({ onCreateWallet, onImportWallet }: WelcomeScreenProps) {
  const fadeIn = useRef(new Animated.Value(0)).current
  const scaleIn = useRef(new Animated.Value(0.85)).current
  const slideUp = useRef(new Animated.Value(30)).current
  const glow = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleIn, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    ).start()
  }, [fadeIn, scaleIn, slideUp, glow])

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A0A0A', '#141414']} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['transparent', Colors.gold + '06']}
        locations={[0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, { opacity: fadeIn }]}>
            <Animated.View style={[styles.hero, { transform: [{ scale: scaleIn }] }]}>
              <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
              <View style={styles.logoWrap}>
                <NoirLogo variant="mark" size={72} />
              </View>
              <Text style={styles.brand}>NOIR</Text>
              <Text style={styles.tagline}>TAP INTO TRUST</Text>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerDot} />
                <View style={styles.dividerLine} />
              </View>
              <Text style={styles.subtitle}>
                The first NFC-powered wallet on Stellar. Tap your card. Pay with agents. Own your assets.
              </Text>
            </Animated.View>

            <Animated.View style={[styles.features, { transform: [{ translateY: slideUp }], opacity: fadeIn }]}>
              {features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={f.icon} size={20} color={Colors.gold} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </Animated.View>

            <Animated.View style={[styles.actions, { transform: [{ translateY: slideUp }], opacity: fadeIn }]}>
              <Button label="Register My Card" onPress={onCreateWallet} icon="radio-outline" />
              <Button variant="ghost" label="I already have a wallet" onPress={onImportWallet} />
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },

  content: { gap: Spacing.lg },

  hero: { alignItems: 'center', position: 'relative' },
  glowRing: {
    position: 'absolute',
    top: -10, alignSelf: 'center',
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.gold,
  },
  logoWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.gold + '10',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.gold + '20',
  },
  brand: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.cream,
    letterSpacing: 12,
    marginTop: Spacing.lg,
    textShadowColor: Colors.gold + '30',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    letterSpacing: 6,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    fontWeight: FontWeight.medium,
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, width: '60%', alignSelf: 'center' },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.gold + '25' },
  dividerDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.gold, marginHorizontal: Spacing.md },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },

  features: { gap: Spacing.md },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderGrey,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.gold + '25',
  },
  featureText: { flex: 1 },
  featureLabel: { fontSize: FontSize.md, color: Colors.cream, fontWeight: FontWeight.semibold },
  featureDesc: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2 },

  actions: { gap: Spacing.md },
})
