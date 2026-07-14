import { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator, Animated, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'

const NOIR_MARK = require('../assets/noir-mark.png')

export default function Index() {
  const router = useRouter()
  const isOnboarded = useAppStore((s) => s.isOnboarded)
  const [imgLoaded, setImgLoaded] = useState(false)

  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.8)).current
  const glow = useRef(new Animated.Value(0)).current
  const brandOpacity = useRef(new Animated.Value(0)).current
  const brandSlide = useRef(new Animated.Value(20)).current

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
    ]).start()
  }, [opacity, scale, glow, brandOpacity, brandSlide])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboarded) {
        router.replace('/(tabs)')
      } else {
        router.replace('/onboarding')
      }
    }, 1400)
    return () => clearTimeout(timer)
  }, [isOnboarded, router])

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] })

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A0A0A', '#000000']} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['transparent', Colors.gold + '06', 'transparent']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <View style={styles.logoRing}>
            <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
            <Image
              source={NOIR_MARK}
              style={{ width: 88, height: 88 }}
              resizeMode="contain"
              onLoad={() => setImgLoaded(true)}
            />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: brandOpacity, transform: [{ translateY: brandSlide }], marginTop: Spacing.lg }}>
          <Animated.Text style={styles.brandText}>NOIR</Animated.Text>
          <Animated.Text style={styles.tagline}>TAP INTO TRUST</Animated.Text>
        </Animated.View>

        <Animated.View style={{ opacity: brandOpacity, marginTop: Spacing.xxl }}>
          <ActivityIndicator size="small" color={Colors.gold + '60'} />
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoRing: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.gold,
    top: -26, left: -26,
  },
  brandText: {
    color: Colors.cream,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 14,
    textAlign: 'center',
  },
  tagline: {
    color: Colors.gold,
    fontSize: 11,
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: Spacing.md,
    textTransform: 'uppercase',
  },
})
