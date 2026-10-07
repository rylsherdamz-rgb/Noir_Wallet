import { useEffect, useRef, useState, useCallback } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing } from '@/constants/theme'
import { BrandBackdrop } from '@/components/brand/BrandBackdrop'
import { BrandMark } from '@/components/brand/BrandMark'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'

const MIN_SPLASH_MS = 600

export default function Index() {
  const router = useRouter()
  const isOnboarded = useAppStore((s) => s.isOnboarded)
  const [readyToRoute, setReadyToRoute] = useState(false)
  // The persisted store hydrates asynchronously (SecureStore / localStorage).
  // Routing before hydration finishes reads the *initial* isOnboarded (false)
  // and bounces an existing wallet to /onboarding — which also made agents and
  // devices look empty right after login. Wait for hydration first.
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated())

  useEffect(() => {
    if (hydrated) return
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true))
    // Safety: if hydration never reports (storage unavailable), proceed anyway.
    const fallback = setTimeout(() => setHydrated(true), 3000)
    return () => { unsub?.(); clearTimeout(fallback) }
  }, [hydrated])

  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.8)).current
  const brandOpacity = useRef(new Animated.Value(0)).current
  const brandSlide = useRef(new Animated.Value(20)).current

  const navigate = useCallback(async () => {
    // Read the store imperatively at navigation time. Using the subscribed
    // `isOnboarded` value risked capturing the pre-hydration default (false)
    // in this closure and bouncing an existing wallet to /onboarding.
    const onboarded = useAppStore.getState().isOnboarded
    if (!onboarded) {
      router.replace('/onboarding')
      return
    }
    // Every cold start of an existing wallet goes through the lock, which
    // unlocks with the phone's own screen lock.
    router.replace('/lock')
  }, [router])

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(brandOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(brandSlide, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => setReadyToRoute(true))
  }, [opacity, scale, brandOpacity, brandSlide])

  // Route once the animation finishes, the minimum splash time elapses, AND
  // the persisted store has hydrated (so isOnboarded reflects real state).
  useEffect(() => {
    if (!readyToRoute || !hydrated) return
    const timer = setTimeout(navigate, MIN_SPLASH_MS)
    return () => clearTimeout(timer)
  }, [readyToRoute, hydrated, navigate])

  return (
    <View style={styles.container}>
      <BrandBackdrop />
      <View style={styles.content}>
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <BrandMark />
        </Animated.View>
        <Animated.View style={[styles.loader, { opacity: brandOpacity, transform: [{ translateY: brandSlide }] }]}>
          <VerifyingPulse size={18} color={Colors.gold} />
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loader: { position: 'absolute', bottom: Spacing.xxl },
})
