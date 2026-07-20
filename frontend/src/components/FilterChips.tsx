import { View, Text, ScrollView } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { TxFilter } from '@/types'

interface FilterChip {
  key: TxFilter
  label: string
}

interface FilterChipsProps {
  options: FilterChip[]
  selected: TxFilter
  onSelect: (key: TxFilter) => void
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row gap-2 py-2"
    >
      {options.map((opt) => {
        const isActive = selected === opt.key
        return (
          <PressableScale
            key={opt.key}
            className={`px-4 py-1.5 rounded-full bg-[#2C2C2C] border border-borderGrey ${isActive ? 'border-gold' : ''}`}
            style={isActive ? { backgroundColor: '#C6A15B20' } : undefined}
            onPress={() => onSelect(opt.key)}
          >
            <Text
              className={`text-sm ${isActive ? 'text-gold font-semibold' : 'text-mutedWhite font-medium'}`}
            >
              {opt.label}
            </Text>
          </PressableScale>
        )
      })}
    </ScrollView>
  )
}
