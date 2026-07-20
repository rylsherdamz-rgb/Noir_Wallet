import { memo, useCallback, useState, ReactNode, useRef } from 'react'
import { View, Text, ScrollView, RefreshControl, Linking, Image, TextInput, Modal, Alert } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { BalanceCard } from '@/components/BalanceCard'
import { TestnetFaucetBanner } from '@/components/TestnetFaucetBanner'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { PressableScale } from '@/components/brand/PressableScale'
import { SignalRipple } from '@/components/brand/SignalRipple'
import { TapGlyph } from '@/components/brand/BrandGlyph'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors } from '@/constants/theme'
import { apiService } from '@/services/api'
import { stellarService } from '@/services/stellar-service'
import { Transaction } from '@/types'

const NOIR_MARK = require('../../assets/noir-mark.png')

const DEVICE_STATUS: Record<string, { color: string; label: string }> = {
  active: { color: Colors.success, label: 'Active' },
  frozen: { color: Colors.warning, label: 'Frozen' },
  lost: { color: Colors.danger, label: 'Lost' },
  deactivated: { color: Colors.mutedWhite, label: 'Deactivated' },
}
const DEVICE_STATUS_FALLBACK = { color: Colors.mutedWhite, label: 'Unknown' }

function greetingForHour(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, balance, devices, transactions, setTransactions, setBalance, network: storeNetwork, setNetwork: setStoreNetwork, updateDevice } = useAppStore()
  const [refreshing, setRefreshing] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ id: string; label: string } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<TextInput>(null)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    try {
      const txRes = await apiService.getTransactions()
      if (txRes?.transactions) {
        const backendIds = new Set(txRes.transactions.map((t: Transaction) => t.id))
        const current = useAppStore.getState().transactions
        const localOnly = current.filter((t) => !backendIds.has(t.id))
        setTransactions([...txRes.transactions, ...localOnly])
      }
    } catch {
      // backend unavailable
    }

    // Merge Horizon transaction history (filter out 0-amount records — old contracts,
    // non-payment transactions with no amount data from Horizon)
    if (user?.stellarPublicKey) {
      try {
        const horizonTxs = await stellarService.getAccountTransactions(user.stellarPublicKey, 10)
        if (horizonTxs.length) {
          const existing = useAppStore.getState().transactions
          const existingIds = new Set(existing.map((t) => t.id))
          const missing = horizonTxs.filter((t) => !existingIds.has(t.id) && t.amountCents > 0)
          if (missing.length) setTransactions([...missing, ...existing])
        }
      } catch { /* non-critical */ }
    }

    if (user?.stellarPublicKey) {
      try {
        const onChain = await stellarService.getBalance(user.stellarPublicKey)
        setBalance({ xlm: onChain.xlm })
      } catch {
        // horizon unavailable
      }
    }

    setRefreshing(false)
  }, [setTransactions, setBalance, user?.stellarPublicKey])

  // Prefetch on-chain balances + txs every time dashboard gains focus
  useFocusEffect(
    useCallback(() => {
      onRefresh()
    }, [onRefresh])
  )

  const handleNetworkSwitch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const newNetwork = storeNetwork === 'mainnet' ? 'testnet' : 'mainnet'
    setStoreNetwork(newNetwork)
  }

  const copyAddress = async () => {
    if (!user?.stellarPublicKey) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await Clipboard.setStringAsync(user.stellarPublicKey)
  }

  const handleRename = useCallback(() => {
    if (renameTarget && renameValue.trim()) {
      updateDevice(renameTarget.id, { label: renameValue.trim() })
      setRenameTarget(null)
      setRenameValue('')
    }
  }, [renameTarget, renameValue, updateDevice])

  const confirmDeleteWallet = useCallback((device: { id: string; label: string }) => {
    Alert.alert(
      `Remove "${device.label}"?`,
      'This will unlink this device from your wallet. NFC tag data and on-chain registration will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const { removeDevice } = useAppStore.getState()
            removeDevice(device.id)
          },
        },
      ],
    )
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom + 16, 24) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
      >
        {/* Brand bar */}
        <View className="flex-row items-center justify-between pt-4 pb-2">
          <View className="flex-row items-center gap-2">
            <Image source={NOIR_MARK} style={{ width: 26, height: 27 }} resizeMode="contain" />
            <Text className="text-base text-cream tracking-[5] font-[Jost-SemiBold]">NOIR</Text>
          </View>
          <PressableScale
            className="w-[42] h-[42] rounded-full bg-cardBg items-center justify-center border-[1.5] border-gold/50"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push('/profile')
            }}
            accessibilityLabel="View profile"
            accessibilityRole="button"
          >
            <Ionicons name="person-outline" size={20} color={Colors.cream} />
          </PressableScale>
        </View>

        {/* Greeting + wallet identity */}
        <View className="pt-4 pb-6">
          <Text className="text-2xl text-cream tracking-[0.2] font-[Jost-SemiBold]" accessibilityRole="header">
            {greetingForHour()}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <PressableScale
              className="flex-row items-center gap-[6] bg-[#0E0E0E] border border-borderGrey rounded-full px-[10] py-[5]"
              onPress={copyAddress}
              accessibilityRole="button"
              accessibilityLabel={`Wallet address: ${user?.stellarPublicKey || 'No wallet'}. Tap to copy`}
            >
              <Ionicons name="wallet-outline" size={12} color={Colors.gold} />
              <Text className="text-xs text-silver font-mono">
                {user?.stellarPublicKey
                  ? `${user.stellarPublicKey.slice(0, 6)}…${user.stellarPublicKey.slice(-4)}`
                  : 'No wallet'}
              </Text>
              {user?.stellarPublicKey && (
                <Ionicons name="copy-outline" size={12} color={Colors.mutedWhite} />
              )}
            </PressableScale>

            <PressableScale
              className={`flex-row items-center gap-[5] px-2 py-[5] rounded-full border ${storeNetwork === 'mainnet' ? 'bg-[#3ED598]/12 border-[#3ED598]/32' : 'bg-gold/10 border-gold/32'}`}
              onPress={handleNetworkSwitch}
              accessibilityRole="button"
              accessibilityLabel={`Current network: ${storeNetwork}. Tap to switch`}
            >
              <View style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: storeNetwork === 'mainnet' ? Colors.success : Colors.gold }} />
              <Text className={`text-xs tracking-[1.2] font-[Jost-Medium] ${storeNetwork === 'mainnet' ? 'text-[#3ED598]' : 'text-gold'}`}>
                {storeNetwork === 'mainnet' ? 'MAINNET' : 'TESTNET'}
              </Text>
            </PressableScale>
          </View>

          {user?.stellarPublicKey && (
            <PressableScale
              className="flex-row items-center gap-[5] mt-4"
              onPress={() => {
                const baseUrl = storeNetwork === 'testnet'
                  ? 'https://stellar.expert/explorer/testnet/account'
                  : 'https://stellar.expert/explorer/public/account'
                Linking.openURL(`${baseUrl}/${user.stellarPublicKey}`)
              }}
              accessibilityRole="button"
              accessibilityLabel="View account on Stellar Expert"
            >
              <Ionicons name="open-outline" size={13} color={Colors.gold} />
              <Text className="text-xs text-gold font-medium">View on Stellar Expert</Text>
            </PressableScale>
          )}
        </View>

        {/* Testnet Banner - Only show on testnet */}
        {storeNetwork === 'testnet' && <TestnetFaucetBanner />}

        {/* Balance Card */}
        <BalanceCard
          xlmBalance={balance.xlm}
          testID="dashboard-balance-card"
        />

        {/* Quick Actions */}
        <View className="flex-row justify-between mt-8 mb-4 gap-[6]" accessibilityRole="menu">
          <QuickAction label="Send" onPress={() => router.push('/send')} testID="quick-action-send">
            <Ionicons name="arrow-up" size={21} color={Colors.gold} />
          </QuickAction>
          <QuickAction label="Receive" onPress={() => router.push('/receive')} testID="quick-action-receive">
            <Ionicons name="arrow-down" size={21} color={Colors.gold} />
          </QuickAction>
          <QuickAction label="Tap" tap onPress={() => router.push('/tap')} testID="quick-action-tap">
            <TapGlyph size={22} color={Colors.goldHi} />
          </QuickAction>
          <QuickAction label="Cash In" onPress={() => router.push('/fiat?mode=cash-in')} testID="quick-action-cashin" tint={Colors.success}>
            <Ionicons name="wallet-outline" size={21} color={Colors.success} />
          </QuickAction>
          <QuickAction label="Cash Out" onPress={() => router.push('/fiat?mode=cash-out')} testID="quick-action-cashout" tint={Colors.warning}>
            <Ionicons name="cash-outline" size={21} color={Colors.warning} />
          </QuickAction>
        </View>

        {/* My Wallets Section */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-silver tracking-[2] font-[Jost-Medium]" accessibilityRole="header">MY WALLETS</Text>
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/(tabs)/devices')
              }}
              accessibilityLabel="Manage wallets"
              accessibilityRole="button"
            >
              <Text className="text-xs text-gold tracking-[0.8] uppercase font-[Jost-Medium]">Manage</Text>
            </PressableScale>
          </View>

          {devices.length === 0 ? (
            <PressableScale
              className="bg-cardBg rounded-2xl p-8 items-center justify-center border-[1.5] border-dashed border-gold/35 min-h-[72]"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.push('/(tabs)/devices')
              }}
              accessibilityLabel="Link your first NFC wallet"
              accessibilityHint="Opens device linking screen"
            >
              <Ionicons name="add-outline" size={30} color={Colors.gold} />
              <Text className="text-sm text-gold font-medium mt-2">Link your first NFC wallet</Text>
            </PressableScale>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6"
              contentContainerClassName="px-6 gap-4"
            >
              {devices.map((device) => (
                <PressableScale
                  key={device.id}
                  className="w-[160] bg-cardBg rounded-2xl p-4 border border-borderGrey overflow-hidden"
                  style={DesignTokens.shadows.card}
                 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    router.push(`/agent/${device.id}`)
                  }}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    setRenameTarget({ id: device.id, label: device.label })
                    setRenameValue(device.label)
                  }}
                  accessibilityLabel={`${device.label}, ${(DEVICE_STATUS[device.status] ?? DEVICE_STATUS_FALLBACK).label}, ${((device.dailySpendLimitCents - device.accumulatedTodayCents) / 100).toFixed(0)} XLM remaining today`}
                  accessibilityRole="summary"
                >
                  <Image source={NOIR_MARK} className="absolute top-[-16] right-[-14] w-[70] h-[70] opacity-[0.12]" resizeMode="contain" />
                  <PressableScale
                    className="absolute top-[6] right-[6] w-[26] h-[26] rounded-full bg-[#FF5A5F]/15 items-center justify-center z-[2]"
                    onPress={() => confirmDeleteWallet(device)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={14} color={Colors.mutedWhite} />
                  </PressableScale>
                  <View className="flex-row justify-between items-start mb-4">
                    <Ionicons name="radio" size={DesignTokens.iconSize.md} color={Colors.gold} />
                    <View
                      style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: (DEVICE_STATUS[device.status] ?? DEVICE_STATUS_FALLBACK).color }}
                      accessibilityLabel={device.status}
                    />
                  </View>
                  <Text className="text-base text-cream mb-4 font-[Jost-SemiBold]" numberOfLines={1}>{device.label}</Text>
                  <Text className="text-xs text-mutedWhite tracking-[1.2] font-[Jost-Medium]">DAILY REMAINING</Text>
                  <Text className="text-xl text-gold mt-[3] tabular-nums font-[Jost-SemiBold]">
                    {((device.dailySpendLimitCents - device.accumulatedTodayCents) / 100).toFixed(0)} XLM
                  </Text>
                </PressableScale>
              ))}
              <PressableScale
                className="w-[74] bg-surfaceBg rounded-2xl border-[1.5] border-dashed border-borderGrey items-center justify-center min-h-[120]"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push('/(tabs)/devices')
                }}
                accessibilityLabel="Add new wallet"
                accessibilityRole="button"
              >
                <Ionicons name="add" size={24} color={Colors.mutedWhite} />
              </PressableScale>
            </ScrollView>
          )}
        </View>

        {/* Recent Activity Section */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-silver tracking-[2] font-[Jost-Medium]" accessibilityRole="header">RECENT ACTIVITY</Text>
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/transactions')
              }}
              accessibilityLabel="See all transactions"
              accessibilityRole="button"
            >
              <Text className="text-xs text-gold tracking-[0.8] uppercase font-[Jost-Medium]">See All</Text>
            </PressableScale>
          </View>
          {refreshing && (!Array.isArray(transactions) || transactions.length === 0) ? (
            <View className="bg-cardBg rounded-2xl border border-borderGrey px-4" style={DesignTokens.shadows.card}>
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} variant="transaction" />
              ))}
            </View>
          ) : !Array.isArray(transactions) || transactions.length === 0 ? (
            <View className="items-center justify-center py-12 bg-cardBg rounded-2xl border border-borderGrey">
              <Ionicons name="receipt-outline" size={44} color={Colors.mutedWhite} />
              <Text className="text-sm text-mutedWhite mt-4">No transactions yet</Text>
            </View>
          ) : (
<View className="bg-cardBg rounded-2xl border border-borderGrey px-4" style={DesignTokens.shadows.card}>
              {Array.isArray(transactions) && transactions.length > 0 ? transactions.slice(0, 5).map((tx, i) => (
                tx ? (
                  <ActivityRow
                    key={tx.id || `tx-${i}`}
                    tx={tx}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      } catch (_) {}
                      try {
                        router.push(`/transaction/${tx.id || 'unknown'}`)
                      } catch (_) {}
                    }}
                  />
                ) : null
              )) : null}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={renameTarget !== null} transparent animationType="fade" onRequestClose={() => setRenameTarget(null)}>
        <PressableScale className="flex-1 bg-black/70 justify-center items-center p-6" onPress={() => setRenameTarget(null)}>
          <View className="w-full max-w-[320] bg-cardBg rounded-3xl p-6 border border-borderGrey" onStartShouldSetResponder={() => true}>
            <Text className="text-xl text-white font-bold mb-4">Rename Wallet</Text>
            <TextInput
              ref={renameInputRef}
              className="bg-midGrey rounded-xl px-4 py-[10] text-base text-white border border-borderGrey"
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Wallet name"
              placeholderTextColor={Colors.mutedWhite}
              autoFocus
              maxLength={32}
            />
            <View className="flex-row gap-4 mt-4">
              <PressableScale className="flex-1 py-[10] rounded-xl border border-borderGrey items-center" onPress={() => setRenameTarget(null)}>
                <Text className="text-base text-mutedWhite font-semibold">Cancel</Text>
              </PressableScale>
              <PressableScale
                className={`flex-[2] py-[10] rounded-xl items-center ${!renameValue.trim() ? 'bg-[#2C2C2C]' : 'bg-gold'}`}
                disabled={!renameValue.trim()}
                onPress={handleRename}
              >
                <Text className="text-base text-black font-bold">Rename</Text>
              </PressableScale>
            </View>
          </View>
        </PressableScale>
      </Modal>
    </SafeAreaView>
  )
}

interface QuickActionProps {
  children: ReactNode
  label: string
  onPress: () => void
  tap?: boolean
  tint?: string
  testID?: string
}

const QuickAction = memo(function QuickAction({ children, label, onPress, tap, tint, testID }: QuickActionProps) {
  return (
    <PressableScale
      className="items-center flex-1"
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      testID={testID}
    >
      <View className={`w-[54] h-[54] rounded-full items-center justify-center border border-borderGrey bg-cardBg mb-2 overflow-hidden ${tap ? 'border-[#D4A964]/45' : ''}`}>
        {tap && <SignalRipple size={54} color={Colors.gold} rings={2} />}
        {children}
      </View>
      <Text className="text-xs text-[#F5F5F5] tracking-[0.6] uppercase font-[Jost-Medium]">{label}</Text>
    </PressableScale>
  )
})

const ActivityRow = memo(function ActivityRow({ tx, onPress }: { tx: Transaction; onPress: () => void }) {
  if (!tx || typeof tx !== 'object') return null
  const assetCode = tx.assetCode || 'XLM'
  const isIncoming = tx.merchantName === 'NFC Receive' || tx.merchantName === 'NFC Payment'
  const amountStr = `${((tx.amountCents ?? 0) / 100).toFixed(2)} ${assetCode}`
  const statusStr = tx.status || 'failed'
  const statusLabel = statusStr.charAt(0).toUpperCase() + statusStr.slice(1)
  const createdAt = tx.createdAt || new Date().toISOString()
  const time = new Date(createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  const accent = isIncoming ? Colors.success : Colors.danger

  return (
    <PressableScale
      className="flex-row items-center py-4 border-b border-surfaceBg min-h-[56]"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${tx.merchantName}, ${isIncoming ? 'received' : 'sent'} ${amountStr}, ${statusLabel}`}
      accessibilityHint="Tap to view details"
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colorWithOpacity(accent, 0.13) }}>
        <Ionicons name={isIncoming ? 'arrow-down' : 'arrow-up'} size={17} color={accent} />
      </View>
      <View className="flex-1 ml-4 mr-2">
        <Text className="text-base text-white font-semibold" numberOfLines={1}>{tx.merchantName}</Text>
        <Text className="text-xs text-mutedWhite mt-[3] font-mono" numberOfLines={1}>{time} · {statusLabel}</Text>
      </View>
      <Text style={{ fontFamily: 'Jost-SemiBold', fontSize: 16, fontVariant: ['tabular-nums'], color: accent }}>
        {isIncoming ? '+' : '−'}{amountStr}
      </Text>
    </PressableScale>
  )
})
