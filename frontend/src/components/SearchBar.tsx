import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme'

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
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={Colors.mutedWhite} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.mutedWhite}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => { onChangeText(''); onClear?.() }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={18} color={Colors.mutedWhite} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGrey,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.white,
    height: '100%',
    padding: 0,
  },
})
