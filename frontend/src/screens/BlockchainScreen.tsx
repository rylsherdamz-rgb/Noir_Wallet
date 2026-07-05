import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Card } from '@/components/Card'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/store/useAppStore'
import { AppConfig } from '@/constants/config'
import { apiService } from '@/services/api'
import { stellarService } from '@/services/stellar'
import { fxRateService } from '@/services/fxRates'

export function BlockchainScreen() {
  const { user, balance, network, setNetwork, transactions, setTransactions, setBalance } = useAppStore()
  const [refreshing, setRefreshing] = useState(false)
  const [funding, setFunding] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })

  const pubKey = user?.stellarPublicKey || 'G...'
  const contractAddr = AppConfig.stellar.deviceRegistryContract || 'Not deployed'
  const recentTx = transactions.slice(0, 3)

  const refreshBalances = useCallback(async () => {
    if (!user?.stellarPublicKey) return
    const onChain = await stellarService.getBalance(user.stellarPublicKey)
    const rates = await fxRateService.getRates()
    setBalance({
      xlm: onChain.xlm,
      usdc: onChain.usdc,
      php: onChain.usdc * rates.usdToPhp,
      localTokens: {},
    })
  }, [user?.stellarPublicKey, setBalance])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const txRes = await apiService.getTransactions()
      if (txRes?.transactions) setTransactions(txRes.transactions)
    } catch {
      // backend unavailable
    }
    await refreshBalances()
    setRefreshing(false)
  }, [refreshBalances, setTransactions])

  const copyAddr = async (addr: string) => {
    await Clipboard.setStringAsync(addr)
    setToast({ visible: true, type: 'success', title: 'Copied', message: 'Address copied to clipboard' })
  }

  const handleFund = useCallback(async () => {
    if (!user?.stellarPublicKey) return
    setFunding(true)
    const success = await stellarService.fundTestnetAccount(user.stellarPublicKey)
    if (success) {
      setToast({ visible: true, type: 'success', title: 'Funded!', message: '10,000 XLM sent to your wallet' })
      await refreshBalances()
    } else {
      setToast({ visible: true, type: 'info', title: 'Failed', message: 'Friendbot request failed. Are you on testnet?' })
    }
    setFunding(false)
  }, [user?.stellarPublicKey, refreshBalances])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <NoirLogo variant="mark" size={24} />
        <Text style={styles.headerTitle}>Blockchain</Text>
        <TouchableOpacity
          onPress={() => setNetwork(network === 'testnet' ? 'mainnet' : 'testnet')}
          style={styles.netBtn}
        >
          <View style={[styles.netDot, { backgroundColor: network === 'testnet' ? Colors.warning : Colors.success }]} />
          <Text style={styles.netText}>{network === 'testnet' ? 'TESTNET' : 'MAINNET'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        {/* Wallet */}
        <Text style={styles.sectionTitle}>Wallet</Text>
        <Card style={styles.card}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={22} color={Colors.gold} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Stellar Address</Text>
              <TouchableOpacity onPress={() => copyAddr(pubKey)} style={styles.addrRow}>
                <Text style={styles.addrText} numberOfLines={1}>{pubKey}</Text>
                <Ionicons name="copy-outline" size={14} color={Colors.gold} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.balances}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>XLM</Text>
              <Text style={styles.balanceValue}>{balance.xlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>USDC</Text>
              <Text style={styles.balanceValue}>{balance.usdc.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>

          {network === 'testnet' && (
            <TouchableOpacity
              style={styles.fundBtn}
              onPress={handleFund}
              disabled={funding}
              activeOpacity={0.7}
            >
              <Ionicons name="water-outline" size={18} color={Colors.black} />
              <Text style={styles.fundBtnLabel}>{funding ? 'Funding...' : 'Fund with Testnet XLM'}</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Smart Contract */}
        <Text style={styles.sectionTitle}>Device Registry Contract</Text>
        <Card style={styles.card}>
          <View style={styles.contractRow}>
            <Ionicons name="code-slash-outline" size={20} color={Colors.mutedWhite} />
            <View style={styles.contractInfo}>
              <Text style={styles.contractLabel}>DeviceRegistry</Text>
              <Text style={styles.contractAddr}>{contractAddr.slice(0, 8)}...{contractAddr.slice(-8)}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.mutedWhite} />
          </View>
          <View style={styles.contractStatus}>
            <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.statusText}>Deployed & Verified</Text>
          </View>
        </Card>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.card}>
          {recentTx.length === 0 ? (
            <Text style={styles.emptyTx}>No recent transactions</Text>
          ) : (
            recentTx.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txIcon}>
                  <Ionicons name="swap-horizontal" size={18} color={Colors.gold} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txType}>{tx.merchantName}</Text>
                  <Text style={styles.txTime}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.txAmount}>-{(tx.amountCents / 100).toFixed(2)} {tx.assetCode}</Text>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>View All Transactions</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <Toast visible={toast.visible} type={toast.type} title={toast.title} message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  netBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, backgroundColor: Colors.lightGrey },
  netDot: { width: 6, height: 6, borderRadius: 3 },
  netText: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontWeight: FontWeight.bold },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  sectionTitle: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.md },
  card: { marginBottom: Spacing.md },
  walletHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', marginBottom: Spacing.md },
  walletIcon: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.gold + '15', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.gold + '25' },
  walletInfo: { flex: 1 },
  walletLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 2 },
  addrText: { fontSize: FontSize.sm, color: Colors.white, fontFamily: 'monospace' },
  balances: { gap: Spacing.sm },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderGrey },
  balanceLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontWeight: FontWeight.medium },
  balanceValue: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.bold },
  contractRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  contractInfo: { flex: 1 },
  contractLabel: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  contractAddr: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontFamily: 'monospace', marginTop: 1 },
  contractStatus: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderGrey },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: FontSize.xs, color: Colors.success },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderGrey, gap: Spacing.md },
  txIcon: { width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: Colors.gold + '10', alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txType: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  txTime: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 1 },
  txAmount: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.bold },
  viewAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
  viewAllText: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.medium },
  emptyTx: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.lg },
  fundBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    marginTop: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold, minHeight: 44,
  },
  fundBtnLabel: { fontSize: FontSize.sm, color: Colors.black, fontWeight: FontWeight.bold },
})
