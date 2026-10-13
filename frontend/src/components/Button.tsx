import { Text, StyleSheet, View, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, BorderRadius, Fonts } from '@/constants/theme'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  label: string
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: keyof typeof Ionicons.glyphMap
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  hapticFeedback?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading


  const handlePress = () => {
    if (isDisabled || !onPress) return
    
    // Provide haptic feedback
    if (hapticFeedback) {
      if (variant === 'danger') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }
    }
    
    onPress()
  }

  const getIconColor = () => {
    if (isDisabled) return Colors.mutedWhite
    
    switch (variant) {
      case 'primary':
        return Colors.onGold
      case 'secondary':
        return Colors.white
      case 'ghost':
        return Colors.cream
      case 'danger':
        return Colors.white
      case 'success':
        return Colors.white
      default:
        return Colors.gold
    }
  }

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20

  return (
    <View style={fullWidth ? styles.fullWidth : undefined}>
      <PressableScale
        style={[
          styles.base,
          styles[variant],
          styles[size],
          isDisabled && styles.disabled,
          fullWidth && styles.fullWidth,
          style,
        ]}
        onPress={handlePress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        testID={testID}
      >
        {loading ? (
          <VerifyingPulse size={size === 'small' ? 16 : 20} color={variant === 'primary' ? Colors.onGold : variant === 'ghost' ? Colors.cream : Colors.white} />
        ) : (
          <View style={styles.inner}>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={iconSize} color={getIconColor()} />
            )}
            <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`], isDisabled && styles.labelDisabled]}>
              {label}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={iconSize} color={getIconColor()} />
            )}
          </View>
        )}
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.gold,
  },
  secondary: {
    backgroundColor: Colors.midGrey,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  success: {
    backgroundColor: Colors.success,
  },
  
  // Sizes
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: DesignTokens.touchTarget.minimum,
  },
  medium: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: DesignTokens.touchTarget.comfortable,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: DesignTokens.touchTarget.large,
  },
  
  // States
  disabled: {
    opacity: DesignTokens.opacity.strong,
  },
  fullWidth: {
    width: '100%',
  },
  
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  // Label styles
  // Jost, sentence case — solid pill (DESIGN.md → Buttons)
  label: {
    fontFamily: Fonts.display,
    letterSpacing: 0.3,
  },
  smallLabel: {
    fontSize: FontSize.sm,
  },
  mediumLabel: {
    fontSize: FontSize.md,
  },
  largeLabel: {
    fontSize: FontSize.lg,
  },
  primaryLabel: {
    color: Colors.onGold,
  },
  secondaryLabel: {
    color: Colors.white,
  },
  ghostLabel: {
    color: Colors.cream,
  },
  dangerLabel: {
    color: Colors.white,
  },
  successLabel: {
    color: Colors.white,
  },
  labelDisabled: {
    color: Colors.mutedWhite,
  },
})
