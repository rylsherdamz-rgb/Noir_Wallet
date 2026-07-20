import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native'
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
      <SafeAreaView className="flex-1 bg-surfaceBg">
        <View className="flex-row items-center justify-between px-4 py-4">
          <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </PressableScale>
          <Text className="text-xl font-bold text-white">Agent</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center gap-4">
          <Ionicons name="alert-circle-outline" size={48} color={Colors.mutedWhite} />
          <Text className="text-base text-mutedWhite">Device not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text className="text-xl font-bold text-white">{device.label}</Text>
        <StatusPill status={device.status} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} colors={[Colors.gold]} />
        }
      >
        {/* Agent Wallet Card */}
        <LinearGradient
          colors={['#1a1a1a', '#101010']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          className="rounded-3xl border border-borderGrey p-6 mt-4 overflow-hidden"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-3xl items-center justify-center bg-[rgba(198,161,91,0.15)] border border-[rgba(198,161,91,0.25)] mr-4">
              <Ionicons name="flash" size={28} color={Colors.gold} />
            </View>
            <View className="flex-1">
              <Text className="font-['Jost-SemiBold'] text-base text-cream">Agent Wallet</Text>
              {agent?.publicKey && (
                <Text className="font-mono text-xs text-mutedWhite mt-0.5">{agent.publicKey.slice(0, 8)}…{agent.publicKey.slice(-6)}</Text>
              )}
            </View>
          </View>

          <Text className="text-[48px] font-['Jost-SemiBold'] text-white mb-2">{xlmBalance}<Text className="text-xl text-mutedWhite"> XLM</Text></Text>

          {device.agentPublicKey && (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name={authorized ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={authorized ? Colors.success : Colors.mutedWhite}
              />
              <Text style={[authorized && { color: Colors.success }]} className="text-xs text-mutedWhite">
                {authorized ? 'Registered on-chain' : 'Not registered'}
              </Text>

              {!authorized && (
                <PressableScale
                  className="ml-auto"
                  onPress={handleRegister}
                  disabled={registering}
                >
                  <Text className="text-xs font-semibold text-gold">{registering ? 'Registering…' : 'Register Now'}</Text>
                </PressableScale>
              )}
            </View>
          )}
        </LinearGradient>

        {/* Budget & Spend */}
        <View className="bg-cardBg rounded-2xl border border-borderGrey p-4 mt-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="wallet-outline" size={16} color={Colors.gold} />
            <Text className="text-sm font-semibold text-cream">Budget</Text>
          </View>

          <View className="flex-row gap-2 mb-2">
            <MetricBox label="Budget" value={`${budget} XLM`} />
            <MetricBox label="Spent" value={`${spent} XLM`} gold={pct > 0} />
            <MetricBox label="Remaining" value={`${remaining} XLM`} gold />
          </View>

          {agent && agent.spendingBudgetStroops > 0 && (
            <View className="mt-1">
              <View className="h-[6px] rounded-[3px] bg-[#1B1B1B] mb-1">
                <View className="h-[6px] rounded-[3px] bg-gold" style={{ width: `${Math.min(pct, 100)}%` }} />
              </View>
              <Text className="text-xs text-mutedWhite">{pct}% of budget used</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="bg-cardBg rounded-2xl border border-borderGrey p-4 mt-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="flash-outline" size={16} color={Colors.gold} />
            <Text className="text-sm font-semibold text-cream">Actions</Text>
          </View>

          <PressableScale
            className="flex-row items-center bg-[#0E0E0E] rounded-xl border border-borderGrey p-4"
            onPress={handleTopUp}
            disabled={toppingUp}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.gold} />
            <View className="flex-1 ml-4">
              <Text className="text-sm font-semibold text-white">Top Up Agent Wallet</Text>
              <Text className="text-xs text-mutedWhite mt-0.5">Send 50 XLM from main wallet</Text>
            </View>
            <Text className="text-xl text-mutedWhite">{toppingUp ? '…' : '→'}</Text>
          </PressableScale>
        </View>

        {/* Transaction History */}
        <View className="bg-cardBg rounded-2xl border border-borderGrey p-4 mt-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="receipt-outline" size={16} color={Colors.gold} />
            <Text className="text-sm font-semibold text-cream">Payment History</Text>
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
        <View className="bg-cardBg rounded-2xl border border-borderGrey p-4 mt-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="information-circle-outline" size={16} color={Colors.mutedWhite} />
            <Text className="text-sm font-semibold text-mutedWhite">Device Info</Text>
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
          className="flex-row items-center justify-center gap-2 py-4 mt-12"
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
          <Text className="text-sm font-semibold text-[#FF5A5F]">Remove Device</Text>
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
    <View className="flex-1 bg-[#0E0E0E] rounded-xl border border-borderGrey p-2 items-center">
      <Text className="text-xs text-mutedWhite mb-0.5">{label}</Text>
      <Text className={`text-base font-bold ${gold ? 'text-gold' : 'text-white'}`} style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-[rgba(58,58,58,0.4)]">
      <Text className="text-sm text-mutedWhite">{label}</Text>
      <Text className="text-sm text-white font-mono">{value}</Text>
    </View>
  )
}
