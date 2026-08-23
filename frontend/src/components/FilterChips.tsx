import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, FontScaleCap } from '@/constants/theme'
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
            // Selection is conveyed only by colour otherwise, which a screen
            // reader cannot see.
            accessibilityRole="tab"
            accessibilityLabel={`${opt.label} filter`}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              maxFontSizeMultiplier={FontScaleCap.row}
            >
              {opt.label}
            </Text>
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
    backgroundColor: colorWithOpacity(Colors.gold, 0.12),
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
