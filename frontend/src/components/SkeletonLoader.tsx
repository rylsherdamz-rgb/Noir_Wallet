import { useEffect, useRef } from 'react'
import { View, Animated } from 'react-native'
import { DesignTokens } from '@/constants/designTokens'

interface SkeletonLoaderProps {
  lines?: number
  variant?: 'card' | 'list' | 'text' | 'balance' | 'transaction'
  testID?: string
}

export function SkeletonLoader({ lines = 3, variant = 'list', testID }: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: DesignTokens.animation.duration.slower,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: DesignTokens.animation.duration.slower,
          useNativeDriver: true,
        }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [])

  if (variant === 'balance') {
    return (
      <Animated.View className="bg-cardBg rounded-2xl p-6 border border-borderGrey" style={[{ opacity }, DesignTokens.shadows.card]} testID={testID}>
        <View className="items-center py-4">
          <View className="w-[120] h-3 bg-[#2C2C2C] rounded-lg mb-2" />
          <View className="w-[180] h-8 bg-[#2C2C2C] rounded-lg mb-1" />
          <View className="w-[100] h-3.5 bg-[#2C2C2C] rounded-lg" />
        </View>

        <View className="h-px bg-borderGrey my-6" />

        {[1, 2, 3].map((i) => (
          <View key={i} className="flex-row items-center py-1 mb-4">
            <View className="w-10 h-10 rounded-full bg-[#2C2C2C] mr-4" />
            <View className="flex-1 gap-1">
              <View className="w-[60] h-2.5 bg-[#2C2C2C] rounded-lg" />
              <View className="w-[80] h-3.5 bg-[#2C2C2C] rounded-lg" />
            </View>
            <View className="w-[70] h-3.5 bg-[#2C2C2C] rounded-lg" />
          </View>
        ))}
      </Animated.View>
    )
  }

  if (variant === 'transaction') {
    return (
      <Animated.View className="flex-row items-center py-4 px-4 bg-cardBg rounded-xl mb-2 border border-borderGrey min-h-[72]" style={{ opacity }} testID={testID}>
        <View className="w-10 h-10 rounded-xl bg-[#2C2C2C] mr-4" />
        <View className="flex-1 gap-1.5">
          <View className="w-[70%] h-4 bg-[#2C2C2C] rounded-lg" />
          <View className="w-1/2 h-3 bg-[#2C2C2C] rounded-lg" />
        </View>
        <View className="items-end gap-1">
          <View className="w-[80] h-4 bg-[#2C2C2C] rounded-lg" />
          <View className="w-[60] h-2.5 bg-[#2C2C2C] rounded-lg" />
        </View>
      </Animated.View>
    )
  }

  if (variant === 'card') {
    return (
      <Animated.View className="bg-cardBg rounded-xl p-4 border border-borderGrey" style={{ opacity }} testID={testID}>
        <View className="flex-row gap-2 mb-4">
          <View className="w-10 h-10 rounded-full bg-[#2C2C2C]" />
          <View className="flex-1 gap-1 justify-center">
            <View className="w-[40%] h-3 bg-[#2C2C2C] rounded-lg" />
            <View className="w-[70%] h-3 bg-[#2C2C2C] rounded-lg" />
          </View>
        </View>
        <View className="gap-1">
          <View className="w-full h-3 bg-[#2C2C2C] rounded-lg" />
          <View className="w-[70%] h-3 bg-[#2C2C2C] rounded-lg" />
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View className="p-4" style={{ opacity }} testID={testID}>
      {Array.from({ length: lines }).map((_, i) => (
        <View
          key={i}
          className={`h-3 bg-[#2C2C2C] rounded-lg mb-2 ${i === lines - 1 ? 'w-[40%]' : 'w-full'}`}
        />
      ))}
    </Animated.View>
  )
}
