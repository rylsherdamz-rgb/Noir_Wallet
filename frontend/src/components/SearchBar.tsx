import { View, TextInput } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  onClear?: () => void
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-[#2C2C2C] rounded-xl px-4 h-11 gap-2 border border-borderGrey">
      <Ionicons name="search-outline" size={18} color="#A9A9A9" />
      <TextInput
        className="flex-1 text-base text-white h-full p-0"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A9A9A9"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <PressableScale onPress={() => { onChangeText(''); onClear?.() }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={18} color="#A9A9A9" />
        </PressableScale>
      )}
    </View>
  )
}
