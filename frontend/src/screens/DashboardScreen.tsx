import { memo, useCallback, useState, ReactNode, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput } from 'react-native'
import { popup, Dialog } from '@/components/popup/Popup'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as Clipboard from 'expo-clipboard'
import { useToast } from '@/components/ToastProvider'
import { useRouter } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { mergeHistory } from '@/lib/localTx'
import { TestnetFaucetBanner } from '@/components/TestnetFaucetBanner'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { EmptyState } from '@/components/EmptyState'
import { PressableScale } from '@/components/brand/PressableScale'
import { TapGlyph, StellarMark } from '@/components/brand/BrandGlyph'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts, Gradient } from '@/constants/theme'
import { stellarService } from '@/services/stellar-service'
import { Transaction } from '@/types'
import { isIncomingTx, formatSignedAmount } from '@/lib/txFormat'
import { NetworkPicker } from '@/components/NetworkPicker'
import { spendableBalance } from '@/lib/stellarAccount'
import { cardTotalCents, loadCardBalances, type CardBalance } from '@/lib/cardBalances'


const DEVICE_STATUS: Record<string, { color: string; label: string }> = {
  active: { color: Colors.success, label: 'Active' },
  frozen: { color: Colors.warning, label: 'Frozen' },
  lost: { color: Colors.danger, label: 'Lost' },
  deactivated: { color: Colors.mutedWhite, label: 'Deactivated' },
}
const DEVICE_STATUS_FALLBACK = { color: Colors.mutedWhite, label: 'Unknown' }

/** Which of the dashboard's three independent data sources failed on the last refresh. */
interface SourceFlags {
  /** Backend transaction history. */
  history: boolean
  /** Horizon transaction history. */
  chainHistory: boolean
  /** On-chain XLM balance — the only one the user can be materially misled by. */
  balance: boolean
}

/** "just now" / "3m ago" / "2h ago", for the balance freshness line. */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (seconds < 45) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function DashboardScreen() {
  const router = useRouter()
  const toast = useToast()
  const insets = useSafeAreaInsets()
  const { user, balance, devices, transactions, setTransactions, setBalance, network: storeNetwork, updateDevice } = useAppStore()
  const [refreshing, setRefreshing] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ id: string; label: string } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<TextInput>(null)
  const [cardBalances, setCardBalances] = useState<Record<string, CardBalance>>({})

  // Each source is fetched independently and can fail on its own. Collapsing
  // all three into a silent catch is what let the screen render a stale balance
  // as if it were current — the worst possible lie for a wallet to tell.
  const [sourceFailed, setSourceFailed] = useState<SourceFlags>({
    history: false,
    chainHistory: false,
    balance: false,
  })
  const [balanceUpdatedAt, setBalanceUpdatedAt] = useState<number | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  /**
   * @param userInitiated true for pull-to-refresh. A focus-triggered refresh
   * must not animate the manual spinner, which is what made the indicator fire
   * on every navigation back to this tab.
   */
  const onRefresh = useCallback(
    async (userInitiated = true) => {
      if (userInitiated) {
        setRefreshing(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }

      const failures: SourceFlags = { history: false, chainHistory: false, balance: false }

      // On-chain payment history straight from Horizon (newest first). Keep
      // locally-recorded txs that Horizon hasn't indexed yet; drop them once
      // their hash shows up on-chain — same merge as TransactionHistoryScreen.
      if (user?.stellarPublicKey) {
        try {
          const onChain = await stellarService.getPaymentHistory(user.stellarPublicKey)
          setTransactions(mergeHistory(onChain, useAppStore.getState().transactions))
        } catch {
          failures.history = true
        }
      }

      if (user?.stellarPublicKey) {
        try {
          const onChain = await stellarService.getBalance(user.stellarPublicKey)
          setBalance({ xlm: onChain.xlm, subentryCount: onChain.subentryCount })
          if (mounted.current) setBalanceUpdatedAt(Date.now())
        } catch {
          failures.balance = true
        }
      }

      // Navigating away mid-flight used to leave setRefreshing(false) to run on
      // an unmounted component.
      if (!mounted.current) return
      setSourceFailed(failures)
      if (userInitiated) setRefreshing(false)
    },
    [setTransactions, setBalance, user?.stellarPublicKey]
  )

  // Prefetch on-chain balances + txs every time dashboard gains focus, in the
  // background — no spinner.
  // Switching networks clears balance/history in the store; refetch right
  // away instead of waiting for the next focus.
  const lastNetwork = useRef(storeNetwork)
  useEffect(() => {
    if (lastNetwork.current === storeNetwork) return
    lastNetwork.current = storeNetwork
    onRefresh(false)
  }, [storeNetwork, onRefresh])

  useFocusEffect(
    useCallback(() => {
      onRefresh(false)
    }, [onRefresh])
  )

  // Real money on each card (agent wallet + tap balance), not its spending limit.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      loadCardBalances(devices.filter((d) => !!d.agentPublicKey), user?.stellarPublicKey)
        .then((b) => { if (!cancelled) setCardBalances(b) })
        .catch(() => {})
      return () => { cancelled = true }
    }, [devices, user?.stellarPublicKey, storeNetwork])
  )

  const copyAddress = async () => {
    if (!user?.stellarPublicKey) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await Clipboard.setStringAsync(user.stellarPublicKey)
    toast.success('Address copied', 'Your Stellar address is on the clipboard.')
  }

  const handleRename = useCallback(() => {
    if (renameTarget && renameValue.trim()) {
      updateDevice(renameTarget.id, { label: renameValue.trim() })
      setRenameTarget(null)
      setRenameValue('')
    }
  }, [renameTarget, renameValue, updateDevice])

  const confirmDeleteWallet = useCallback((device: { id: string; label: string }) => {
    popup.confirm({
      title: `Remove ${device.label}?`,
      message: 'It disappears from this phone only. The NFC tag and its on-chain registration stay as they are.',
      icon: 'trash-outline',
      tone: 'danger',
      confirmLabel: 'Remove',
    }).then((ok) => {
      if (ok) useAppStore.getState().removeDevice(device.id)
    })
  }, [])

  const [tab, setTab] = useState<'assets' | 'activity' | 'cards'>('assets')
  const hasKey = !!user?.stellarPublicKey
  const short = (k?: string | null) => (k ? `${k.slice(0, 4)}…${k.slice(-4)}` : 'No wallet')
  const accountName = user?.displayName?.trim() || 'My wallet'
  const spendable = spendableBalance(balance.xlm, balance.subentryCount ?? 0)
  const cardCents = (id: string) => cardTotalCents(cardBalances[id])
  const cardsTotal = devices.reduce((sum, d) => sum + (cardCents(d.id) ?? 0), 0) / 100
  const recent = Array.isArray(transactions) ? transactions.filter(Boolean).slice(0, 5) : []

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => onRefresh(true)} tintColor={Colors.gold} colors={[Colors.gold]} />
        }
      >
        {/* Account header: network · account selector · notifications (wallet-app convention) */}
        <View style={styles.topBar}>
          <View style={styles.topSide}><NetworkPicker /></View>
          <PressableScale
            style={styles.account}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel={`${accountName}, ${user?.stellarPublicKey ?? 'no wallet'}. Open profile`}
          >
            <View style={styles.accountRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{accountName.charAt(0).toUpperCase()}</Text></View>
              <Text style={styles.accountName} numberOfLines={1}>{accountName}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.mutedWhite} />
            </View>
          </PressableScale>
          <View style={[styles.topSide, styles.topRight]}>
            <PressableScale onPress={() => router.push('/settings/notifications')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={22} color={Colors.white} />
            </PressableScale>
          </View>
        </View>
        <PressableScale style={styles.addrRow} onPress={copyAddress} disabled={!hasKey} accessibilityRole="button" accessibilityLabel="Copy wallet address">
          <Text style={styles.addrText}>{short(user?.stellarPublicKey)}</Text>
          {hasKey && <Ionicons name="copy-outline" size={12} color={Colors.mutedWhite} />}
        </PressableScale>

        {/* Balance */}
        <View style={styles.balanceBlock} accessibilityRole="summary" accessibilityLabel={`Balance ${balance.xlm.toFixed(2)} XLM`}>
          <View style={styles.balanceRow}>
            <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
              {balance.xlm.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.balanceAsset}>XLM</Text>
          </View>
          {sourceFailed.balance ? (
            <Text style={styles.freshWarn}>
              Couldn’t reach Stellar{balanceUpdatedAt ? ` · showing ${formatRelativeTime(balanceUpdatedAt)}` : ''}
            </Text>
          ) : (
            <Text style={styles.fresh}>
              Stellar {storeNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'} · {balanceUpdatedAt ? `updated ${formatRelativeTime(balanceUpdatedAt)}` : 'updating…'}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Action label="Send" primary onPress={() => router.push('/send')}><Ionicons name="arrow-up" size={22} color={Colors.onGold} /></Action>
          <Action label="Receive" onPress={() => router.push('/receive')}><Ionicons name="arrow-down" size={22} color={Colors.white} /></Action>
          <Action label="Tap" onPress={() => router.push('/tap')}><TapGlyph size={22} color={Colors.white} /></Action>
          <Action label="Top up" onPress={() => router.push(devices.length === 1 ? `/agent-fund/${devices[0].id}` : devices[0] ? '/(tabs)/pos' : '/link-device')}><Ionicons name="add" size={24} color={Colors.white} /></Action>
        </View>

        {storeNetwork === 'testnet' && hasKey && balance.xlm === 0 && <TestnetFaucetBanner />}

        {/* Tabs */}
        <View style={styles.tabs} accessibilityRole="tablist">
          {(['assets', 'activity', 'cards'] as const).map((k) => (
            <PressableScale key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
              <Text style={[styles.tabText, tab === k && styles.tabTextOn]}>{k === 'assets' ? 'Assets' : k === 'activity' ? 'Activity' : 'Cards'}</Text>
            </PressableScale>
          ))}
        </View>

        {tab === 'assets' && (
          <View>
            <Row
              icon={<View style={styles.xlmIcon}><StellarMark size={22} color={Colors.gold} /></View>}
              title="Stellar Lumens"
              sub="XLM"
              value={balance.xlm.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              valueSub={`Available ${spendable.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
            />
            <Row
              icon={<TapGlyph size={22} color={Colors.gold} />}
              title="On your cards"
              sub={`${devices.length} ${devices.length === 1 ? 'card' : 'cards'}`}
              value={cardsTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              valueSub="XLM"
              onPress={() => setTab('cards')}
              last
            />
          </View>
        )}

        {tab === 'activity' && (
          refreshing && recent.length === 0 ? (
            <View>{[1, 2, 3].map((i) => <SkeletonLoader key={i} variant="transaction" />)}</View>
          ) : recent.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title={sourceFailed.history ? 'Couldn’t load activity' : 'No activity yet'}
              description={sourceFailed.history ? 'Stellar didn’t respond. Pull down to retry.' : 'Payments you send, receive or tap show up here.'}
            />
          ) : (
            <View>
              {recent.map((tx, i) => <ActivityRow key={tx.id || `tx-${i}`} tx={tx} last={i === recent.length - 1} onPress={() => router.push(`/transaction/${tx.id || 'unknown'}`)} />)}
              <PressableScale style={styles.linkRow} onPress={() => router.push('/transactions')} accessibilityRole="button">
                <Text style={styles.link}>See all activity</Text>
              </PressableScale>
            </View>
          )
        )}

        {tab === 'cards' && (
          <View>
            {devices.map((d, i) => {
              const st = DEVICE_STATUS[d.status] ?? DEVICE_STATUS_FALLBACK
              return (
                <Row
                  key={d.id}
                  icon={<Ionicons name="radio" size={22} color={Colors.gold} />}
                  title={d.label}
                  sub={st.label}
                  subColor={st.color}
                  value={cardCents(d.id) == null ? '…' : (cardCents(d.id)! / 100).toFixed(2)}
                  valueSub="XLM"
                  onPress={() => router.push(`/agent/${d.id}`)}
                  onLongPress={() => { setRenameTarget({ id: d.id, label: d.label }); setRenameValue(d.label) }}
                  last={i === devices.length - 1}
                />
              )
            })}
            <PressableScale style={[styles.linkRow, styles.linkRowIcon]} onPress={() => router.push('/link-device')} accessibilityRole="button">
              <Ionicons name="add" size={18} color={Colors.gold} />
              <Text style={styles.link}>Link a card</Text>
            </PressableScale>
          </View>
        )}
      </ScrollView>

      <Dialog
        visible={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Rename card"
        confirmLabel="Save"
        onConfirm={handleRename}
        confirmDisabled={!renameValue.trim()}
      >
        <View style={styles.renameField}>
          <TextInput
            ref={renameInputRef}
            style={styles.renameInput}
            value={renameValue}
            onChangeText={setRenameValue}
            placeholder="Card name"
            placeholderTextColor={Colors.mutedWhite}
            autoFocus
            maxLength={32}
            returnKeyType="done"
            onSubmitEditing={handleRename}
            accessibilityLabel="Card name"
          />
          <Text style={styles.renameCount}>{renameValue.length}/32</Text>
        </View>
        {renameTarget && (
          <PressableScale style={styles.removeLink} onPress={() => { const t = renameTarget; setRenameTarget(null); confirmDeleteWallet(t) }} accessibilityRole="button">
            <Text style={styles.removeText}>Remove from this phone</Text>
          </PressableScale>
        )}
      </Dialog>
    </SafeAreaView>
  )
}

function Action({ label, children, onPress, primary }: { label: string; children: ReactNode; onPress: () => void; primary?: boolean }) {
  return (
    <PressableScale style={styles.action} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[styles.actionDisc, primary && styles.actionDiscPrimary]}>{children}</View>
      <Text style={styles.actionLabel}>{label}</Text>
    </PressableScale>
  )
}

function Row({ icon, title, sub, subColor, value, valueSub, onPress, onLongPress, last }: {
  icon: ReactNode; title: string; sub?: string; subColor?: string; value?: string; valueSub?: string
  onPress?: () => void; onLongPress?: () => void; last?: boolean
}) {
  return (
    <PressableScale style={[styles.row, !last && styles.rowDivider]} onPress={onPress} onLongPress={onLongPress} disabled={!onPress && !onLongPress} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        {!!sub && <Text style={[styles.rowSub, subColor ? { color: subColor } : null]} numberOfLines={1}>{sub}</Text>}
      </View>
      {!!value && (
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{value}</Text>
          {!!valueSub && <Text style={styles.rowSub}>{valueSub}</Text>}
        </View>
      )}
    </PressableScale>
  )
}

const ActivityRow = memo(function ActivityRow({ tx, onPress, last }: { tx: Transaction; onPress: () => void; last?: boolean }) {
  if (!tx || typeof tx !== 'object') return null
  const incoming = isIncomingTx(tx)
  const failed = tx.status === 'failed'
  const time = new Date(tx.createdAt || Date.now()).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  const status = tx.status === 'confirmed' ? '' : ` · ${tx.status.charAt(0).toUpperCase()}${tx.status.slice(1)}`
  return (
    <Row
      icon={<Ionicons name={failed ? 'close' : incoming ? 'arrow-down' : 'arrow-up'} size={20} color={failed ? Colors.danger : incoming ? Colors.success : Colors.mutedWhite} />}
      title={tx.merchantName}
      sub={`${incoming ? 'Received' : 'Sent'} · ${time}${status}`}
      value={formatSignedAmount(tx)}
      onPress={onPress}
      last={last}
    />
  )
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: Spacing.md },
  topSide: { flex: 1 },
  topRight: { alignItems: 'flex-end' },
  account: { alignItems: 'center', maxWidth: 180 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#5a4a2c', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.display, fontSize: 12, color: Colors.cream },
  accountName: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.cream, flexShrink: 1 },
  addrRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2, alignSelf: 'center' },
  addrText: { fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.mutedWhite },

  balanceBlock: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm, maxWidth: '100%' },
  balance: { fontFamily: Fonts.display, fontSize: 44, color: Colors.white, letterSpacing: -0.5, fontVariant: ['tabular-nums'], flexShrink: 1 },
  balanceAsset: { fontFamily: Fonts.displayMd, fontSize: FontSize.lg - 2, color: Colors.mutedWhite },
  fresh: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, marginTop: 6 },
  freshWarn: { fontSize: FontSize.sm - 1, color: Colors.warning, marginTop: 6 },

  actions: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingBottom: Spacing.lg },
  action: { width: 72, alignItems: 'center', gap: Spacing.sm },
  actionDisc: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.midGrey, alignItems: 'center', justifyContent: 'center' },
  actionDiscPrimary: { backgroundColor: Colors.gold },
  actionLabel: { fontSize: FontSize.sm - 1, color: Colors.white, fontWeight: FontWeight.medium },

  tabs: { flexDirection: 'row', gap: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Gradient.panel, marginTop: Spacing.sm },
  tab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabOn: { borderBottomColor: Colors.gold },
  tabText: { fontFamily: Fonts.displayMd, fontSize: FontSize.md - 1, color: Colors.mutedWhite },
  tabTextOn: { color: Colors.white },

  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, paddingVertical: Spacing.sm },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Gradient.panel },
  rowIcon: { width: 40, alignItems: 'center' },
  xlmIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1d1a12', alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: FontSize.md - 1, color: Colors.white, fontWeight: FontWeight.medium },
  rowSub: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowValue: { fontSize: FontSize.md - 1, color: Colors.white, fontWeight: FontWeight.medium, fontVariant: ['tabular-nums'] },
  linkRow: { alignItems: 'center', paddingVertical: Spacing.md },
  linkRowIcon: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  link: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.medium },

  renameField: {
    alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md,
    paddingHorizontal: Spacing.md, minHeight: 52, borderRadius: BorderRadius.md, backgroundColor: Colors.midGrey,
  },
  renameInput: { flex: 1, fontSize: FontSize.md, color: Colors.white, paddingVertical: Spacing.sm },
  renameCount: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  removeLink: { alignSelf: 'center', paddingTop: Spacing.md },
  removeText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.medium },
})
