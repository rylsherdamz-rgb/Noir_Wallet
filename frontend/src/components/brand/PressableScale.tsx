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
 * Extra touch area applied to every PressableScale.
 *
 * Most icon buttons in the app render at 18–24pt, well under the 44pt minimum
 * touch target. Defaulting the slop here fixes all of them at once; a call site
 * that needs more can still pass its own `hitSlop`.
 */
const DEFAULT_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 }

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
  hitSlop = DEFAULT_HIT_SLOP,
  disabled,
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
      hitSlop={hitSlop}
      disabled={disabled}
      accessibilityRole="button"
      // Screen readers need the disabled state announced, not just enforced.
      accessibilityState={{ disabled: !!disabled }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  )
}

export default PressableScale
