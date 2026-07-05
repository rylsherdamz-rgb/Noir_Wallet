import { useRouter } from 'expo-router'
import { SeedPhraseScreen } from '@/screens/SeedPhraseScreen'
import { useAppStore } from '@/store/useAppStore'
import { WalletKeys } from '@/services/wallet'
import { stellarService } from '@/services/stellar'

export default function SeedPhraseRoute() {
  const router = useRouter()
  const { setUser } = useAppStore()

  const handleNext = (keys: WalletKeys) => {
    setUser({
      id: Math.random().toString(36).slice(2),
      email: '',
      phoneNumber: '',
      stellarPublicKey: keys.stellarPublic,
      kycLevel: 0,
      role: 'consumer',
      displayName: 'My Wallet',
    })
    stellarService.fundTestnetAccount(keys.stellarPublic)
    router.replace('/seed-verify')
  }

  return <SeedPhraseScreen onNext={handleNext} onBack={() => router.back()} />
}
