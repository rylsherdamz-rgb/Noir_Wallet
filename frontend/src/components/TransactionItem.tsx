import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Transaction } from '@/types'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface TransactionItemProps {
  transaction: Transaction
  onPress?: () => void
  testID?: string
}

export const TransactionItem = memo(function TransactionItem({ transaction, onPress, testID }: TransactionItemProps) {
  const router = useRouter()
  
  const statusConfig = {
    pending: { color: Colors.warning, icon: 'time-outline' as const, label: 'Pending' },
    confirmed: { color: Colors.success, icon: 'checkmark-circle-outline' as const, label: 'Confirmed' },
    failed: { color: Colors.danger, icon: 'close-circle-outline' as const, label: 'Failed' },
  }

  const FALLBACK_CONFIG = { color: Colors.mutedWhite, icon: 'help-circle-outline' as const, label: 'Unknown' }

  const config = statusConfig[transaction.status] ?? FALLBACK_CONFIG
  const amountStr = `${(transaction.amountCents / 100).toFixed(2)} ${transaction.assetCode}`
  const isIncoming = transaction.merchantName === 'NFC Receive' || transaction.merchantName === 'NFC Payment'

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (onPress) {
      onPress()
    } else {
      router.push(`/transaction/${transaction.id}`)
    }
  }

  return (
    <PressableScale
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${transaction.merchantName}, ${amountStr}, ${config.label}`}
      accessibilityHint="Tap to view details"
      testID={testID}
    >
      <View style={[styles.iconWrap, { backgroundColor: colorWithOpacity(config.color, 0.15) }]}>
        <Ionicons name={config.icon} size={DesignTokens.iconSize.sm} color={config.color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchantName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {new Date(transaction.createdAt).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          {'\u00B7'} {config.label}
        </Text>
      </View>

      <View style={styles.amountSection}>
        <Text style={[styles.amount, !isIncoming && styles.outgoing]}>
          {isIncoming ? '+' : '-'}
          {amountStr}
        </Text>
        {transaction.stellarTxHash && (
          <Text style={styles.txHash} numberOfLines={1}>
            {transaction.stellarTxHash.slice(0, 8)}...
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.borderGrey} />
    </PressableScale>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    minHeight: DesignTokens.touchTarget.large,
    ...DesignTokens.shadows.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  merchant: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.md * DesignTokens.typography.lineHeight.tight,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
  amountSection: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  amount: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.md * DesignTokens.typography.lineHeight.tight,
  },
  outgoing: {
    color: Colors.danger,
  },
  txHash: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 2,
    maxWidth: 80,
    fontFamily: 'monospace',
  },
})
