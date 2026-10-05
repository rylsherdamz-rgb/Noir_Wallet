import { useRouter } from 'expo-router'
import { ImportWalletScreen } from '@/screens/ImportWalletScreen'
import { useAppStore } from '@/store/useAppStore'
import { WalletKeys } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'
import { logger } from '@/lib/logger'

export default function ImportWalletRoute() {
  const router = useRouter()
  const { setUser, setIsOnboarded, isOnboarded } = useAppStore()

  const handleComplete = async (keys: WalletKeys) => {
    // Already onboarded — just adding another wallet. Go back.
    if (isOnboarded) {
      const funded = await stellarService.fundAccount(keys.stellarPublic)
      if (!funded) logger.warn('Account funding failed for additional wallet')
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

    const funded = await stellarService.fundAccount(keys.stellarPublic)
    if (!funded) logger.warn('Account funding failed — will retry on dashboard')

    // A freshly imported wallet has no PIN yet on this device. Route through
    // the lock screen's setup mode so a PIN is mandatory before the wallet
    // is reachable — biometrics is an optional layer on top, never a
    // replacement for it.
    router.replace('/lock')
  }

  return <ImportWalletScreen onComplete={handleComplete} onBack={() => router.back()} />
}
