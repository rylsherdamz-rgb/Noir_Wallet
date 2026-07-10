import { useRouter } from 'expo-router'
import { ImportWalletScreen } from '@/screens/ImportWalletScreen'
import { useAppStore } from '@/store/useAppStore'
import { WalletKeys } from '@/services/wallet'
import { stellarService } from '@/services/stellar'

export default function ImportWalletRoute() {
  const router = useRouter()
  const { setUser, setIsOnboarded } = useAppStore()

  const handleComplete = async (keys: WalletKeys) => {
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
    
    // Fund account and wait for it to be created on-chain
    const funded = await stellarService.fundTestnetAccount(keys.stellarPublic)
    
    // If funding fails, still continue - user can fund later via dashboard
    if (!funded) {
      console.warn('Testnet funding failed - account may need manual funding')
    }
    
    router.replace('/(tabs)')
  }

  return <ImportWalletScreen onComplete={handleComplete} onBack={() => router.back()} />
}
