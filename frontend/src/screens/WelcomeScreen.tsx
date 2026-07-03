import { View, Text, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { PrimaryButton } from '@/components/PrimaryButton'
import { GhostButton } from '@/components/GhostButton'

interface WelcomeScreenProps {
  onCreateWallet: () => void
  onImportWallet: () => void
}

const LOGO = require('../../assets/logo.jpg')

export function WelcomeScreen({ onCreateWallet, onImportWallet }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.black, Colors.surfaceBg]} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>NOIR</Text>
          <Text style={styles.tagline}>Tap into Trust</Text>
        </View>

        <View style={styles.bottom}>
          <View style={styles.features}>
            <Feature icon="radio-outline" label="Register NFC Card" />
            <Feature icon="sparkles" label="x402 Agent Payments" />
            <Feature icon="cube-outline" label="Stellar Blockchain" />
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Register My Card" onPress={onCreateWallet} icon="radio-outline" />
            <GhostButton label="I already have a wallet" onPress={onImportWallet} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

function Feature({ icon, label }: { icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; label: string }) {
  const { Ionicons } = require('@expo/vector-icons') as typeof import('@expo/vector-icons')
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color={Colors.gold} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'space-between', paddingTop: Spacing.xxl * 2, paddingBottom: Spacing.xl },
  hero: { alignItems: 'center' },
  logo: { width: 120, height: 120, borderRadius: 60 },
  brand: { fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy, color: Colors.cream, letterSpacing: 8, marginTop: Spacing.md },
  tagline: { fontSize: FontSize.sm, color: Colors.gold, letterSpacing: 4, marginTop: Spacing.sm, textTransform: 'uppercase' },
  bottom: { gap: Spacing.xl },
  features: { gap: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureIcon: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.gold + '15', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.gold + '25' },
  featureLabel: { fontSize: FontSize.md, color: Colors.silver, fontWeight: FontWeight.medium },
  actions: { gap: Spacing.md },
})
