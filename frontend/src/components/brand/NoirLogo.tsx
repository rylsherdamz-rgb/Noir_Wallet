import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme'

/**
 * NoirLogo — the NOIR brand mark.
 *
 * Variants:
 *  - "mark"     → the geometric cat head only (used for app icon / splash / small sizes)
 *  - "wordmark" → NOIR text (wide letter-spacing) + TAP INTO TRUST tagline
 *  - "lockup"   → mark stacked above the wordmark (onboarding hero)
 *
 * The cat mark below is composed with @expo/vector-icons + styled Views so we don't
 * pull in any new native dependency (react-native-svg). It's a faceted "gold cat on
 * black" placeholder.
 *
 * TODO(asset): drop a real raster/SVG cat here when available:
 *   1. add `assets/noir-cat.png` (transparent, gold on black)
 *   2. replace the <CatMark/> body with:
 *        <Image source={require('../../../assets/noir-cat.png')}
 *               style={{ width: size, height: size }} resizeMode="contain" />
 */

type NoirLogoVariant = 'mark' | 'wordmark' | 'lockup'

interface NoirLogoProps {
  variant?: NoirLogoVariant
  /** Pixel size of the cat mark (mark + lockup). Defaults to 72. */
  size?: number
  /** Accent color for the mark. Defaults to gold. */
  color?: string
  showTagline?: boolean
  style?: StyleProp<ViewStyle>
}

export function NoirLogo({
  variant = 'lockup',
  size = 72,
  color = Colors.gold,
  showTagline = true,
  style,
}: NoirLogoProps) {
  if (variant === 'wordmark') {
    return (
      <View style={[styles.center, style]}>
        <Wordmark color={color} showTagline={showTagline} />
      </View>
    )
  }

  if (variant === 'mark') {
    return (
      <View style={[styles.center, style]}>
        <CatMark size={size} color={color} />
      </View>
    )
  }

  // lockup
  return (
    <View style={[styles.center, style]}>
      <CatMark size={size} color={color} />
      <View style={{ height: Spacing.md }} />
      <Wordmark color={color} showTagline={showTagline} />
    </View>
  )
}

/**
 * The faceted cat head. Built from two rotated diamond "ears" and a circular face
 * carrying an Ionicons paw glyph. Purely decorative, so it is marked as such for a11y.
 */
function CatMark({ size, color }: { size: number; color: string }) {
  const ear = size * 0.3
  const face = size * 0.78
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.markWrap, { width: size, height: size }]}
    >
      {/* Ears — rotated squares peeking above the face */}
      <View
        style={[
          styles.ear,
          {
            width: ear,
            height: ear,
            borderColor: color,
            left: size * 0.12,
            top: 0,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.ear,
          {
            width: ear,
            height: ear,
            borderColor: color,
            right: size * 0.12,
            top: 0,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      {/* Face disc */}
      <View
        style={[
          styles.face,
          {
            width: face,
            height: face,
            borderRadius: face / 2,
            borderColor: color,
          },
        ]}
      >
        <Ionicons name="paw" size={face * 0.5} color={color} />
      </View>
    </View>
  )
}

function Wordmark({ color, showTagline }: { color: string; showTagline: boolean }) {
  return (
    <View style={styles.center}>
      <Text
        accessibilityRole="header"
        accessibilityLabel="NOIR"
        style={[styles.wordmark, { color: Colors.cream }]}
      >
        NOIR
      </Text>
      {showTagline && (
        <Text style={[styles.tagline, { color }]}>TAP INTO TRUST</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  ear: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: Colors.black,
  },
  face: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
  },
  wordmark: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.heavy,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 4,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
})

export default NoirLogo
