import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '@/store/useAppStore'
import { Colors, FontSize } from '@/constants/theme'

export default function TabLayout() {
  const activeRole = useAppStore((s) => s.activeRole)
  const isMerchant = activeRole === 'merchant'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.darkGrey,
          borderTopColor: Colors.borderGrey,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 60,
        },
        tabBarActiveTintColor: Colors.accentGreen,
        tabBarInactiveTintColor: Colors.mutedWhite,
        tabBarLabelStyle: { fontSize: FontSize.xs, marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isMerchant ? 'Terminal' : 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isMerchant ? 'radio-outline' : 'wallet-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: isMerchant ? 'Sales' : 'Pay',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isMerchant ? 'bar-chart-outline' : 'radio-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Devices',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
