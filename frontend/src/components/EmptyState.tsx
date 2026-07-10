import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

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
    <View style={styles.container} testID={testID} accessibilityRole="status">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={DesignTokens.iconSize.xxl} color={Colors.gold} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.gold} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: colorWithOpacity(Colors.gold, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: colorWithOpacity(Colors.gold, 0.2),
  },
  title: {
    fontSize: FontSize.lg,
    color: Colors.offWhite,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  desc: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    lineHeight: FontSize.sm * DesignTokens.typography.lineHeight.normal,
    maxWidth: 280,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: colorWithOpacity(Colors.gold, 0.1),
    marginTop: Spacing.lg,
    minHeight: DesignTokens.touchTarget.minimum,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
})

export default EmptyState
