import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors } from '@/constants/theme'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  variant?: 'inline' | 'card' | 'fullscreen'
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  variant = 'card',
}: ErrorMessageProps) {
  if (variant === 'inline') {
    return (
      <View className="flex-row items-center gap-1 py-1">
        <Ionicons name="alert-circle" size={16} color={Colors.danger} />
        <Text className="text-xs text-[#FF5A5F] flex-1">{message}</Text>
      </View>
    )
  }

  if (variant === 'fullscreen') {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: Colors.danger + '15', borderRadius: 40 }}>
          <Ionicons name="cloud-offline-outline" size={40} color={Colors.danger} />
        </View>
        <Text className="text-2xl font-bold text-white mb-2">{title}</Text>
        <Text className="text-sm text-mutedWhite text-center leading-5 mb-6">{message}</Text>
        {onRetry && (
          <PressableScale className="flex-row items-center bg-gold py-4 px-6 rounded-xl gap-2" onPress={onRetry}>
            <Ionicons name="refresh" size={18} color={Colors.black} />
            <Text className="text-base font-bold text-black">{retryLabel}</Text>
          </PressableScale>
        )}
      </View>
    )
  }

  return (
    <View className="bg-cardBg rounded-xl border p-4" style={{ borderColor: Colors.danger + '30' }}>
      <View className="flex-row gap-2">
        <View className="mt-0.5">
          <Ionicons name="alert-circle" size={22} color={Colors.danger} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-white">{title}</Text>
          <Text className="text-xs text-mutedWhite mt-0.5 leading-4">{message}</Text>
        </View>
      </View>
      {onRetry && (
        <PressableScale className="flex-row items-center justify-center gap-1 mt-2 pt-2 border-t border-t-borderGrey" onPress={onRetry}>
          <Text className="text-sm text-gold font-semibold">{retryLabel}</Text>
          <Ionicons name="refresh" size={14} color={Colors.gold} />
        </PressableScale>
      )}
    </View>
  )
}
