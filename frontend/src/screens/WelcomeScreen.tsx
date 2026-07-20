import { useEffect, useRef } from 'react'
import { View, Text, Animated, ScrollView, Image } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, RadialGradient, Stop, Circle, Polygon } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { useReducedMotion } from 'react-native-reanimated'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors } from '@/constants/theme'
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
    <View className="flex-1 bg-surfaceBg">
      <LinearGradient colors={['#000000', '#0A0A0A', '#141414']} className="absolute inset-0" />
      <LinearGradient colors={['transparent', colorWithOpacity(Colors.gold, 0.04)]} locations={[0.5, 1]} className="absolute inset-0" />
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View className="gap-6" style={{ opacity: fadeIn }}>
            <Animated.View className="items-center" style={{ transform: [{ scale: scaleIn }] }}>
              {/* Logo — transparent mark over a soft radial glow + faint facet frame */}
              <View className="w-[150] h-[150] items-center justify-center relative">
                <Animated.View className="absolute inset-0 items-center justify-center" style={{ opacity: glowOpacity }} pointerEvents="none">
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
                <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
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
                <Image source={NOIR_MARK} className="w-24 h-[100]" resizeMode="contain" />
              </View>

              <Text className="text-5xl text-cream mt-4 tracking-[10px]" style={{ fontFamily: 'Jost-SemiBold', textShadowColor: colorWithOpacity(Colors.gold, 0.3), textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 }}>
                NOIR
              </Text>
              <Text className="text-xs text-gold mt-4 tracking-[6px] uppercase" style={{ fontFamily: 'Jost-Medium' }}>
                TAP INTO TRUST
              </Text>
              <View className="flex-row items-center mt-6 w-[60%] self-center">
                <View className="flex-1 h-px" style={{ backgroundColor: colorWithOpacity(Colors.gold, 0.25) }} />
                <View className="w-[5] h-[5] mx-4 rounded-full" style={{ backgroundColor: Colors.gold }} />
                <View className="flex-1 h-px" style={{ backgroundColor: colorWithOpacity(Colors.gold, 0.25) }} />
              </View>
              <Text className="text-base text-silver text-center mt-6 px-4 leading-[24px]">
                The first NFC-powered wallet on Stellar. Tap your card. Pay with agents. Own your assets.
              </Text>
            </Animated.View>

            <Animated.View className="gap-4" style={{ transform: [{ translateY: slideUp }], opacity: fadeIn }}>
              {features.map((f, i) => (
                <LinearGradient
                  key={i}
                  colors={['#161616', '#101010']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  className="flex-row items-center gap-4 p-4 rounded-2xl border border-borderGrey"
                >
                  <View className="w-11 h-11 items-center justify-center rounded-full border" style={{ backgroundColor: colorWithOpacity(Colors.gold, 0.12), borderColor: colorWithOpacity(Colors.gold, 0.28) }}>
                    {f.contactless ? (
                      <TapGlyph size={20} color={Colors.gold} />
                    ) : (
                      <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={20} color={Colors.gold} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Jost-SemiBold' }} className="text-base text-cream">{f.label}</Text>
                    <Text className="text-xs text-mutedWhite mt-[3] leading-[17px]">{f.desc}</Text>
                  </View>
                </LinearGradient>
              ))}
            </Animated.View>

            <Animated.View className="gap-4 mt-2" style={{ transform: [{ translateY: slideUp }], opacity: fadeIn }}>
              <PressableScale onPress={onCreateWallet} accessibilityRole="button" accessibilityLabel="Register my card">
                <LinearGradient colors={[Colors.goldHi, Colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} className="flex-row items-center justify-center gap-2 py-4 rounded-xl min-h-[54]" style={DesignTokens.shadows.goldGlow}>
                  <TapGlyph size={18} color="#151107" />
                  <Text className="text-base text-[#151107] tracking-[1px] uppercase" style={{ fontFamily: 'Jost-SemiBold' }}>
                    Register My Card
                  </Text>
                </LinearGradient>
              </PressableScale>
              <PressableScale onPress={onImportWallet} className="items-center justify-center py-4 min-h-[48]" accessibilityRole="button" accessibilityLabel="I already have a wallet">
                <Text className="text-sm text-gold tracking-[0.6px]" style={{ fontFamily: 'Jost-Medium' }}>
                  I already have a wallet
                </Text>
              </PressableScale>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
