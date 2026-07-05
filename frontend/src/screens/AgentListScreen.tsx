import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { x402 } from '@/domain/x402'
import type { AgentWallet } from '@/domain/x402'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Button } from '@/components/Button'

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        <Text style={styles.screenTitle}>Agents</Text>
        <Text style={styles.screenSub}>Autonomous wallets linked to your NFC devices for tap-and-go payments.</Text>

        {devices.length === 0 ? (
          <View style={styles.emptySection}>
            <View style={styles.emptyIcon}>
              <Ionicons name="flash-outline" size={48} color={Colors.gold} />
            </View>
            <Text style={styles.emptyTitle}>No Agents Yet</Text>
            <Text style={styles.emptyDesc}>
              Link an NFC device to create its payment agent. Agents handle payments automatically when you tap.
            </Text>
            <View style={styles.emptySteps}>
              <View style={styles.stepRow}>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>Provision an NFC tag as your wallet key</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>An x402 agent wallet is created for that device</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>Tap to pay — agent signs automatically</Text>
              </View>
            </View>
            <Button
              label="Link a Device"
              icon="radio-outline"
              onPress={() => router.push('/(tabs)/devices')}
            />
          </View>
        ) : (
          <>
            {devices.filter((d) => d.status === 'active').map((device) => {
              const xlmBalance = agent ? (agent.balanceStroops / 10_000_000).toFixed(2) : '—'
              const remaining = agent ? ((agent.spendingBudgetStroops - agent.totalSpentStroops) / 10_000_000).toFixed(2) : '—'
              const spent = agent ? (agent.totalSpentStroops / 10_000_000).toFixed(2) : '—'
              const pct = agent && agent.spendingBudgetStroops > 0
                ? Math.round((agent.totalSpentStroops / agent.spendingBudgetStroops) * 100)
                : 0

              return (
                <TouchableOpacity
                  key={device.id}
                  style={styles.agentCard}
                  onPress={() => router.push(`/agent/${device.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIcon}>
                        <Ionicons name="flash-outline" size={22} color={Colors.gold} />
                      </View>
                      <View style={styles.cardTitleArea}>
                        <Text style={styles.cardTitle}>{device.label}</Text>
                        <Text style={styles.cardSub}>
                          {device.agentPublicKey
                            ? `${device.agentPublicKey.slice(0, 8)}...${device.agentPublicKey.slice(-6)}`
                            : 'No agent'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: device.status === 'active' ? Colors.success + '20' : Colors.danger + '20' }]}>
                      <Text style={[styles.statusText, { color: device.status === 'active' ? Colors.success : Colors.danger }]}>
                        {device.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.balanceRow}>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>Balance</Text>
                      <Text style={styles.balanceValue}>{xlmBalance} XLM</Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>Remaining</Text>
                      <Text style={styles.balanceValueGold}>{remaining} XLM</Text>
                    </View>
                  </View>

                  <View style={styles.progressWrap}>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
                    </View>
                    <Text style={styles.progressLabel}>{spent} XLM spent of {agent ? (agent.spendingBudgetStroops / 10_000_000).toFixed(2) : '—'} XLM budget</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/(tabs)/devices')}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={22} color={Colors.gold} />
              <Text style={styles.addBtnLabel}>Link Another Device</Text>
            </TouchableOpacity>
          </>
        )}

        {!agent && devices.length > 0 && (
          <Text style={styles.loadingText}>Loading agent data...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  screenTitle: { fontSize: FontSize.xxl, color: Colors.cream, fontWeight: FontWeight.heavy, paddingVertical: Spacing.md },
  screenSub: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginBottom: Spacing.lg, lineHeight: 20 },

  // Empty state
  emptySection: { alignItems: 'center', paddingTop: Spacing.xxl, paddingHorizontal: Spacing.md },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.gold + '12', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.gold + '20', marginBottom: Spacing.lg,
  },
  emptyTitle: { fontSize: FontSize.xl, color: Colors.white, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  emptySteps: { width: '100%', gap: Spacing.md, marginBottom: Spacing.xl },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold },
  stepText: { flex: 1, fontSize: FontSize.sm, color: Colors.offWhite, lineHeight: 20 },

  // Agent cards
  agentCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  cardIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.gold + '15', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.gold + '25',
  },
  cardTitleArea: { flex: 1 },
  cardTitle: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.bold },
  cardSub: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontFamily: 'monospace', marginTop: 2 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  balanceRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  balanceItem: { flex: 1, backgroundColor: Colors.lightGrey, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  balanceLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginBottom: 2 },
  balanceValue: { fontSize: FontSize.lg, color: Colors.white, fontWeight: FontWeight.bold },
  balanceValueGold: { fontSize: FontSize.lg, color: Colors.gold, fontWeight: FontWeight.bold },
  progressWrap: { marginTop: Spacing.xs },
  progressBg: { height: 4, borderRadius: 2, backgroundColor: Colors.lightGrey, marginBottom: Spacing.xs },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: Colors.gold },
  progressLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  loadingText: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.xl },

  // Add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderGrey,
    borderStyle: 'dashed', marginTop: Spacing.sm,
  },
  addBtnLabel: { fontSize: FontSize.md, color: Colors.gold, fontWeight: FontWeight.semibold },
})
