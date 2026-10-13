import { useRouter } from 'expo-router'
import { ImportWalletScreen } from '@/screens/ImportWalletScreen'
import { useAppStore } from '@/store/useAppStore'
import { WalletKeys } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'
import { logger } from '@/lib/logger'

export default function ImportWalletRoute() {
  const router = useRouter()
  const { setUser, setIsOnboarded, isOnboarded } = useAppStore()

  // Fund in the background (Testnet only; an imported wallet is usually funded
  // already). Never hold the user on the button waiting for the network.
  const fundInBackground = (pub: string) =>
    stellarService.fundAccount(pub)
      .then((funded) => { if (!funded) logger.warn('Account funding skipped/failed — Wallet tab will offer it') })
      .catch((e) => logger.warn('Account funding error:', e?.message))

  const handleComplete = async (keys: WalletKeys) => {
    // Already onboarded — just adding another wallet. Go back.
    if (isOnboarded) {
      fundInBackground(keys.stellarPublic)
      router.back()
      return
    }

    setUser({
      id: Math.random().toString(36).slice(2),
      email: '',
      phoneNumber: '',
      stellarPublicKey: keys.stellarPublic,
      role: 'consumer',
      displayName: 'My Wallet',
    })
    setIsOnboarded(true)

    fundInBackground(keys.stellarPublic)

    // Name + backup password before the wallet is reachable on this device.
    router.replace('/setup-profile')
  }

  return <ImportWalletScreen onComplete={handleComplete} onBack={() => router.back()} />
}
