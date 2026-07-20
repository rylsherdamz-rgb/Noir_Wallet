import { memo, useState, useEffect } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
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
  transaction: '#C6A15B',
  security: '#FF5A5F',
  system: '#A9A9A9',
  promo: '#C6A15B',
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
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-bold text-white">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-[#FF5A5F] rounded-full px-2 min-w-[22] h-[22] items-center justify-center">
              <Text className="text-xs text-white font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <PressableScale
            onPress={markAllRead}
            accessibilityRole="button"
            accessibilityLabel="Mark all read"
          >
            <Text className="text-sm text-gold font-medium">Mark All Read</Text>
          </PressableScale>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C6A15B" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationRow item={item} onPress={() => markRead(item.id)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
          ListEmptyComponent={
            <EmptyState icon="notifications-off-outline" title="No Notifications" description="You're all caught up!" />
          }
        />
      )}
    </SafeAreaView>
  )
}

const NotificationRow = memo(function NotificationRow({
  item,
  onPress,
}: {
  item: Notification
  onPress: () => void
}) {
  return (
    <PressableScale
      onPress={onPress}
      className="flex-row gap-4 p-4 bg-cardBg rounded-xl mb-2 border"
      style={
        !item.read
          ? {
              borderColor: '#C6A15B40',
              borderLeftColor: '#C6A15B',
              borderLeftWidth: 3,
              backgroundColor: 'rgba(198, 161, 91, 0.05)',
            }
          : { borderColor: '#3A3A3A' }
      }
    >
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: TYPE_COLORS[item.type] + '15' }}>
        <Ionicons name={TYPE_ICONS[item.type]} size={20} color={TYPE_COLORS[item.type]} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm text-white font-semibold">{item.title}</Text>
          {!item.read && <View className="w-2 h-2 rounded bg-gold" />}
        </View>
        <Text className="text-xs text-mutedWhite leading-4 mt-0.5" numberOfLines={2}>{item.body}</Text>
        <Text className="text-xs text-mutedWhite mt-1">
          {timeAgo(item.createdAt)}
        </Text>
      </View>
    </PressableScale>
  )
})
