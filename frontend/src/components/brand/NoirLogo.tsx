import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme'

type NoirLogoVariant = 'mark' | 'wordmark' | 'lockup'

interface NoirLogoProps {
  variant?: NoirLogoVariant
  size?: number
  color?: string
  showTagline?: boolean
  style?: StyleProp<ViewStyle>
}

const LOGO_MARK = require('../../../assets/noir-mark.png')
const LOGO_FULL = require('../../../assets/logo-full.jpg')

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
        <Image
          source={LOGO_MARK}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    )
  }

  return (
    <View style={[styles.center, style]}>
      <Image
        source={LOGO_FULL}
        style={{ width: size * 2.5, height: size * 1.2 }}
        resizeMode="contain"
      />
      {showTagline && (
        <Text style={[styles.tagline, { color, marginTop: Spacing.sm }]}>
          TAP INTO TRUST
        </Text>
      )}
    </View>
  )
}

function Wordmark({ color, showTagline }: { color: string; showTagline: boolean }) {
  return (
    <View style={styles.center}>
      <Image
        source={LOGO_FULL}
        style={{ width: 160, height: 48 }}
        resizeMode="contain"
      />
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
  tagline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
})

export default NoirLogo
