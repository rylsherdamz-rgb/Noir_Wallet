import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { TransactionItem } from '@/components/TransactionItem'
import { FilterChips } from '@/components/FilterChips'
import { SearchBar } from '@/components/SearchBar'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { ErrorMessage } from '@/components/ErrorMessage'
import { useAppStore } from '@/store/useAppStore'
import { Transaction, TxFilter } from '@/types'

const FILTERS = [
  { key: 'all' as TxFilter, label: 'All' },
  { key: 'confirmed' as TxFilter, label: 'Confirmed' },
  { key: 'pending' as TxFilter, label: 'Pending' },
  { key: 'failed' as TxFilter, label: 'Failed' },
]

const MOCK_TXS: Transaction[] = [
  { id: '1', stellarTxHash: 'a1b2c3d4e5f6g7h8i9j0', merchantId: 'm1', merchantName: '7-Eleven', userId: 'u1', deviceId: 'd1', amountCents: 4500, assetCode: 'USDC', status: 'confirmed', errorMessage: null, createdAt: new Date().toISOString() },
  { id: '2', stellarTxHash: 'b2c3d4e5f6g7h8i9j0k1', merchantId: 'm2', merchantName: 'Angkas', userId: 'u1', deviceId: 'd1', amountCents: 15000, assetCode: 'PHP', status: 'confirmed', errorMessage: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', stellarTxHash: null, merchantId: 'm3', merchantName: 'Jollibee', userId: 'u1', deviceId: 'd2', amountCents: 8900, assetCode: 'USDC', status: 'pending', errorMessage: null, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: '4', stellarTxHash: 'c3d4e5f6g7h8i9j0k1l2', merchantId: 'm4', merchantName: 'GrabPay', userId: 'u1', deviceId: 'd1', amountCents: 2500, assetCode: 'USDC', status: 'confirmed', errorMessage: null, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '5', stellarTxHash: null, merchantId: 'm5', merchantName: 'Starbucks', userId: 'u1', deviceId: 'd3', amountCents: 5800, assetCode: 'USDC', status: 'failed', errorMessage: 'Insufficient balance', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: '6', stellarTxHash: 'd4e5f6g7h8i9j0k1l2m3', merchantId: 'm6', merchantName: 'McDonalds', userId: 'u1', deviceId: 'd1', amountCents: 12000, assetCode: 'PHP', status: 'confirmed', errorMessage: null, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: '7', stellarTxHash: 'e5f6g7h8i9j0k1l2m3n4', merchantId: 'm7', merchantName: 'Shell', userId: 'u1', deviceId: 'd2', amountCents: 32000, assetCode: 'PHP', status: 'confirmed', errorMessage: null, createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: '8', stellarTxHash: null, merchantId: 'm8', merchantName: 'Puregold', userId: 'u1', deviceId: 'd3', amountCents: 6700, assetCode: 'USDC', status: 'pending', errorMessage: null, createdAt: new Date(Date.now() - 21600000).toISOString() },
]

export function TransactionHistoryScreen() {
  const router = useRouter()
  const { transactions } = useAppStore()
  const [filter, setFilter] = useState<TxFilter>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayTxs = MOCK_TXS.filter((tx) => {
    if (filter !== 'all' && tx.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        tx.merchantName.toLowerCase().includes(q) ||
        tx.amountCents.toString().includes(q)
      )
    }
    return true
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setRefreshing(false)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="download-outline" size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search merchant or amount..." />
      </View>

      <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />

      {error && (
        <View style={{ paddingHorizontal: Spacing.md }}>
          <ErrorMessage message={error} variant="card" onRetry={() => setError(null)} />
        </View>
      )}

      {loading ? (
        <View style={{ paddingHorizontal: Spacing.md }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} variant="list" />
          ))}
        </View>
      ) : displayTxs.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={search ? 'No Results' : 'No Transactions'}
          description={search ? 'Try a different search term' : 'Your transactions will appear here'}
        />
      ) : (
        <FlatList
          data={displayTxs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/transaction/${item.id}`)}
              activeOpacity={0.7}
            >
              <TransactionItem transaction={item} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  searchSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
})
