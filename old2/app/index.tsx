import { useEffect, useRef } from 'react'
import { View, ActivityIndicator, Animated, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'

export default function Index() {
  const router = useRouter()
  const isOnboarded = useAppStore((s) => s.isOnboarded)

  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, scale])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboarded) {
        router.replace('/(tabs)')
      } else {
        router.replace('/onboarding')
      }
    }, 900)
    return () => clearTimeout(timer)
  }, [isOnboarded, router])

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <NoirLogo variant="mark" size={96} />
      </Animated.View>
      <ActivityIndicator
        size="large"
        color={Colors.gold}
        style={styles.spinner}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: Spacing.xxl,
  },
})
