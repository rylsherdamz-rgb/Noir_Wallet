import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { PrimaryButton } from '@/components/PrimaryButton'
import { GhostButton } from '@/components/GhostButton'
import { UserRole } from '@/types'

interface WelcomeScreenProps {
  onGetStarted: () => void
  onSwitchRole: () => void
  onImport?: () => void
  isMerchant?: boolean
}

const VALUE_PROPS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'eye-off-outline', label: 'Invisible' },
  { icon: 'shield-checkmark-outline', label: 'Trusted' },
  { icon: 'link-outline', label: 'Connected' },
  { icon: 'flash-outline', label: 'Effortless' },
]

export function WelcomeScreen({
  onGetStarted,
  onSwitchRole,
  onImport,
  isMerchant,
}: WelcomeScreenProps) {
  const role: UserRole = isMerchant ? 'merchant' : 'consumer'

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.black, Colors.surfaceBg]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Brand lockup */}
        <View style={styles.hero}>
          <NoirLogo variant="lockup" size={96} />
        </View>

        {/* Value props */}
        <View style={styles.valueProps}>
          {VALUE_PROPS.map((v) => (
            <View key={v.label} style={styles.valueProp}>
              <View style={styles.valueIcon}>
                <Ionicons name={v.icon} size={22} color={Colors.gold} />
              </View>
              <Text style={styles.valueLabel}>{v.label}</Text>
            </View>
          ))}
        </View>

        {/* Role segmented control */}
        <View style={styles.segmentWrap}>
          <Text style={styles.segmentHint}>I am using Noir as a</Text>
          <View style={styles.segment} accessibilityRole="tablist">
            <SegmentButton
              label="Consumer"
              active={role === 'consumer'}
              onPress={() => {
                if (role !== 'consumer') onSwitchRole()
              }}
            />
            <SegmentButton
              label="Merchant"
              active={role === 'merchant'}
              onPress={() => {
                if (role !== 'merchant') onSwitchRole()
              }}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <PrimaryButton
            label="Create Wallet"
            icon="add-circle-outline"
            onPress={onGetStarted}
          />
          <GhostButton
            label="I already have a wallet"
            onPress={onImport ?? onGetStarted}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[styles.segmentBtn, active && styles.segmentBtnActive]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} mode`}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  valueProps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.xl,
  },
  valueProp: {
    alignItems: 'center',
    width: '22%',
  },
  valueIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15',
    borderWidth: 1,
    borderColor: Colors.gold + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  valueLabel: {
    fontSize: FontSize.xs,
    color: Colors.silver,
    fontWeight: FontWeight.medium,
  },
  segmentWrap: {
    marginBottom: Spacing.lg,
  },
  segmentHint: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.midGrey,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentBtnActive: {
    backgroundColor: Colors.gold,
  },
  segmentText: {
    fontSize: FontSize.sm,
    color: Colors.silver,
    fontWeight: FontWeight.semibold,
  },
  segmentTextActive: {
    color: Colors.black,
  },
  actions: {
    gap: Spacing.md,
  },
})
