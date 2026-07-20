import { View, Text, TextInput, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { DesignTokens } from '@/constants/designTokens'
import { Colors } from '@/constants/theme'

interface AmountInputProps {
  value: string
  onChangeValue: (value: string) => void
  currency?: string
  maxAmount?: number
  label?: string
  error?: string
  placeholder?: string
  editable?: boolean
  testID?: string
}

export function AmountInput({
  value,
  onChangeValue,
  currency = '₱',
  maxAmount,
  label,
  error,
  placeholder = '0.00',
  editable = true,
  testID,
}: AmountInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const formatValue = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2)
    }
    return cleaned
  }

  const handleChange = (text: string) => {
    const formatted = formatValue(text)
    const numValue = parseFloat(formatted) || 0
    if (maxAmount && numValue > maxAmount) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      }
      return
    }
    onChangeValue(formatted)
  }

  const handleMaxPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    if (maxAmount) {
      onChangeValue(maxAmount.toFixed(2))
    }
  }

  const numValue = parseFloat(value) || 0
  const hasError = !!error
  const exceedsMax = maxAmount && numValue > maxAmount

  const inputContainerClass = `flex-row items-center bg-midGrey rounded-xl border-2 px-4 min-h-[56] ${
    hasError ? 'border-[#FF5A5F]' : isFocused ? 'border-gold bg-cardBg' : 'border-borderGrey'
  }`

  return (
    <View className="w-full" testID={testID}>
      {label && (
        <Text
          className="text-sm font-medium text-[#F5F5F5] mb-2 uppercase"
          style={{ letterSpacing: DesignTokens.typography.letterSpacing.wide }}
          accessibilityLabel={label}
        >
          {label}
        </Text>
      )}

      <View className={inputContainerClass}>
        <Text className="text-2xl font-bold text-gold mr-1">{currency}</Text>

        <TextInput
          className="flex-1 text-2xl font-bold text-white"
          style={{ padding: 0, includeFontPadding: false }}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.mutedWhite}
          keyboardType="decimal-pad"
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectTextOnFocus
          accessibilityLabel={`Amount input, ${label || 'enter amount'}`}
          accessibilityHint={maxAmount ? `Maximum amount is ${maxAmount}` : undefined}
          accessibilityValue={{ text: `${currency}${value || '0'}` }}
        />

        {maxAmount && (
          <PressableScale
            className="py-1 px-2 rounded-lg border border-gold"
            style={{ backgroundColor: Colors.gold + '20' }}
            onPress={handleMaxPress}
            disabled={!editable}
            accessibilityRole="button"
            accessibilityLabel="Set maximum amount"
          >
            <Text className="text-xs font-bold text-gold" style={{ letterSpacing: 1 }}>MAX</Text>
          </PressableScale>
        )}
      </View>

      <View className="mt-2 min-h-5">
        {error && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="alert-circle" size={14} color={Colors.danger} />
            <Text className="text-xs text-[#FF5A5F] flex-1">{error}</Text>
          </View>
        )}

        {!error && maxAmount && (
          <Text className="text-xs text-mutedWhite">
            Available: {currency}{maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        )}
      </View>

      {value && !hasError && (
        <View className="items-center mt-6">
          <Text className="text-5xl font-extrabold text-cream" style={{ lineHeight: 48 * DesignTokens.typography.lineHeight.tight }}>
            {currency}{numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      )}
    </View>
  )
}
