import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface NumericKeypadProps {
  value: string
  onChangeValue: (val: string) => void
  maxDigits?: number
}

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'backspace'],
]

export function NumericKeypad({ value, onChangeValue, maxDigits = 8 }: NumericKeypadProps) {
  const handlePress = (key: string) => {
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
                  style={styles.key}
                  onPress={() => handlePress(key)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keyText}>C</Text>
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
    marginBottom: Spacing.sm,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: FontSize.xxl,
    color: Colors.white,
    fontWeight: FontWeight.medium,
  },
})
