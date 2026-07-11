import { useCallback, useState, ReactNode } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { BalanceCard } from '@/components/BalanceCard'
import { TestnetFaucetBanner } from '@/components/TestnetFaucetBanner'
import { PressableScale } from '@/components/brand/PressableScale'
import { SignalRipple } from '@/components/brand/SignalRipple'
import { TapGlyph } from '@/components/brand/BrandGlyph'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { apiService } from '@/services/api'
import { stellarService } from '@/services/stellar-service'
import { fxRateService } from '@/services/fxRates'
import { Transaction } from '@/types'

const NOIR_MARK = require('../../assets/noir-mark.png')

function greetingForHour(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardScreen() {
  const router = useRouter()
  const { user, balance, devices, transactions, setTransactions, setBalance, network: storeNetwork, setNetwork: setStoreNetwork } = useAppStore()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    try {
      const txRes = await apiService.getTransactions()
      if (txRes?.transactions) setTransactions(txRes.transactions)
    } catch {
      // backend unavailable
    }

    if (user?.stellarPublicKey) {
      try {
        const onChain = await stellarService.getBalance(user.stellarPublicKey)
        const rates = await fxRateService.getRates()
        setBalance({
          xlm: onChain.xlm,
          usdc: onChain.usdc,
          php: onChain.usdc * rates.usdToPhp,
          localTokens: {},
        })
      } catch {
        // horizon unavailable
      }
    }

    setRefreshing(false)
  }, [setTransactions, setBalance, user?.stellarPublicKey])

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

  const displayName = user?.displayName || user?.email?.split('@')[0] || ''

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push('/profile')
            }}
            accessibilityLabel="View profile"
            accessibilityRole="button"
          >
            <Ionicons name="person-outline" size={20} color={Colors.cream} />
          </TouchableOpacity>
        </View>

        {/* Greeting + wallet identity */}
        <View style={styles.greetBlock}>
          <Text style={styles.greeting} accessibilityRole="header">
            {greetingForHour()}{displayName ? `, ${displayName}` : ''}
          </Text>
          <View style={styles.subRow}>
            <TouchableOpacity
              style={styles.addrChip}
              onPress={copyAddress}
              accessibilityRole="button"
              accessibilityLabel={`Wallet address: ${user?.stellarPublicKey || 'No wallet'}. Tap to copy`}
            >
              <Text style={styles.addrText}>
                {user?.stellarPublicKey
                  ? `${user.stellarPublicKey.slice(0, 6)}…${user.stellarPublicKey.slice(-4)}`
                  : 'No wallet'}
              </Text>
              {user?.stellarPublicKey && (
                <Ionicons name="copy-outline" size={12} color={Colors.mutedWhite} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.networkBadge, storeNetwork === 'mainnet' && styles.networkBadgeMainnet]}
              onPress={handleNetworkSwitch}
              accessibilityRole="button"
              accessibilityLabel={`Current network: ${storeNetwork}. Tap to switch`}
            >
              <View style={[styles.networkDot, storeNetwork === 'mainnet' && styles.networkDotMainnet]} />
              <Text style={[styles.networkText, storeNetwork === 'mainnet' && styles.networkTextMainnet]}>
                {storeNetwork === 'mainnet' ? 'MAINNET' : 'TESTNET'}
              </Text>
            </TouchableOpacity>
          </View>

          {user?.stellarPublicKey && (
            <TouchableOpacity
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
            </TouchableOpacity>
          )}
        </View>

        {/* Testnet Banner - Only show on testnet */}
        {storeNetwork === 'testnet' && <TestnetFaucetBanner />}

        {/* Balance Card */}
        <BalanceCard
          phpBalance={balance.php}
          usdcBalance={balance.usdc}
          xlmBalance={balance.xlm}
          localTokens={balance.localTokens}
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
          <QuickAction label="Cash In" onPress={() => router.push('/fiat')} testID="quick-action-cashin" tint={Colors.success}>
            <Ionicons name="wallet-outline" size={21} color={Colors.success} />
          </QuickAction>
          <QuickAction label="Cash Out" onPress={() => router.push('/fiat')} testID="quick-action-cashout" tint={Colors.warning}>
            <Ionicons name="cash-outline" size={21} color={Colors.warning} />
          </QuickAction>
        </View>

        {/* My Wallets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">MY WALLETS</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/(tabs)/devices')
              }}
              accessibilityLabel="Manage wallets"
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>Manage</Text>
            </TouchableOpacity>
          </View>

          {devices.length === 0 ? (
            <TouchableOpacity
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
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.walletScroll}
              contentContainerStyle={styles.walletScrollContent}
            >
              {devices.map((device) => (
                <View
                  key={device.id}
                  style={styles.walletCard}
                  accessibilityLabel={`${device.label}, ${device.status === 'active' ? 'Active' : 'Inactive'}, ${((device.dailySpendLimitCents - device.accumulatedTodayCents) / 100).toFixed(0)} pesos remaining today`}
                  accessibilityRole="summary"
                >
                  <Image source={NOIR_MARK} style={styles.walletWatermark} resizeMode="contain" />
                  <View style={styles.walletCardHeader}>
                    <Ionicons name="radio" size={DesignTokens.iconSize.md} color={Colors.gold} />
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: device.status === 'active' ? Colors.success : Colors.danger },
                      ]}
                      accessibilityLabel={device.status}
                    />
                  </View>
                  <Text style={styles.walletLabelText} numberOfLines={1}>{device.label}</Text>
                  <Text style={styles.walletRemainingLabel}>DAILY REMAINING</Text>
                  <Text style={styles.walletRemainingValue}>
                    ₱{((device.dailySpendLimitCents - device.accumulatedTodayCents) / 100).toFixed(0)}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addWalletCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push('/(tabs)/devices')
                }}
                accessibilityLabel="Add new wallet"
                accessibilityRole="button"
              >
                <Ionicons name="add" size={24} color={Colors.mutedWhite} />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">RECENT ACTIVITY</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push('/transactions')
              }}
              accessibilityLabel="See all transactions"
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={44} color={Colors.mutedWhite} />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {transactions.slice(0, 5).map((tx) => (
                <ActivityRow
                  key={tx.id}
                  tx={tx}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    router.push(`/transaction/${tx.id}`)
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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

function QuickAction({ children, label, onPress, tap, tint, testID }: QuickActionProps) {
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
}

function ActivityRow({ tx, onPress }: { tx: Transaction; onPress: () => void }) {
  const isOutgoing = tx.assetCode !== 'PHP'
  const amountStr =
    tx.assetCode === 'PHP'
      ? `₱${(tx.amountCents / 100).toFixed(2)}`
      : `${(tx.amountCents / 100).toFixed(2)} ${tx.assetCode}`
  const statusLabel = tx.status.charAt(0).toUpperCase() + tx.status.slice(1)
  const time = new Date(tx.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  const accent = isOutgoing ? Colors.cream : Colors.success

  return (
    <TouchableOpacity
      style={styles.txRow}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${tx.merchantName}, ${isOutgoing ? 'sent' : 'received'} ${amountStr}, ${statusLabel}`}
      accessibilityHint="Tap to view details"
    >
      <View style={[styles.txIcon, { backgroundColor: colorWithOpacity(accent, 0.13) }]}>
        <Ionicons name={isOutgoing ? 'arrow-up' : 'arrow-down'} size={17} color={accent} />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle} numberOfLines={1}>{tx.merchantName}</Text>
        <Text style={styles.txMeta} numberOfLines={1}>{time} · {statusLabel}</Text>
      </View>
      <Text style={[styles.txAmount, { color: accent }]}>
        {isOutgoing ? '−' : '+'}{amountStr}
      </Text>
    </TouchableOpacity>
  )
}

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
    paddingBottom: Spacing.xxl,
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
    fontSize: 15,
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
    fontSize: 22,
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
    fontSize: 12,
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
    fontSize: 10,
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
  },
  discTap: {
    borderColor: colorWithOpacity(Colors.goldHi, 0.45),
  },
  qlabel: {
    fontFamily: Fonts.displayMd,
    fontSize: 10,
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
    fontSize: 9.5,
    color: Colors.mutedWhite,
    letterSpacing: 1.2,
  },
  walletRemainingValue: {
    fontFamily: Fonts.display,
    fontSize: 19,
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
    fontSize: 11.5,
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
})
