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

interface VerifyingPulseProps {
  /**
   * Side of the square animation stage for the full-size variant. Sizes at
   * or below `COMPACT_THRESHOLD` switch to a compact inline dot (no rings)
   * sized to sit next to text in place of a bare `ActivityIndicator`.
   */
  size?: number
  label?: string
  color?: string
}

const COMPACT_THRESHOLD = 32

/**
 * "Verifying on-chain" animation: a breathing shield disc with expanding
 * signal rings — the same visual language as `NfcScanPulse`'s "waiting for
 * tap" state, but reading as "checking" rather than "listening". Replaces the
 * plain `ActivityIndicator` + "Checking…" text used for on-chain lookups.
 * Reduced motion → static dot/ring, no movement.
 */
export function VerifyingPulse({ size = 176, label, color = Colors.gold }: VerifyingPulseProps) {
  const reduced = useReducedMotion()
  const breathe = useSharedValue(1)
  const compact = size <= COMPACT_THRESHOLD
  const disc = compact ? size : Math.round(size * 0.42)

  useEffect(() => {
    if (reduced) return
    breathe.value = withRepeat(
      withSequence(
        withTiming(compact ? 0.7 : 1.06, { duration: compact ? 650 : 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: compact ? 650 : 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(breathe)
  }, [reduced, breathe, compact])

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
    opacity: compact ? 0.45 + breathe.value * 0.55 : 1,
  }))

  if (compact) {
    return (
      <View style={styles.compactRow} accessibilityRole="progressbar" accessibilityLabel={label ?? 'Checking'}>
        <Animated.View
          style={[{ width: disc, height: disc, borderRadius: disc / 2, backgroundColor: color }, discStyle]}
        />
        {label ? <Text style={[styles.compactLabel, { color }]}>{label}</Text> : null}
      </View>
    )
  }

  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label ?? 'Verifying on Stellar'}>
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
          <Ionicons name="shield-checkmark" size={Math.round(disc * 0.48)} color={color} />
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
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compactLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
})

export default VerifyingPulse
