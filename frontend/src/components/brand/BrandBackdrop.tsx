import { StyleSheet, View } from 'react-native'
import { Colors } from '@/constants/theme'

/**
 * Full-screen backdrop for brand screens (splash, onboarding, lock): the plain
 * app background. Kept as a component so every brand screen stays identical.
 */
export function BrandBackdrop() {
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surfaceBg }]} />
}
