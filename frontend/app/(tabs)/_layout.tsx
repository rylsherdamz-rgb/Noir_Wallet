import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, ColorValue } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Fonts, FontSize } from '@/constants/theme'

type IoniconName = keyof typeof Ionicons.glyphMap

function TabIcon({ name, color, focused }: { name: IoniconName; color: ColorValue; focused: boolean }) {
  return (
    <View className="items-center justify-center">
      <View className="h-[5px] mb-[3px] justify-center">
        {focused && <View className="w-[5px] h-[5px] rounded-full bg-gold" />}
      </View>
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
          borderTopColor: '#242424',
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: insets.bottom,
          height: 62 + insets.bottom,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.mutedWhite,
        tabBarLabelStyle: {
          fontFamily: Fonts.displayMd,
          fontSize: FontSize.xs,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
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
        name="devices"
        options={{
          title: 'Devices',
          tabBarIcon: ({ color, focused }) => <TabIcon name="hardware-chip-outline" color={color} focused={focused} />,
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
