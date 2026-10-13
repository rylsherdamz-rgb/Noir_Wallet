import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Transaction } from '@/types'
import { isIncomingTx, formatAmount, formatSignedAmount } from '@/lib/txFormat'
import { Colors, Spacing, FontSize, FontWeight, Gradient } from '@/constants/theme'

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
  const amountStr = `${formatAmount(transaction.amountCents)} ${transaction.assetCode}`
  const isIncoming = isIncomingTx(transaction)

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (onPress) {
      onPress()
    } else {
      router.push(`/transaction/${transaction.id}`)
    }
  }

  const failed = transaction.status === 'failed'
  const time = new Date(transaction.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  const amountColor = failed ? Colors.mutedWhite : isIncoming ? Colors.success : Colors.white

  return (
    <PressableScale
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${transaction.merchantName}, ${amountStr}, ${config.label}`}
      accessibilityHint="Opens the transaction"
      testID={testID}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={failed ? 'close' : isIncoming ? 'arrow-down' : 'arrow-up'} size={20} color={failed ? Colors.danger : isIncoming ? Colors.success : Colors.mutedWhite} />
      </View>
      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>{transaction.merchantName}</Text>
        <Text style={styles.meta} numberOfLines={1}>{isIncoming ? 'Received' : 'Sent'} · {time}</Text>
      </View>
      <View style={styles.amountSection}>
        <Text style={[styles.amount, { color: amountColor }, failed && styles.struck]}>{formatSignedAmount(transaction)}</Text>
        {transaction.status !== 'confirmed' && <Text style={[styles.status, { color: config.color }]}>{config.label}</Text>}
      </View>
    </PressableScale>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Gradient.panel,
  },
  iconWrap: { width: 28, alignItems: 'center' },
  info: { flex: 1, minWidth: 0 },
  merchant: { fontSize: FontSize.md - 1, color: Colors.white, fontWeight: FontWeight.medium },
  meta: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, marginTop: 2 },
  amountSection: { alignItems: 'flex-end' },
  amount: { fontSize: FontSize.md - 1, fontWeight: FontWeight.medium, fontVariant: ['tabular-nums'] },
  struck: { textDecorationLine: 'line-through' },
  status: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, marginTop: 2 },
})
