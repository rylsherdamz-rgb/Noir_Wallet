import { View, Text, Image, StyleProp, ViewStyle } from 'react-native'
import { Colors, Spacing } from '@/constants/theme'

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
      <View className="items-center justify-center" style={style}>
        <Wordmark color={color} showTagline={showTagline} />
      </View>
    )
  }

  if (variant === 'mark') {
    return (
      <View className="items-center justify-center" style={style}>
        <Image
          source={LOGO_MARK}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    )
  }

  return (
    <View className="items-center justify-center" style={style}>
      <Image
        source={LOGO_FULL}
        style={{ width: size * 2.5, height: size * 1.2 }}
        resizeMode="contain"
      />
      {showTagline && (
        <Text className="text-xs font-medium uppercase tracking-[4]" style={{ color, marginTop: Spacing.sm }}>
          TAP INTO TRUST
        </Text>
      )}
    </View>
  )
}

function Wordmark({ color, showTagline }: { color: string; showTagline: boolean }) {
  return (
    <View className="items-center justify-center">
      <Image
        source={LOGO_FULL}
        style={{ width: 160, height: 48 }}
        resizeMode="contain"
      />
      {showTagline && (
        <Text className="text-xs font-medium uppercase tracking-[4]" style={{ color }}>TAP INTO TRUST</Text>
      )}
    </View>
  )
}

export default NoirLogo
