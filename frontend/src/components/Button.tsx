import { Text, ActivityIndicator, View, StyleProp, ViewStyle, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { useRef } from 'react'
import { Colors } from '@/constants/theme'

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

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gold',
  secondary: 'bg-midGrey border border-borderGrey',
  ghost: 'border border-gold bg-transparent',
  danger: 'bg-[#FF5A5F]',
  success: 'bg-[#3ED598]',
}

const sizeClasses: Record<ButtonSize, string> = {
  small: 'py-2 px-4 min-h-[44]',
  medium: 'py-4 px-6 min-h-[56]',
  large: 'py-6 px-8 min-h-[72]',
}

const labelVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-black',
  secondary: 'text-white',
  ghost: 'text-gold',
  danger: 'text-white',
  success: 'text-white',
}

const labelSizeClasses: Record<ButtonSize, string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-xl',
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
        className={`rounded-xl items-center justify-center flex-row ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'opacity-60' : ''} ${fullWidth ? 'w-full' : ''}`}
        style={style}
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
          <View className="flex-row items-center gap-2">
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={iconSize} color={getIconColor()} />
            )}
            <Text className={`font-bold ${labelVariantClasses[variant]} ${labelSizeClasses[size]} ${isDisabled ? 'text-mutedWhite' : ''}`}>
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
