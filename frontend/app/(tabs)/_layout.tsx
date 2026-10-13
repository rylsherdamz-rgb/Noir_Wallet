import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, StyleSheet, ColorValue } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Fonts, FontSize, Gradient } from '@/constants/theme'

type IoniconName = keyof typeof Ionicons.glyphMap

function TabIcon({ name, color, focused }: { name: IoniconName; color: ColorValue; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  )
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surfaceBg,
          borderTopColor: Gradient.panel,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: insets.bottom,
          height: 62 + insets.bottom,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.mutedWhite,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => <TabIcon name="wallet-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: 'Agents',
          tabBarIcon: ({ color, focused }) => <TabIcon name="flash-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => <TabIcon name="compass-outline" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <TabIcon name="settings-outline" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalSlot: {
    height: 5,
    marginBottom: 3,
    justifyContent: 'center',
  },
  signalDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.gold,
  },
})
