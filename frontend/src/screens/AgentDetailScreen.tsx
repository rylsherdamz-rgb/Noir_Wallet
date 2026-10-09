import { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, Linking } from 'react-native'
import { popup } from '@/components/popup/Popup'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppStore } from '@/store/useAppStore'
import { Keypair } from '@stellar/stellar-sdk/axios'
import { x402 } from '@/domain/x402'
import type { AgentWallet, OnChainAgentPolicy, AgentChainStatus } from '@/domain/x402'
import { describeContractError } from '@/domain/contractErrors'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts, Gradient } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { Toast } from '@/components/Toast'
import { TransactionItem } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'
import { LinearGradient } from 'expo-linear-gradient'
import { logger } from '@/lib/logger'
import { useHorizonPayments } from '@/hooks/useHorizonPayments'
import { ProcessingOverlay } from '@/components/flow/ProcessingOverlay'
import { openReceipt } from '@/lib/receipt'
import { formatAmount, shortAddress } from '@/lib/txFormat'
import { cardTotalCents } from '@/lib/cardBalances'
import { ScreenHeader } from '@/components/ScreenHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { SectionLabel, KeyValueRow, TextAction } from '@/components/ui/List'
import { Button } from '@/components/Button'

function formatStroops(v: bigint): string {
  return (Number(v) / 10_000_000).toFixed(2)
}

function describeExpiry(expiresAt: bigint): string {
  if (expiresAt === 0n) return 'Never'
  const ms = Number(expiresAt) * 1000
  const label = new Date(ms).toLocaleDateString()
  return ms <= Date.now() ? `Expired ${label}` : label
}

export function AgentDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, devices, transactions, removeDevice, network: storeNetwork } = useAppStore()
  const [agent, setAgent] = useState<AgentWallet | null>(null)
  const [agentIndex, setAgentIndex] = useState<number | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })
  const [escrowBalance, setEscrowBalance] = useState<bigint | null>(null)
  const [policy, setPolicy] = useState<OnChainAgentPolicy | null>(null)

  const device = devices.find((d) => d.id === id) ?? null
  const agentTxs = transactions.filter((tx) => tx.deviceId === device?.deviceUidHash)
  // Real on-chain state from agent_registry — not just "we hold a local key".
  const [chainStatus, setChainStatus] = useState<AgentChainStatus | null>(null)
  const authorized = chainStatus === 'active'
  const autoSyncTried = useRef(false)

  const loadAgent = async () => {
    if (!device) { setAgent(null); return }
    // Self-heal from the persisted device list first (fixes missing agent after login).
    try {
      await x402.syncAgentsFromDevices([{
        deviceUidHash: device.deviceUidHash,
        agentPublicKey: device.agentPublicKey,
        label: device.label,
        createdAt: device.createdAt,
      }])
    } catch { /* non-critical */ }
    // Resolve THIS device's own agent (multi-agent: one per card).
    let idx = await x402.getAgentIndexForDevice(device.deviceUidHash)
    if (idx == null) {
      // Fall back: match a live agent by the device's stored agentPublicKey.
      const all = await x402.listAgents()
      const match = all.find((a) => a.publicKey === device.agentPublicKey)
      idx = match?.index ?? 1
    }
    setAgentIndex(idx)
    const a = await x402.getAgent(idx)
    setAgent(a)

    // On-chain escrow balance + delegation policy. Simulated from the owner
    // wallet: a fresh agent account may not exist on-chain yet.
    const walletPub = user?.stellarPublicKey
    if (walletPub) {
      const [bal, pol] = await Promise.allSettled([
        x402.getEscrowBalance(device.deviceUidHash, walletPub),
        x402.getAgentPolicy(device.deviceUidHash, walletPub),
      ])
      if (bal.status === 'fulfilled') setEscrowBalance(bal.value)
      else logger.warn('escrow balance read failed:', bal.reason?.message)
      if (pol.status === 'fulfilled') setPolicy(pol.value)
      else logger.warn('agent policy read failed:', pol.reason?.message)

      const agentPub = a?.publicKey ?? device.agentPublicKey
      if (agentPub) {
        try {
          const status = await x402.getAgentChainStatus(device.deviceUidHash, agentPub, walletPub)
          setChainStatus(status)
          if (status === 'missing' && !autoSyncTried.current) {
            autoSyncTried.current = true
            void autoRegister(agentPub)
          }
        } catch (e: any) {
          logger.warn('agent status read failed:', e?.message)
        }
      }
    }
  }

  // Auto-sync: a linked device whose agent is missing on-chain gets registered
  // without the user having to find and press "Register Now".
  const autoRegister = async (agentPub: string) => {
    if (!device) return
    setRegistering(true)
    try {
      const { walletService } = await import('@/services/wallet')
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret) return
      const [result] = await x402.syncAgentRegistrations({
        walletSecret: keys.stellarSecret,
        devices: [{ deviceUidHash: device.deviceUidHash, agentPublicKey: agentPub }],
      })
      if (result?.outcome === 'registered') {
        setChainStatus('active')
        setToast({ visible: true, type: 'success', title: 'Synced', message: 'Agent registered on-chain automatically' })
        await loadAgent()
      } else if (result?.outcome === 'failed' || result?.outcome === 'skipped') {
        logger.warn('agent auto-sync:', result.outcome, result.reason)
      }
    } catch (e: any) {
      logger.warn('agent auto-sync failed:', e?.message)
    } finally {
      setRegistering(false)
    }
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
        agentPublicKey: agent?.publicKey ?? device.agentPublicKey ?? keys.agentPublic,
      })
      await loadAgent()
      setToast({ visible: true, type: 'success', title: 'Registered', message: 'Device and agent registered on-chain' })
    } catch (e: any) {
      const msg = e?.message ?? ''
      // x402 already treats AlreadyRegistered as success; #4 from agent_registry
      // is InvalidPolicy, so only #3 / the named error mean "already on-chain".
      if (msg.includes('AlreadyRegistered') || msg.includes('Error(Contract, #3)')) {
        setToast({ visible: true, type: 'info', title: 'Already Registered', message: 'This device was already on-chain' })
      } else {
        setToast({ visible: true, type: 'info', title: 'Registration Failed', message: msg })
      }
    } finally {
      setRegistering(false)
    }
  }, [device, registering])

  const [removing, setRemoving] = useState(false)
  const handleRemoveDevice = useCallback(async () => {
    if (!device || removing) return
    setRemoving(true)
    try {
      const { walletService } = await import('@/services/wallet')
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret) throw new Error('No wallet configured')
      const mainWallet = Keypair.fromSecret(keys.stellarSecret).publicKey()

      let idx = agentIndex ?? (await x402.getAgentIndexForDevice(device.deviceUidHash))
      if (idx == null) idx = 1

      // 1. On-chain: revoke agent → return escrow → revoke device. Throws
      //    (and we stop here, keeping the device + agent keys) if any step
      //    fails, so escrow can never be stranded behind a deleted device.
      const unlinked = await x402.unlinkDevice({
        walletSecret: keys.stellarSecret,
        deviceHashHex: device.deviceUidHash,
        agentPublicKey: agent?.publicKey ?? device.agentPublicKey,
      })

      // 2. PERMANENT retire: sweep the agent wallet's own XLM back to the
      //    owner, wipe its keys, and retire its HD index.
      try {
        const result = await x402.retireAgent(idx, mainWallet)
        if ('error' in result) logger.warn('Agent retire/sweep reported:', result.error)
      } catch (e: any) {
        logger.warn('Agent retire error:', e?.message)
      }

      // 3. Local cleanup.
      removeDevice(device.id)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      if (unlinked.sweptStroops > 0n) {
        popup.notice({
          title: 'Card revoked',
          message: 'The tap balance was returned to your main wallet.',
          tone: 'success',
          details: [{ label: 'Returned', value: `${formatStroops(unlinked.sweptStroops)} XLM`, emphasis: true }],
        })
      }
      router.replace('/(tabs)/pos')
    } catch (e: any) {
      logger.warn('unlinkDevice failed:', e?.message)
      setToast({
        visible: true,
        type: 'info',
        title: 'Remove failed',
        message: `${describeContractError('payment_escrow', e)} Your device and funds are unchanged where the step did not complete — you can retry safely.`,
      })
    } finally {
      setRemoving(false)
    }
  }, [device, agent, agentIndex, removing, removeDevice, router])

  const [withdrawing, setWithdrawing] = useState(false)
  const runWithdraw = useCallback(async (amountStroops: bigint) => {
    if (!device) return
    setWithdrawing(true)
    try {
      const { walletService } = await import('@/services/wallet')
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret) throw new Error('No wallet configured')
      const hash = await x402.withdrawEscrow({
        walletSecret: keys.stellarSecret,
        deviceHashHex: device.deviceUidHash,
        amountStroops,
      })
      openReceipt(router, {
        title: 'Tap balance withdrawal',
        amountCents: Number(amountStroops / 100_000n),
        assetCode: 'XLM',
        direction: 'in',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        hash,
        note: `Returned from ${device.label}'s tap balance to your main wallet`,
      }, 'push')
    } catch (e: any) {
      logger.warn('withdrawEscrow failed:', e?.message)
      setToast({ visible: true, type: 'info', title: 'Withdrawal failed', message: describeContractError('payment_escrow', e) })
    } finally {
      setWithdrawing(false)
    }
  }, [device, router])

  const handleWithdraw = useCallback(() => {
    if (!device || withdrawing || !escrowBalance || escrowBalance <= 0n) return
    const amount = escrowBalance
    popup.sign({
      title: 'Withdraw tap balance?',
      message: 'Taps on this card stop until you add funds again.',
      icon: 'arrow-undo-outline',
      details: [
        { label: 'From', value: `${device.label} · tap balance` },
        { label: 'To', value: 'Main wallet' },
        { label: 'Amount', value: `${formatStroops(amount)} XLM`, emphasis: true },
      ],
      confirmLabel: 'Withdraw',
    }).then((ok) => { if (ok) runWithdraw(amount) })
  }, [device, withdrawing, escrowBalance, runWithdraw])

  // Live: any payment touching the agent account (top-up, tap, payout)
  // refreshes balances without pull-to-refresh. Bursts are coalesced.
  const liveRefresh = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadAgentRef = useRef(loadAgent)
  loadAgentRef.current = loadAgent
  const liveStatus = useHorizonPayments(agent?.publicKey, () => {
    if (liveRefresh.current) clearTimeout(liveRefresh.current)
    liveRefresh.current = setTimeout(() => { loadAgentRef.current() }, 800)
  })
  useEffect(() => () => { if (liveRefresh.current) clearTimeout(liveRefresh.current) }, [])

  // One balance per card: agent wallet + tap balance, same as the Agents list and Dashboard.
  const totalCents = cardTotalCents({
    agentCents: agent ? Math.round(agent.balanceStroops / 100_000) : null,
    tapCents: escrowBalance === null ? null : Number(escrowBalance / 100_000n),
  })
  const balanceXlm = totalCents == null ? '—' : formatAmount(totalCents)
  const limitText = policy === null ? '—'
    : policy.maxAmountStroops === 0n ? 'No limit'
    : `${formatAmount(Number(policy.maxAmountStroops / 100_000n))} XLM per payment`
  const statusText = chainStatus === null ? 'Checking Stellar…'
    : authorized ? 'Authorized on-chain'
    : chainStatus === 'expired' ? 'Authorization expired'
    : chainStatus === 'mismatch' ? 'Different agent on-chain'
    : registering ? 'Syncing to Stellar…' : 'Not authorized'
  const statusColor = authorized ? Colors.success : chainStatus === null || registering ? Colors.mutedWhite : Colors.warning
  // One funding action: "Top up" funds the agent wallet, which taps pay from.
  const openFund = () => router.push({ pathname: '/agent-fund/[id]', params: { id: device!.id } })
  const explorer = (pub: string) =>
    Linking.openURL(`https://stellar.expert/explorer/${storeNetwork === 'testnet' ? 'testnet' : 'public'}/account/${pub}`)

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Card" onBackPress={() => router.back()} />
        <ErrorState icon="search-outline" tone="neutral" title="Card not found" message="It may have been removed from this phone." primary={{ label: 'Back to agents', onPress: () => router.replace('/(tabs)/pos') }} />
      </SafeAreaView>
    )
  }

  const canWithdraw = !withdrawing && !!escrowBalance && escrowBalance > 0n

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={device.label}
        onBackPress={() => router.back()}
        rightAction={
          <View style={styles.live} accessibilityLabel={liveStatus === 'live' ? 'Live updates on' : 'Live updates reconnecting'}>
            <View style={[styles.liveDot, { backgroundColor: liveStatus === 'live' ? Colors.success : Colors.mutedWhite }]} />
            <Text style={[styles.liveText, liveStatus === 'live' && { color: Colors.success }]}>{liveStatus === 'live' ? 'Live' : 'Sync'}</Text>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />}
      >
        <View style={styles.hero}>
          <View style={styles.statusRow}>
            <Ionicons name={authorized ? 'shield-checkmark' : 'shield-outline'} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>{balanceXlm}</Text>
            <Text style={styles.asset}>XLM</Text>
          </View>
          <Text style={styles.heroSub}>Card balance</Text>
          {chainStatus === 'missing' && !registering && (
            <Button label="Authorize on Stellar" size="small" onPress={handleRegister} style={styles.authorize} />
          )}
        </View>

        <View style={styles.quickRow}>
          <QuickAction icon="add" label="Top up" onPress={openFund} />
          <QuickAction icon="arrow-undo-outline" label={withdrawing ? 'Withdrawing…' : 'Withdraw'} onPress={handleWithdraw} disabled={!canWithdraw} />
          {agent?.publicKey && <QuickAction icon="open-outline" label="Explorer" onPress={() => explorer(agent.publicKey)} />}
        </View>

        <SectionLabel title="Activity" />
        {agentTxs.length === 0 ? (
          <Text style={styles.empty}>No payments yet. Tap this card on a Noir terminal, or use NFC tap on the Receive screen.</Text>
        ) : (
          agentTxs.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
        )}

        <SectionLabel title="Card" />
        <KeyValueRow label="Status" value={device.status.charAt(0).toUpperCase() + device.status.slice(1)} valueStyle={{ color: device.status === 'active' ? Colors.success : Colors.warning }} />
        <KeyValueRow label="Agent" value={shortAddress(agent?.publicKey ?? device.agentPublicKey) || 'None'} mono />
        <KeyValueRow label="Linked" value={new Date(device.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
        {device.lastTapAt && <KeyValueRow label="Last tap" value={new Date(device.lastTapAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />}
        <KeyValueRow label="Limit" value={limitText} />
        <KeyValueRow label="Works until" value={policy && policy.expiresAt !== 0n ? describeExpiry(policy.expiresAt) : 'You revoke it'} last />

        <View style={styles.revoke}>
          <TextAction
            label={removing ? 'Revoking…' : 'Revoke card'}
            color={Colors.danger}
            disabled={removing}
            onPress={() =>
              popup.sign({
                title: `Revoke ${device.label}?`,
                message: 'Its agent stops working for good. Its tap balance and agent XLM return to your main wallet.',
                icon: 'trash-outline',
                tone: 'danger',
                confirmLabel: 'Revoke card',
              }).then((ok) => { if (ok) handleRemoveDevice() })
            }
          />
        </View>
      </ScrollView>

      <ProcessingOverlay
        visible={withdrawing || removing}
        title={removing ? 'Revoking card' : 'Withdrawing tap balance'}
        subtitle={removing ? 'Revoking the agent and returning all funds to your main wallet.' : 'Returning XLM from escrow to your main wallet.'}
      />

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

function QuickAction({ icon, label, onPress, disabled }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <PressableScale style={[styles.quick, disabled && styles.dimmed]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.quickDisc}><Ionicons name={icon} size={22} color={Colors.white} /></View>
      <Text style={styles.quickLabel} numberOfLines={2}>{label}</Text>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontWeight: FontWeight.medium },
  hero: { alignItems: 'center', gap: 6, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: FontSize.sm - 1, fontWeight: FontWeight.medium },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  amount: { fontFamily: Fonts.display, fontSize: 40, color: Colors.white, fontVariant: ['tabular-nums'] },
  asset: { fontFamily: Fonts.displayMd, fontSize: FontSize.lg - 2, color: Colors.mutedWhite },
  heroSub: { fontSize: FontSize.sm, color: Colors.mutedWhite },
  authorize: { marginTop: Spacing.sm },
  heroNote: { fontSize: FontSize.xs, color: Colors.mutedWhite, textAlign: 'center' },
  quickRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, paddingVertical: Spacing.md },
  quick: { width: 78, alignItems: 'center', gap: 8 },
  quickDisc: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.midGrey, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: FontSize.xs, color: Colors.white, textAlign: 'center', fontWeight: FontWeight.medium },
  dimmed: { opacity: 0.4 },
  empty: { fontSize: FontSize.sm, color: Colors.mutedWhite, lineHeight: 20, paddingVertical: Spacing.sm },
  revoke: { marginTop: Spacing.xl },
})
