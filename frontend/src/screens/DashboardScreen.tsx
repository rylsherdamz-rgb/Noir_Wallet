import { memo, useCallback, useState, ReactNode, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, Linking, Image, TextInput, Modal, Alert } from 'react-native'
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
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
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
        <View style={styles.brandBar}>
          <View style={styles.lockup}>
            <Image source={NOIR_MARK} style={styles.markImg} resizeMode="contain" />
            <Text style={styles.wordmark}>NOIR</Text>
          </View>
          <PressableScale
            style={styles.avatarBtn}
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
        <View style={styles.greetBlock}>
          <Text style={styles.greeting} accessibilityRole="header">
            {greetingForHour()}
          </Text>
          <View style={styles.subRow}>
            <PressableScale
              style={styles.addrChip}
              onPress={copyAddress}
              accessibilityRole="button"
              accessibilityLabel={`Wallet address: ${user?.stellarPublicKey || 'No wallet'}. Tap to copy`}
            >
              <Ionicons name="wallet-outline" size={12} color={Colors.gold} />
              <Text style={styles.addrText}>
                {user?.stellarPublicKey
                  ? `${user.stellarPublicKey.slice(0, 6)}…${user.stellarPublicKey.slice(-4)}`
                  : 'No wallet'}
              </Text>
              {user?.stellarPublicKey && (
                <Ionicons name="copy-outline" size={12} color={Colors.mutedWhite} />
              )}
            </PressableScale>

            <PressableScale
              style={[styles.networkBadge, storeNetwork === 'mainnet' && styles.networkBadgeMainnet]}
              onPress={handleNetworkSwitch}
              accessibilityRole="button"
              accessibilityLabel={`Current network: ${storeNetwork}. Tap to switch`}
            >
              <View style={[styles.networkDot, storeNetwork === 'mainnet' && styles.networkDotMainnet]} />
              <Text style={[styles.networkText, storeNetwork === 'mainnet' && styles.networkTextMainnet]}>
                {storeNetwork === 'mainnet' ? 'MAINNET' : 'TESTNET'}
              </Text>
            </PressableScale>
          </View>

          {user?.stellarPublicKey && (
            <PressableScale
              style={styles.expertLink}
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
              <Text style={styles.expertLinkText}>View on Stellar Expert</Text>
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
        <View style={styles.quickActions} accessibilityRole="menu">
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">MY WALLETS</Text>
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/(tabs)/devices')
              }}
              accessibilityLabel="Manage wallets"
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>Manage</Text>
            </PressableScale>
          </View>

          {devices.length === 0 ? (
            <PressableScale
              style={styles.emptyWalletCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.push('/(tabs)/devices')
              }}
              accessibilityLabel="Link your first NFC wallet"
              accessibilityHint="Opens device linking screen"
            >
              <Ionicons name="add-outline" size={30} color={Colors.gold} />
              <Text style={styles.emptyWalletText}>Link your first NFC wallet</Text>
            </PressableScale>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.walletScroll}
              contentContainerStyle={styles.walletScrollContent}
            >
              {devices.map((device) => (
                <PressableScale
                  key={device.id}
                  style={styles.walletCard}
                 
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
                  <Image source={NOIR_MARK} style={styles.walletWatermark} resizeMode="contain" />
                  <PressableScale
                    style={styles.walletMoreBtn}
                    onPress={() => confirmDeleteWallet(device)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={14} color={Colors.mutedWhite} />
                  </PressableScale>
                  <View style={styles.walletCardHeader}>
                    <Ionicons name="radio" size={DesignTokens.iconSize.md} color={Colors.gold} />
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: (DEVICE_STATUS[device.status] ?? DEVICE_STATUS_FALLBACK).color },
                      ]}
                      accessibilityLabel={device.status}
                    />
                  </View>
                  <Text style={styles.walletLabelText} numberOfLines={1}>{device.label}</Text>
                  <Text style={styles.walletRemainingLabel}>DAILY REMAINING</Text>
                  <Text style={styles.walletRemainingValue}>
                    {((device.dailySpendLimitCents - device.accumulatedTodayCents) / 100).toFixed(0)} XLM
                  </Text>
                </PressableScale>
              ))}
              <PressableScale
                style={styles.addWalletCard}
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">RECENT ACTIVITY</Text>
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/transactions')
              }}
              accessibilityLabel="See all transactions"
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>See All</Text>
            </PressableScale>
          </View>
          {refreshing && (!Array.isArray(transactions) || transactions.length === 0) ? (
            <View style={styles.activityList}>
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} variant="transaction" />
              ))}
            </View>
          ) : !Array.isArray(transactions) || transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={44} color={Colors.mutedWhite} />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
<View style={styles.activityList}>
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
        <PressableScale style={styles.renameOverlay} onPress={() => setRenameTarget(null)}>
          <View style={styles.renameCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.renameTitle}>Rename Wallet</Text>
            <TextInput
              ref={renameInputRef}
              style={styles.renameInput}
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Wallet name"
              placeholderTextColor={Colors.mutedWhite}
              autoFocus
              maxLength={32}
            />
            <View style={styles.renameActions}>
              <PressableScale style={styles.renameCancel} onPress={() => setRenameTarget(null)}>
                <Text style={styles.renameCancelText}>Cancel</Text>
              </PressableScale>
              <PressableScale
                style={[styles.renameConfirm, !renameValue.trim() && styles.renameDisabled]}
                disabled={!renameValue.trim()}
                onPress={handleRename}
              >
                <Text style={styles.renameConfirmText}>Rename</Text>
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
      style={styles.qbtn}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      testID={testID}
    >
      <View style={[styles.disc, tap && styles.discTap]}>
        {tap && <SignalRipple size={54} color={Colors.gold} rings={2} />}
        {children}
      </View>
      <Text style={styles.qlabel}>{label}</Text>
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
      style={styles.txRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${tx.merchantName}, ${isIncoming ? 'received' : 'sent'} ${amountStr}, ${statusLabel}`}
      accessibilityHint="Tap to view details"
    >
      <View style={[styles.txIcon, { backgroundColor: colorWithOpacity(accent, 0.13) }]}>
        <Ionicons name={isIncoming ? 'arrow-down' : 'arrow-up'} size={17} color={accent} />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle} numberOfLines={1}>{tx.merchantName}</Text>
        <Text style={styles.txMeta} numberOfLines={1}>{time} · {statusLabel}</Text>
      </View>
      <Text style={[styles.txAmount, { color: accent }]}>
        {isIncoming ? '+' : '−'}{amountStr}
      </Text>
    </PressableScale>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 24,
  },

  // Brand bar
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  markImg: {
    width: 26,
    height: 27,
  },
  wordmark: {
    fontFamily: Fonts.display,
    fontSize: FontSize.md,
    color: Colors.cream,
    letterSpacing: 5,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colorWithOpacity(Colors.gold, 0.5),
  },

  // Greeting
  greetBlock: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: Fonts.display,
    fontSize: FontSize.xl,
    color: Colors.cream,
    letterSpacing: 0.2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addrChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E0E0E',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addrText: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.xs,
    color: Colors.silver,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    backgroundColor: colorWithOpacity(Colors.gold, 0.1),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colorWithOpacity(Colors.gold, 0.32),
  },
  networkBadgeMainnet: {
    backgroundColor: colorWithOpacity(Colors.success, 0.12),
    borderColor: colorWithOpacity(Colors.success, 0.32),
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold,
  },
  networkDotMainnet: {
    backgroundColor: Colors.success,
  },
  networkText: {
    fontFamily: Fonts.displayMd,
    fontSize: FontSize.xs,
    color: Colors.gold,
    letterSpacing: 1.2,
  },
  networkTextMainnet: {
    color: Colors.success,
  },
  expertLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.md,
  },
  expertLinkText: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    gap: 6,
  },
  qbtn: {
    alignItems: 'center',
    flex: 1,
  },
  disc: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    backgroundColor: '#141414',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  discTap: {
    borderColor: colorWithOpacity(Colors.goldHi, 0.45),
  },
  qlabel: {
    fontFamily: Fonts.displayMd,
    fontSize: FontSize.xs,
    color: Colors.offWhite,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Sections
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.displayMd,
    fontSize: FontSize.sm,
    color: Colors.silver,
    letterSpacing: 2,
  },
  seeAll: {
    fontFamily: Fonts.displayMd,
    fontSize: FontSize.xs,
    color: Colors.gold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Wallet Cards
  walletScroll: {
    marginHorizontal: -Spacing.lg,
  },
  walletScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  walletCard: {
    width: 160,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    overflow: 'hidden',
    ...DesignTokens.shadows.card,
  },
  walletWatermark: {
    position: 'absolute',
    width: 70,
    height: 70,
    top: -16,
    right: -14,
    opacity: 0.12,
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  walletLabelText: {
    fontFamily: Fonts.display,
    fontSize: FontSize.md,
    color: Colors.cream,
    marginBottom: Spacing.md,
  },
  walletRemainingLabel: {
    fontFamily: Fonts.displayMd,
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    letterSpacing: 1.2,
  },
  walletRemainingValue: {
    fontFamily: Fonts.display,
    fontSize: FontSize.lg,
    color: Colors.gold,
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  addWalletCard: {
    width: 74,
    backgroundColor: Colors.surfaceBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderGrey,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyWalletCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colorWithOpacity(Colors.gold, 0.35),
    minHeight: DesignTokens.touchTarget.large,
  },
  emptyWalletText: {
    color: Colors.gold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },

  // Recent Activity
  activityList: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.md,
    ...DesignTokens.shadows.card,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBg,
    minHeight: DesignTokens.touchTarget.comfortable,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  txTitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  txMeta: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 3,
  },
  txAmount: {
    fontFamily: Fonts.display,
    fontSize: FontSize.md,
    fontVariant: ['tabular-nums'],
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  emptyStateText: {
    color: Colors.mutedWhite,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },

  // Wallet card extras
  walletMoreBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colorWithOpacity(Colors.danger, 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  // Rename Modal
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  renameCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  renameTitle: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  renameInput: {
    backgroundColor: Colors.midGrey,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  renameActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  renameCancel: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    alignItems: 'center',
  },
  renameCancelText: {
    fontSize: FontSize.md,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.semibold,
  },
  renameConfirm: {
    flex: 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold,
    alignItems: 'center',
  },
  renameConfirmText: {
    fontSize: FontSize.md,
    color: Colors.black,
    fontWeight: FontWeight.bold,
  },
  renameDisabled: {
    backgroundColor: Colors.lightGrey,
  },
})
