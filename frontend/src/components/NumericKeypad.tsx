import { View, Text, Platform, Dimensions } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing } from '@/constants/theme'

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
    <View className="px-6 pb-2">
      {keys.map((row, rowIdx) => (
        <View
          key={rowIdx}
          className="flex-row justify-center"
          style={{ gap: KEY_GAP, marginBottom: KEY_GAP }}
        >
          {row.map((key) => {
            if (key === 'clear') {
              return (
                <PressableScale
                  key={key}
                  className="items-center justify-center bg-midGrey"
                  style={{
                    width: KEY_SIZE,
                    height: KEY_SIZE,
                    borderRadius: KEY_SIZE / 2,
                    ...DesignTokens.shadows.card,
                  }}
                  onPress={() => handlePress(key)}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all"
                >
                  <Text className="text-sm text-mutedWhite font-medium">Clear</Text>
                </PressableScale>
              )
            }
            if (key === 'backspace') {
              return (
                <PressableScale
                  key={key}
                  className="items-center justify-center"
                  style={{
                    width: KEY_SIZE,
                    height: KEY_SIZE,
                    borderRadius: KEY_SIZE / 2,
                    backgroundColor: Colors.lightGrey,
                    ...DesignTokens.shadows.card,
                  }}
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
                className="items-center justify-center"
                style={{
                  width: KEY_SIZE,
                  height: KEY_SIZE,
                  borderRadius: KEY_SIZE / 2,
                  backgroundColor: Colors.lightGrey,
                  ...DesignTokens.shadows.card,
                }}
                onPress={() => handlePress(key)}
                accessibilityRole="button"
                accessibilityLabel={`Digit ${key}`}
              >
                <Text className="font-semibold text-white" style={{ fontSize: Math.min(32, KEY_SIZE * 0.45) }}>
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
