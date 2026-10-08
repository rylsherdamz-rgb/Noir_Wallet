import { useLocalSearchParams, useRouter } from 'expo-router'
import { CreatePasswordScreen } from '@/screens/CreatePasswordScreen'

export default function CreatePasswordRoute() {
  const router = useRouter()
  // Opened from Security settings the user can back out; at the end of
  // onboarding (or on first open for a wallet without one) they cannot.
  const { from } = useLocalSearchParams<{ from?: string }>()
  const fromSettings = from === 'settings'

  return (
    <CreatePasswordScreen
      onDone={() => (fromSettings ? router.back() : router.replace('/(tabs)'))}
      onBack={fromSettings ? () => router.back() : undefined}
    />
  )
}
