import { useEffect, useRef } from 'react'
import { View, Text, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, FontSize } from '@/constants/theme'

interface ReadyToTapIndicatorProps {
  amount: string
  isActive: boolean
  state?: 'idle' | 'active' | 'processing' | 'success' | 'error'
  onTapDetected?: () => void
  testID?: string
}

export function ReadyToTapIndicator({
  amount,
  isActive,
  state = 'idle',
  onTapDetected,
  testID,
}: ReadyToTapIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const successScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!isActive || state === 'processing' || state === 'success' || state === 'error') {
      pulseAnim.setValue(1)
      return
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )

    pulse.start()
    return () => pulse.stop()
  }, [isActive, state])

  useEffect(() => {
    if (!isActive || state === 'success' || state === 'error') {
      rotateAnim.setValue(0)
      return
    }

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )

    rotate.start()
    return () => rotate.stop()
  }, [isActive, state])

  useEffect(() => {
    if (isActive && (state === 'active' || state === 'processing')) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      glowAnim.setValue(0)
    }
  }, [isActive, state])

  useEffect(() => {
    if (state === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Animated.sequence([
        Animated.spring(successScale, {
          toValue: 1.2,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
      ]).start()
    } else if (state === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Animated.sequence([
        Animated.timing(successScale, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(successScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      successScale.setValue(1)
    }
  }, [state])

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  })

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (state) {
      case 'success':
        return 'checkmark-circle'
      case 'error':
        return 'close-circle'
      case 'processing':
        return 'hourglass-outline'
      default:
        return 'radio-outline'
    }
  }

  const getIconColor = () => {
    switch (state) {
      case 'success':
        return Colors.success
      case 'error':
        return Colors.danger
      case 'processing':
        return Colors.warning
      default:
        return Colors.gold
    }
  }

  const getStatusText = () => {
    switch (state) {
      case 'success':
        return 'Payment Successful'
      case 'error':
        return 'Payment Failed'
      case 'processing':
        return 'Processing...'
      case 'active':
        return 'Ready to Tap'
      default:
        return 'Enter an amount'
    }
  }

  return (
    <View
      className="items-center py-8"
      testID={testID}
      accessibilityLabel={`${getStatusText()}. Amount: ${amount || 'None'}`}
      accessibilityLiveRegion="polite"
    >
      <View className="w-[140] h-[140] items-center justify-center mb-6">
        {(isActive || state === 'processing') && (
          <Animated.View
            className="absolute w-[140] h-[140] rounded-full border-2"
            style={{
              transform: [{ scale: pulseAnim }],
              opacity: glowOpacity,
              borderColor: getIconColor() + '40',
            }}
          />
        )}

        {isActive && state !== 'success' && state !== 'error' && (
          <Animated.View
            className="absolute w-[140] h-[140] items-center justify-center"
            style={{ transform: [{ rotate: rotateInterpolate }] }}
          >
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <View
                key={deg}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: getIconColor(),
                  opacity: DesignTokens.opacity.strong,
                  transform: [{ rotate: `${deg}deg` }, { translateY: -55 }],
                }}
              />
            ))}
          </Animated.View>
        )}

        <Animated.View
          className="w-16 h-16 rounded-full items-center justify-center border border-borderGrey"
          style={{
            backgroundColor: getIconColor() + '15',
            transform: [{ scale: successScale }],
            ...(state === 'success' || state === 'error'
              ? DesignTokens.shadows[state === 'success' ? 'successGlow' : 'errorGlow']
              : {}),
          }}
        >
          <Ionicons name={getIconName()} size={DesignTokens.iconSize.lg} color={getIconColor()} />
        </Animated.View>
      </View>

      <Text
        className="text-5xl text-white font-extrabold"
        style={{ lineHeight: FontSize.xxxl * DesignTokens.typography.lineHeight.tight }}
        accessibilityRole="text"
      >
        {amount || '₱0.00'}
      </Text>

      <Text
        className="text-base font-medium mt-2"
        style={[{ color: getIconColor() }, state === 'processing' && { opacity: 0.7 }]}
        accessibilityRole="text"
      >
        {getStatusText()}
      </Text>
    </View>
  )
}
