import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { WelcomeScreen } from '@/screens/WelcomeScreen'

export default function Onboarding() {
  const router = useRouter()
  const { isOnboarded } = useAppStore()

  if (isOnboarded) {
    router.replace('/(tabs)')
    return null
  }

  return (
    <WelcomeScreen
      onCreateWallet={() => router.push('/seed-phrase')}
      onImportWallet={() => router.push('/import-wallet')}
    />
  )
}
