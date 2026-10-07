import { ReactNode } from 'react'
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native'
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
  /** Opacity while pressed. */
  pressedOpacity?: number
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
 * A Pressable that dims on press (with a light haptic tick). It never scales:
 * size changes on press read as buttons growing/shrinking, so feedback is
 * opacity only. Reduced motion → instant dim, no fade.
 */
export function PressableScale({
  children,
  onPress,
  pressedOpacity = 0.6,
  haptic = true,
  style,
  hitSlop = DEFAULT_HIT_SLOP,
  disabled,
  ...rest
}: PressableScaleProps) {
  const reduced = useReducedMotion()
  const opacity = useSharedValue(1)
  // Respect a style-level opacity (e.g. a disabled Button) instead of overriding it.
  const flatOpacity = StyleSheet.flatten(style)?.opacity
  const baseOpacity = typeof flatOpacity === 'number' ? flatOpacity : 1

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: baseOpacity * opacity.value,
  }))

  return (
    <AnimatedPressable
      onPressIn={() => {
        opacity.value = reduced ? pressedOpacity : withTiming(pressedOpacity, { duration: 80 })
      }}
      onPressOut={() => {
        opacity.value = reduced ? 1 : withTiming(1, { duration: 150 })
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
