import { WelcomeScreen } from '@/screens/WelcomeScreen'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'

export default function Onboarding() {
  const router = useRouter()
  const { setActiveRole, setIsOnboarded, activeRole } = useAppStore()

  return (
    <WelcomeScreen
      isMerchant={activeRole === 'merchant'}
      onGetStarted={() => {
        setIsOnboarded(true)
        router.replace('/(tabs)')
      }}
      onSwitchRole={() =>
        setActiveRole(activeRole === 'consumer' ? 'merchant' : 'consumer')
      }
    />
  )
}
