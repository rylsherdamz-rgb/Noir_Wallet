import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { TxFilter } from '@/types'

interface FilterChip {
  key: TxFilter
  label: string
}

interface FilterChipsProps {
  options: FilterChip[]
  selected: string
  onSelect: (key: TxFilter) => void
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((opt) => {
        const isActive = selected === opt.key
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  chipActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
  },
  labelActive: {
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
})
