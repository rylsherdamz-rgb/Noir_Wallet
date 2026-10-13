import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors, FontSize, FontWeight, Gradient } from '@/constants/theme'

/** Pill segmented control — Receive / Send / Tap to Pay mode pickers. */
export function Segmented<T extends string>({ value, options, onChange, style }: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View style={[styles.segment, style]} accessibilityRole="tablist">
      {options.map((o) => (
        <PressableScale
          key={o.value}
          style={[styles.item, value === o.value && styles.itemOn]}
          onPress={() => onChange(o.value)}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === o.value }}
        >
          <Text style={[styles.text, value === o.value && styles.textOn]}>{o.label}</Text>
        </PressableScale>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: Colors.midGrey },
  item: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  itemOn: { backgroundColor: Gradient.elevated },
  text: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontWeight: FontWeight.medium },
  textOn: { color: Colors.white },
})
