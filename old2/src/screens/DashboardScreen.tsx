import { useCallback, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionItem } from '@/components/TransactionItem'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Transaction } from '@/types'

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', stellarTxHash: 'a1b2c3d4e5f6g7h8i9j0', merchantId: 'm1', merchantName: '7-Eleven', userId: 'u1', deviceId: 'd1', amountCents: 4500, assetCode: 'USDC', status: 'confirmed', errorMessage: null, createdAt: new Date().toISOString() },
  { id: '2', stellarTxHash: 'b2c3d4e5f6g7h8i9j0k1', merchantId: 'm2', merchantName: 'Angkas', userId: 'u1', deviceId: 'd1', amountCents: 15000, assetCode: 'PHP', status: 'confirmed', errorMessage: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', stellarTxHash: null, merchantId: 'm3', merchantName: 'Jollibee', userId: 'u1', deviceId: 'd2', amountCents: 8900, assetCode: 'USDC', status: 'pending', errorMessage: null, createdAt: new Date(Date.now() - 600000).toISOString() },
]

export function DashboardScreen() {
  const router = useRouter()
  const { user, balance, devices } = useAppStore()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setRefreshing(false)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </Text>
            <Text style={styles.walletLabel}>
              {user?.stellarPublicKey ? `${user.stellarPublicKey.slice(0, 8)}...${user.stellarPublicKey.slice(-4)}` : 'No wallet'}
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={22} color={Colors.cream} />
          </TouchableOpacity>
        </View>

        <BalanceCard
          phpBalance={balance.php}
          usdcBalance={balance.usdc}
          xlmBalance={balance.xlm}
          localTokens={balance.localTokens}
        />

        <View style={styles.quickActions}>
          <ActionButton icon="arrow-up-outline" label="Send" onPress={() => router.push('/send')} />
          <ActionButton icon="arrow-down-outline" label="Receive" onPress={() => router.push('/receive')} />
          <ActionButton icon="radio-outline" label="Link Device" onPress={() => router.push('/(tabs)/devices')} />
          <ActionButton icon="receipt-outline" label="History" onPress={() => router.push('/transactions')} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Wallets</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAll}>Manage</Text>
            </TouchableOpacity>
          </View>
          {devices.length === 0 ? (
            <TouchableOpacity style={styles.emptyWalletCard}>
              <Ionicons name="add-outline" size={32} color={Colors.gold} />
              <Text style={styles.emptyWalletText}>Link your first NFC wallet</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
              {devices.map((device) => (
                <View key={device.id} style={styles.walletCard}>
                  <View style={styles.walletCardHeader}>
                    <Ionicons name="radio" size={24} color={Colors.gold} />
                    <View style={[styles.statusDot, { backgroundColor: device.status === 'active' ? Colors.success : Colors.danger }]} />
                  </View>
                  <Text style={styles.walletLabelText}>{device.label}</Text>
                  <Text style={styles.walletRemainingLabel}>Daily Remaining</Text>
                  <Text style={styles.walletRemainingValue}>₱{((device.dailySpendLimitCents - device.accumulatedTodayCents) / 100).toFixed(0)}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addWalletCard}>
                <Ionicons name="add" size={24} color={Colors.mutedWhite} />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {MOCK_TRANSACTIONS.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function ActionButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={22} color={Colors.gold} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  greeting: { fontSize: FontSize.lg, color: Colors.cream, fontWeight: FontWeight.bold },
  walletLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontFamily: 'monospace', marginTop: 2 },
  avatarBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderGrey,
  },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md, marginBottom: Spacing.lg },
  actionBtn: { alignItems: 'center', width: '22%' },
  actionIcon: {
    width: 48, height: 48, borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.gold + '25',
  },
  actionLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: Spacing.xs, fontWeight: FontWeight.medium },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.cream, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  seeAll: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.medium, marginBottom: Spacing.sm },
  walletScroll: { marginHorizontal: -Spacing.md, paddingHorizontal: Spacing.md },
  walletCard: {
    width: 160, backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.borderGrey,
  },
  walletCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  walletLabelText: { fontSize: FontSize.md, color: Colors.cream, fontWeight: FontWeight.bold },
  walletRemainingLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: Spacing.sm },
  walletRemainingValue: { fontSize: FontSize.lg, color: Colors.gold, fontWeight: FontWeight.bold },
  addWalletCard: {
    width: 60, height: 120, backgroundColor: Colors.black, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderGrey,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyWalletCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.xl,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.gold + '40',
  },
  emptyWalletText: { color: Colors.gold, fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginTop: Spacing.sm },
})
