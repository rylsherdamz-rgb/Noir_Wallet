import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { SignalRipple } from './SignalRipple'

interface NfcScanPulseProps {
  /** Side of the square animation stage. Everything is centered inside it. */
  size?: number
  label?: string
  color?: string
}

/**
 * "Waiting for a tap" animation: expanding signal rings around a softly
 * breathing NFC disc. The rings and disc share one fixed-size stage so they
 * stay concentric; the label sits *below* the stage so it can't shift the
 * visual center. Reduced motion → static ring, no movement.
 */
export function NfcScanPulse({ size = 176, label, color = Colors.gold }: NfcScanPulseProps) {
  const reduced = useReducedMotion()
  const breathe = useSharedValue(1)
  const disc = Math.round(size * 0.42)

  useEffect(() => {
    if (reduced) return
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(breathe)
  }, [reduced, breathe])

  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }))

  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label ?? 'Waiting for NFC tag'}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Static guide ring — also the only ring when reduced motion is on */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: disc * 1.5,
            height: disc * 1.5,
            borderRadius: disc * 0.75,
            borderWidth: 1,
            borderColor: colorWithOpacity(color, 0.18),
          }}
        />
        <SignalRipple size={Math.round(size * 0.62)} rings={3} color={color} duration={2400} />
        <Animated.View
          style={[
            {
              width: disc,
              height: disc,
              borderRadius: disc / 2,
              backgroundColor: colorWithOpacity(color, 0.12),
              borderWidth: 1.5,
              borderColor: colorWithOpacity(color, 0.35),
              alignItems: 'center',
              justifyContent: 'center',
            },
            discStyle,
          ]}
        >
          <Ionicons name="radio" size={Math.round(disc * 0.48)} color={color} />
        </Animated.View>
      </View>
      {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
})

export default NfcScanPulse
