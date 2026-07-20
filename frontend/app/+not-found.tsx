import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'

export default function NotFoundScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center px-8 gap-4">
        <Ionicons name="compass-outline" size={64} color={Colors.mutedWhite} />
        <Text className="text-[32px] font-bold text-white">Page Not Found</Text>
        <Text className="text-base text-mutedWhite text-center leading-[22px]">
          The page you are looking for does not exist or has been moved.
        </Text>
        <TouchableOpacity className="flex-row items-center gap-2 bg-gold px-8 py-4 rounded-xl mt-4" onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="home-outline" size={18} color={Colors.black} />
          <Text className="text-base font-bold text-black">Go Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
