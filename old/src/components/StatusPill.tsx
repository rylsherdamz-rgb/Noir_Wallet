import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

export type TxStatus = 'pending' | 'confirmed' | 'failed'

interface StatusPillProps {
  status: TxStatus
}

const CONFIG: Record<
  TxStatus,
  { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  pending: { color: Colors.warning, icon: 'time-outline', label: 'Pending' },
  confirmed: { color: Colors.success, icon: 'checkmark-circle', label: 'Confirmed' },
  failed: { color: Colors.danger, icon: 'close-circle', label: 'Failed' },
}

/**
 * Maps a transaction status to a warning/success/danger pill.
 * Status is conveyed by icon + text (not color alone) for accessibility.
 */
export function StatusPill({ status }: StatusPillProps) {
  const { color, icon, label } = CONFIG[status]
  return (
    <View
      style={[styles.pill, { backgroundColor: color + '20', borderColor: color + '55' }]}
      accessibilityLabel={`Status: ${label}`}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
})

export default StatusPill
