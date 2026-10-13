import { useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Platform, AccessibilityInfo } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  cancelAnimation,
  runOnJS,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { PressableScale } from '@/components/brand/PressableScale'
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

/** Errors and warnings need reading time; confirmations do not. */
const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3000,
  info: 3500,
  warning: 5000,
  error: 6000,
}

/** Drag up past this (or flick up) to dismiss. */
const SWIPE_DISMISS_PX = 24
const HIDDEN_Y = -140
/** After a hold or an aborted swipe, leave at least this much of the timer. */
const MIN_RESUME = 0.35

function hapticFor(type: ToastType) {
  if (type === 'info') return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  return Haptics.notificationAsync(
    type === 'success' ? Haptics.NotificationFeedbackType.Success
      : type === 'error' ? Haptics.NotificationFeedbackType.Error
      : Haptics.NotificationFeedbackType.Warning
  )
}

/**
 * Top-of-screen status toast. Swipe up or tap × to dismiss; touching it holds
 * the timer (the bar along the bottom) so a long message can be read.
 */
export function Toast({
  visible,
  type,
  title,
  message,
  onDismiss,
  duration = DEFAULT_DURATION[type],
  hapticFeedback = true,
  testID,
}: ToastProps) {
  const insets = useSafeAreaInsets()
  const reduceMotion = useReducedMotion()
  const translateY = useSharedValue(HIDDEN_Y)
  const opacity = useSharedValue(0)
  const progress = useSharedValue(1)
  const dismissed = useRef(false)

  const dismiss = useCallback(() => {
    if (dismissed.current) return
    dismissed.current = true
    cancelAnimation(progress)
    const d = reduceMotion ? 0 : DesignTokens.animation.duration.quick
    opacity.value = withTiming(0, { duration: d })
    translateY.value = withTiming(HIDDEN_Y, { duration: d }, (done) => {
      if (done) runOnJS(onDismiss)()
    })
  }, [onDismiss, reduceMotion])

  const runTimer = useCallback((from: number) => {
    if (dismissed.current) return
    progress.value = from
    progress.value = withTiming(0, { duration: duration * from, easing: Easing.linear }, (done) => {
      if (done) runOnJS(dismiss)()
    })
  }, [duration, dismiss])

  useEffect(() => {
    if (!visible) return
    dismissed.current = false
    if (hapticFeedback && Platform.OS !== 'web') void hapticFor(type)
    AccessibilityInfo.announceForAccessibility(message ? `${title}. ${message}` : title)

    if (reduceMotion) {
      translateY.value = 0
      opacity.value = 1
    } else {
      translateY.value = withSpring(0, { damping: 18, stiffness: 180 })
      opacity.value = withTiming(1, { duration: DesignTokens.animation.duration.normal })
    }
    runTimer(1)
    return () => cancelAnimation(progress)
  }, [visible])

  const pan = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onBegin(() => { cancelAnimation(progress) })
    .onUpdate((e) => {
      // Follows the finger upward; resists a downward pull.
      translateY.value = e.translationY < 0 ? e.translationY : e.translationY * 0.15
    })
    .onFinalize((e) => {
      if (e.translationY < -SWIPE_DISMISS_PX || e.velocityY < -500) {
        runOnJS(dismiss)()
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 180 })
        runOnJS(runTimer)(Math.max(progress.value, MIN_RESUME))
      }
    })

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))
  const barStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }))

  if (!visible) return null

  const accent = COLORS[type]

  return (
    <Animated.View
      style={[styles.container, { top: insets.top + Spacing.sm }, containerStyle]}
      testID={testID}
    >
      <GestureDetector gesture={pan}>
        <View
          style={[styles.card, { borderColor: colorWithOpacity(accent, 0.35) }]}
          accessible
          accessibilityRole="alert"
          accessibilityLiveRegion={type === 'error' ? 'assertive' : 'polite'}
          accessibilityLabel={`${title}${message ? `. ${message}` : ''}`}
          accessibilityHint="Swipe up to dismiss"
          accessibilityActions={[{ name: 'dismiss', label: 'Dismiss' }]}
          onAccessibilityAction={dismiss}
        >
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colorWithOpacity(accent, 0.15) }]}>
              <Ionicons name={ICONS[type]} size={DesignTokens.iconSize.sm} color={accent} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title} numberOfLines={2}>{title}</Text>
              {message ? <Text style={styles.message} numberOfLines={4}>{message}</Text> : null}
            </View>
            <PressableScale
              onPress={dismiss}
              style={styles.close}
              accessibilityLabel="Dismiss"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={18} color={Colors.mutedWhite} />
            </PressableScale>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.bar, { backgroundColor: accent }, barStyle]} />
          </View>
        </View>
      </GestureDetector>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: DesignTokens.zIndex.toast,
    elevation: 12,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...DesignTokens.shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
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
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 2,
    backgroundColor: colorWithOpacity(Colors.white, 0.06),
  },
  bar: {
    height: 2,
    width: '100%',
    transformOrigin: 'left',
  },
})
