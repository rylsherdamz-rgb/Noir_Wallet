import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { useState, useEffect } from 'react'
import { fxRateService } from '@/services/fxRates'

interface AssetRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  amount: string
  value: string
  color: string
}

function AssetRow({ icon, label, amount, value, color }: AssetRowProps) {
  return (
    <View style={styles.assetRow}>
      <View style={[styles.assetIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetLabel}>{label}</Text>
        <Text style={[styles.assetAmount, { color: Colors.white }]}>{amount}</Text>
      </View>
      <View style={styles.assetValueWrap}>
        <Text style={styles.assetValue}>{value}</Text>
      </View>
    </View>
  )
}

interface BalanceCardProps {
  phpBalance: number
  usdcBalance: number
  xlmBalance: number
  localTokens?: Record<string, number>
}

export function BalanceCard({ phpBalance, usdcBalance, xlmBalance }: BalanceCardProps) {
  const [rates, setRates] = useState({ usdToPhp: 58, xlmToUsd: 0.12 })

  useEffect(() => {
    fxRateService.getRates().then(setRates)
  }, [])

  const totalPhp = phpBalance + usdcBalance * rates.usdToPhp + xlmBalance * rates.usdToPhp * rates.xlmToUsd

  return (
    <View style={styles.container}>
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Portfolio Value</Text>
        <Text style={styles.totalAmount}>
          ₱{totalPhp.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.totalSub}>≈ ${(totalPhp / rates.usdToPhp).toFixed(2)} USD</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.assetList}>
        <AssetRow
          icon="cash-outline"
          label="PHP"
          amount={`₱${phpBalance.toFixed(2)}`}
          value="Fiat"
          color={Colors.gold}
        />
        <AssetRow
          icon="logo-usd"
          label="USDC"
          amount={`${usdcBalance.toFixed(2)} USDC`}
          value={`₱${(usdcBalance * rates.usdToPhp).toFixed(2)}`}
          color={Colors.silver}
        />
        <AssetRow
          icon="planet-outline"
          label="XLM"
          amount={`${xlmBalance.toFixed(4)} XLM`}
          value={`₱${(xlmBalance * rates.usdToPhp * rates.xlmToUsd).toFixed(2)}`}
          color={Colors.goldDim}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  totalSection: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  totalAmount: {
    fontSize: FontSize.hero,
    color: Colors.cream,
    fontWeight: FontWeight.heavy,
    marginTop: Spacing.xs,
  },
  totalSub: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGrey,
    marginVertical: Spacing.lg,
  },
  assetList: {
    gap: Spacing.md,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  assetInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  assetLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
  },
  assetAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  assetValueWrap: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
  },
})
