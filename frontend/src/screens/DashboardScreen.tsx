import { useCallback, useState } from 'react'
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
import { useAppStore } from '@/store/useAppStore'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionItem } from '@/components/TransactionItem'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Transaction } from '@/types'

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    stellarTxHash: 'a1b2c3d4e5f6g7h8i9j0',
    merchantId: 'm1',
    merchantName: '7-Eleven',
    userId: 'u1',
    deviceId: 'd1',
    amountCents: 4500,
    assetCode: 'USDC',
    status: 'confirmed',
    errorMessage: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    stellarTxHash: 'b2c3d4e5f6g7h8i9j0k1',
    merchantId: 'm2',
    merchantName: 'Angkas',
    userId: 'u1',
    deviceId: 'd1',
    amountCents: 15000,
    assetCode: 'PHP',
    status: 'confirmed',
    errorMessage: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    stellarTxHash: null,
    merchantId: 'm3',
    merchantName: 'Jollibee',
    userId: 'u1',
    deviceId: 'd2',
    amountCents: 8900,
    assetCode: 'USDC',
    status: 'pending',
    errorMessage: null,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
]

export function DashboardScreen() {
  const { user, balance, devices, setActiveRole } = useAppStore()
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accentGreen}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </Text>
            <Text style={styles.walletLabel}>
              {user?.stellarPublicKey
                ? `${user.stellarPublicKey.slice(0, 8)}...${user.stellarPublicKey.slice(-4)}`
                : 'No wallet'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roleBadge}
              onPress={() => setActiveRole('merchant')}
            >
              <Ionicons name="swap-horizontal" size={14} color={Colors.accentGreen} />
              <Text style={styles.roleBadgeText}>Switch</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <BalanceCard
          phpBalance={balance.php}
          usdcBalance={balance.usdc}
          xlmBalance={balance.xlm}
          localTokens={balance.localTokens}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ActionButton icon="add-circle-outline" label="Cash In" color={Colors.accentBlue} />
          <ActionButton icon="remove-circle-outline" label="Cash Out" color={Colors.accentOrange} />
          <ActionButton icon="radio-outline" label="Link Device" color={Colors.accentGreen} />
          <ActionButton icon="scan-outline" label="Pay" color={Colors.accentGreen} />
        </View>

        {/* Linked Devices */}
        {devices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Linked Devices</Text>
            {devices.map((device) => (
              <View key={device.id} style={styles.deviceRow}>
                <View style={styles.deviceIcon}>
                  <Ionicons
                    name={device.status === 'active' ? 'radio-outline' : 'lock-closed-outline'}
                    size={20}
                    color={device.status === 'active' ? Colors.accentGreen : Colors.accentRed}
                  />
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceLabel}>{device.label}</Text>
                  <Text style={styles.deviceStatus}>{device.status}</Text>
                </View>
                <Text style={styles.deviceLimit}>
                  ₱{((device.dailySpendLimitCents - device.accumulatedTodayCents) / 100).toFixed(0)} left
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
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

function ActionButton({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  color: string
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  walletLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accentGreen + '15',
    borderWidth: 1,
    borderColor: Colors.accentGreen + '30',
    gap: 4,
  },
  roleBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.accentGreen,
    fontWeight: FontWeight.semibold,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.accentGreen,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  deviceLabel: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  deviceStatus: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  deviceLimit: {
    fontSize: FontSize.sm,
    color: Colors.accentGreen,
    fontWeight: FontWeight.semibold,
  },
})
