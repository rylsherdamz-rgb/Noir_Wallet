import { ReactNode, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/Button'
import { TextAction } from '@/components/ui/List'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme'

export type ErrorTone = 'danger' | 'warning' | 'neutral' | 'brand' | 'success'
const TONE: Record<ErrorTone, string> = {
  danger: Colors.danger, warning: Colors.warning, neutral: Colors.mutedWhite, brand: Colors.gold, success: Colors.success,
}

interface Action { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; loading?: boolean; disabled?: boolean }

interface ErrorStateProps {
  icon: keyof typeof Ionicons.glyphMap
  tone?: ErrorTone
  title: string
  message: string
  /** Optional block under the message (network tag, address, amounts). */
  children?: ReactNode
  primary?: Action
  secondary?: Action & { color?: string }
  /** Raw error text, shown behind a "Technical details" toggle. */
  details?: string
}

/**
 * One pattern for every error / blocked state (DESIGN.md → Errors):
 * inline icon · title · one sentence saying what happened and what to do ·
 * one primary action · an optional quiet secondary · technical details.
 */
export function ErrorState({ icon, tone = 'danger', title, message, children, primary, secondary, details }: ErrorStateProps) {
  const [open, setOpen] = useState(false)
  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false} bounces={false}>
        <Ionicons name={icon} size={52} color={TONE[tone]} />
        <Text style={styles.title} accessibilityRole="header">{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {children}
        {!!details && (
          <>
            <PressableScale style={styles.detailsToggle} onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityLabel={open ? 'Hide technical details' : 'Show technical details'}>
              <Text style={styles.detailsLink}>{open ? 'Hide details' : 'Technical details'}</Text>
            </PressableScale>
            {open && <Text style={styles.raw} selectable>{details}</Text>}
          </>
        )}
      </ScrollView>
      {(primary || secondary) && (
        <View style={styles.footer}>
          {primary && <Button label={primary.label} icon={primary.icon} onPress={primary.onPress} loading={primary.loading} disabled={primary.disabled} fullWidth />}
          {secondary && <TextAction label={secondary.label} onPress={secondary.onPress} color={secondary.color ?? Colors.mutedWhite} disabled={secondary.disabled} />}
        </View>
      )}
    </View>
  )
}

/** Small network chip used inside error states ("Testnet" / "Mainnet"). */
export function NetworkTag({ network }: { network: 'testnet' | 'mainnet' }) {
  return (
    <View style={styles.tag}>
      <View style={[styles.tagDot, { backgroundColor: network === 'mainnet' ? Colors.mainnet : Colors.testnet }]} />
      <Text style={styles.tagText}>{network === 'mainnet' ? 'Mainnet' : 'Testnet'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 10 },
  title: { fontFamily: Fonts.display, fontSize: 22, color: Colors.cream, textAlign: 'center', marginTop: 10 },
  message: { fontSize: FontSize.md - 1, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 22, maxWidth: 310 },
  detailsToggle: { minHeight: 44, justifyContent: 'center', marginTop: 4 },
  detailsLink: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, textDecorationLine: 'underline' },
  raw: { alignSelf: 'stretch', fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.mutedWhite, backgroundColor: Colors.midGrey, borderRadius: 8, padding: Spacing.sm },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.lg, gap: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: Colors.midGrey, marginTop: 4 },
  tagDot: { width: 7, height: 7, borderRadius: 4 },
  tagText: { fontSize: FontSize.xs, color: Colors.silver },
})
