import { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  Platform,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useFocusEffect } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme'
import { TransactionItem } from '@/components/TransactionItem'
import { FilterChips } from '@/components/FilterChips'
import { SearchBar } from '@/components/SearchBar'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { ErrorMessage } from '@/components/ErrorMessage'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useAppStore } from '@/store/useAppStore'
import { stellarService } from '@/services/stellar-service'
import { logger } from '@/lib/logger'
import { TxFilter, Transaction } from '@/types'
import { isIncomingTx } from '@/lib/txFormat'

const keyExtractor = (item: Transaction) => item.id

const renderItem = ({ item }: { item: Transaction }) => <TransactionItem transaction={item} />

const FILTERS = [
  { key: 'all' as TxFilter, label: 'All' },
  { key: 'sent' as TxFilter, label: 'Sent' },
  { key: 'received' as TxFilter, label: 'Received' },
  { key: 'failed' as TxFilter, label: 'Failed' },
]

const haptic = (fn: () => Promise<void>) => {
  if (Platform.OS !== 'web') fn().catch(() => {})
}

/** "Today", "Yesterday", or a short date — used as section titles. */
function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (same(d, today)) return 'Today'
  if (same(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

/** `asTab`: shown as the History tab (no back arrow); otherwise a pushed screen. */
export function TransactionHistoryScreen({ asTab = false }: { asTab?: boolean } = {}) {
  const { transactions, setTransactions, user } = useAppStore()
  const [filter, setFilter] = useState<TxFilter>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const walletPub = user?.stellarPublicKey

  const load = useCallback(
    async (mode: 'initial' | 'pull') => {
      if (!walletPub) return
      mode === 'pull' ? setRefreshing(true) : setLoading(true)
      setError(null)
      if (mode === 'pull') haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))

      try {
        const onChain = await stellarService.getPaymentHistory(walletPub)
        // Keep locally-recorded txs (e.g. pending taps) that Horizon hasn't
        // indexed yet; drop them once their hash shows up on-chain.
        const chainHashes = new Set(onChain.map((t) => t.stellarTxHash).filter(Boolean))
        const chainIds = new Set(onChain.map((t) => t.id))
        const localOnly = useAppStore
          .getState()
          .transactions.filter(
            (t) => !chainIds.has(t.id) && !(t.stellarTxHash && chainHashes.has(t.stellarTxHash)),
          )
        const merged = [...onChain, ...localOnly].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        setTransactions(merged)
        if (mode === 'pull') haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
      } catch (e: any) {
        logger.warn('[transactions] history load failed:', e?.message ?? e)
        setError("Couldn't reach Stellar. Pull down or tap retry.")
        haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))
      } finally {
        setRefreshing(false)
        setLoading(false)
        setLoadedOnce(true)
      }
    },
    [walletPub, setTransactions],
  )

  // Refresh every time the screen gains focus so new taps/sends appear.
  useFocusEffect(
    useCallback(() => {
      load(loadedOnce ? 'pull' : 'initial')
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  )

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = transactions.filter((tx) => {
      if (filter === 'sent' && isIncomingTx(tx)) return false
      if (filter === 'received' && !isIncomingTx(tx)) return false
      if ((filter === 'failed' || filter === 'pending' || filter === 'confirmed') && tx.status !== filter) return false
      if (!q) return true
      return (
        tx.merchantName.toLowerCase().includes(q) ||
        (tx.amountCents / 100).toFixed(2).includes(q) ||
        (tx.stellarTxHash ?? '').toLowerCase().includes(q) ||
        (tx.merchantId ?? '').toLowerCase().includes(q)
      )
    })
    const groups = new Map<string, Transaction[]>()
    for (const tx of filtered) {
      const k = dayLabel(tx.createdAt)
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k)!.push(tx)
    }
    return [...groups.entries()].map(([title, data]) => ({ title, data }))
  }, [transactions, filter, search])

  const isEmpty = sections.length === 0
  const showSkeleton = loading && transactions.length === 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Activity"
        showBack={!asTab}
        rightAction={
          <PressableScale
            onPress={() => load('pull')}
            disabled={refreshing || loading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Refresh transactions"
          >
            <Ionicons name="refresh" size={22} color={refreshing || loading ? Colors.mutedWhite : Colors.gold} />
          </PressableScale>
        }
      />

      <View style={styles.searchSection}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search name, amount, or hash" />
      </View>

      <View style={styles.filters}>
        <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} variant="card" onRetry={() => load('pull')} />
        </View>
      ) : null}

      {!walletPub ? (
        <EmptyState icon="wallet-outline" title="No wallet" description="Create or import a wallet to see its history" />
      ) : showSkeleton ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonLoader key={i} variant="list" />
          ))}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader} accessibilityRole="header">
              {section.title}
            </Text>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[styles.listContent, isEmpty && styles.listEmpty]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loadedOnce && !error ? (
              <EmptyState
                icon="receipt-outline"
                title={search || filter !== 'all' ? 'No matches' : 'No transactions yet'}
                description={
                  search || filter !== 'all'
                    ? 'Try a different search or filter'
                    : 'Payments you send, receive, or tap will show up here'
                }
              />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load('pull')}
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
    paddingHorizontal: 20,
    marginBottom: Spacing.sm,
  },
  filters: {
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    fontSize: FontSize.sm - 1,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    paddingTop: Spacing.lg,
    paddingBottom: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xxl * 2,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  loadingContainer: {
    paddingHorizontal: Spacing.md,
  },
})
