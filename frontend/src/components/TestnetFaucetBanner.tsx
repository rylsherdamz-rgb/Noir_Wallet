import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { useAppStore } from '@/store/useAppStore'
import { stellarService } from '@/services/stellar-service'
import { fxRateService } from '@/services/fxRates'

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
      const rates = await fxRateService.getRates()
      setBalance({
        xlm: onChain.xlm,
        usdc: onChain.usdc,
        php: onChain.usdc * rates.usdToPhp,
        localTokens: {},
      })
    }
    setFunding(false)
    setDismissed(true)
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="water-outline" size={20} color={Colors.black} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Testnet Account</Text>
          <Text style={styles.subtitle}>Fund with free test XLM to get started</Text>
        </View>
        <TouchableOpacity
          style={styles.fundBtn}
          onPress={handleFund}
          disabled={funding}
          activeOpacity={0.7}
        >
          <Text style={styles.fundLabel}>{funding ? '...' : 'Fund'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.gold + '18',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 1,
  },
  fundBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold,
    minWidth: 60,
    alignItems: 'center',
  },
  fundLabel: {
    fontSize: FontSize.sm,
    color: Colors.black,
    fontWeight: FontWeight.bold,
  },
})
