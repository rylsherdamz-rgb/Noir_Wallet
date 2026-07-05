import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { EmptyState } from '@/components/EmptyState'
import { Notification } from '@/types'
import { apiService } from '@/services/api'

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await apiService.getNotifications()
        if (res?.notifications) setNotifications(res.notifications)
      } catch {
        // backend unavailable — empty state
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

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

      {loading ? null : (
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
