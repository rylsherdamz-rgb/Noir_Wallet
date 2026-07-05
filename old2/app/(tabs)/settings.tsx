import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/Card'
import { SectionHeader } from '@/components/SectionHeader'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { StellarNetwork } from '@/types'

const TIMEOUT_OPTIONS: { label: string; sec: number }[] = [
  { label: 'Immediately', sec: 0 },
  { label: '30s', sec: 30 },
  { label: '1m', sec: 60 },
  { label: '5m', sec: 300 },
]

export default function SettingsScreen() {
  const router = useRouter()
  const {
    user,
    network,
    setNetwork,
    nfcSupported,
    security,
    reset,
  } = useAppStore()

  const [busy, setBusy] = useState(false)

  const handleReset = () => {
    Alert.alert(
      'Sign out & reset',
      'This clears local wallet state on this device. Make sure your recovery details are backed up.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setBusy(true)
            reset()
            router.replace('/onboarding')
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Profile */}
        <SectionHeader title="Profile" />
        <Card style={styles.card}>
          <TouchableOpacity style={styles.navRow} onPress={() => router.push('/profile')}>
            <View style={styles.rowLeft}>
              <Ionicons name="person-outline" size={20} color={Colors.silver} />
              <View>
                <Text style={styles.rowLabel}>Profile</Text>
                <Text style={styles.navHint}>{user?.displayName || 'Tap to set up'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
          <Divider />
          <Row
            icon="mail-outline"
            label="Email"
            value={user?.email ?? 'Not signed in'}
          />
          <Divider />
          <Row
            icon="key-outline"
            label="Stellar address"
            value={
              user?.stellarPublicKey
                ? `${user.stellarPublicKey.slice(0, 8)}…${user.stellarPublicKey.slice(-6)}`
                : '—'
            }
            mono
          />
        </Card>

        {/* Security */}
        <SectionHeader title="Security" />
        <Card style={styles.card}>
          <TouchableOpacity style={styles.navRow} onPress={() => router.push('/settings/security')}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.silver} />
              <View>
                <Text style={styles.rowLabel}>Security Settings</Text>
                <Text style={styles.navHint}>
                  {security.biometricLockEnabled ? 'Biometric + Auto-lock' : 'Tap to configure'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
        </Card>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <Card style={styles.card}>
          <TouchableOpacity style={styles.navRow} onPress={() => router.push('/settings/notifications')}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.silver} />
              <View>
                <Text style={styles.rowLabel}>Notifications</Text>
                <Text style={styles.navHint}>View notification history and preferences</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
        </Card>

        {/* Network */}
        <SectionHeader title="Network" />
        <Card style={styles.card}>
          <View style={styles.chips}>
            {(['testnet', 'mainnet'] as StellarNetwork[]).map((net) => {
              const active = network === net
              return (
                <TouchableOpacity
                  key={net}
                  style={[styles.chip, styles.chipWide, active && styles.chipActive]}
                  onPress={() => setNetwork(net)}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${net}`}
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons
                    name={net === 'mainnet' ? 'globe-outline' : 'flask-outline'}
                    size={16}
                    color={active ? Colors.black : Colors.silver}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {net === 'mainnet' ? 'Mainnet' : 'Testnet'}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={styles.hint}>
            {network === 'testnet'
              ? 'Test SDF Network — no real value.'
              : 'Public network — real assets.'}
          </Text>
          <Divider />
          <Row
            icon="radio-outline"
            label="NFC"
            value={nfcSupported ? 'Available' : 'Unavailable'}
            valueColor={nfcSupported ? Colors.success : Colors.danger}
          />
        </Card>

        {/* About / danger */}
        <SectionHeader title="About" />
        <Card style={styles.card}>
          <Row icon="information-circle-outline" label="Noir Wallet" value="v1.0.0" />
          <Divider />
          <Row icon="document-text-outline" label="Tagline" value="Tap into Trust" />
        </Card>

        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={handleReset}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Sign out and reset"
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={styles.dangerText}>Sign out & reset</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({
  icon,
  label,
  value,
  mono,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
  mono?: boolean
  valueColor?: string
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={Colors.silver} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text
        style={[
          styles.rowValue,
          mono && styles.mono,
          valueColor ? { color: valueColor } : null,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  )
}

function Divider() {
  return <View style={styles.divider} />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  screenTitle: {
    fontSize: FontSize.xxl,
    color: Colors.cream,
    fontWeight: FontWeight.heavy,
    paddingVertical: Spacing.md,
  },
  card: { marginBottom: Spacing.lg, paddingVertical: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexShrink: 1 },
  rowLabel: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.medium },
  rowValue: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginLeft: Spacing.md,
    flexShrink: 1,
    textAlign: 'right',
  },
  mono: { fontFamily: 'monospace' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  navHint: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 2,
  },
  subLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingVertical: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.midGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  chipWide: { flexGrow: 1, justifyContent: 'center' },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { fontSize: FontSize.sm, color: Colors.silver, fontWeight: FontWeight.semibold },
  chipTextActive: { color: Colors.black },
  hint: { fontSize: FontSize.xs, color: Colors.mutedWhite, paddingTop: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.borderGrey, marginVertical: Spacing.xs },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.danger,
    marginTop: Spacing.sm,
  },
  dangerText: { color: Colors.danger, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
})
