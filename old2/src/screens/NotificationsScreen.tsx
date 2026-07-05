import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { EmptyState } from '@/components/EmptyState'
import { Notification } from '@/types'

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Payment Confirmed', body: '₱45.00 paid to 7-Eleven — confirmed on Stellar.', type: 'transaction', read: false, createdAt: new Date().toISOString() },
  { id: '2', title: 'Device Linked', body: 'New NFC device "My Wallet Tag" has been linked to your account.', type: 'system', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', title: 'Daily Limit Warning', body: 'You\'ve used 85% of your daily spend limit on device "Daily Carry".', type: 'security', read: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', title: 'Network Update', body: 'Stellar Testnet upgrade scheduled for July 5, 2026. No downtime expected.', type: 'system', read: true, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: '5', title: 'Welcome to Noir Wallet!', body: 'Your wallet is ready. Link an NFC device to start tap-to-pay.', type: 'promo', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '6', title: 'Payment Failed', body: '₱58.00 payment to Starbucks failed — insufficient balance.', type: 'transaction', read: false, createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: '7', title: 'Security Alert', body: 'New login from unknown device. If this wasn\'t you, secure your account.', type: 'security', read: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
]

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  transaction: 'swap-horizontal',
  security: 'shield-outline',
  system: 'settings-outline',
  promo: 'megaphone-outline',
}

const TYPE_COLORS: Record<string, string> = {
  transaction: Colors.gold,
  security: Colors.danger,
  system: Colors.mutedWhite,
  promo: Colors.gold,
}

export function NotificationsScreen() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifRow, !item.read && styles.notifUnread]}
            onPress={() => markRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.notifIcon, { backgroundColor: TYPE_COLORS[item.type] + '15' }]}>
              <Ionicons name={TYPE_ICONS[item.type]} size={20} color={TYPE_COLORS[item.type]} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.notifTime}>
                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="notifications-off-outline" title="No Notifications" description="You're all caught up!" />
        }
      />
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  badge: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  markAllText: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  notifRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  notifUnread: {
    borderColor: Colors.gold + '40',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifTitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  notifBody: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    lineHeight: 16,
    marginTop: 2,
  },
  notifTime: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: Spacing.xs,
  },
})
