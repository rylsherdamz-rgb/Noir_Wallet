import { useRouter } from 'expo-router'
import { WelcomeScreen } from '@/screens/WelcomeScreen'

export default function Onboarding() {
  const router = useRouter()

  return (
    <WelcomeScreen
      onCreateWallet={() => router.push('/seed-phrase')}
      onImportWallet={() => router.push('/import-wallet')}
    />
  )
}
