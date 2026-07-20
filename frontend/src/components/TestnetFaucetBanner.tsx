import { useState } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors } from '@/constants/theme'
import { useAppStore } from '@/store/useAppStore'
import { stellarService } from '@/services/stellar-service'

export function TestnetFaucetBanner() {
  const { user, balance, network, setBalance } = useAppStore()
  const [funding, setFunding] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (network !== 'testnet' || balance.xlm > 0 || dismissed || !user?.stellarPublicKey) {
    return null
  }

  const handleFund = async () => {
    if (!user?.stellarPublicKey) return
    setFunding(true)
    const success = await stellarService.fundAccount(user.stellarPublicKey)
    if (success) {
      const onChain = await stellarService.getBalance(user.stellarPublicKey)
      setBalance({ xlm: onChain.xlm })
    }
    setFunding(false)
    setDismissed(true)
  }

  return (
    <View className="rounded-xl border mb-4" style={{ backgroundColor: Colors.gold + '18', borderColor: Colors.gold + '30' }}>
      <View className="flex-row items-center gap-4 p-4">
        <View className="w-9 h-9 rounded-full bg-gold items-center justify-center">
          <Ionicons name="water-outline" size={20} color={Colors.black} />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gold font-bold">Testnet Account</Text>
          <Text className="text-xs text-mutedWhite mt-px">Fund with free test XLM to get started</Text>
        </View>
        <PressableScale
          className="px-4 py-2 rounded-xl bg-gold min-w-[60] items-center"
          onPress={handleFund}
          disabled={funding}
        >
          <Text className="text-sm text-black font-bold">{funding ? '...' : 'Fund'}</Text>
        </PressableScale>
      </View>
    </View>
  )
}
