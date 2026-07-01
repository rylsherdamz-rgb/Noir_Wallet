import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

interface WelcomeScreenProps {
  onGetStarted: () => void
  onSwitchRole: () => void
  isMerchant?: boolean
}

export function WelcomeScreen({ onGetStarted, onSwitchRole, isMerchant }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.black, Colors.darkGrey]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Ionicons name="wallet-outline" size={48} color={Colors.accentGreen} />
          </View>
          <Text style={styles.title}>Noir Wallet</Text>
          <Text style={styles.subtitle}>
            {isMerchant
              ? 'Accept contactless payments with a single tap'
              : 'Tap any RFID card or sticker to pay instantly'}
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureRow
            icon="radio-outline"
            title="Tap to Pay"
            description="No app opens, no confirmations. Just tap and go."
          />
          <FeatureRow
            icon="planet-outline"
            title="Stellar Powered"
            description="Fast, low-cost transactions on the Stellar network."
          />
          <FeatureRow
            icon="cash-outline"
            title="PDAX Fiat Bridge"
            description="Cash in and out in Philippine Pesos."
          />
          <FeatureRow
            icon="hardware-chip-outline"
            title="x402 Protocol"
            description="Hardware-backed payments with zero UI interaction."
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onGetStarted} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>
              {isMerchant ? 'Start Accepting Payments' : 'Create Your Wallet'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={onSwitchRole} activeOpacity={0.7}>
            <Ionicons name="swap-horizontal-outline" size={18} color={Colors.mutedWhite} />
            <Text style={styles.switchBtnText}>
              Switch to {isMerchant ? 'Consumer' : 'Merchant'} Mode
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

function FeatureRow({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color={Colors.accentGreen} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
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
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.accentGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    color: Colors.white,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.mutedWhite,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  features: {
    marginVertical: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accentGreen + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginTop: 2,
  },
  actions: {
    gap: Spacing.md,
  },
  primaryBtn: {
    backgroundColor: Colors.accentGreen,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.black,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  switchBtnText: {
    color: Colors.mutedWhite,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
})
