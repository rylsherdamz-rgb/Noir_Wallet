import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, ScrollView, Image } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, RadialGradient, Stop, Circle, Polygon } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { useReducedMotion } from 'react-native-reanimated'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { TapGlyph } from '@/components/brand/BrandGlyph'

interface WelcomeScreenProps {
  onCreateWallet: () => void
  onImportWallet: () => void
}

const NOIR_MARK = require('../../assets/noir-mark.png')

type Feature = {
  label: string
  desc: string
  contactless?: boolean
  icon?: keyof typeof Ionicons.glyphMap
}

const features: Feature[] = [
  { label: 'NFC Wallet Cards', desc: 'Link a physical NFC tag as your hardware wallet key', contactless: true },
  { label: 'x402 Agent Payments', desc: 'AI-powered agents sign transactions when you tap', icon: 'flash-outline' },
  { label: 'Stellar Blockchain', desc: 'Fast, low-cost global payments on the Stellar network', icon: 'cube-outline' },
]

export function WelcomeScreen({ onCreateWallet, onImportWallet }: WelcomeScreenProps) {
  const reduced = useReducedMotion()
  const fadeIn = useRef(new Animated.Value(0)).current
  const scaleIn = useRef(new Animated.Value(0.85)).current
  const slideUp = useRef(new Animated.Value(30)).current
  const glow = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    if (reduced) {
      fadeIn.setValue(1)
      scaleIn.setValue(1)
      slideUp.setValue(0)
      glow.setValue(0.5)
      return
    }
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleIn, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [reduced, fadeIn, scaleIn, slideUp, glow])

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.6] })

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A0A0A', '#141414']} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['transparent', colorWithOpacity(Colors.gold, 0.04)]} locations={[0.5, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, { opacity: fadeIn }]}>
            <Animated.View style={[styles.hero, { transform: [{ scale: scaleIn }] }]}>
              {/* Logo — transparent mark over a soft radial glow + faint facet frame */}
              <View style={styles.logoBlock}>
                <Animated.View style={[styles.glowLayer, { opacity: glowOpacity }]} pointerEvents="none">
                  <Svg width={210} height={210} viewBox="0 0 100 100">
                    <Defs>
                      <RadialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                        <Stop offset="0" stopColor={Colors.gold} stopOpacity={0.5} />
                        <Stop offset="0.6" stopColor={Colors.gold} stopOpacity={0} />
                      </RadialGradient>
                    </Defs>
                    <Circle cx="50" cy="50" r="50" fill="url(#heroGlow)" />
                  </Svg>
                </Animated.View>
                <View style={styles.facetFrame} pointerEvents="none">
                  <Svg width={148} height={148} viewBox="0 0 100 100">
                    <Polygon
                      points="50,4 90,27 90,73 50,96 10,73 10,27"
                      fill="none"
                      stroke={colorWithOpacity(Colors.gold, 0.28)}
                      strokeWidth={1.4}
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Image source={NOIR_MARK} style={styles.heroMark} resizeMode="contain" />
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
                <LinearGradient
                  key={i}
                  colors={['#161616', '#101010']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.featureRow}
                >
                  <View style={styles.featureIcon}>
                    {f.contactless ? (
                      <TapGlyph size={20} color={Colors.gold} />
                    ) : (
                      <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={20} color={Colors.gold} />
                    )}
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                </LinearGradient>
              ))}
            </Animated.View>

            <Animated.View style={[styles.actions, { transform: [{ translateY: slideUp }], opacity: fadeIn }]}>
              <PressableScale onPress={onCreateWallet} accessibilityRole="button" accessibilityLabel="Register my card">
                <LinearGradient colors={[Colors.goldHi, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.primaryBtn}>
                  <TapGlyph size={18} color="#151107" />
                  <Text style={styles.primaryText}>Register My Card</Text>
                </LinearGradient>
              </PressableScale>
              <PressableScale onPress={onImportWallet} style={styles.ghostBtn} accessibilityRole="button" accessibilityLabel="I already have a wallet">
                <Text style={styles.ghostText}>I already have a wallet</Text>
              </PressableScale>
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

  hero: { alignItems: 'center' },
  logoBlock: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glowLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  facetFrame: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  heroMark: { width: 96, height: 100 },

  brand: {
    fontFamily: Fonts.display,
    fontSize: FontSize.xxxl,
    color: Colors.cream,
    letterSpacing: 10,
    marginTop: Spacing.md,
    textShadowColor: colorWithOpacity(Colors.gold, 0.3),
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontFamily: Fonts.displayMd,
    fontSize: FontSize.xs,
    color: Colors.gold,
    letterSpacing: 6,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, width: '60%', alignSelf: 'center' },
  dividerLine: { flex: 1, height: 1, backgroundColor: colorWithOpacity(Colors.gold, 0.25) },
  dividerDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.gold, marginHorizontal: Spacing.md },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.silver,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },

  features: { gap: Spacing.md },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderGrey,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.full,
    backgroundColor: colorWithOpacity(Colors.gold, 0.12), alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colorWithOpacity(Colors.gold, 0.28),
  },
  featureText: { flex: 1 },
  featureLabel: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.cream },
  featureDesc: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 3, lineHeight: 17 },

  actions: { gap: Spacing.md, marginTop: Spacing.sm },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, minHeight: 54,
    ...DesignTokens.shadows.goldGlow,
  },
  primaryText: { fontFamily: Fonts.display, fontSize: FontSize.md, color: '#151107', letterSpacing: 1, textTransform: 'uppercase' },
  ghostBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, minHeight: 48 },
  ghostText: { fontFamily: Fonts.displayMd, fontSize: FontSize.sm, color: Colors.gold, letterSpacing: 0.6 },
})
