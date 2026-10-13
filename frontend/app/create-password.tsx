import { useLocalSearchParams, useRouter } from 'expo-router'
import { CreatePasswordScreen } from '@/screens/CreatePasswordScreen'

export default function CreatePasswordRoute() {
  const router = useRouter()
  // From Security settings the user can back out; a wallet opened without a
  // password cannot — there is nothing else to unlock it with.
  const { from } = useLocalSearchParams<{ from?: string }>()
  const fromSettings = from === 'settings'

  return (
    <CreatePasswordScreen
      onDone={() => (fromSettings ? router.back() : router.replace('/(tabs)'))}
      onBack={fromSettings ? () => router.back() : undefined}
    />
  )
}
