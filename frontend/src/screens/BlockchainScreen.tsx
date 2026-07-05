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
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/store/useAppStore'
import { AppConfig } from '@/constants/config'
import { apiService } from '@/services/api'

export function BlockchainScreen() {
  const { user, balance, network, setNetwork, transactions, setTransactions, setBalance } = useAppStore()
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })

  const pubKey = user?.stellarPublicKey || 'G...'
  const contractAddr = AppConfig.stellar.deviceRegistryContract || 'Not deployed'
  const recentTx = transactions.slice(0, 3)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const [txRes, balanceRes] = await Promise.all([
        apiService.getTransactions(),
        apiService.getBalance(),
      ])
      if (txRes?.transactions) setTransactions(txRes.transactions)
      if (balanceRes?.balance) setBalance(balanceRes.balance)
    } catch {
      // Store retains last known data
    } finally {
      setRefreshing(false)
    }
  }, [setTransactions, setBalance])

  const copyAddr = async (addr: string) => {
    await Clipboard.setStringAsync(addr)
    setToast({ visible: true, type: 'success', title: 'Copied', message: 'Address copied to clipboard' })
  }

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
        {/* Main Wallet */}
        <Text style={styles.sectionTitle}>Main Wallet</Text>
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
              <Text style={styles.balanceLabel}>USDC</Text>
              <Text style={styles.balanceValue}>{balance.usdc.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>XLM</Text>
              <Text style={styles.balanceValue}>{balance.xlm.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>PHP</Text>
              <Text style={styles.balanceValue}>₱{balance.php.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        {/* x402 Agent Wallet */}
        <Text style={styles.sectionTitle}>x402 Agent Wallet</Text>
        <Card style={[styles.card, styles.agentCard]}>
          <View style={styles.walletHeader}>
            <View style={[styles.walletIcon, { backgroundColor: Colors.gold + '20' }]}>
              <Ionicons name="sparkles" size={22} color={Colors.gold} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Stellar Address</Text>
              <TouchableOpacity onPress={() => copyAddr(pubKey)} style={styles.addrRow}>
                <Text style={styles.addrText} numberOfLines={1}>{pubKey}</Text>
                <Ionicons name="copy-outline" size={14} color={Colors.gold} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.agentActions}>
            <TouchableOpacity style={styles.agentBtn} activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.gold} />
              <Text style={styles.agentBtnLabel}>Fund</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.agentBtn} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={18} color={Colors.gold} />
              <Text style={styles.agentBtnLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
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

        {/* Recent On-Chain Activity */}
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
  agentCard: { borderColor: Colors.gold + '40' },
  agentStats: { flexDirection: 'row', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderGrey, marginTop: Spacing.sm },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.md, color: Colors.gold, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.borderGrey },
  agentActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderGrey },
  agentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.gold + '30', backgroundColor: Colors.gold + '08' },
  agentBtnLabel: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.semibold },
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
})
