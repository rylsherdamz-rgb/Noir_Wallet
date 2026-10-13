import { memo, useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { EmptyState } from '@/components/EmptyState'
import { Notification } from '@/types'
import { apiService } from '@/services/api'
import { ScreenHeader } from '@/components/ScreenHeader'
import { ListRow } from '@/components/ui/List'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  transaction: 'swap-horizontal',
  security: 'shield-outline',
  system: 'settings-outline',
  promo: 'megaphone-outline',
}

const TYPE_COLORS: Record<string, string> = {
  transaction: Colors.silver,
  security: Colors.warning,
  system: Colors.mutedWhite,
  promo: Colors.gold,
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  if (mins < 1440 * 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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
      <ScreenHeader
        title="Notifications"
        onBackPress={() => router.back()}
        rightAction={unreadCount > 0 ? (
          <PressableScale onPress={markAllRead} hitSlop={10} accessibilityRole="button" accessibilityLabel="Mark all read">
            <Text style={styles.readAll}>Read all</Text>
          </PressableScale>
        ) : undefined}
      />
      {loading ? (
        <View style={styles.loading}><VerifyingPulse size={120} /></View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <NotificationRow item={item} last={index === notifications.length - 1} onPress={() => markRead(item.id)} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="You’re all caught up" description="Payments and card alerts show up here." />}
        />
      )}
    </SafeAreaView>
  )
}

const NotificationRow = memo(function NotificationRow({ item, onPress, last }: { item: Notification; onPress: () => void; last?: boolean }) {
  return (
    <ListRow
      icon={TYPE_ICONS[item.type]}
      iconColor={TYPE_COLORS[item.type]}
      title={item.title}
      subtitle={item.body}
      right={
        <View style={styles.right}>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          {!item.read && <View style={styles.unreadDot} accessibilityLabel="Unread" />}
        </View>
      }
      last={last}
      onPress={onPress}
      style={!item.read ? styles.unread : undefined}
    />
  )
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: Spacing.xxl, flexGrow: 1 },
  readAll: { fontSize: FontSize.sm - 1, color: Colors.gold, fontWeight: FontWeight.medium },
  right: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.gold },
  unread: {},
})
