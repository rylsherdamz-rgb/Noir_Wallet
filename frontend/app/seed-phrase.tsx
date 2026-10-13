import { useRouter } from 'expo-router'
import { SeedPhraseScreen } from '@/screens/SeedPhraseScreen'
import { useAppStore } from '@/store/useAppStore'
import { WalletKeys } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'
import { logger } from '@/lib/logger'

export default function SeedPhraseRoute() {
  const router = useRouter()
  const { setUser } = useAppStore()

  const handleNext = async (keys: WalletKeys) => {
    setUser({
      id: Math.random().toString(36).slice(2),
      email: '',
      phoneNumber: '',
      stellarPublicKey: keys.stellarPublic,
      role: 'consumer',
      displayName: 'My Wallet',
    })
    
    // Fund in the background: the next screens don't need the network, and a
    // slow or missing connection must never hold the user on this button.
    // If it fails, the Wallet tab offers "Get free test XLM" (Testnet only).
    stellarService.fundAccount(keys.stellarPublic)
      .then((funded) => { if (!funded) logger.warn('Account funding failed — Wallet tab will offer it again') })
      .catch((e) => logger.warn('Account funding error:', e?.message))

    router.replace('/seed-verify')
  }

  return <SeedPhraseScreen onNext={handleNext} onBack={() => router.back()} />
}
