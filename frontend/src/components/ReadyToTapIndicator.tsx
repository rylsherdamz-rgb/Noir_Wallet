import { useEffect, useRef } from 'react'
import { View, Text, Animated, Easing, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface ReadyToTapIndicatorProps {
  amount: string
  isActive: boolean
  onTapDetected?: () => void
}

export function ReadyToTapIndicator({ amount, isActive }: ReadyToTapIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isActive) {
      pulseAnim.setValue(1)
      rotateAnim.setValue(0)
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

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )

    pulse.start()
    rotate.start()

    return () => {
      pulse.stop()
      rotate.stop()
    }
  }, [isActive])

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={styles.container}>
      <View style={styles.radarWrap}>
        <Animated.View
          style={[
            styles.radarOuter,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
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
                  transform: [
                    { rotate: `${deg}deg` },
                    { translateY: -55 },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
        <View style={styles.radarCenter}>
          <Ionicons name="radio-outline" size={32} color={Colors.accentGreen} />
        </View>
      </View>

      <Text style={styles.amountLabel}>
        {amount || '₱0.00'}
      </Text>
      <Text style={styles.statusText}>
        {isActive ? 'Ready to Tap' : 'Enter an amount'}
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
    borderRadius: 70,
    borderWidth: 2,
    borderColor: Colors.accentGreen + '30',
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
    borderRadius: 3,
    backgroundColor: Colors.accentGreen,
    opacity: 0.6,
  },
  radarCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountLabel: {
    fontSize: FontSize.xxxl,
    color: Colors.white,
    fontWeight: FontWeight.heavy,
  },
  statusText: {
    fontSize: FontSize.md,
    color: Colors.accentGreen,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
})
