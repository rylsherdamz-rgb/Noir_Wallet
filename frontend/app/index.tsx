import { useEffect, useRef, useState, useCallback } from 'react'
import { View, ActivityIndicator, Animated, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppStore } from '@/store/useAppStore'
import { Colors } from '@/constants/theme'

const NOIR_MARK = require('../assets/noir-mark.png')
const MIN_SPLASH_MS = 600

export default function Index() {
  const router = useRouter()
  const isOnboarded = useAppStore((s) => s.isOnboarded)
  const [readyToRoute, setReadyToRoute] = useState(false)

  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.8)).current
  const glow = useRef(new Animated.Value(0)).current
  const brandOpacity = useRef(new Animated.Value(0)).current
  const brandSlide = useRef(new Animated.Value(20)).current

  const navigate = useCallback(() => {
    router.replace(isOnboarded ? '/(tabs)' : '/onboarding')
  }, [isOnboarded, router])

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(brandOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(brandSlide, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => setReadyToRoute(true))
  }, [opacity, scale, glow, brandOpacity, brandSlide])

  // Route once the animation finishes AND the minimum splash time elapses
  useEffect(() => {
    if (!readyToRoute) return
    const timer = setTimeout(navigate, MIN_SPLASH_MS)
    return () => clearTimeout(timer)
  }, [readyToRoute, navigate])

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] })

  return (
    <View className="flex-1 bg-black">
      <LinearGradient colors={['#000000', '#0A0A0A', '#000000']} className="absolute inset-0" />
      <LinearGradient
        colors={['transparent', Colors.gold + '06', 'transparent']}
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />

      <View className="flex-1 items-center justify-center">
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <View className="relative items-center justify-center">
            <Animated.View className="absolute w-[140px] h-[140px] rounded-full bg-gold -top-[26px] -left-[26px]" style={{ opacity: glowOpacity }} />
            <Image
              source={NOIR_MARK}
              style={{ width: 88, height: 88 }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: brandOpacity, transform: [{ translateY: brandSlide }], marginTop: 24 }}>
          <Animated.Text className="text-cream text-[48px] font-heavy tracking-[14px] text-center">NOIR</Animated.Text>
          <Animated.Text className="text-gold text-xs tracking-[6px] text-center mt-4 uppercase">TAP INTO TRUST</Animated.Text>
        </Animated.View>

        <Animated.View style={{ opacity: brandOpacity, marginTop: 48 }}>
          <ActivityIndicator size="small" color={Colors.gold + '60'} />
        </Animated.View>
      </View>
    </View>
  )
}
