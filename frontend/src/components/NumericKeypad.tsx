import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

const SCREEN_WIDTH = Dimensions.get('window').width
const KEY_SIZE = Math.min(Math.floor((SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 4) / 3), 80)
const KEY_GAP = Math.max(Spacing.sm, (SCREEN_WIDTH - Spacing.lg * 2 - KEY_SIZE * 3) / 4)

interface NumericKeypadProps {
  value: string
  onChangeValue: (val: string) => void
  maxDigits?: number
  hapticFeedback?: boolean
}

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'backspace'],
]

export function NumericKeypad({
  value,
  onChangeValue,
  maxDigits = 8,
  hapticFeedback = true,
}: NumericKeypadProps) {
  const handlePress = (key: string) => {
    // Haptic feedback
    if (hapticFeedback && Platform.OS !== 'web') {
      if (key === 'clear' || key === 'backspace') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }
    }

    if (key === 'clear') {
      onChangeValue('')
      return
    }
    if (key === 'backspace') {
      onChangeValue(value.slice(0, -1))
      return
    }
    if (value.length >= maxDigits) return
    onChangeValue(value + key)
  }

  return (
    <View style={styles.container}>
      {keys.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((key) => {
            if (key === 'clear') {
              return (
                <PressableScale
                  key={key}
                  style={[styles.key, styles.specialKey]}
                  onPress={() => handlePress(key)}

                  accessibilityRole="button"
                  accessibilityLabel="Clear all"
                >
                  <Text style={styles.specialKeyText}>Clear</Text>
                </PressableScale>
              )
            }
            if (key === 'backspace') {
              return (
                <PressableScale
                  key={key}
                  style={styles.key}
                  onPress={() => handlePress(key)}

                  accessibilityRole="button"
                  accessibilityLabel="Delete last digit"
                >
                  <Ionicons name="backspace-outline" size={28} color={Colors.white} />
                </PressableScale>
              )
            }
            return (
              <PressableScale
                key={key}
                style={styles.key}
                onPress={() => handlePress(key)}

                accessibilityRole="button"
                accessibilityLabel={`Digit ${key}`}
              >
                <Text style={styles.keyText}>{key}</Text>
              </PressableScale>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: KEY_GAP,
    marginBottom: KEY_GAP,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignTokens.shadows.card,
  },
  keyText: {
    fontSize: Math.min(FontSize.xxl, KEY_SIZE * 0.45),
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  specialKey: {
    backgroundColor: Colors.midGrey,
  },
  specialKeyText: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
  },
})
