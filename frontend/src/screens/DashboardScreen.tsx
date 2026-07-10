import { useCallback, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionItem } from '@/components/TransactionItem'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { TestnetFaucetBanner } from '@/components/TestnetFaucetBanner'
import { apiService } from '@/services/api'
import { stellarService } from '@/services/stellar-service'
import { fxRateService } from '@/services/fxRates'

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
        {/* Header with Network Switcher */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting} accessibilityRole="header">
              Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </Text>
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel} accessibilityLabel={`Wallet address: ${user?.stellarPublicKey || 'No wallet'}`}>
                {user?.stellarPublicKey
                  ? `${user.stellarPublicKey.slice(0, 8)}...${user.stellarPublicKey.slice(-4)}`
                  : 'No wallet'}
              </Text>
              {/* Network Badge */}
              <TouchableOpacity
                style={[
                  styles.networkBadge,
                  storeNetwork === 'mainnet' && styles.networkBadgeMainnet,
                ]}
                onPress={handleNetworkSwitch}
                accessibilityRole="button"
                accessibilityLabel={`Current network: ${storeNetwork}. Tap to switch`}
              >
                <View style={[
                  styles.networkDot,
                  storeNetwork === 'mainnet' && styles.networkDotMainnet,
                ]} />
                <Text style={[
                  styles.networkText,
                  storeNetwork === 'mainnet' && styles.networkTextMainnet,
                ]}>
                  {storeNetwork === 'mainnet' ? 'MAINNET' : 'TESTNET'}
                </Text>
              </TouchableOpacity>
            </View>
            {/* Stellar Expert Link */}
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
                <Ionicons name="open-outline" size={14} color={Colors.gold} />
                <Text style={styles.expertLinkText}>View on Stellar Expert</Text>
              </TouchableOpacity>
            )}
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
            <Ionicons name="person-outline" size={22} color={Colors.cream} />
          </TouchableOpacity>
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

        {/* Quick Actions - Updated with Cash In/Cash Out */}
        <View style={styles.quickActions} accessibilityRole="menu">
          <ActionButton
            icon="arrow-up-outline"
            label="Send"
            onPress={() => router.push('/send')}
            testID="quick-action-send"
          />
          <ActionButton
            icon="arrow-down-outline"
            label="Receive"
            onPress={() => router.push('/receive')}
            testID="quick-action-receive"
          />
          <ActionButton
            icon="wallet-outline"
            label="Cash In"
            onPress={() => router.push('/fiat')} // Navigate to fiat on/off ramp
            testID="quick-action-cashin"
            color={Colors.success}
          />
          <ActionButton
            icon="cash-outline"
            label="Cash Out"
            onPress={() => router.push('/fiat')} // Navigate to fiat on/off ramp
            testID="quick-action-cashout"
            color={Colors.warning}
          />
        </View>

        {/* My Wallets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              My Wallets
            </Text>
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
              <Ionicons name="add-outline" size={32} color={Colors.gold} />
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
                  <Text style={styles.walletLabelText} numberOfLines={1}>
                    {device.label}
                  </Text>
                  <Text style={styles.walletRemainingLabel}>Daily Remaining</Text>
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
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Recent Activity
            </Text>
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
              <Ionicons name="receipt-outline" size={48} color={Colors.mutedWhite} />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  color?: string
  testID?: string
}

function ActionButton({ icon, label, onPress, color = Colors.gold, testID }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={styles.actionBtn}
      activeOpacity={0.7}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      accessibilityLabel={label}
      accessibilityRole="button"
      testID={testID}
    >
      <View style={[styles.actionIcon, { backgroundColor: colorWithOpacity(color, 0.15) }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSize.xl,
    color: Colors.cream,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xl * DesignTokens.typography.lineHeight.tight,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  walletLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: 'monospace',
  },
  expertLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    paddingVertical: 2,
  },
  expertLinkText: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
    textDecorationLine: 'underline',
  },
  
  // Network Switcher
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: colorWithOpacity(Colors.warning, 0.15),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colorWithOpacity(Colors.warning, 0.3),
  },
  networkBadgeMainnet: {
    backgroundColor: colorWithOpacity(Colors.success, 0.15),
    borderColor: colorWithOpacity(Colors.success, 0.3),
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.warning,
  },
  networkDotMainnet: {
    backgroundColor: Colors.success,
  },
  networkText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    letterSpacing: 0.5,
  },
  networkTextMainnet: {
    color: Colors.success,
  },
  
  avatarBtn: {
    width: DesignTokens.touchTarget.minimum,
    height: DesignTokens.touchTarget.minimum,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
    minHeight: DesignTokens.touchTarget.comfortable,
    justifyContent: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSize.xs,
    color: Colors.offWhite,
    fontWeight: FontWeight.medium,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    color: Colors.cream,
    fontWeight: FontWeight.bold,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
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
    ...DesignTokens.shadows.card,
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
    fontSize: FontSize.md,
    color: Colors.cream,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  walletRemainingLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    textTransform: 'uppercase',
    letterSpacing: DesignTokens.typography.letterSpacing.wide,
  },
  walletRemainingValue: {
    fontSize: FontSize.lg,
    color: Colors.gold,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  addWalletCard: {
    width: 80,
    backgroundColor: Colors.surfaceBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
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
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gold + '40',
    minHeight: DesignTokens.touchTarget.large,
  },
  emptyWalletText: {
    color: Colors.gold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateText: {
    color: Colors.mutedWhite,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },
})
