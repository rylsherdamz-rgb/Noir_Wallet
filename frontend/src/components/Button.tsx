import { Text, StyleSheet, ActivityIndicator, View, StyleProp, ViewStyle, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { useRef } from 'react'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

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
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    if (isDisabled) return
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start()
  }

  const handlePressOut = () => {
    if (isDisabled) return
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start()
  }

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
        return Colors.black
      case 'secondary':
        return Colors.white
      case 'ghost':
        return Colors.gold
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
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}>
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
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? Colors.black : variant === 'ghost' ? Colors.gold : Colors.white}
            size={size === 'small' ? 'small' : 'large'}
          />
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
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
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
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  ghost: {
    borderWidth: 1,
    borderColor: Colors.gold,
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
  label: {
    fontWeight: FontWeight.bold,
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
    color: Colors.black,
  },
  secondaryLabel: {
    color: Colors.white,
  },
  ghostLabel: {
    color: Colors.gold,
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
