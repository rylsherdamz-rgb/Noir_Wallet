import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, FontScaleCap } from '@/constants/theme'

const SCREEN_WIDTH = Dimensions.get('window').width
const KEY_SIZE = Math.min(Math.floor((SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 4) / 3), 80)
const KEY_GAP = Math.max(Spacing.sm, (SCREEN_WIDTH - Spacing.lg * 2 - KEY_SIZE * 3) / 4)

interface NumericKeypadProps {
  value: string
  onChangeValue: (val: string) => void
  maxDigits?: number
  hapticFeedback?: boolean
  /**
   * Dims the keypad and ignores presses. The caller (e.g. lock.tsx while a
   * PIN hash is running) already ignores input during this window, but with
   * no visual change the keys look fully live — tapping them does nothing,
   * which reads as the screen having frozen. Dimming makes the "busy, please
   * wait" state visible instead of silent.
   */
  disabled?: boolean
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
  disabled = false,
}: NumericKeypadProps) {
  const handlePress = (key: string) => {
    if (disabled) return

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
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {keys.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((key) => {
            if (key === 'clear') {
              return (
                <PressableScale
                  key={key}
                  style={[styles.key, styles.specialKey]}
                  onPress={() => handlePress(key)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all"
                  accessibilityState={{ disabled }}
                >
                  <Text style={styles.specialKeyText} maxFontSizeMultiplier={FontScaleCap.keypad}>
                    Clear
                  </Text>
                </PressableScale>
              )
            }
            if (key === 'backspace') {
              return (
                <PressableScale
                  key={key}
                  style={styles.key}
                  onPress={() => handlePress(key)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel="Delete last digit"
                  accessibilityState={{ disabled }}
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
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Digit ${key}`}
                accessibilityState={{ disabled }}
              >
                <Text style={styles.keyText} maxFontSizeMultiplier={FontScaleCap.keypad}>
                  {key}
                </Text>
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
  containerDisabled: {
    opacity: 0.45,
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
