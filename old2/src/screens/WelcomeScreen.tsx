import { View, Text, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Button } from '@/components/Button'

interface WelcomeScreenProps {
  onCreateWallet: () => void
  onImportWallet: () => void
}

const LOGO = require('../../assets/logo.jpg')

export function WelcomeScreen({ onCreateWallet, onImportWallet }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A0A0A', '#141414']} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['transparent', Colors.gold + '08']}
        locations={[0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.brand}>NOIR</Text>
            <Text style={styles.tagline}>Tap into Trust</Text>
          </View>

          <View style={styles.features}>
            {[
              { icon: 'radio-outline' as const, label: 'Register NFC Card', desc: 'Link your first hardware wallet in seconds' },
              { icon: 'flash-outline' as const, label: 'x402 Agent Payments', desc: 'AI-powered autonomous spending' },
              { icon: 'cube-outline' as const, label: 'Stellar Blockchain', desc: 'Fast, low-cost global transfers' },
            ].map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={20} color={Colors.gold} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button label="Register My Card" onPress={onCreateWallet} icon="radio-outline" />
            <Button variant="ghost" label="I already have a wallet" onPress={onImportWallet} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'space-between', paddingTop: Spacing.xxl * 2, paddingBottom: Spacing.xl },
  hero: { alignItems: 'center' },
  logoWrap: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.gold + '12',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.gold + '20',
  },
  logo: { width: 100, height: 100, borderRadius: 50 },
  brand: { fontSize: FontSize.xxxl, fontWeight: FontWeight.heavy, color: Colors.cream, letterSpacing: 8, marginTop: Spacing.lg },
  tagline: { fontSize: FontSize.sm, color: Colors.gold, letterSpacing: 4, marginTop: Spacing.sm, textTransform: 'uppercase' },
  features: { gap: Spacing.md, paddingHorizontal: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.gold + '25',
  },
  featureText: { flex: 1 },
  featureLabel: { fontSize: FontSize.md, color: Colors.cream, fontWeight: FontWeight.semibold },
  featureDesc: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2 },
  actions: { gap: Spacing.md, paddingHorizontal: Spacing.sm },
})
