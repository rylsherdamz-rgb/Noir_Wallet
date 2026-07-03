import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface HeaderAction {
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  accessibilityLabel: string
}

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  /** Monospace secondary line (e.g. truncated Stellar address). */
  mono?: string
  actions?: HeaderAction[]
}

/** Standard screen header: cream title, optional subtitle/mono line, icon actions. */
export function ScreenHeader({ title, subtitle, mono, actions }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {mono && <Text style={styles.mono}>{mono}</Text>}
      </View>
      {actions && actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((a) => (
            <TouchableOpacity
              key={a.accessibilityLabel}
              style={styles.iconBtn}
              onPress={a.onPress}
              accessibilityRole="button"
              accessibilityLabel={a.accessibilityLabel}
            >
              <Ionicons name={a.icon} size={20} color={Colors.silver} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.cream,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginTop: 2,
  },
  mono: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.midGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default ScreenHeader
