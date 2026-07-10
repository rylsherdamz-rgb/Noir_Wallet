import { useRouter } from 'expo-router'
import { SeedPhraseScreen } from '@/screens/SeedPhraseScreen'
import { useAppStore } from '@/store/useAppStore'
import { WalletKeys } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'

export default function SeedPhraseRoute() {
  const router = useRouter()
  const { setUser } = useAppStore()

  const handleNext = async (keys: WalletKeys) => {
    setUser({
      id: Math.random().toString(36).slice(2),
      email: '',
      phoneNumber: '',
      stellarPublicKey: keys.stellarPublic,
      kycLevel: 0,
      role: 'consumer',
      displayName: 'My Wallet',
    })
    
    const funded = await stellarService.fundAccount(keys.stellarPublic)
    
    if (!funded) {
      console.warn('Account funding failed — will retry on dashboard')
    }
    
    router.replace('/seed-verify')
  }

  return <SeedPhraseScreen onNext={handleNext} onBack={() => router.back()} />
}
