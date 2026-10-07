import { useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
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
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme'

const NOIR_MARK = require('../../../assets/noir-mark.png')

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
 * "Verifying on-chain" animation: the Noir mark breathing on its own (compact: a breathing mini mark next to
 * text) — never a blank disc. Same visual language as `NfcScanPulse`'s
 * "waiting for tap" state — the same visual language as `NfcScanPulse`'s "waiting for
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
        withTiming(compact ? 0.82 : 1.06, { duration: compact ? 650 : 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: compact ? 650 : 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(breathe)
  }, [reduced, breathe, compact])

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
    opacity: compact ? 0.55 + breathe.value * 0.45 : 1,
  }))

  // The mark is gold; on a gold or neutral surface it is drawn as a silhouette.
  const tint = color === Colors.gold ? undefined : color

  if (compact) {
    return (
      <View style={styles.compactRow} accessibilityRole="progressbar" accessibilityLabel={label ?? 'Checking'}>
        <Animated.View style={discStyle}>
          <Image source={NOIR_MARK} style={{ width: disc, height: disc, tintColor: tint }} resizeMode="contain" />
        </Animated.View>
        {label ? <Text style={[styles.compactLabel, { color }]}>{label}</Text> : null}
      </View>
    )
  }

  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label ?? 'Verifying on Stellar'}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={discStyle}>
          <Image source={NOIR_MARK} style={{ width: disc * 1.1, height: disc * 1.16, tintColor: tint }} resizeMode="contain" />
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
