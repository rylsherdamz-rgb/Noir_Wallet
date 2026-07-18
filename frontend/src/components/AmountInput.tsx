import { View, Text, TextInput, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

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
    // Remove non-numeric characters except decimal point
    const cleaned = val.replace(/[^0-9.]/g, '')
    
    // Ensure only one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limit to 2 decimal places
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

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text style={styles.label} accessibilityLabel={label}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        <Text style={styles.currency}>{currency}</Text>
        
        <TextInput
          style={styles.input}
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
            style={styles.maxButton}
            onPress={handleMaxPress}
            disabled={!editable}
            accessibilityRole="button"
            accessibilityLabel="Set maximum amount"
          >
            <Text style={styles.maxLabel}>MAX</Text>
          </PressableScale>
        )}
      </View>

      {/* Helper Text */}
      <View style={styles.helperRow}>
        {error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {!error && maxAmount && (
          <Text style={styles.helperText}>
            Available: {currency}{maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        )}
      </View>

      {/* Amount Display (Large) */}
      {value && !hasError && (
        <View style={styles.displayContainer}>
          <Text style={styles.displayAmount}>
            {currency}{numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.offWhite,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: DesignTokens.typography.letterSpacing.wide,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.midGrey,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.md,
    minHeight: DesignTokens.touchTarget.comfortable,
  },
  inputContainerFocused: {
    borderColor: Colors.gold,
    backgroundColor: Colors.cardBg,
  },
  inputContainerError: {
    borderColor: Colors.danger,
  },
  currency: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    padding: 0,
    includeFontPadding: false,
  },
  maxButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.gold + '20',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  maxLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
    letterSpacing: 1,
  },
  helperRow: {
    marginTop: Spacing.sm,
    minHeight: 20,
  },
  helperText: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    flex: 1,
  },
  displayContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  displayAmount: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.cream,
    lineHeight: FontSize.xxxl * DesignTokens.typography.lineHeight.tight,
  },
})
