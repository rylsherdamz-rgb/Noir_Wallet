import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, View, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

type ButtonVariant = 'primary' | 'ghost' | 'danger'

interface ButtonProps {
  label: string
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: ButtonVariant
  icon?: keyof typeof Ionicons.glyphMap
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

export function Button({ label, onPress, disabled, loading, variant = 'primary', icon, accessibilityLabel, style }: ButtonProps) {
  const isDisabled = disabled || loading
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.black : Colors.gold} />
      ) : (
        <View style={styles.inner}>
          {icon && <Ionicons name={icon} size={20} color={variant === 'primary' ? Colors.black : isDisabled ? Colors.mutedWhite : Colors.gold} />}
          <Text style={[styles.label, styles[`${variant}Label`], isDisabled && styles.labelDisabled]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: {
    backgroundColor: Colors.gold,
  },
  ghost: {
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  disabled: {
    opacity: 0.4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  primaryLabel: {
    color: Colors.black,
  },
  ghostLabel: {
    color: Colors.gold,
  },
  dangerLabel: {
    color: Colors.white,
  },
  labelDisabled: {
    color: Colors.mutedWhite,
  },
})
