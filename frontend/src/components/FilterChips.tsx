import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
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
          <PressableScale
            key={opt.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(opt.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{opt.label}</Text>
          </PressableScale>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
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
