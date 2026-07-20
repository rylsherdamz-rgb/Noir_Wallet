import { memo } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Transaction } from '@/types'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, FontSize } from '@/constants/theme'

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
      className="flex-row items-center py-4 px-4 bg-cardBg rounded-xl mb-2 border border-borderGrey min-h-[72]"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${transaction.merchantName}, ${amountStr}, ${config.label}`}
      accessibilityHint="Tap to view details"
      testID={testID}
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center border border-borderGrey" style={{ backgroundColor: colorWithOpacity(config.color, 0.15) }}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      <View className="flex-1 ml-4 mr-2">
        <Text className="text-base text-white font-semibold" numberOfLines={1} style={{ lineHeight: FontSize.md * DesignTokens.typography.lineHeight.tight }}>
          {transaction.merchantName}
        </Text>
        <Text className="text-xs text-mutedWhite mt-1 capitalize" numberOfLines={1}>
          {new Date(transaction.createdAt).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          {'\u00B7'} {config.label}
        </Text>
      </View>

      <View className="items-end mr-2">
        <Text className="text-base font-bold" style={{ color: isIncoming ? Colors.success : Colors.danger, lineHeight: FontSize.md * DesignTokens.typography.lineHeight.tight }}>
          {isIncoming ? '+' : '-'}
          {amountStr}
        </Text>
        {transaction.stellarTxHash && (
          <Text className="text-xs text-mutedWhite mt-0.5 max-w-20 font-mono" numberOfLines={1}>
            {transaction.stellarTxHash.slice(0, 8)}...
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.borderGrey} />
    </PressableScale>
  )
})
