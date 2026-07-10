import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

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
                <TouchableOpacity
                  key={key}
                  style={[styles.key, styles.specialKey]}
                  onPress={() => handlePress(key)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all"
                >
                  <Text style={styles.specialKeyText}>Clear</Text>
                </TouchableOpacity>
              )
            }
            if (key === 'backspace') {
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handlePress(key)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel="Delete last digit"
                >
                  <Ionicons name="backspace-outline" size={28} color={Colors.white} />
                </TouchableOpacity>
              )
            }
            return (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => handlePress(key)}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={`Digit ${key}`}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
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
    paddingBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignTokens.shadows.card,
  },
  keyText: {
    fontSize: FontSize.xxl,
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
