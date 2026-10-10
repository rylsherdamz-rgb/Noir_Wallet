import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, FontScaleCap, Fonts } from '@/constants/theme'
import { applyKeypadKey, type KeypadKey } from '@/lib/keypadInput'

const SCREEN_WIDTH = Dimensions.get('window').width

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
  /**
   * Amount entry: the bottom-left key becomes a decimal point, and input
   * follows `applyKeypadKey` (one point, max 7 decimals, no leading zeros).
   * Off by default so PIN pads keep accepting a leading 0.
   */
  allowDecimal?: boolean
}

const digitRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
]

export function NumericKeypad({
  value,
  onChangeValue,
  maxDigits = 8,
  hapticFeedback = true,
  disabled = false,
  allowDecimal = false,
}: NumericKeypadProps) {
  const keys = [...digitRows, [allowDecimal ? '.' : 'clear', '0', 'backspace']]
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

    if (allowDecimal) {
      onChangeValue(applyKeypadKey(value, key as KeypadKey, { maxDigits }))
      return
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
            if (key === '.') {
              return (
                <PressableScale
                  key={key}
                  style={styles.key}
                  onPress={() => handlePress(key)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel="Decimal point"
                  accessibilityState={{ disabled }}
                >
                  <Text style={styles.keyText} maxFontSizeMultiplier={FontScaleCap.keypad}>.</Text>
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
                  <Ionicons name="backspace-outline" size={24} color={Colors.white} />
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  containerDisabled: {
    opacity: 0.45,
  },
  // Flat keys (wallet-app convention): no discs, just a generous hit area.
  row: {
    flexDirection: 'row',
  },
  key: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontFamily: Fonts.displayMd,
    fontSize: 26,
    color: Colors.white,
  },
  specialKey: {},
  specialKeyText: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
  },
})
