import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors } from '@/constants/theme'

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  testID?: string
}

/** Neutral placeholder for empty lists/data surfaces. */
export function EmptyState({
  icon = 'ellipse-outline',
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-12 px-6" testID={testID} accessibilityLiveRegion="polite">
      <View className="w-24 h-24 rounded-full items-center justify-center mb-6 border-2" style={{ backgroundColor: colorWithOpacity(Colors.gold, 0.1), borderColor: colorWithOpacity(Colors.gold, 0.2) }}>
        <Ionicons name={icon} size={DesignTokens.iconSize.xxl} color={Colors.gold} />
      </View>
      <Text className="text-xl text-[#F5F5F5] font-semibold text-center mb-1">{title}</Text>
      {description ? (
        <Text className="text-sm text-mutedWhite text-center max-w-[280]" style={{ lineHeight: DesignTokens.typography.size.sm * DesignTokens.typography.lineHeight.normal }}>{description}</Text>
      ) : null}
      {actionLabel && onAction && (
        <PressableScale
          className="flex-row items-center gap-2 py-4 px-6 rounded-full border border-gold mt-6 min-h-[44]"
          style={{ backgroundColor: colorWithOpacity(Colors.gold, 0.1) }}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text className="text-sm text-gold font-semibold">{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.gold} />
        </PressableScale>
      )}
    </View>
  )
}

export default EmptyState
