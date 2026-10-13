import { View, Text, StyleSheet } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { NumericKeypad } from '@/components/NumericKeypad'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { formatAmount } from '@/lib/txFormat'
import { Button } from '@/components/Button'

interface AmountEntryProps {
  value: string
  onChangeValue: (v: string) => void
  assetCode?: string
  /** Small line under the amount, e.g. "Available 120.00 XLM". */
  caption?: string
  /** Replaces the caption in red when the amount can't be used. */
  error?: string | null
  quickAmounts?: number[]
  ctaLabel: string
  onSubmit: () => void
  ctaDisabled?: boolean
}

/** Big-number amount entry with quick picks and the on-screen keypad. */
export function AmountEntry({
  value,
  onChangeValue,
  assetCode = 'XLM',
  caption,
  error,
  quickAmounts = [],
  ctaLabel,
  onSubmit,
  ctaDisabled,
}: AmountEntryProps) {
  const display = value === '' ? '0' : value
  return (
    <View style={styles.container}>
      <View style={styles.amountBlock}>
        <View style={styles.amountRow}>
          <Text style={[styles.amount, value === '' && styles.amountEmpty]} numberOfLines={1} adjustsFontSizeToFit>
            {display}
          </Text>
          <Text style={styles.asset}>{assetCode}</Text>
        </View>
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
        ) : caption ? (
          <Text style={styles.caption}>{caption}</Text>
        ) : null}
      </View>

      {quickAmounts.length > 0 && (
        <View style={styles.chips}>
          {quickAmounts.map((a) => {
            const active = value === String(a)
            return (
              <PressableScale
                key={a}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onChangeValue(String(a))}
                accessibilityRole="button"
                accessibilityLabel={`${a} ${assetCode}`}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{formatAmount(a * 100).replace(/\.00$/, '')}</Text>
              </PressableScale>
            )
          })}
        </View>
      )}

      <NumericKeypad value={value} onChangeValue={onChangeValue} allowDecimal maxDigits={7} />

      <View style={styles.footer}>
        <Button label={ctaLabel} onPress={onSubmit} disabled={ctaDisabled} fullWidth />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end', paddingBottom: Spacing.md },
  amountBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, maxWidth: '100%' },
  amount: { fontFamily: Fonts.display, fontSize: 52, color: Colors.white, letterSpacing: -0.5, fontVariant: ['tabular-nums'], flexShrink: 1 },
  amountEmpty: { color: Colors.mutedWhite },
  asset: { fontFamily: Fonts.displayMd, fontSize: FontSize.lg - 2, color: Colors.mutedWhite },
  caption: { marginTop: Spacing.sm, fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center' },
  error: { marginTop: Spacing.sm, fontSize: FontSize.sm, color: Colors.danger, textAlign: 'center' },
  chips: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 999, backgroundColor: Colors.midGrey, minWidth: 56, alignItems: 'center' },
  chipActive: { backgroundColor: Colors.cream },
  chipLabel: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  chipLabelActive: { color: Colors.surfaceBg },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.sm },
})
