import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Polygon, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { useState, useEffect } from 'react'
import { fxRateService } from '@/services/fxRates'
import { SkeletonLoader } from './SkeletonLoader'
import { CurrencyToken } from './brand/CurrencyToken'
import { useCountUp } from '@/hooks/useCountUp'
import { AssetCode } from '@/types'

interface AssetRowProps {
  asset: AssetCode
  label: string
  amount: string
  value: string
  testID?: string
}

function AssetRow({ asset, label, amount, value, testID }: AssetRowProps) {
  return (
    <View style={styles.assetRow} testID={testID}>
      <CurrencyToken asset={asset} size={38} />
      <View style={styles.assetInfo}>
        <Text style={styles.assetLabel}>{label}</Text>
        <Text style={styles.assetAmount}>{amount}</Text>
      </View>
      <View style={styles.assetValueWrap}>
        <Text style={styles.assetValue}>{value}</Text>
      </View>
    </View>
  )
}

/** Refined faceted shard — original shape, now with per-facet gradients + edges. */
function HeroFacets() {
  return (
    <View style={styles.facets} pointerEvents="none">
      <Svg width={172} height={172} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="fgH" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#E9C482" />
            <Stop offset="1" stopColor="#C6A15B" />
          </SvgLinearGradient>
          <SvgLinearGradient id="fgM" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#C6A15B" />
            <Stop offset="1" stopColor="#8F6C33" />
          </SvgLinearGradient>
          <SvgLinearGradient id="fgD" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#A57E3D" />
            <Stop offset="1" stopColor="#6E5327" />
          </SvgLinearGradient>
        </Defs>
        <Polygon points="50,4 92,26 78,60 44,52" fill="url(#fgH)" stroke="#0D0D0D" strokeWidth={0.5} strokeLinejoin="round" />
        <Polygon points="44,52 78,60 60,96 30,74" fill="url(#fgM)" stroke="#0D0D0D" strokeWidth={0.5} strokeLinejoin="round" />
        <Polygon points="8,30 50,4 44,52 14,64" fill="url(#fgD)" stroke="#0D0D0D" strokeWidth={0.5} strokeLinejoin="round" />
        <Polygon points="14,64 44,52 30,74 12,86" fill="url(#fgH)" stroke="#0D0D0D" strokeWidth={0.5} strokeLinejoin="round" />
      </Svg>
    </View>
  )
}

interface BalanceCardProps {
  phpBalance: number
  usdcBalance: number
  xlmBalance: number
  localTokens?: Record<string, number>
  loading?: boolean
  testID?: string
}

const MASK = '••••••'

function formatPhp(n: number): string {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const TILT_MAX = 6 // degrees

export function BalanceCard({
  phpBalance,
  usdcBalance,
  xlmBalance,
  localTokens,
  loading = false,
  testID,
}: BalanceCardProps) {
  const [rates, setRates] = useState({ usdToPhp: 58, xlmToUsd: 0.12 })
  const [loadingRates, setLoadingRates] = useState(true)
  const [hidden, setHidden] = useState(false)
  const reducedMotion = useReducedMotion()

  // Tilt-toward-touch state (UI thread)
  const rx = useSharedValue(0)
  const ry = useSharedValue(0)
  const sx = useSharedValue(0)
  const sy = useSharedValue(0)
  const w = useSharedValue(0)
  const h = useSharedValue(0)

  useEffect(() => {
    fxRateService
      .getRates()
      .then(setRates)
      .catch(() => {
        // Use default rates on error
      })
      .finally(() => setLoadingRates(false))
  }, [])

  const onLayout = (e: LayoutChangeEvent) => {
    w.value = e.nativeEvent.layout.width
    h.value = e.nativeEvent.layout.height
  }

  // Horizontal-drag tilt that yields to the vertical scroll of the parent list.
  const tilt = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      'worklet'
      if (reducedMotion) return
      const px = w.value ? e.x / w.value - 0.5 : 0
      const py = h.value ? e.y / h.value - 0.5 : 0
      ry.value = px * TILT_MAX * 2
      rx.value = -py * TILT_MAX * 2
      sx.value = px * 16
      sy.value = py * 16
    })
    .onFinalize(() => {
      'worklet'
      rx.value = withSpring(0, { damping: 16, stiffness: 140 })
      ry.value = withSpring(0, { damping: 16, stiffness: 140 })
      sx.value = withSpring(0, { damping: 16, stiffness: 140 })
      sy.value = withSpring(0, { damping: 16, stiffness: 140 })
    })

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${ry.value}deg` },
    ],
  }))

  const sheenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sx.value }, { translateY: sy.value }],
  }))

  const xlmValueInPhp = xlmBalance * rates.xlmToUsd * rates.usdToPhp
  const usdcValueInPhp = usdcBalance * rates.usdToPhp
  const totalPhp = phpBalance + usdcValueInPhp + xlmValueInPhp

  const shownTotal = useCountUp(totalPhp, { enabled: !hidden && !loadingRates })

  if (loading || loadingRates) {
    return <SkeletonLoader variant="balance" testID={`${testID}-skeleton`} />
  }

  return (
    <GestureDetector gesture={tilt}>
      <Animated.View style={cardStyle} onLayout={onLayout}>
        <LinearGradient
          colors={['rgba(228,190,124,0.92)', 'rgba(198,161,91,0.42)', 'rgba(120,92,45,0.16)', 'rgba(0,0,0,0.42)']}
          locations={[0, 0.38, 0.68, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBorder}
        >
          <LinearGradient
            colors={['#191919', '#0E0E0E']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.heroInner}
            testID={testID}
          >
            <HeroFacets />

            {/* thin warm ray of light — glints off the top-right facet corner, clear of the balance text */}
            <Animated.View style={[styles.sheenWrap, sheenStyle]} pointerEvents="none">
              <LinearGradient
                colors={['transparent', 'rgba(255,246,228,0.04)', 'rgba(255,248,236,0.16)', 'rgba(255,246,228,0.04)', 'transparent']}
                locations={[0.72, 0.79, 0.82, 0.85, 0.91]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            {/* beveled edges: lit top highlight + shadowed bottom lip (fakes the inset bevel RN lacks) */}
            <View style={styles.topHighlight} pointerEvents="none" />
            <View style={styles.bottomShadow} pointerEvents="none" />

            {/* Portfolio Total */}
            <View
              accessibilityLabel={`Total portfolio value: ${hidden ? 'hidden' : totalPhp.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`}
              accessibilityRole="summary"
            >
              <View style={styles.totalHeader}>
                <Text style={styles.totalLabel}>PORTFOLIO VALUE</Text>
                <TouchableOpacity
                  onPress={() => setHidden((v) => !v)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
                  testID="balance-privacy-toggle"
                >
                  <Ionicons
                    name={hidden ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.mutedWhite}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.totalAmount} accessibilityRole="text">
                <Text style={styles.currency}>₱</Text>
                {hidden ? MASK : formatPhp(shownTotal)}
              </Text>

              {!hidden && totalPhp > 0 && (
                <Text style={styles.totalSub}>
                  ${(totalPhp / rates.usdToPhp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD available
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.assetList} accessibilityRole="list">
              <AssetRow asset="PHP" label="PHP · CASH" amount={`₱${formatPhp(phpBalance)}`} value="Fiat" testID="balance-card-php" />
              <AssetRow
                asset="USDC"
                label="USDC · STABLECOIN"
                amount={usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                value={`₱${formatPhp(usdcValueInPhp)}`}
                testID="balance-card-usdc"
              />
              <AssetRow
                asset="XLM"
                label="XLM · STELLAR"
                amount={xlmBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                value={`₱${formatPhp(xlmValueInPhp)}`}
                testID="balance-card-xlm"
              />
            </View>
          </LinearGradient>
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  heroBorder: {
    borderRadius: 22,
    padding: 1.5,
    // stronger, softer depth so the card reads as raised
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 26,
    elevation: 12,
  },
  heroInner: {
    borderRadius: 21,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  facets: {
    position: 'absolute',
    top: -28,
    right: -22,
    opacity: 0.18,
  },
  sheenWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 22,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 22,
    right: 14,
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: Fonts.displayMd,
    fontSize: FontSize.xs,
    color: Colors.silver,
    letterSpacing: 2,
  },
  totalAmount: {
    fontFamily: Fonts.display,
    fontSize: 38,
    color: Colors.cream,
    marginTop: Spacing.sm,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  currency: {
    fontFamily: Fonts.display,
    fontSize: 29,
    color: Colors.gold,
  },
  totalSub: {
    fontSize: FontSize.sm,
    color: Colors.silver,
    marginTop: Spacing.sm,
    fontWeight: FontWeight.medium,
    minHeight: 18,
    fontVariant: ['tabular-nums'],
  },

  divider: {
    height: 1,
    backgroundColor: Colors.borderGrey,
    marginVertical: Spacing.lg,
  },

  assetList: {
    gap: Spacing.md,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    minHeight: DesignTokens.touchTarget.minimum,
  },
  assetInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  assetLabel: {
    fontFamily: Fonts.displayMd,
    fontSize: 10,
    color: Colors.mutedWhite,
    letterSpacing: 1.4,
  },
  assetAmount: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  assetValueWrap: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
})
