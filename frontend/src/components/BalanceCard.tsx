import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

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
      <View style={[styles.assetIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetLabel}>{label}</Text>
        <Text style={[styles.assetAmount, { color }]}>{amount}</Text>
      </View>
      <Text style={styles.assetValue}>{value}</Text>
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
  const totalPhp = phpBalance + usdcBalance * 58 + xlmBalance * 15

  return (
    <View style={styles.container}>
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Balance</Text>
        <Text style={styles.totalAmount}>
          ₱{totalPhp.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.totalSub}>≈ ${(totalPhp / 58).toFixed(2)} USD</Text>
      </View>

      <View style={styles.divider} />

      <AssetRow
        icon="wallet-outline"
        label="PHP"
        amount={`₱${phpBalance.toFixed(2)}`}
        value="Local Currency"
        color={Colors.accentGreen}
      />
      <AssetRow
        icon="logo-usd"
        label="USDC"
        amount={`${usdcBalance.toFixed(2)} USDC`}
        value={`₱${(usdcBalance * 58).toFixed(2)}`}
        color={Colors.accentBlue}
      />
      <AssetRow
        icon="planet-outline"
        label="XLM"
        amount={`${xlmBalance.toFixed(4)} XLM`}
        value={`₱${(xlmBalance * 15).toFixed(2)}`}
        color={Colors.accentOrange}
      />
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
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: FontSize.xxxl,
    color: Colors.white,
    fontWeight: FontWeight.heavy,
    marginTop: Spacing.xs,
  },
  totalSub: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGrey,
    marginVertical: Spacing.md,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  assetLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
  },
  assetAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  assetValue: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
  },
})
