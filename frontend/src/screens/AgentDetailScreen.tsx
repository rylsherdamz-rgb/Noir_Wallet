import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppStore } from '@/store/useAppStore'
import { Keypair } from '@stellar/stellar-sdk/axios'
import { x402 } from '@/domain/x402'
import type { AgentWallet } from '@/domain/x402'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { StatusPill } from '@/components/StatusPill'
import { Toast } from '@/components/Toast'
import { TransactionItem } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'
import { LinearGradient } from 'expo-linear-gradient'

export function AgentDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { devices, transactions, addTransaction, removeDevice } = useAppStore()
  const [agent, setAgent] = useState<AgentWallet | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })
  const [toppingUp, setToppingUp] = useState(false)

  const device = devices.find((d) => d.id === id) ?? null
  const agentTxs = transactions.filter((tx) => tx.deviceId === device?.deviceUidHash)
  const authorized = !!device?.agentPublicKey && !!agent

  const loadAgent = async () => {
    const a = await x402.getAgent()
    setAgent(a)
  }

  useEffect(() => { loadAgent() }, [id])

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadAgent()
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Attempt on-chain registration in background if device isn't authorized yet
  const [registering, setRegistering] = useState(false)
  const handleRegister = useCallback(async () => {
    if (!device || registering) return
    setRegistering(true)
    try {
      const { walletService } = await import('@/services/wallet')
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret || !keys.agentPublic) {
        setToast({ visible: true, type: 'info', title: 'Missing Keys', message: 'No wallet keys found' })
        return
      }
      await x402.registerDeviceAndAgentOnChain({
        walletSecret: keys.stellarSecret,
        deviceHashHex: device.deviceUidHash,
        agentPublicKey: keys.agentPublic,
      })
      await loadAgent()
      setToast({ visible: true, type: 'success', title: 'Registered', message: 'Device and agent registered on-chain' })
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg.includes('AlreadyRegistered') || msg.includes('Error(Contract, #4)') || msg.includes('Error(Contract, #3)')) {
        setToast({ visible: true, type: 'info', title: 'Already Registered', message: 'This device was already on-chain' })
      } else {
        setToast({ visible: true, type: 'info', title: 'Registration Failed', message: msg })
      }
    } finally {
      setRegistering(false)
    }
  }, [device, registering])

  const handleRemoveDevice = useCallback(async () => {
    if (!device) return
    try {
      const { walletService } = await import('@/services/wallet')
      const keys = await walletService.loadKeys()
      if (keys?.stellarSecret) {
        // 1. Recover agent XLM balance to main wallet before revoking
        const agentBal = await x402.getAgentBalanceXlm()
        if (agentBal > 0.01) {
          try {
            const recoverAmount = (agentBal - 0.001).toFixed(7)
            const recoverResult = await x402.payWithAgent({
              destination: Keypair.fromSecret(keys.stellarSecret).publicKey(),
              amount: recoverAmount,
            })
            if ('error' in recoverResult) {
              console.warn('Agent XLM recovery failed:', recoverResult.error)
            }
          } catch (e: any) {
            console.warn('Agent XLM recovery error:', e?.message)
          }
        }

        // 2. Revoke agent on agent_registry contract
        try {
          await x402.revokeAgentOnChain({
            walletSecret: keys.stellarSecret,
            deviceHashHex: device.deviceUidHash,
          })
        } catch (e: any) {
          console.warn('revokeAgentOnChain failed:', e?.message)
        }

        // 3. Revoke device on device_registry contract
        try {
          await x402.revokeDeviceOnChain({
            walletSecret: keys.stellarSecret,
            deviceHashHex: device.deviceUidHash,
          })
        } catch (e: any) {
          console.warn('revokeDeviceOnChain failed:', e?.message)
        }
      }

      // 4. Local cleanup
      await x402.clearAgent()
      removeDevice(device.id)
      router.replace('/(tabs)/devices')
    } catch (e: any) {
      setToast({ visible: true, type: 'info', title: 'Remove Failed', message: e?.message ?? 'Unknown error' })
    }
  }, [device, removeDevice, router])

  const handleTopUp = useCallback(async () => {
    setToppingUp(true)
    try {
      const { walletService } = await import('@/services/wallet')
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret) throw new Error('No wallet configured')
      await x402.topUpAgent(50, keys.stellarSecret)
      setToast({ visible: true, type: 'success', title: 'Agent topped up', message: '50 XLM sent to agent wallet' })
      await loadAgent()
    } catch (e: any) {
      setToast({ visible: true, type: 'info', title: 'Top-up failed', message: e?.message })
    } finally {
      setToppingUp(false)
    }
  }, [])

  const xlmBalance = agent ? (agent.balanceStroops / 10_000_000).toFixed(2) : '—'
  const budget = agent ? (agent.spendingBudgetStroops / 10_000_000).toFixed(2) : '—'
  const spent = agent ? (agent.totalSpentStroops / 10_000_000).toFixed(2) : '—'
  const remaining = agent ? Math.max(0, (agent.spendingBudgetStroops - agent.totalSpentStroops) / 10_000_000).toFixed(2) : '—'
  const pct = agent && agent.spendingBudgetStroops > 0
    ? Math.round((agent.totalSpentStroops / agent.spendingBudgetStroops) * 100) : 0

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </PressableScale>
          <Text style={styles.headerTitle}>Agent</Text>
          <View style={styles.spacer24} />
        </View>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.mutedWhite} />
          <Text style={styles.notFoundText}>Device not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle}>{device.label}</Text>
        <StatusPill status={device.status} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
        }
      >
        {/* Agent Wallet Card */}
        <LinearGradient
          colors={['#1a1a1a', '#101010']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.walletCard}
        >
          <View style={styles.walletIconRow}>
            <View style={styles.walletIcon}>
              <Ionicons name="flash" size={28} color={Colors.gold} />
            </View>
            <View style={styles.walletTitleArea}>
              <Text style={styles.walletTitle}>Agent Wallet</Text>
              {agent?.publicKey && (
                <Text style={styles.walletKey}>{agent.publicKey.slice(0, 8)}…{agent.publicKey.slice(-6)}</Text>
              )}
            </View>
          </View>

          <Text style={styles.balanceAmount}>{xlmBalance}<Text style={styles.balanceUnit}> XLM</Text></Text>

          {device.agentPublicKey && (
            <View style={styles.authRow}>
              <Ionicons
                name={authorized ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={authorized ? Colors.success : Colors.mutedWhite}
              />
              <Text style={[styles.authText, authorized && { color: Colors.success }]}>
                {authorized ? 'Registered on-chain' : 'Not registered'}
              </Text>

              {!authorized && (
                <PressableScale
                  style={styles.registerLink}
                  onPress={handleRegister}
                  disabled={registering}
                >
                  <Text style={styles.registerLinkText}>{registering ? 'Registering…' : 'Register Now'}</Text>
                </PressableScale>
              )}
            </View>
          )}
        </LinearGradient>

        {/* Budget & Spend */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={16} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Budget</Text>
          </View>

          <View style={styles.metricsRow}>
            <MetricBox label="Budget" value={`${budget} XLM`} />
            <MetricBox label="Spent" value={`${spent} XLM`} gold={pct > 0} />
            <MetricBox label="Remaining" value={`${remaining} XLM`} gold />
          </View>

          {agent && agent.spendingBudgetStroops > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{pct}% of budget used</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={16} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Actions</Text>
          </View>

          <PressableScale
            style={styles.actionBtn}
            onPress={handleTopUp}
            disabled={toppingUp}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.gold} />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Top Up Agent Wallet</Text>
              <Text style={styles.actionDesc}>Send 50 XLM from main wallet</Text>
            </View>
            <Text style={styles.actionArrow}>{toppingUp ? '…' : '→'}</Text>
          </PressableScale>
        </View>

        {/* Transaction History */}
        <View style={styles.txSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={16} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Payment History</Text>
          </View>
          {agentTxs.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No payments yet"
              description="Tap this device's NFC tag against a payment terminal and the agent will sign automatically."
            />
          ) : (
            agentTxs.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))
          )}
        </View>

        {/* Device Info */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.mutedWhite} />
            <Text style={[styles.sectionTitle, { color: Colors.mutedWhite }]}>Device Info</Text>
          </View>
          <InfoRow label="Label" value={device.label} />
          <InfoRow label="Status" value={device.status} />
          <InfoRow label="Agent Key" value={device.agentPublicKey ? `${device.agentPublicKey.slice(0, 8)}…${device.agentPublicKey.slice(-6)}` : 'None'} />
          <InfoRow label="Created" value={new Date(device.createdAt).toLocaleDateString()} />
          {device.lastTapAt && (
            <InfoRow label="Last Tap" value={new Date(device.lastTapAt).toLocaleDateString()} />
          )}
        </View>

        {/* Remove device (danger) */}
        <PressableScale
          style={styles.dangerBtn}
          onPress={() =>
            Alert.alert(
              'Remove Device',
              `Unlink "${device.label}" and delete its agent keys? This cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: handleRemoveDevice },
              ],
            )
          }
        >
          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
          <Text style={styles.dangerText}>Remove Device</Text>
        </PressableScale>
      </ScrollView>

      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  )
}

function MetricBox({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, gold && styles.metricValueGold]}>{value}</Text>
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: FontSize.md, color: Colors.mutedWhite },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  spacer24: { width: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: 24 },

  // Wallet card
  walletCard: {
    borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.lg, marginTop: Spacing.md, overflow: 'hidden',
  },
  walletIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  walletIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colorWithOpacity(Colors.gold, 0.15),
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colorWithOpacity(Colors.gold, 0.25),
    marginRight: Spacing.md,
  },
  walletTitleArea: { flex: 1 },
  walletTitle: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.cream },
  walletKey: { fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2 },
  balanceAmount: { fontSize: FontSize.xxxl, fontFamily: Fonts.display, color: Colors.white, marginBottom: Spacing.sm },
  balanceUnit: { fontSize: FontSize.lg, color: Colors.mutedWhite },
  authRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  authText: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  registerLink: { marginLeft: 'auto' },
  registerLinkText: { fontSize: FontSize.xs, color: Colors.gold, fontWeight: FontWeight.semibold },

  // Section card
  sectionCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginTop: Spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.sm, color: Colors.cream, fontWeight: FontWeight.semibold },
  metricsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  metric: { flex: 1, backgroundColor: '#0E0E0E', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderGrey, padding: Spacing.sm, alignItems: 'center' },
  metricLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginBottom: 2 },
  metricValue: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.bold, fontVariant: ['tabular-nums'] },
  metricValueGold: { color: Colors.gold },
  progressSection: { marginTop: Spacing.xs },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: '#1B1B1B', marginBottom: Spacing.xs },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.gold },
  progressLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite },

  // Actions
  actionsCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginTop: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0E0E0E', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md,
  },
  actionContent: { flex: 1, marginLeft: Spacing.md },
  actionLabel: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.semibold },
  actionDesc: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2 },
  actionArrow: { fontSize: FontSize.lg, color: Colors.mutedWhite },

  // Transactions
  txSection: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginTop: Spacing.md,
  },

  // Device Info
  infoCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: colorWithOpacity(Colors.borderGrey, 0.4),
  },
  infoLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite },
  infoValue: { fontSize: FontSize.sm, color: Colors.white, fontFamily: Fonts.mono },

  // Danger
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, marginTop: Spacing.xxl,
  },
  dangerText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.semibold },
})
