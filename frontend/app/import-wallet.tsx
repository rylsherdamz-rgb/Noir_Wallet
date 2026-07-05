import { useRouter } from 'expo-router'
import { ImportWalletScreen } from '@/screens/ImportWalletScreen'
import { useAppStore } from '@/store/useAppStore'
import { WalletKeys } from '@/services/wallet'
import { stellarService } from '@/services/stellar'

export default function ImportWalletRoute() {
  const router = useRouter()
  const { setUser, setIsOnboarded } = useAppStore()

  const handleComplete = (keys: WalletKeys) => {
    setUser({
      id: Math.random().toString(36).slice(2),
      email: '',
      phoneNumber: '',
      stellarPublicKey: keys.stellarPublic,
      kycLevel: 0,
      role: 'consumer',
      displayName: 'My Wallet',
    })
    setIsOnboarded(true)
    stellarService.fundTestnetAccount(keys.stellarPublic)
    router.replace('/(tabs)')
  }

  return <ImportWalletScreen onComplete={handleComplete} onBack={() => router.back()} />
}
