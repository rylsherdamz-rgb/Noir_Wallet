import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface GhostButtonProps {
  label: string
  onPress?: () => void
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

/** Outline secondary button. Gold hairline on black. Min tap target 48px. */
export function GhostButton({
  label,
  onPress,
  disabled,
  icon,
  accessibilityLabel,
  style,
}: GhostButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
    >
      <View style={styles.inner}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={disabled ? Colors.mutedWhite : Colors.gold}
          />
        )}
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: 'transparent',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  disabled: {
    borderColor: Colors.borderGrey,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    color: Colors.gold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  labelDisabled: {
    color: Colors.mutedWhite,
  },
})

export default GhostButton
