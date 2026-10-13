import { View, Text, StyleSheet, Image } from 'react-native'
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme'

const NOIR_MARK = require('../../../assets/noir-mark.png')

interface BrandMarkProps {
  /** Show the NOIR wordmark + tagline under the logo. */
  showWordmark?: boolean
  size?: number
}

/**
 * The Noir lockup for brand moments (splash, welcome): the cat standing alone
 * on the background — no ring, frame or glow — over the NOIR wordmark.
 * In-app screens show the account, not the logo. See DESIGN.md → "Logo".
 */
export function BrandMark({ showWordmark = true, size = 104 }: BrandMarkProps) {
  return (
    <View style={styles.hero}>
      <Image source={NOIR_MARK} style={{ width: size, height: Math.round(size * 1.05) }} resizeMode="contain" accessibilityLabel="Noir" />
      {showWordmark && (
        <View style={styles.words}>
          <Text style={styles.brand}>NOIR</Text>
          <Text style={styles.tagline}>TAP INTO TRUST</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  words: { alignItems: 'center', marginTop: Spacing.lg },
  brand: { fontFamily: Fonts.display, fontSize: 40, color: Colors.cream, letterSpacing: 10, paddingLeft: 10 },
  tagline: { fontFamily: Fonts.displayMd, fontSize: FontSize.xs, color: Colors.gold, letterSpacing: 6, paddingLeft: 6, marginTop: 14 },
})
