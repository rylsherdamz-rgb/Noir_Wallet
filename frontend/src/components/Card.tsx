import { View, StyleProp, ViewStyle } from 'react-native'
import { Colors } from '@/constants/theme'

interface CardProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  /** When true, adds a subtle gold border to highlight an active surface. */
  active?: boolean
}

/** Flat premium surface: cardBg + 1px hairline border, radius lg. */
export function Card({ children, style, active }: CardProps) {
  return (
    <View
      className="bg-cardBg rounded-2xl p-6 border border-borderGrey"
      style={[active && { borderColor: Colors.gold }, style]}
    >
      {children}
    </View>
  )
}

export default Card
