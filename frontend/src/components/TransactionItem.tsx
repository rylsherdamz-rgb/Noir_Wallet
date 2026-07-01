import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Transaction } from '@/types'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const statusConfig = {
    pending: { color: Colors.accentYellow, icon: 'time-outline' as const },
    confirmed: { color: Colors.accentGreen, icon: 'checkmark-circle-outline' as const },
    failed: { color: Colors.accentRed, icon: 'close-circle-outline' as const },
  }

  const config = statusConfig[transaction.status]
  const isOutgoing = transaction.assetCode !== 'PHP'
  const amountStr =
    transaction.assetCode === 'PHP'
      ? `₱${(transaction.amountCents / 100).toFixed(2)}`
      : `${(transaction.amountCents / 100).toFixed(2)} ${transaction.assetCode}`

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.merchant}>{transaction.merchantName}</Text>
        <Text style={styles.meta}>
          {new Date(transaction.createdAt).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          {'\u00B7'} {transaction.status}
        </Text>
      </View>

      <View style={styles.amountSection}>
        <Text style={[styles.amount, isOutgoing && styles.outgoing]}>
          {isOutgoing ? '-' : '+'}
          {amountStr}
        </Text>
        {transaction.stellarTxHash && (
          <Text style={styles.txHash} numberOfLines={1}>
            {transaction.stellarTxHash.slice(0, 8)}...
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  merchant: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FontSize.md,
    color: Colors.accentGreen,
    fontWeight: FontWeight.bold,
  },
  outgoing: {
    color: Colors.accentRed,
  },
  txHash: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 2,
    maxWidth: 100,
  },
})
