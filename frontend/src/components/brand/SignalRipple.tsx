import { useEffect } from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated'
import { Colors } from '@/constants/theme'

interface SignalRippleProps {
  size?: number
  color?: string
  rings?: number
  duration?: number
  active?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * Concentric gold rings that expand and fade — the visible "signal" of the
 * NFC tap, the core Noir motion motif ("Signal in Silence").
 * Rendered behind its sibling (e.g. a Tap disc). Reduced-motion → nothing.
 */
export function SignalRipple({
  size = 54,
  color = Colors.gold,
  rings = 2,
  duration = 2400,
  active = true,
  style,
}: SignalRippleProps) {
  const reduced = useReducedMotion()
  const progress = useSharedValue(0)
  const enabled = active && !reduced

  useEffect(() => {
    if (!enabled) return
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false)
    return () => cancelAnimation(progress)
  }, [enabled, duration, progress])

  if (!enabled) return null

  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {Array.from({ length: rings }).map((_, i) => (
        <Ring key={i} progress={progress} index={i} rings={rings} size={size} color={color} />
      ))}
    </View>
  )
}

function Ring({
  progress,
  index,
  rings,
  size,
  color,
}: {
  progress: SharedValue<number>
  index: number
  rings: number
  size: number
  color: string
}) {
  const style = useAnimatedStyle(() => {
    'worklet'
    const t = (progress.value + index / rings) % 1
    return {
      transform: [{ scale: 0.55 + t * 1.05 }],
      opacity: (1 - t) * 0.5,
    }
  })

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
        },
        style,
      ]}
    />
  )
}

export default SignalRipple
