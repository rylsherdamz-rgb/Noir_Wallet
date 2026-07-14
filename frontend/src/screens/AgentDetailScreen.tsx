import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { sha256 } from '@noble/hashes/sha2.js'
import { Buffer } from 'buffer'
import { useAppStore } from '@/store/useAppStore'
import { x402 } from '@/domain/x402'
import type { AgentWallet } from '@/domain/x402'
import { nfcService } from '@/services/nfc'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { StatusPill, TxStatus } from '@/components/StatusPill'
import { Toast } from '@/components/Toast'

export function AgentDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { devices, transactions, addTransaction } = useAppStore()
  const [agent, setAgent] = useState<AgentWallet | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<'success' | 'failed' | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })

  const device = devices.find((d) => d.id === id) ?? null
  const agentTxs = transactions.filter((tx) => tx.deviceId === device?.deviceUidHash)

  const loadAgent = async () => {
    const a = await x402.getAgent()
    setAgent(a)
  }

  useEffect(() => { loadAgent() }, [id])

  const xlmBalance = agent ? (agent.balanceStroops / 10_000_000).toFixed(2) : '—'
  const budget = agent ? (agent.spendingBudgetStroops / 10_000_000).toFixed(2) : '—'
  const spent = agent ? (agent.totalSpentStroops / 10_000_000).toFixed(2) : '—'
  const remaining = agent ? Math.max(0, (agent.spendingBudgetStroops - agent.totalSpentStroops) / 10_000_000).toFixed(2) : '—'
  const pct = agent && agent.spendingBudgetStroops > 0
    ? Math.round((agent.totalSpentStroops / agent.spendingBudgetStroops) * 100) : 0

  const handleTapToPay = useCallback(async () => {
    if (!device || isProcessing) return
    setIsProcessing(true)
    setLastResult(null)
    try {
      const tag = await nfcService.readTag()
      if (!tag) { setIsProcessing(false); return }

      const hash = sha256(new TextEncoder().encode(tag.uid))
      const hashHex = Buffer.from(hash).toString('hex')
      if (hashHex !== device.deviceUidHash) {
        setToast({ visible: true, type: 'info', title: 'Wrong Tag', message: `Tap your "${device.label}" tag` })
        setIsProcessing(false)
        return
      }

      const hasAgent = await x402.hasAgent()
      if (!hasAgent || !device.agentPublicKey) {
        setToast({ visible: true, type: 'info', title: 'No Agent', message: 'This device has no payment agent linked.' })
        setIsProcessing(false)
        return
      }

      const result = await x402.payWithAgent({
        destination: device.agentPublicKey,
        amount: '0.01',
      })

      if ('error' in result) throw new Error(result.error)

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setLastResult('success')
      addTransaction({
        id: Math.random().toString(36).slice(2),
        stellarTxHash: result.hash,
        merchantId: 'agent',
        merchantName: device.label,
        userId: 'local',
        deviceId: tag.uid,
        amountCents: 1,
        assetCode: 'XLM',
        status: 'confirmed',
        errorMessage: null,
        createdAt: new Date().toISOString(),
      })
      await loadAgent()
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setLastResult('failed')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setLastResult(null), 3000)
    }
  }, [device, isProcessing, addTransaction])

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agent</Text>
          <View style={{ width: 24 }} />
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
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{device.label}</Text>
        <StatusPill status={device.status as TxStatus} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Agent ID card */}
        <View style={styles.agentCard}>
          <View style={styles.agentIconRow}>
            <View style={styles.agentIcon}>
              <Ionicons name="flash" size={28} color={Colors.gold} />
            </View>
          </View>
          <Text style={styles.agentPubKey} numberOfLines={1}>
            {device.agentPublicKey || 'No agent key'}
          </Text>
          {agent?.createdAt && (
            <Text style={styles.agentCreated}>Created {new Date(agent.createdAt).toLocaleDateString()}</Text>
          )}
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet-outline" size={18} color={Colors.gold} />
            <Text style={styles.balanceHeaderTitle}>Agent Wallet</Text>
          </View>
          <Text style={styles.balanceAmount}>{xlmBalance} XLM</Text>

          <View style={styles.metricsRow}>
            <MetricBox label="Budget" value={`${budget} XLM`} />
            <MetricBox label="Spent" value={`${spent} XLM`} gold={pct > 0} />
            <MetricBox label="Remaining" value={`${remaining} XLM`} gold />
          </View>

          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{pct}% of budget used</Text>
        </View>

        {/* Tap to Pay */}
        <View style={styles.tapSection}>
          <TouchableOpacity
            style={[styles.tapBtn, isProcessing && styles.tapBtnDisabled]}
            onPress={handleTapToPay}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isProcessing ? 'sync' : 'radio'}
              size={24}
              color={Colors.black}
            />
            <Text style={styles.tapBtnText}>
              {isProcessing ? 'Processing...' : 'Tap to Pay'}
            </Text>
          </TouchableOpacity>

          {lastResult === 'success' && (
            <View style={styles.resultRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.resultSuccess}>Payment Sent</Text>
            </View>
          )}
          {lastResult === 'failed' && (
            <View style={styles.resultRow}>
              <Ionicons name="close-circle" size={20} color={Colors.danger} />
              <Text style={styles.resultFailed}>Payment Failed</Text>
            </View>
          )}
        </View>

        {/* Transaction History */}
        <View style={styles.txSection}>
          <Text style={styles.txSectionTitle}>Payment History</Text>
          {agentTxs.length === 0 ? (
            <Text style={styles.noTx}>No payments yet. Tap your NFC tag to make a payment.</Text>
          ) : (
            agentTxs.map((tx) => (
              <TouchableOpacity
                key={tx.id}
                style={styles.txRow}
                onPress={() => router.push(`/transaction/${tx.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.txLeft}>
                  <Ionicons
                    name={tx.status === 'confirmed' ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={tx.status === 'confirmed' ? Colors.success : Colors.danger}
                  />
                  <View style={styles.txInfo}>
                    <Text style={styles.txMerchant}>{tx.merchantName}</Text>
                    <Text style={styles.txDate}>
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.txAmount}>
                  {(tx.amountCents / 100).toFixed(2)} {tx.assetCode}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: FontSize.md, color: Colors.mutedWhite },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  agentCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.md,
  },
  agentIconRow: { marginBottom: Spacing.md },
  agentIcon: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.gold + '15',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.gold + '25',
  },
  agentPubKey: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontFamily: 'monospace', marginBottom: Spacing.xs },
  agentCreated: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  balanceCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginTop: Spacing.md,
  },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  balanceHeaderTitle: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontWeight: FontWeight.semibold },
  balanceAmount: { fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy, color: Colors.white, marginBottom: Spacing.md },
  metricsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  metric: { flex: 1, backgroundColor: Colors.lightGrey, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  metricLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginBottom: 2 },
  metricValue: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.bold },
  metricValueGold: { color: Colors.gold },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: Colors.lightGrey, marginBottom: Spacing.xs },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.gold },
  progressLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  tapSection: { alignItems: 'center', marginTop: Spacing.lg, gap: Spacing.md },
  tapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.gold, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md, minWidth: 200, minHeight: 52,
  },
  tapBtnDisabled: { opacity: 0.5 },
  tapBtnText: { fontSize: FontSize.lg, color: Colors.black, fontWeight: FontWeight.bold },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  resultSuccess: { fontSize: FontSize.md, color: Colors.success, fontWeight: FontWeight.semibold },
  resultFailed: { fontSize: FontSize.md, color: Colors.danger, fontWeight: FontWeight.semibold },
  txSection: { marginTop: Spacing.lg },
  txSectionTitle: { fontSize: FontSize.lg, color: Colors.cream, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  noTx: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.xl },
  txRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.cardBg, padding: Spacing.md, borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderGrey,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  txDate: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 1 },
  txAmount: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.bold },
})
