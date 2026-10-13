import { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect, useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated'
import { PressableScale } from '@/components/brand/PressableScale'
import { SignalRipple } from '@/components/brand/SignalRipple'
import { TapGlyph } from '@/components/brand/BrandGlyph'
import { StatusPill } from '@/components/StatusPill'
import { useAppStore } from '@/store/useAppStore'
import { x402 } from '@/domain/x402'
import type { Device } from '@/types'
import { formatAmount, shortAddress } from '@/lib/txFormat'
import { cardTotalCents } from '@/lib/cardBalances'
import { logger } from '@/lib/logger'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { PageTitle, SectionLabel, ListRow, TextAction } from '@/components/ui/List'
import { Button } from '@/components/Button'

const NOIR_MARK = require('../../assets/noir-mark.png')

interface AgentRow {
  device: Device
  agentPub?: string
  /** Agent wallet XLM, in cents (2-dp display units). null = not loaded. */
  agentCents: number | null
  /** Escrow tap balance, in cents. null = not loaded / unavailable. */
  tapCents: number | null
}

/** Agents tab: one row per linked card's payment agent. */
export function AgentListScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { devices, user } = useAppStore()
  const [rows, setRows] = useState<AgentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const linked = devices.filter((d) => !!d.agentPublicKey)
    // Show the cards immediately; balances fill in when the reads return.
    setRows((prev) => linked.map((d) => prev.find((r) => r.device.id === d.id) ?? { device: d, agentPub: d.agentPublicKey, agentCents: null, tapCents: null }))
    try {
      // Self-heal local agent metadata from the persisted device list.
      await x402.syncAgentsFromDevices(linked.map((d) => ({
        deviceUidHash: d.deviceUidHash, agentPublicKey: d.agentPublicKey, label: d.label, createdAt: d.createdAt,
      })))
    } catch { /* non-critical */ }

    const agents = await x402.listAgents().catch(() => [])
    const next = await Promise.all(linked.map(async (d): Promise<AgentRow> => {
      const agent = agents.find((a) => a.deviceHash === d.deviceUidHash) ?? agents.find((a) => a.publicKey === d.agentPublicKey)
      let tapCents: number | null = null
      if (user?.stellarPublicKey) {
        try {
          tapCents = Number((await x402.getEscrowBalance(d.deviceUidHash, user.stellarPublicKey)) / 100_000n)
        } catch (e: any) {
          logger.debug('agents: escrow read failed', e?.message)
        }
      }
      return {
        device: d,
        agentPub: agent?.publicKey ?? d.agentPublicKey,
        agentCents: agent ? Math.round(agent.balanceStroops / 100_000) : null,
        tapCents,
      }
    }))
    setRows(next)
    setLoading(false)
  }, [devices, user?.stellarPublicKey])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const totalCards = rows.reduce((s, r) => s + (cardTotalCents(r) ?? 0), 0)
  const linkDevice = () => router.push('/link-device')

  const statusLabel = (st: string) => st.charAt(0).toUpperCase() + st.slice(1)
  const statusColor = (st: string) => (st === 'active' ? Colors.success : st === 'frozen' ? Colors.warning : Colors.mutedWhite)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageTitle title="Agents" subtitle={rows.length > 0 ? 'Each card pays through its own agent' : undefined} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, rows.length === 0 && styles.contentEmpty, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />}
      >
        {rows.length === 0 ? (
          <EmptyAgents onLink={linkDevice} />
        ) : (
          <>
            <View style={styles.stats}>
              <Stat value={formatAmount(totalCards)} label="On cards · XLM" />
              <Stat value={String(rows.length)} label={rows.length === 1 ? 'Card' : 'Cards'} />
            </View>
            <SectionLabel title="Your cards" />
            {rows.map((r, i) => (
              <ListRow
                key={r.device.id}
                iconNode={<TapGlyph size={22} color={Colors.gold} />}
                title={r.device.label}
                subtitle={`${shortAddress(r.agentPub) || 'No agent key'}${r.device.status !== 'active' ? ` · ${statusLabel(r.device.status)}` : ''}`}
                subtitleMono
                subtitleColor={r.device.status !== 'active' ? statusColor(r.device.status) : undefined}
                right={
                  <View style={styles.amounts}>
                    {cardTotalCents(r) == null && loading
                      ? <View style={styles.placeholder} />
                      : <Text style={styles.amount}>{cardTotalCents(r) == null ? '—' : formatAmount(cardTotalCents(r)!)} XLM</Text>}
                  </View>
                }
                chevron
                last={i === rows.length - 1}
                onPress={() => router.push(`/agent/${r.device.id}`)}
                accessibilityLabel={`${r.device.label}, balance ${cardTotalCents(r) == null ? 'unknown' : formatAmount(cardTotalCents(r)!)} XLM`}
              />
            ))}
            <TextAction label="Link another card" icon="add" onPress={linkDevice} center={false} />
          </>
        )}
      </ScrollView>
      {rows.length === 0 && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button label="Link a card" onPress={linkDevice} fullWidth />
        </View>
      )}
    </SafeAreaView>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function EmptyAgents({ onLink: _onLink }: { onLink: () => void }) {
  return (
    <View style={styles.empty}>
      <Image source={NOIR_MARK} style={styles.emptyMark} resizeMode="contain" />
      <Text style={styles.emptyTitle}>No cards yet</Text>
      <Text style={styles.emptyDesc}>Link an NFC card or sticker and it gets an agent that pays when you tap.</Text>
      <View style={styles.steps}>
        {['Tap your card on the back of the phone', 'Its agent wallet is created on Stellar', 'Top it up — taps pay without signing each time'].map((t, i) => (
          <View key={t} style={styles.step}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <Text style={styles.stepText}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20 },
  contentEmpty: { flexGrow: 1, justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 28, paddingTop: Spacing.sm },
  statValue: { fontFamily: Fonts.display, fontSize: 22, color: Colors.white, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, marginTop: 2 },
  amounts: { alignItems: 'flex-end' },
  amount: { fontSize: FontSize.md - 1, color: Colors.white, fontWeight: FontWeight.medium, fontVariant: ['tabular-nums'] },
  placeholder: { width: 64, height: 14, borderRadius: 4, backgroundColor: Colors.lightGrey },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.sm },
  empty: { alignItems: 'center', gap: 14, paddingVertical: Spacing.lg },
  emptyMark: { width: 72, height: 76, opacity: 0.9 },
  emptyTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.cream },
  emptyDesc: { fontSize: FontSize.md - 1, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 22, maxWidth: 290 },
  steps: { alignSelf: 'stretch', gap: 16, marginTop: Spacing.lg, paddingHorizontal: 12 },
  step: { flexDirection: 'row', gap: 14 },
  stepNum: { fontFamily: Fonts.display, fontSize: FontSize.md - 1, color: Colors.gold, width: 16 },
  stepText: { flex: 1, fontSize: FontSize.md - 1, color: Colors.silver, lineHeight: 21 },
})
