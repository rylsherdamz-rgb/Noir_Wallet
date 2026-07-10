import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'

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
      <Animated.View style={[styles.balanceCard, { opacity }]} testID={testID}>
        {/* Total Section */}
        <View style={styles.balanceTotalSection}>
          <View style={[styles.line, styles.balanceLabel]} />
          <View style={[styles.line, styles.balanceAmount]} />
          <View style={[styles.line, styles.balanceSubAmount]} />
        </View>

        <View style={styles.balanceDivider} />

        {/* Asset Rows */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.balanceAssetRow}>
            <View style={styles.balanceAssetIcon} />
            <View style={styles.balanceAssetInfo}>
              <View style={[styles.line, styles.balanceAssetLabel]} />
              <View style={[styles.line, styles.balanceAssetAmount]} />
            </View>
            <View style={[styles.line, styles.balanceAssetValue]} />
          </View>
        ))}
      </Animated.View>
    )
  }

  if (variant === 'transaction') {
    return (
      <Animated.View style={[styles.transactionItem, { opacity }]} testID={testID}>
        <View style={styles.transactionIcon} />
        <View style={styles.transactionInfo}>
          <View style={[styles.line, styles.transactionTitle]} />
          <View style={[styles.line, styles.transactionMeta]} />
        </View>
        <View style={styles.transactionAmount}>
          <View style={[styles.line, styles.transactionAmountValue]} />
          <View style={[styles.line, styles.transactionHash]} />
        </View>
      </Animated.View>
    )
  }

  if (variant === 'card') {
    return (
      <Animated.View style={[styles.card, { opacity }]} testID={testID}>
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

  // Text variant (default)
  return (
    <Animated.View style={[styles.textBlock, { opacity }]} testID={testID}>
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
  // Balance Card Skeleton
  balanceCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    ...DesignTokens.shadows.card,
  },
  balanceTotalSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  balanceLabel: {
    width: 120,
    height: 12,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    width: 180,
    height: 32,
    marginBottom: Spacing.xs,
  },
  balanceSubAmount: {
    width: 100,
    height: 14,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: Colors.borderGrey,
    marginVertical: Spacing.lg,
  },
  balanceAssetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  balanceAssetIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    marginRight: Spacing.md,
  },
  balanceAssetInfo: {
    flex: 1,
    gap: 4,
  },
  balanceAssetLabel: {
    width: 60,
    height: 10,
  },
  balanceAssetAmount: {
    width: 80,
    height: 14,
  },
  balanceAssetValue: {
    width: 70,
    height: 14,
  },

  // Transaction Item Skeleton
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    minHeight: DesignTokens.touchTarget.large,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGrey,
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
    gap: 6,
  },
  transactionTitle: {
    width: '70%',
    height: 16,
  },
  transactionMeta: {
    width: '50%',
    height: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmountValue: {
    width: 80,
    height: 16,
  },
  transactionHash: {
    width: 60,
    height: 10,
  },

  // Card Skeleton
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
    borderRadius: BorderRadius.full,
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

  // Text Skeleton
  textBlock: {
    padding: Spacing.md,
  },
  line: {
    backgroundColor: Colors.lightGrey,
    borderRadius: BorderRadius.sm,
  },
  lineFull: {
    width: '100%',
    height: 12,
  },
  lineMedium: {
    width: '70%',
    height: 12,
  },
  lineShort: {
    width: '40%',
    height: 12,
  },
})
