import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface PrimaryButtonProps {
  label: string
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

/** Gold, filled primary CTA. One per screen. Min tap target 48px. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  accessibilityLabel,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading
  return (
    <TouchableOpacity
      style={[styles.btn, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={Colors.black} />
      ) : (
        <View style={styles.inner}>
          {icon && <Ionicons name={icon} size={20} color={Colors.black} />}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  disabled: {
    backgroundColor: Colors.lightGrey,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    color: Colors.black,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
})

export default PrimaryButton
