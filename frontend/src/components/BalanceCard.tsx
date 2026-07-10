import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { useState, useEffect } from 'react'
import { fxRateService } from '@/services/fxRates'

interface AssetRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  amount: string
  value: string
  color: string
  testID?: string
}

function AssetRow({ icon, label, amount, value, color, testID }: AssetRowProps) {
  return (
    <View style={styles.assetRow} testID={testID}>
      <View style={[styles.assetIcon, { backgroundColor: colorWithOpacity(color, 0.15) }]}>
        <Ionicons name={icon} size={DesignTokens.iconSize.sm} color={color} />
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetLabel}>{label}</Text>
        <Text style={styles.assetAmount}>{amount}</Text>
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
  testID?: string
}

export function BalanceCard({
  phpBalance,
  usdcBalance,
  xlmBalance,
  localTokens,
  testID,
}: BalanceCardProps) {
  const [rates, setRates] = useState({ usdToPhp: 58, xlmToUsd: 0.12 })

  useEffect(() => {
    fxRateService.getRates().then(setRates).catch(() => {
      // Use default rates on error
    })
  }, [])

  const xlmValueInPhp = xlmBalance * rates.xlmToUsd * rates.usdToPhp
  const usdcValueInPhp = usdcBalance * rates.usdToPhp
  const totalPhp = phpBalance + usdcValueInPhp + xlmValueInPhp

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityLabel={`Total portfolio value: ${totalPhp.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`}
      accessibilityRole="summary"
    >
      {/* Portfolio Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>PORTFOLIO VALUE</Text>
        <Text style={styles.totalAmount} accessibilityRole="text">
          ₱{totalPhp.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        {totalPhp > 0 && (
          <Text style={styles.totalSub}>
            ${(totalPhp / rates.usdToPhp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </Text>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Asset Breakdown */}
      <View style={styles.assetList} accessibilityRole="list">
        <AssetRow
          icon="cash-outline"
          label="PHP"
          amount={`₱${phpBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          value="Fiat"
          color={Colors.gold}
          testID="balance-card-php"
        />
        <AssetRow
          icon="logo-usd"
          label="USDC"
          amount={usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          value={`₱${usdcValueInPhp.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          color={Colors.silver}
          testID="balance-card-usdc"
        />
        <AssetRow
          icon="planet-outline"
          label="XLM"
          amount={xlmBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          value={`₱${xlmValueInPhp.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          color={Colors.goldDim}
          testID="balance-card-xlm"
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
    ...DesignTokens.shadows.card,
  },
  
  // Portfolio Total Section
  totalSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: DesignTokens.typography.letterSpacing.wider,
  },
  totalAmount: {
    fontSize: FontSize.xxl,
    color: Colors.cream,
    fontWeight: FontWeight.heavy,
    marginTop: Spacing.sm,
    lineHeight: FontSize.xxl * DesignTokens.typography.lineHeight.tight,
  },
  totalSub: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
    minHeight: 18,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.borderGrey,
    marginVertical: Spacing.lg,
  },
  
  // Asset List
  assetList: {
    gap: Spacing.md,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    minHeight: DesignTokens.touchTarget.minimum,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
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
    letterSpacing: DesignTokens.typography.letterSpacing.wide,
  },
  assetAmount: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
    lineHeight: FontSize.md * DesignTokens.typography.lineHeight.tight,
  },
  assetValueWrap: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
  },
})
