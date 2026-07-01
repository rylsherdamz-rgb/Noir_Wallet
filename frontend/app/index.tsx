import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { Colors } from '@/constants/theme'

export default function Index() {
  const router = useRouter()
  const isOnboarded = useAppStore((s) => s.isOnboarded)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboarded) {
        router.replace('/(tabs)')
      } else {
        router.replace('/onboarding')
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [isOnboarded])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={Colors.accentGreen} />
    </View>
  )
}
