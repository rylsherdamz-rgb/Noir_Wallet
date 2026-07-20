import { useEffect, useRef } from 'react'
import { View, Text, Animated, Platform } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors } from '@/constants/theme'
import { ToastType } from '@/types'

interface ToastProps {
  visible: boolean
  type: ToastType
  title: string
  message?: string
  onDismiss: () => void
  duration?: number
  hapticFeedback?: boolean
  testID?: string
}

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
}

const COLORS: Record<ToastType, string> = {
  success: Colors.success,
  error: Colors.danger,
  warning: Colors.warning,
  info: Colors.gold,
}

const HAPTIC_TYPES: Record<ToastType, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  warning: Haptics.NotificationFeedbackType.Warning,
  info: Haptics.NotificationFeedbackType.Success,
}

export function Toast({
  visible,
  type,
  title,
  message,
  onDismiss,
  duration = type === 'error' ? 5000 : 3000,
  hapticFeedback = true,
  testID,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    if (visible) {
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(HAPTIC_TYPES[type])
      }

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: DesignTokens.animation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 100,
        }),
      ]).start()

      const timer = setTimeout(() => {
        dismiss()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible])

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: DesignTokens.animation.duration.quick,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: DesignTokens.animation.duration.quick,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss())
  }

  const handleDismiss = () => {
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    dismiss()
  }

  if (!visible) return null

  const backgroundColor = COLORS[type]

  return (
    <Animated.View
      className="absolute z-[500] left-4 right-4"
      style={[
        {
          top: Platform.OS === 'ios' ? 60 : 20,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
      testID={testID}
    >
      <PressableScale
        className="flex-row items-center bg-cardBg rounded-xl p-4 border border-borderGrey gap-2"
        style={[{ borderLeftWidth: 3, borderLeftColor: backgroundColor }, DesignTokens.shadows.card]}
        onPress={handleDismiss}
        accessibilityRole="alert"
        accessibilityLabel={`${type}: ${title}${message ? `. ${message}` : ''}`}
        accessibilityHint="Tap to dismiss"
      >
        <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colorWithOpacity(backgroundColor, 0.15) }}>
          <Ionicons name={ICONS[type]} size={DesignTokens.iconSize.sm} color={backgroundColor} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-white">{title}</Text>
          {message ? <Text className="text-xs text-mutedWhite mt-0.5" style={{ lineHeight: DesignTokens.typography.size.xs * DesignTokens.typography.lineHeight.normal }}>{message}</Text> : null}
        </View>
        <PressableScale
          onPress={handleDismiss}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={18} color={Colors.mutedWhite} />
        </PressableScale>
      </PressableScale>
    </Animated.View>
  )
}
