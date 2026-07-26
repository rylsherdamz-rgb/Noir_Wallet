import { useEffect, useRef } from 'react'
import { View, Text, Animated, Easing, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

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

  // Pulse animation
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

  // Rotate animation
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

  // Glow animation
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

  // Success/Error animation
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
      style={styles.container}
      testID={testID}
      accessibilityLabel={`${getStatusText()}. Amount: ${amount || 'None'}`}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.radarWrap}>
        {/* Outer Pulsing Ring */}
        {(isActive || state === 'processing') && (
          <Animated.View
            style={[
              styles.radarOuter,
              {
                transform: [{ scale: pulseAnim }],
                opacity: glowOpacity,
                borderColor: getIconColor() + '40',
              },
            ]}
          />
        )}

        {/* Rotating Dots */}
        {isActive && state !== 'success' && state !== 'error' && (
          <Animated.View
            style={[
              styles.radarRing,
              { transform: [{ rotate: rotateInterpolate }] },
            ]}
          >
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <View
                key={deg}
                style={[
                  styles.radarDot,
                  {
                    backgroundColor: getIconColor(),
                    transform: [{ rotate: `${deg}deg` }, { translateY: -55 }],
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}

        {/* Center Icon */}
        <Animated.View
          style={[
            styles.radarCenter,
            {
              backgroundColor: getIconColor() + '15',
              transform: [{ scale: successScale }],
            },
            (state === 'success' || state === 'error') && {
              ...DesignTokens.shadows[state === 'success' ? 'successGlow' : 'errorGlow'],
            },
          ]}
        >
          <Ionicons name={getIconName()} size={DesignTokens.iconSize.lg} color={getIconColor()} />
        </Animated.View>
      </View>

      {/* Amount Display */}
      <Text
        style={[styles.amountLabel, state === 'error' && { color: Colors.danger }]}
        accessibilityRole="text"
      >
        {amount || '₱0.00'}
      </Text>

      {/* Status Text */}
      <Text
        style={[
          styles.statusText,
          { color: getIconColor() },
          state === 'processing' && styles.statusTextBlink,
        ]}
        accessibilityRole="text"
      >
        {getStatusText()}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  radarWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  radarOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  radarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    opacity: DesignTokens.opacity.strong,
  },
  radarCenter: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  amountLabel: {
    fontSize: FontSize.xxxl,
    color: Colors.white,
    fontWeight: FontWeight.heavy,
    lineHeight: FontSize.xxxl * DesignTokens.typography.lineHeight.tight,
  },
  statusText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
  statusTextBlink: {
    opacity: 0.7,
  },
})
