import { View, Text } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
}

/** Titled section divider with an optional trailing text action. */
export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-sm text-mutedWhite font-medium uppercase" style={{ letterSpacing: 1 }}>{title}</Text>
      {actionLabel && (
        <PressableScale
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text className="text-sm text-gold font-semibold">{actionLabel}</Text>
        </PressableScale>
      )}
    </View>
  )
}

export default SectionHeader
