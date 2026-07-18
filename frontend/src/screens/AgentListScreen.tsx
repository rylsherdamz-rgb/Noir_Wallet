import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { PressableScale } from '@/components/brand/PressableScale'
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
import { StatusPill } from '@/components/StatusPill'

const NOIR_MARK = require('../../assets/noir-mark.png')

export function AgentListScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
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

  const xlmBalance = agent ? (agent.balanceStroops / 10_000_000).toFixed(2) : '—'
  const budget = agent ? (agent.spendingBudgetStroops / 10_000_000).toFixed(2) : '—'
  const spent = agent ? (agent.totalSpentStroops / 10_000_000).toFixed(2) : '—'
  const remaining = agent
    ? Math.max(0, (agent.spendingBudgetStroops - agent.totalSpentStroops) / 10_000_000).toFixed(2) : '—'
  const pct = agent && agent.spendingBudgetStroops > 0
    ? Math.round((agent.totalSpentStroops / agent.spendingBudgetStroops) * 100) : 0

  const agentExists = agent !== null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        <Text style={styles.screenTitle}>Payment Agent</Text>
        <Text style={styles.screenSub}>
          Your x402 agent wallet signs and pays for NFC taps — no manual confirmation needed.
        </Text>

        {!agentExists && devices.length > 0 && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.gold} />
            <Text style={styles.loadingText}>Loading agent wallet…</Text>
          </View>
        )}

        {/* Shared Agent Wallet Card */}
        <LinearGradient
          colors={['#1a1a1a', '#101010']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.agentWalletCard}
        >
          <View style={styles.walletHeader}>
            <View style={styles.walletIcon}>
              <Ionicons name="flash" size={20} color={Colors.goldHi} />
            </View>
            <View style={styles.walletTitleArea}>
              <Text style={styles.walletTitle}>x402 Agent Wallet</Text>
              {agent?.publicKey && (
                <Text style={styles.walletSub}>
                  {agent.publicKey.slice(0, 8)}…{agent.publicKey.slice(-6)}
                </Text>
              )}
            </View>
            {agent?.createdAt && (
              <Text style={styles.walletCreated}>
                {new Date(agent.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          <Text style={styles.balanceAmount}>{xlmBalance}<Text style={styles.balanceUnit}> XLM</Text></Text>

          <View style={styles.budgetRow}>
            <View style={styles.budgetTile}>
              <Text style={styles.budgetLabel}>SPENT</Text>
              <Text style={styles.budgetValue}>{spent}<Text style={styles.budgetUnit}> XLM</Text></Text>
            </View>
            <View style={styles.budgetTile}>
              <Text style={styles.budgetLabel}>REMAINING</Text>
              <Text style={[styles.budgetValue, { color: Colors.gold }]}>{remaining}<Text style={styles.budgetUnit}> XLM</Text></Text>
            </View>
            <View style={styles.budgetTile}>
              <Text style={styles.budgetLabel}>BUDGET</Text>
              <Text style={styles.budgetValue}>{budget}<Text style={styles.budgetUnit}> XLM</Text></Text>
            </View>
          </View>

          {agent && agent.spendingBudgetStroops > 0 && (
            <View style={styles.meterWrap}>
              <View style={styles.meterTrack}>
                <LinearGradient
                  colors={[Colors.goldDeep, Colors.gold, Colors.goldHi]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.meterFill, { width: `${Math.min(pct, 100)}%` }]}
                >
                  <View style={styles.meterEndpoint} />
                </LinearGradient>
              </View>
              <Text style={styles.meterLabel}>{pct}% of budget used</Text>
            </View>
          )}
        </LinearGradient>

        {/* Device List */}
        {devices.length > 0 && (
          <View style={styles.devicesSection}>
            <Text style={styles.sectionTitle}>Linked Devices</Text>
            {devices.map((device) => (
              <PressableScale
                key={device.id}
                onPress={() => router.push(`/agent/${device.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${device.label}, ${device.status}`}
              >
                <LinearGradient
                  colors={['#161616', '#101010']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.deviceCard}
                >
                  <View style={styles.deviceRow}>
                    <View style={styles.deviceIcon}>
                      <TapGlyph size={16} color={Colors.goldHi} />
                    </View>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceLabel}>{device.label}</Text>
                      {device.agentPublicKey && (
                        <Text style={styles.deviceKey}>
                          {device.agentPublicKey.slice(0, 8)}…{device.agentPublicKey.slice(-6)}
                        </Text>
                      )}
                    </View>
                    <StatusPill status={device.status} />
                  </View>
                </LinearGradient>
              </PressableScale>
            ))}
          </View>
        )}

        {devices.length === 0 ? (
          <EmptyAgents onLink={() => router.push('/(tabs)/devices')} />
        ) : (
          <PressableScale
            style={styles.addBtn}
            onPress={() => router.push('/(tabs)/devices')}
          >
            <Ionicons name="add" size={20} color={Colors.gold} />
            <Text style={styles.addBtnLabel}>Link Another Device</Text>
          </PressableScale>
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

      <PressableScale onPress={onLink} accessibilityRole="button" accessibilityLabel="Link a device">
        <LinearGradient
          colors={[Colors.goldHi, Colors.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cta}
        >
          <TapGlyph size={18} color="#151107" />
          <Text style={styles.ctaText}>Link a Device</Text>
        </LinearGradient>
      </PressableScale>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 24 },
  screenTitle: { fontFamily: Fonts.display, fontSize: FontSize.xxl, color: Colors.cream, letterSpacing: 0.2, paddingTop: Spacing.md },
  screenSub: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: 6, marginBottom: Spacing.lg, lineHeight: 20 },

  // Empty state
  empty: { alignItems: 'center', paddingTop: Spacing.xl },
  sigStage: { width: 170, height: 170, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  staticRing: {
    position: 'absolute', width: 104, height: 104, borderRadius: 52,
    borderWidth: 1, borderColor: colorWithOpacity(Colors.gold, 0.18),
  },
  emptyMark: { width: 82, height: 86 },
  emptyTitle: { fontFamily: Fonts.display, fontSize: FontSize.lg, color: Colors.white, marginTop: Spacing.xs },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.silver, textAlign: 'center', lineHeight: 21, marginTop: Spacing.sm, maxWidth: 300 },
  steps: { width: '100%', gap: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.xl },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepDot: {
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colorWithOpacity(Colors.gold, 0.4), backgroundColor: colorWithOpacity(Colors.gold, 0.08),
  },
  stepNum: { fontFamily: Fonts.display, fontSize: FontSize.xs, color: Colors.gold },
  stepText: { flex: 1, fontSize: FontSize.sm, color: Colors.silver, lineHeight: 19 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md, minHeight: 52,
    ...DesignTokens.shadows.goldGlow,
  },
  ctaText: { fontFamily: Fonts.display, fontSize: FontSize.md, color: '#151107', letterSpacing: 1, textTransform: 'uppercase' },

  // Loading
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg },
  loadingText: { fontSize: FontSize.sm, color: Colors.mutedWhite },

  // Agent wallet card (shared)
  agentWalletCard: {
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.lg, marginBottom: Spacing.xl, overflow: 'hidden',
    ...DesignTokens.shadows.card,
  },
  walletHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  walletIcon: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colorWithOpacity(Colors.goldHi, 0.12), borderWidth: 1, borderColor: colorWithOpacity(Colors.goldHi, 0.35),
    marginRight: Spacing.md,
  },
  walletTitleArea: { flex: 1 },
  walletTitle: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.cream },
  walletSub: { fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2 },
  walletCreated: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  balanceAmount: { fontSize: FontSize.xxxl, fontFamily: Fonts.display, color: Colors.white, marginBottom: Spacing.md },
  balanceUnit: { fontSize: FontSize.lg, color: Colors.mutedWhite },
  budgetRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  budgetTile: {
    flex: 1, backgroundColor: '#0E0E0E', borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderGrey, padding: Spacing.sm, alignItems: 'center',
  },
  budgetLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, letterSpacing: 1, marginBottom: 2 },
  budgetValue: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.white, fontVariant: ['tabular-nums'] },
  budgetUnit: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  meterWrap: { marginTop: Spacing.xs },
  meterTrack: { height: 7, borderRadius: 4, backgroundColor: '#1B1B1B', marginBottom: Spacing.sm },
  meterFill: { height: 7, borderRadius: 4, position: 'relative' },
  meterEndpoint: {
    position: 'absolute', right: -1, top: -2, bottom: -2, width: 3, borderRadius: 2,
    backgroundColor: Colors.goldHi, ...DesignTokens.shadows.goldGlow,
  },
  meterLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontVariant: ['tabular-nums'] },

  // Device list
  devicesSection: { marginBottom: Spacing.md },
  sectionTitle: { fontFamily: Fonts.display, fontSize: FontSize.lg, color: Colors.cream, marginBottom: Spacing.md },
  deviceCard: {
    borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  deviceRow: { flexDirection: 'row', alignItems: 'center' },
  deviceIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colorWithOpacity(Colors.goldHi, 0.1), borderWidth: 1, borderColor: colorWithOpacity(Colors.goldHi, 0.25),
    marginRight: Spacing.md,
  },
  deviceInfo: { flex: 1 },
  deviceLabel: { fontFamily: Fonts.display, fontSize: FontSize.sm, color: Colors.cream },
  deviceKey: { fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2 },

  // Add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.borderGrey,
    borderStyle: 'dashed', marginTop: Spacing.sm,
  },
  addBtnLabel: { fontFamily: Fonts.displayMd, fontSize: FontSize.sm, color: Colors.gold, letterSpacing: 0.6, textTransform: 'uppercase' },
})
