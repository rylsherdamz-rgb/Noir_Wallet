import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'

const short = (s: string, head = 4, tail = 4) =>
  s && s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s

const formatDate = (unixSeconds: number | null) => {
  if (!unixSeconds) return 'Unknown'
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

type Props =
  | {
      kind: 'other'
      owner: string
      yourWallet?: string
      createdAt: number | null
      deviceHash: string
    }
  | {
      kind: 'mine'
      agent: string
      active: boolean
      createdAt: number | null
      deviceHash: string
      label?: string
    }

/**
 * Explains why a scanned tag can't be (re-)registered: it's either already
 * linked to this wallet, or bound to a different wallet on-chain.
 */
export function TagOwnershipNotice(props: Props) {
  const isOther = props.kind === 'other'
  const tone = isOther ? Colors.warning : Colors.success

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colorWithOpacity(tone, 0.1), borderColor: colorWithOpacity(tone, 0.25) },
        ]}
      >
        <Ionicons name={isOther ? 'lock-closed' : 'checkmark-done'} size={32} color={tone} />
      </View>

      <Text style={styles.eyebrow}>{isOther ? 'Tag unavailable' : 'Nothing to sign'}</Text>
      <Text style={styles.title} accessibilityRole="header">
        {isOther ? 'Linked to another wallet' : 'Already linked to you'}
      </Text>
      <Text style={styles.body}>
        {isOther
          ? 'This tag is registered to a different Noir wallet on Stellar. Only that wallet can unlink it.'
          : `${props.kind === 'mine' && props.label ? props.label : 'This tag'} is already registered to your wallet. No new transaction is needed.`}
      </Text>

      <View style={styles.card}>
        {isOther ? (
          <>
            <Row label="Owner" value={short(props.owner, 6, 4)} tone={Colors.warning} mono />
            {props.yourWallet ? <Row label="Your wallet" value={short(props.yourWallet, 6, 4)} mono /> : null}
          </>
        ) : (
          <>
            <Row
              label="Status"
              value={props.active ? 'Active' : 'Inactive'}
              tone={props.active ? Colors.success : Colors.warning}
            />
            <Row label="Agent" value={short(props.agent, 6, 4)} mono />
          </>
        )}
        <Row label="Linked" value={formatDate(props.createdAt)} />
        <Row label="Tag ID" value={short(props.deviceHash, 6, 6)} mono last />
      </View>

      {isOther && (
        <View style={styles.howTo}>
          <Text style={styles.howToTitle}>To use this tag here</Text>
          <Step n={1} text="Open Noir with the wallet that linked it" />
          <Step n={2} text="Unlink the tag from its card settings" />
          <Step n={3} text="Come back and scan it again" />
        </View>
      )}
    </View>
  )
}

function Row({
  label,
  value,
  tone,
  mono,
  last,
}: {
  label: string
  value: string
  tone?: string
  mono?: boolean
  last?: boolean
}) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono, tone ? { color: tone } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', alignSelf: 'stretch' },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: FontWeight.semibold,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  card: {
    alignSelf: 'stretch',
    marginTop: Spacing.lg,
    backgroundColor: Colors.lightGrey,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderGrey },
  rowLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite },
  rowValue: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium, maxWidth: '62%' },
  mono: { fontFamily: 'monospace', letterSpacing: 0.3 },
  howTo: { alignSelf: 'stretch', marginTop: Spacing.lg, gap: Spacing.sm },
  howToTitle: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colorWithOpacity(Colors.gold, 0.4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: FontSize.xs, color: Colors.gold, fontWeight: FontWeight.bold },
  stepText: { fontSize: FontSize.sm, color: Colors.offWhite, flex: 1 },
})
