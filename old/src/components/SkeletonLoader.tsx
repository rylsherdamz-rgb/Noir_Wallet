import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'

interface SkeletonLoaderProps {
  lines?: number
  variant?: 'card' | 'list' | 'text'
}

export function SkeletonLoader({ lines = 3, variant = 'list' }: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [])

  if (variant === 'card') {
    return (
      <Animated.View style={[styles.card, { opacity }]}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.cardHeaderLines}>
            <View style={[styles.line, styles.lineShort]} />
            <View style={[styles.line, styles.lineMedium]} />
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={[styles.line, styles.lineFull]} />
          <View style={[styles.line, styles.lineMedium]} />
        </View>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[styles.textBlock, { opacity }]}>
      {Array.from({ length: lines }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.line,
            i === lines - 1 ? styles.lineShort : styles.lineFull,
            { marginBottom: Spacing.sm },
          ]}
        />
      ))}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGrey,
  },
  cardHeaderLines: {
    flex: 1,
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  cardBody: {
    gap: Spacing.xs,
  },
  textBlock: {
    padding: Spacing.md,
  },
  line: {
    height: 12,
    backgroundColor: Colors.lightGrey,
    borderRadius: BorderRadius.sm,
  },
  lineFull: {
    width: '100%',
  },
  lineMedium: {
    width: '70%',
  },
  lineShort: {
    width: '40%',
  },
})
