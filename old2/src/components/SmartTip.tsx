import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface SmartTipProps {
  title: string
  description: string
  icon?: keyof typeof Ionicons.glyphMap
  action?: { label: string; onPress: () => void }
  dismissible?: boolean
  variant?: 'tip' | 'warning' | 'success'
}

const VARIANT_STYLES = {
  tip: {
    icon: 'bulb-outline' as const,
    bg: Colors.gold + '10',
    border: Colors.gold + '25',
    iconColor: Colors.gold,
  },
  warning: {
    icon: 'warning-outline' as const,
    bg: Colors.warning + '10',
    border: Colors.warning + '25',
    iconColor: Colors.warning,
  },
  success: {
    icon: 'checkmark-circle-outline' as const,
    bg: Colors.success + '10',
    border: Colors.success + '25',
    iconColor: Colors.success,
  },
}

export function SmartTip({
  title,
  description,
  icon,
  action,
  dismissible = true,
  variant = 'tip',
}: SmartTipProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const v = VARIANT_STYLES[variant]

  return (
    <View style={[styles.card, { backgroundColor: v.bg, borderColor: v.border }]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: v.iconColor + '15' }]}>
          <Ionicons name={icon || v.icon} size={20} color={v.iconColor} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {dismissible && (
          <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color={Colors.mutedWhite} />
          </TouchableOpacity>
        )}
      </View>
      {action && (
        <TouchableOpacity style={styles.actionBtn} onPress={action.onPress} activeOpacity={0.7}>
          <Text style={[styles.actionLabel, { color: v.iconColor }]}>{action.label}</Text>
          <Ionicons name="chevron-forward" size={14} color={v.iconColor} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
    marginBottom: 2,
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    lineHeight: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
})
