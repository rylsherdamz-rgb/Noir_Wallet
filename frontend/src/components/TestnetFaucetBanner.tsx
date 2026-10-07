import { colorWithOpacity } from '@/constants/designTokens'
import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
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
      setBalance({ xlm: onChain.xlm, subentryCount: onChain.subentryCount })
    }
    setFunding(false)
    setDismissed(true)
  }

  return (
    <View style={styles.banner}>
      <Ionicons name="water-outline" size={20} color={Colors.testnet} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>Empty Testnet wallet</Text>
        <Text style={styles.subtitle}>Get free test XLM to try Noir</Text>
      </View>
      <PressableScale style={styles.fundBtn} onPress={handleFund} disabled={funding} accessibilityRole="button" accessibilityLabel="Get free test XLM">
        <Text style={styles.fundLabel}>{funding ? 'Funding…' : 'Get XLM'}</Text>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: Colors.midGrey, marginBottom: Spacing.md },
  textWrap: { flex: 1 },
  title: { fontSize: FontSize.md - 1, color: Colors.white, fontWeight: FontWeight.medium },
  subtitle: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, marginTop: 2 },
  fundBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.gold },
  fundLabel: { fontSize: FontSize.sm, color: Colors.onGold, fontWeight: FontWeight.semibold },
})
