import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'

export type TxStatus = 'pending' | 'confirmed' | 'failed'

interface StatusPillProps {
  status: TxStatus | string
}

const CONFIG: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  pending: { color: Colors.warning, icon: 'time-outline', label: 'Pending' },
  confirmed: { color: Colors.success, icon: 'checkmark-circle', label: 'Confirmed' },
  failed: { color: Colors.danger, icon: 'close-circle', label: 'Failed' },
  active: { color: Colors.success, icon: 'checkmark-circle', label: 'Active' },
  inactive: { color: Colors.mutedWhite, icon: 'close-circle', label: 'Inactive' },
  frozen: { color: Colors.warning, icon: 'snow-outline', label: 'Frozen' },
  lost: { color: Colors.danger, icon: 'alert-circle-outline', label: 'Lost' },
  deactivated: { color: Colors.mutedWhite, icon: 'close-circle', label: 'Deactivated' },
  expired: { color: Colors.mutedWhite, icon: 'time-outline', label: 'Expired' },
  reversed: { color: Colors.mutedWhite, icon: 'return-down-back-outline', label: 'Reversed' },
}

const FALLBACK_CONFIG: { color: string; icon: keyof typeof Ionicons.glyphMap; label: string } = {
  color: Colors.mutedWhite,
  icon: 'help-circle-outline',
  label: 'Unknown',
}

/**
 * Maps a transaction status to a warning/success/danger pill.
 * Status is conveyed by icon + text (not color alone) for accessibility.
 */
export function StatusPill({ status }: StatusPillProps) {
  const { color, icon, label } = CONFIG[status as string] ?? FALLBACK_CONFIG
  return (
    <View
      className="flex-row items-center gap-1 px-2 py-1 rounded-full border self-start"
      style={{ backgroundColor: color + '20', borderColor: color + '55' }}
      accessibilityLabel={`Status: ${label}`}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text className="text-xs font-semibold" style={{ color }}>{label}</Text>
    </View>
  )
}
