import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'

interface CardProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  /** When true, adds a subtle gold border to highlight an active surface. */
  active?: boolean
}

/** Flat premium surface: cardBg + 1px hairline border, radius lg. */
export function Card({ children, style, active }: CardProps) {
  return (
    <View style={[styles.card, active && styles.active, style]}>{children}</View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  active: {
    borderColor: Colors.gold,
  },
})

export default Card
