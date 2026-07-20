import { useState } from 'react'
import {
  View,
  Text,
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
import { Colors } from '@/constants/theme'
import { StellarNetwork } from '@/types'
import { walletService } from '@/services/wallet'
import { x402 } from '@/domain/x402'

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
          onPress: async () => {
            setBusy(true)
            await walletService.clearKeys()
            await x402.clearAgent()
            reset()
            router.replace('/onboarding')
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[32px] text-cream font-heavy py-4">Settings</Text>

        {/* Profile */}
        <SectionHeader title="Profile" />
        <Card style={{ marginBottom: 24 }}>
          <TouchableOpacity className="flex-row items-center justify-between py-4" onPress={() => router.push('/profile')}>
            <View className="flex-row items-center gap-4 shrink">
              <Ionicons name="person-outline" size={20} color={Colors.silver} />
              <View>
                <Text className="text-base text-white font-medium">Profile</Text>
                <Text className="text-xs text-mutedWhite mt-0.5">{user?.displayName || 'Tap to set up'}</Text>
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
        <Card style={{ marginBottom: 24 }}>
          <TouchableOpacity className="flex-row items-center justify-between py-4" onPress={() => router.push('/settings/security')}>
            <View className="flex-row items-center gap-4 shrink">
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.silver} />
              <View>
                <Text className="text-base text-white font-medium">Security Settings</Text>
                <Text className="text-xs text-mutedWhite mt-0.5">
                  {security.biometricLockEnabled ? 'Biometric + Auto-lock' : 'Tap to configure'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
        </Card>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <Card style={{ marginBottom: 24 }}>
          <TouchableOpacity className="flex-row items-center justify-between py-4" onPress={() => router.push('/settings/notifications')}>
            <View className="flex-row items-center gap-4 shrink">
              <Ionicons name="notifications-outline" size={20} color={Colors.silver} />
              <View>
                <Text className="text-base text-white font-medium">Notifications</Text>
                <Text className="text-xs text-mutedWhite mt-0.5">View notification history and preferences</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
        </Card>

        {/* Network */}
        <SectionHeader title="Network" />
        <Card style={{ marginBottom: 24 }}>
          <View className="flex-row flex-wrap gap-2 py-1">
            {(['testnet', 'mainnet'] as StellarNetwork[]).map((net) => {
              const active = network === net
              return (
                <TouchableOpacity
                  key={net}
                  className={`flex-row items-center gap-[6px] px-4 py-2 rounded-full bg-midGrey border border-borderGrey grow justify-center ${active ? 'bg-gold border-gold' : ''}`}
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
                  <Text className={`text-sm text-silver font-semibold ${active ? 'text-black' : ''}`}>
                    {net === 'mainnet' ? 'Mainnet' : 'Testnet'}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <Text className="text-xs text-mutedWhite pt-2">
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

        {/* Fiat */}
        <SectionHeader title="Banking" />
        <Card style={{ marginBottom: 24 }}>
          <TouchableOpacity className="flex-row items-center justify-between py-4" onPress={() => router.push('/cards')}>
            <View className="flex-row items-center gap-4 shrink">
              <Ionicons name="card-outline" size={20} color={Colors.silver} />
              <View>
                <Text className="text-base text-white font-medium">Cards</Text>
                <Text className="text-xs text-mutedWhite mt-0.5">Add a tap-to-pay card, set a PIN, or revoke</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between py-4" onPress={() => router.push('/fiat')}>
            <View className="flex-row items-center gap-4 shrink">
              <Ionicons name="wallet-outline" size={20} color={Colors.silver} />
              <View>
                <Text className="text-base text-white font-medium">Cash In / Cash Out</Text>
                <Text className="text-xs text-mutedWhite mt-0.5">Deposit or withdraw PHP via PDAX</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
        </Card>

        {/* About / danger */}
        <SectionHeader title="About" />
        <Card style={{ marginBottom: 24 }}>
          <Row icon="information-circle-outline" label="Noir Wallet" value="v1.0.0" />
          <Divider />
          <Row icon="document-text-outline" label="Tagline" value="Tap into Trust" />
        </Card>

        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-4 rounded-xl border border-[#FF5A5F] mt-2"
          onPress={handleReset}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Sign out and reset"
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text className="text-[#FF5A5F] text-base font-semibold">Sign out & reset</Text>
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
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-4 shrink">
        <Ionicons name={icon} size={20} color={Colors.silver} />
        <Text className="text-base text-white font-medium">{label}</Text>
      </View>
      <Text
        className={`text-sm text-mutedWhite ml-4 shrink text-right ${mono ? 'font-mono' : ''}`}
        style={valueColor ? { color: valueColor } : undefined}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  )
}

function Divider() {
  return <View className="h-[1px] bg-borderGrey my-1" />
}
