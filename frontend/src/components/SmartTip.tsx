import { useState } from 'react'
import { View, Text } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'

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
    <View className="rounded-xl border p-4" style={{ backgroundColor: v.bg, borderColor: v.border }}>
      <View className="flex-row gap-2 items-start">
        <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: v.iconColor + '15' }}>
          <Ionicons name={icon || v.icon} size={20} color={v.iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-white mb-0.5">{title}</Text>
          <Text className="text-xs text-mutedWhite leading-4">{description}</Text>
        </View>
        {dismissible && (
          <PressableScale onPress={() => setDismissed(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color={Colors.mutedWhite} />
          </PressableScale>
        )}
      </View>
      {action && (
        <PressableScale className="flex-row items-center justify-center gap-1 mt-2 pt-2 border-t border-t-[rgba(255,255,255,0.06)]" onPress={action.onPress}>
          <Text className="text-sm font-semibold" style={{ color: v.iconColor }}>{action.label}</Text>
          <Ionicons name="chevron-forward" size={14} color={v.iconColor} />
        </PressableScale>
      )}
    </View>
  )
}
