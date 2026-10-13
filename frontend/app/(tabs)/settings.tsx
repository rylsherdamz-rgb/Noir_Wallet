import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { popup } from '@/components/popup/Popup'
import { PressableScale } from '@/components/brand/PressableScale'
import { NetworkPicker } from '@/components/NetworkPicker'
import { PageTitle, SectionLabel, ListRow, TextAction } from '@/components/ui/List'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/components/ToastProvider'
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme'
import { walletService } from '@/services/wallet'
import { x402 } from '@/domain/x402'

function lockLabel(sec: number): string {
  if (sec <= 0) return 'Immediately'
  return sec < 60 ? `${sec}s` : `${Math.round(sec / 60)} min`
}

export default function SettingsScreen() {
  const router = useRouter()
  const toast = useToast()
  const { user, nfcSupported, security, reset } = useAppStore()
  const [busy, setBusy] = useState(false)
  const name = user?.displayName?.trim() || 'My wallet'
  const key = user?.stellarPublicKey

  const copyAddress = async () => {
    if (!key) return
    await Clipboard.setStringAsync(key)
    toast.success('Address copied', 'Your Stellar address is on the clipboard.')
  }

  const handleReset = () => {
    popup.confirm({
      title: 'Reset this phone?',
      message: 'This removes the wallet from this phone. Make sure your recovery phrase is written down — it’s the only way back in.',
      icon: 'log-out-outline',
      tone: 'danger',
      confirmLabel: 'Reset this phone',
    }).then(async (ok) => {
      if (!ok) return
      setBusy(true)
      await walletService.clearKeys()
      await x402.clearAllAgents()
      reset()
      router.replace('/onboarding')
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageTitle title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <PressableScale style={styles.account} onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel={`${name}. Open profile`}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
          <View style={styles.accountBody}>
            <Text style={styles.accountName} numberOfLines={1}>{name}</Text>
            <PressableScale style={styles.addr} onPress={copyAddress} disabled={!key} hitSlop={8} accessibilityRole="button" accessibilityLabel="Copy Stellar address">
              <Text style={styles.addrText}>{key ? `${key.slice(0, 8)}…${key.slice(-4)}` : 'No wallet'}</Text>
              {!!key && <Ionicons name="copy-outline" size={12} color={Colors.mutedWhite} />}
            </PressableScale>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
        </PressableScale>

        <SectionLabel title="Security" />
        <ListRow icon="finger-print-outline" title="Phone lock & auto-lock" value={lockLabel(security.backgroundLockTimeoutSec)} chevron onPress={() => router.push('/settings/security')} />
        <ListRow icon="key-outline" title="Recovery phrase & keys" chevron last onPress={() => router.push('/settings/export-keys')} />

        <SectionLabel title="Network" />
        <ListRow icon="git-network-outline" title="Stellar network" right={<NetworkPicker align="right" />} />
        <ListRow icon="radio-outline" title="NFC" value={nfcSupported ? 'Available' : 'Unavailable'} valueColor={nfcSupported ? Colors.success : Colors.danger} last />

        <SectionLabel title="Cards & alerts" />
        <ListRow icon="card-outline" title="Cards" subtitle="Add any NFC card or sticker, or revoke one" chevron onPress={() => router.push('/cards')} />
        <ListRow icon="notifications-outline" title="Notifications" chevron last onPress={() => router.push('/settings/notifications')} />

        <SectionLabel title="About" />
        <ListRow icon="information-circle-outline" title="Noir" value="v1.0.0" last />

        <View style={styles.reset}>
          <TextAction label="Sign out & reset this phone" color={Colors.danger} onPress={handleReset} disabled={busy} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  content: { paddingHorizontal: 20, paddingBottom: Spacing.xxl },
  account: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: Spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#5a4a2c', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.display, fontSize: 18, color: Colors.cream },
  accountBody: { flex: 1 },
  accountName: { fontFamily: Fonts.display, fontSize: FontSize.md + 1, color: Colors.cream },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, alignSelf: 'flex-start' },
  addrText: { fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.mutedWhite },
  reset: { marginTop: Spacing.xl },
})
