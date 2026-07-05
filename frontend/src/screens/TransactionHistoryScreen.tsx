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
import { apiService } from '@/services/api'
import { TxFilter } from '@/types'

const FILTERS = [
  { key: 'all' as TxFilter, label: 'All' },
  { key: 'confirmed' as TxFilter, label: 'Confirmed' },
  { key: 'pending' as TxFilter, label: 'Pending' },
  { key: 'failed' as TxFilter, label: 'Failed' },
]

export function TransactionHistoryScreen() {
  const router = useRouter()
  const { transactions, setTransactions } = useAppStore()
  const [filter, setFilter] = useState<TxFilter>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayTxs = transactions.filter((tx) => {
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
    setError(null)
    try {
      const res = await apiService.getTransactions()
      if (res?.transactions) setTransactions(res.transactions)
    } catch {
      setError('Failed to load transactions')
    } finally {
      setRefreshing(false)
    }
  }, [setTransactions])

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
