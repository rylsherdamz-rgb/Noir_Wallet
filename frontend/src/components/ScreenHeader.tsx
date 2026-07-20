import { View, Text, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { ReactNode } from 'react'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBackPress?: () => void
  rightAction?: ReactNode
  variant?: 'default' | 'large' | 'minimal'
  testID?: string
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightAction,
  variant = 'default',
  testID,
}: ScreenHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  const containerClass = `flex-row items-center justify-between px-4 ${
    variant === 'large' ? 'py-6 min-h-[72]' : variant === 'minimal' ? 'py-2' : 'py-4 min-h-[56]'
  }`

  const titleClass = `text-center ${
    variant === 'large' ? 'text-2xl text-white font-extrabold' : variant === 'minimal' ? 'text-base text-white font-semibold' : 'text-xl text-white font-bold'
  }`

  return (
    <View className={containerClass} testID={testID}>
      <View className="w-11 items-start">
        {showBack ? (
          <PressableScale
            className="w-11 h-11 items-center justify-center"
            onPress={handleBack}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </PressableScale>
        ) : (
          <View className="w-11 h-11" />
        )}
      </View>

      <View className="flex-1 items-center justify-center px-2">
        <Text className={titleClass} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-mutedWhite mt-0.5 text-center" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View className="w-11 items-end">{rightAction || <View className="w-11 h-11" />}</View>
    </View>
  )
}
