import { ReactNode } from 'react'
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: ReactNode
  onPress?: () => void
  scaleTo?: number
  haptic?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * A Pressable that gently scales down on press (with a light haptic tick) —
 * the calm, premium press feedback used across Noir's primary actions.
 * Reduced-motion → no scale, but the press + haptic still fire.
 */
export function PressableScale({
  children,
  onPress,
  scaleTo = 0.94,
  haptic = true,
  style,
  ...rest
}: PressableScaleProps) {
  const reduced = useReducedMotion()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      onPressIn={() => {
        if (!reduced) scale.value = withTiming(scaleTo, { duration: 90 })
      }}
      onPressOut={() => {
        if (!reduced) scale.value = withTiming(1, { duration: 150 })
      }}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress?.()
      }}
      style={[style, animatedStyle]}
      accessibilityRole="button"
      {...rest}
    >
      {children}
    </AnimatedPressable>
  )
}

export default PressableScale
