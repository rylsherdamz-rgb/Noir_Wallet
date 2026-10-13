import { ReactNode } from 'react'
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors, Spacing, FontSize, FontWeight, Fonts, Gradient } from '@/constants/theme'

/**
 * Flat list primitives (wallet-app convention, DESIGN.md → Patterns):
 * rows separated by hairlines, no card boxes, icons inline, status as text.
 */

/** Large left-aligned title for tab roots (Agents, Browse, Settings). */
export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.pageTitle}>
      <View style={styles.flex}>
        <Text style={styles.pageTitleText} accessibilityRole="header">{title}</Text>
        {!!subtitle && <Text style={styles.pageSub}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  )
}

/** Small muted section label, sentence case. */
export function SectionLabel({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionText} accessibilityRole="header">{title}</Text>
      {right}
    </View>
  )
}

interface ListRowProps {
  icon?: keyof typeof Ionicons.glyphMap
  iconNode?: ReactNode
  iconColor?: string
  title: string
  titleColor?: string
  subtitle?: string
  subtitleMono?: boolean
  subtitleColor?: string
  /** Right-hand text value (muted by default). */
  value?: string
  valueColor?: string
  /** Custom right-hand node (switch, chip, amount stack). */
  right?: ReactNode
  chevron?: boolean
  last?: boolean
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

export function ListRow({
  icon, iconNode, iconColor = Colors.silver, title, titleColor = Colors.white, subtitle, subtitleMono, subtitleColor,
  value, valueColor = Colors.mutedWhite, right, chevron, last, onPress, onLongPress, disabled, accessibilityLabel, style,
}: ListRowProps) {
  return (
    <PressableScale
      style={[styles.row, !last && styles.divider, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled || (!onPress && !onLongPress)}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
    >
      {(icon || iconNode) && (
        <View style={styles.icon}>{iconNode ?? <Ionicons name={icon!} size={22} color={iconColor} />}</View>
      )}
      <View style={styles.body}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>{title}</Text>
        {!!subtitle && (
          <Text style={[styles.sub, subtitleMono && styles.mono, subtitleColor ? { color: subtitleColor } : null]} numberOfLines={1}>{subtitle}</Text>
        )}
      </View>
      {!!value && <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>{value}</Text>}
      {right}
      {chevron && <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />}
    </PressableScale>
  )
}

/** Label / value line for details, reviews and receipts. */
export function KeyValueRow({ label, value, mono, valueStyle, last, right }: {
  label: string; value?: string; mono?: boolean; valueStyle?: StyleProp<TextStyle>; last?: boolean; right?: ReactNode
}) {
  return (
    <View style={[styles.kv, !last && styles.divider]}>
      <Text style={styles.kvLabel}>{label}</Text>
      {right ?? (
        <Text style={[styles.kvValue, mono && styles.kvMono, valueStyle]} numberOfLines={1} ellipsizeMode="middle">{value}</Text>
      )}
    </View>
  )
}

/** Quiet text action (secondary buttons, "See all", destructive links). */
export function TextAction({ label, onPress, color = Colors.gold, icon, disabled, center = true }: {
  label: string; onPress: () => void; color?: string; icon?: keyof typeof Ionicons.glyphMap; disabled?: boolean; center?: boolean
}) {
  return (
    <PressableScale style={[styles.textAction, center && styles.center, disabled && styles.dim]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}>
      {icon && <Ionicons name={icon} size={18} color={color} />}
      <Text style={[styles.textActionText, { color }]}>{label}</Text>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pageTitle: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.md },
  pageTitleText: { fontFamily: Fonts.display, fontSize: 28, color: Colors.cream },
  pageSub: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: 4 },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: Spacing.lg, paddingBottom: 6 },
  sectionText: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, fontWeight: FontWeight.medium },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingVertical: Spacing.sm },
  divider: { borderBottomWidth: 1, borderBottomColor: Gradient.panel },
  icon: { width: 28, alignItems: 'center' },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: FontSize.md - 1, fontWeight: FontWeight.medium },
  sub: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, marginTop: 2 },
  mono: { fontFamily: Fonts.mono, fontSize: FontSize.xs },
  value: { fontSize: FontSize.sm, maxWidth: '45%' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md, minHeight: 52 },
  kvLabel: { fontSize: FontSize.md - 1, color: Colors.mutedWhite },
  kvValue: { flexShrink: 1, fontSize: FontSize.md - 1, color: Colors.white, fontWeight: FontWeight.medium, textAlign: 'right' },
  kvMono: { fontFamily: Fonts.mono, fontSize: FontSize.sm - 1, fontWeight: FontWeight.regular },
  textAction: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48 },
  center: { justifyContent: 'center' },
  dim: { opacity: 0.45 },
  textActionText: { fontFamily: Fonts.displayMd, fontSize: FontSize.md - 1 },
})
