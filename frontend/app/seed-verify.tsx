import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SeedVerifyScreen } from '@/screens/SeedVerifyScreen'
import { useAppStore } from '@/store/useAppStore'
import { walletService } from '@/services/wallet'
import { Colors } from '@/constants/theme'

export default function SeedVerifyRoute() {
  const router = useRouter()
  const { setIsOnboarded } = useAppStore()
  const [phrase, setPhrase] = useState<string[] | null>(null)

  useEffect(() => {
    walletService.loadKeys().then((keys) => {
      if (keys) {
        setPhrase(keys.mnemonic.split(' '))
      } else {
        router.replace('/onboarding')
      }
    })
  }, [])

  if (!phrase) {
    return <View style={{ flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.gold} />
    </View>
  }

  return (
    <SeedVerifyScreen
      phrase={phrase}
      onComplete={() => {
        setIsOnboarded(true)
        router.replace('/(tabs)')
      }}
      onBack={() => router.back()}
    />
  )
}
