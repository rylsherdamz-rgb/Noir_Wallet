import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
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
      // Provide haptic feedback
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(HAPTIC_TYPES[type])
      }

      // Animate in
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

      // Auto dismiss
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
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
      testID={testID}
    >
      <TouchableOpacity
        style={[styles.inner, { borderLeftWidth: 3, borderLeftColor: backgroundColor }]}
        onPress={handleDismiss}
        activeOpacity={0.9}
        accessibilityRole="alert"
        accessibilityLabel={`${type}: ${title}${message ? `. ${message}` : ''}`}
        accessibilityHint="Tap to dismiss"
      >
        <View style={[styles.iconWrap, { backgroundColor: colorWithOpacity(backgroundColor, 0.15) }]}>
          <Ionicons name={ICONS[type]} size={DesignTokens.iconSize.sm} color={backgroundColor} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={18} color={Colors.mutedWhite} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: DesignTokens.zIndex.toast,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    gap: Spacing.sm,
    ...DesignTokens.shadows.card,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  message: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 2,
    lineHeight: FontSize.xs * DesignTokens.typography.lineHeight.normal,
  },
})
