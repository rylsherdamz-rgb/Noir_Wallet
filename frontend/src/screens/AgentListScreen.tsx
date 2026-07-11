import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
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
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { x402 } from '@/domain/x402'
import type { AgentWallet } from '@/domain/x402'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { SignalRipple } from '@/components/brand/SignalRipple'
import { TapGlyph } from '@/components/brand/BrandGlyph'

const NOIR_MARK = require('../../assets/noir-mark.png')

export function AgentListScreen() {
  const router = useRouter()
  const { devices } = useAppStore()
  const [agent, setAgent] = useState<AgentWallet | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadAgent = async () => {
    const a = await x402.getAgent()
    setAgent(a)
  }

  useEffect(() => { loadAgent() }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAgent()
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        <Text style={styles.screenTitle}>Agents</Text>
        <Text style={styles.screenSub}>Autonomous wallets linked to your NFC devices for tap-and-go payments.</Text>

        {devices.length === 0 ? (
          <EmptyAgents onLink={() => router.push('/(tabs)/devices')} />
        ) : (
          <>
            {devices.filter((d) => d.status === 'active').map((device) => {
              const xlmBalance = agent ? (agent.balanceStroops / 10_000_000).toFixed(2) : '—'
              const remaining = agent ? ((agent.spendingBudgetStroops - agent.totalSpentStroops) / 10_000_000).toFixed(2) : '—'
              const spent = agent ? (agent.totalSpentStroops / 10_000_000).toFixed(2) : '—'
              const budget = agent ? (agent.spendingBudgetStroops / 10_000_000).toFixed(2) : '—'
              const pct = agent && agent.spendingBudgetStroops > 0
                ? Math.round((agent.totalSpentStroops / agent.spendingBudgetStroops) * 100)
                : 0

              return (
                <TouchableOpacity
                  key={device.id}
                  onPress={() => router.push(`/agent/${device.id}`)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#161616', '#101010']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.agentCard}
                  >
                    <View style={styles.cardTop}>
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                          <TapGlyph size={20} color={Colors.goldHi} />
                        </View>
                        <View style={styles.cardTitleArea}>
                          <Text style={styles.cardTitle}>{device.label}</Text>
                          <Text style={styles.cardSub}>
                            {device.agentPublicKey
                              ? `${device.agentPublicKey.slice(0, 8)}…${device.agentPublicKey.slice(-6)}`
                              : 'No agent'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: colorWithOpacity(device.status === 'active' ? Colors.success : Colors.danger, 0.14), borderColor: colorWithOpacity(device.status === 'active' ? Colors.success : Colors.danger, 0.3) }]}>
                        <Text style={[styles.statusText, { color: device.status === 'active' ? Colors.success : Colors.danger }]}>
                          {device.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.tile}>
                        <Text style={styles.tileLabel}>BALANCE</Text>
                        <Text style={styles.tileValue}>{xlmBalance} XLM</Text>
                      </View>
                      <View style={styles.tile}>
                        <Text style={styles.tileLabel}>REMAINING</Text>
                        <Text style={[styles.tileValue, styles.tileValueGold]}>{remaining} XLM</Text>
                      </View>
                    </View>

                    <View style={styles.meterWrap}>
                      <SpendMeter pct={pct} />
                      <Text style={styles.meterLabel}>{spent} XLM spent of {budget} XLM budget</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )
            })}

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/(tabs)/devices')}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={Colors.gold} />
              <Text style={styles.addBtnLabel}>Link Another Device</Text>
            </TouchableOpacity>
          </>
        )}

        {!agent && devices.length > 0 && (
          <Text style={styles.loadingText}>Loading agent data…</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

/** Empty state — the Cat mark inside concentric signal ripples, waiting for a tap. */
function EmptyAgents({ onLink }: { onLink: () => void }) {
  const reduced = useReducedMotion()
  const scale = useSharedValue(1)

  useEffect(() => {
    if (reduced) return
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(scale)
  }, [reduced, scale])

  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <View style={styles.empty}>
      <View style={styles.sigStage}>
        <View style={styles.staticRing} />
        <SignalRipple size={104} rings={3} color={Colors.gold} duration={2900} />
        <Animated.Image source={NOIR_MARK} style={[styles.emptyMark, markStyle]} resizeMode="contain" />
      </View>

      <Text style={styles.emptyTitle}>No agents yet</Text>
      <Text style={styles.emptyDesc}>
        Link an NFC device to create its payment agent — it signs your taps automatically.
      </Text>

      <View style={styles.steps}>
        <StepRow n="1" text="Provision an NFC tag as your wallet key" />
        <StepRow n="2" text="An x402 agent wallet is created for that device" />
        <StepRow n="3" text="Tap to pay — the agent signs automatically" />
      </View>

      <TouchableOpacity onPress={onLink} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Link a device">
        <LinearGradient
          colors={[Colors.goldHi, Colors.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cta}
        >
          <TapGlyph size={18} color="#151107" />
          <Text style={styles.ctaText}>Link a Device</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

function StepRow({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepDot}>
        <Text style={styles.stepNum}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  )
}

/** Gold-gradient spend meter with an emphasized endpoint. */
function SpendMeter({ pct }: { pct: number }) {
  const w = Math.max(3, Math.min(pct, 100))
  return (
    <View style={styles.meterTrack}>
      <LinearGradient
        colors={[Colors.goldDeep, Colors.gold, Colors.goldHi]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.meterFill, { width: `${w}%` }]}
      >
        <View style={styles.meterEndpoint} />
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  screenTitle: { fontFamily: Fonts.display, fontSize: 26, color: Colors.cream, letterSpacing: 0.2, paddingTop: Spacing.md },
  screenSub: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: 6, marginBottom: Spacing.lg, lineHeight: 20 },

  // Empty state
  empty: { alignItems: 'center', paddingTop: Spacing.xl },
  sigStage: { width: 170, height: 170, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  staticRing: {
    position: 'absolute', width: 104, height: 104, borderRadius: 52,
    borderWidth: 1, borderColor: colorWithOpacity(Colors.gold, 0.18),
  },
  emptyMark: { width: 82, height: 86 },
  emptyTitle: { fontFamily: Fonts.display, fontSize: 20, color: Colors.white, marginTop: Spacing.xs },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.silver, textAlign: 'center', lineHeight: 21, marginTop: Spacing.sm, maxWidth: 300 },
  steps: { width: '100%', gap: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.xl },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepDot: {
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colorWithOpacity(Colors.gold, 0.4), backgroundColor: colorWithOpacity(Colors.gold, 0.08),
  },
  stepNum: { fontFamily: Fonts.display, fontSize: 11, color: Colors.gold },
  stepText: { flex: 1, fontSize: 13, color: Colors.silver, lineHeight: 19 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md, minHeight: 52,
    ...DesignTokens.shadows.goldGlow,
  },
  ctaText: { fontFamily: Fonts.display, fontSize: 14, color: '#151107', letterSpacing: 1, textTransform: 'uppercase' },

  // Agent cards
  agentCard: {
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginBottom: Spacing.md, overflow: 'hidden',
    ...DesignTokens.shadows.card,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  cardIcon: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colorWithOpacity(Colors.goldHi, 0.12), borderWidth: 1, borderColor: colorWithOpacity(Colors.goldHi, 0.35),
  },
  cardTitleArea: { flex: 1 },
  cardTitle: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.cream },
  cardSub: { fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 3 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1 },
  statusText: { fontFamily: Fonts.displayMd, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  tile: {
    flex: 1, backgroundColor: '#0E0E0E', borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderGrey, padding: Spacing.md,
  },
  tileLabel: { fontFamily: Fonts.displayMd, fontSize: 9, color: Colors.mutedWhite, letterSpacing: 1.4 },
  tileValue: { fontFamily: Fonts.display, fontSize: 17, color: Colors.white, marginTop: 4, fontVariant: ['tabular-nums'] },
  tileValueGold: { color: Colors.gold },
  meterWrap: { marginTop: Spacing.xs },
  meterTrack: { height: 7, borderRadius: 4, backgroundColor: '#1B1B1B', marginBottom: Spacing.sm },
  meterFill: { height: 7, borderRadius: 4, position: 'relative' },
  meterEndpoint: {
    position: 'absolute', right: -1, top: -2, bottom: -2, width: 3, borderRadius: 2,
    backgroundColor: Colors.goldHi, ...DesignTokens.shadows.goldGlow,
  },
  meterLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontVariant: ['tabular-nums'] },
  loadingText: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.xl },

  // Add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.borderGrey,
    borderStyle: 'dashed', marginTop: Spacing.sm,
  },
  addBtnLabel: { fontFamily: Fonts.displayMd, fontSize: FontSize.sm, color: Colors.gold, letterSpacing: 0.6, textTransform: 'uppercase' },
})
