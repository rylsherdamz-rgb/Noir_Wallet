import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { WelcomeScreen } from '@/screens/WelcomeScreen'
import { IntroScreen } from '@/screens/IntroScreen'
import { getItem, setItem } from '@/services/storage'
import { Colors } from '@/constants/theme'

const INTRO_SEEN_KEY = 'onboarding_intro_seen'

export default function Onboarding() {
  const router = useRouter()
  // null while reading storage, so the welcome screen never flashes first.
  const [showIntro, setShowIntro] = useState<boolean | null>(null)

  useEffect(() => {
    getItem<boolean>(INTRO_SEEN_KEY)
      .then((seen) => setShowIntro(!seen))
      .catch(() => setShowIntro(true))
  }, [])

  const finishIntro = () => {
    setShowIntro(false)
    setItem(INTRO_SEEN_KEY, true).catch(() => { /* shows again next time; harmless */ })
  }

  if (showIntro === null) return <View style={{ flex: 1, backgroundColor: Colors.surfaceBg }} />
  if (showIntro) return <IntroScreen onDone={finishIntro} />

  return (
    <WelcomeScreen
      onCreateWallet={() => router.push('/seed-phrase')}
      onImportWallet={() => router.push('/import-wallet')}
    />
  )
}
