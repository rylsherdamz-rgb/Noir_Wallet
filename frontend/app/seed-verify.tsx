import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'
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
    return <View style={{ flex: 1, backgroundColor: Colors.surfaceBg, alignItems: 'center', justifyContent: 'center' }}>
      <VerifyingPulse size={120} />
    </View>
  }

  return (
    <SeedVerifyScreen
      phrase={phrase}
      onComplete={() => {
        setIsOnboarded(true)
        // Name + backup password before the wallet is reachable.
        router.replace('/setup-profile')
      }}
      onBack={() => router.back()}
    />
  )
}
