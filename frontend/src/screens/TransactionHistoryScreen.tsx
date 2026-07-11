import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { TransactionItem } from '@/components/TransactionItem'
import { FilterChips } from '@/components/FilterChips'
import { SearchBar } from '@/components/SearchBar'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { ErrorMessage } from '@/components/ErrorMessage'
import { ScreenHeader } from '@/components/ScreenHeader'
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
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    
    try {
      const res = await apiService.getTransactions()
      if (res?.transactions) {
        setTransactions(res.transactions)
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        }
      }
    } catch {
      setError('Failed to load transactions')
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    } finally {
      setRefreshing(false)
    }
  }, [setTransactions])

  const handleExport = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    // TODO: Implement export functionality
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Transactions"
        rightAction={
          <TouchableOpacity
            onPress={handleExport}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Export transactions"
          >
            <Ionicons name="download-outline" size={22} color={Colors.gold} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchSection}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search name or amount..." />
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
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
              colors={[Colors.gold]}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBg,
  },
  searchSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
})
