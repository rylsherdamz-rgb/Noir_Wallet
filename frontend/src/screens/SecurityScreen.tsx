import { colorWithOpacity } from '@/constants/designTokens'
import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Button } from '@/components/Button'
import { Toast } from '@/components/Toast'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAppStore } from '@/store/useAppStore'
import type { ToastType } from '@/types'
import { walletService } from '@/services/wallet'
import { x402 } from '@/domain/x402'
import { apiService } from '@/services/api'
import { usePreventScreenCapture } from 'expo-screen-capture'
import { useToast } from '@/components/ToastProvider'
import { clearPassword } from '@/services/appPassword'
import { ScreenHeader } from '@/components/ScreenHeader'
import { SectionLabel, ListRow, TextAction } from '@/components/ui/List'

const TIMEOUT_OPTIONS = [30, 60, 120, 300]

export function SecurityScreen() {
  const router = useRouter()
  // The recovery phrase and private key can be revealed on this screen.
  usePreventScreenCapture('security-settings')

  // The app-wide host, so a message survives the navigation away from here.
  const appToast = useToast()

  const {
    security,
    setBackgroundLockTimeoutSec,
    reset,
  } = useAppStore()
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; title: string; message?: string }>({
    visible: false,
    type: 'info',
    title: '',
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const showToast = (title: string, message?: string, type: ToastType = 'info') => {
    setToast({ visible: true, type, title, message })
  }

  const handleShowRecoveryPhrase = async () => {
    const keys = await walletService.loadKeys()
    if (!keys?.mnemonic) {
      showToast('Not Available', 'No recovery phrase found on this device', 'error')
      return
    }
    // Secrets are never dumped into a toast — the export screen gates the
    // reveal behind biometrics/PIN and offers masked copy instead.
    router.push('/settings/export-keys')
  }

  const handleShowPrivateKey = async () => {
    const keys = await walletService.loadKeys()
    if (!keys?.stellarSecret) {
      showToast('Not Available', 'No private key found on this device', 'error')
      return
    }
    router.push('/settings/export-keys')
  }

  const lock = security.backgroundLockTimeoutSec
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Security" onBackPress={() => router.back()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <SectionLabel title="Unlock" />
        <ListRow icon="finger-print-outline" title="Phone screen lock" subtitle="Fingerprint, face or phone PIN" value="On" valueColor={Colors.success} />
        <ListRow icon="time-outline" title="Auto-lock" subtitle="After the app is in the background" value={lock < 60 ? `${lock}s` : `${lock / 60} min`} last />
        <View style={styles.chips}>
          {TIMEOUT_OPTIONS.map((sec) => (
            <PressableScale key={sec} style={[styles.chip, lock === sec && styles.chipOn]} onPress={() => setBackgroundLockTimeoutSec(sec)} accessibilityRole="button" accessibilityState={{ selected: lock === sec }}>
              <Text style={[styles.chipText, lock === sec && styles.chipTextOn]}>{sec < 60 ? `${sec}s` : `${sec / 60}m`}</Text>
            </PressableScale>
          ))}
        </View>

        <SectionLabel title="Keys" />
        <ListRow icon="key-outline" title="Recovery phrase" chevron onPress={handleShowRecoveryPhrase} />
        <ListRow icon="download-outline" title="Export keys" subtitle="Phrase, wallet secret & card agents" chevron last onPress={() => router.push('/settings/export-keys')} />

        <View style={styles.danger}>
          <TextAction label="Delete wallet" color={Colors.danger} onPress={() => setShowDeleteConfirm(true)} />
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete this wallet?"
        message="This permanently removes your wallet from this phone. Make sure your recovery phrase is written down — it can’t be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        variant="danger"
        icon="trash-outline"
        onConfirm={async () => {
          setDeleting(true)
          // The local wipe proceeds either way — the keys are what matter — but
          // the user is told when the server copy was not confirmed deleted,
          // rather than being shown an unqualified success.
          let serverDeleted = true
          try {
            await apiService.request('/auth/account', { method: 'DELETE' })
          } catch {
            serverDeleted = false
          }
          if (!serverDeleted) {
            appToast.error(
              'Deleted on this device only',
              'The server could not be reached, so your account record may still exist. Try again from a connected device.',
            )
          }
          await walletService.clearKeys()
          await x402.clearAllAgents()
          await clearPassword()
          reset()
          router.replace('/onboarding')
        }}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeleting(false)
        }}
        loading={deleting}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: Spacing.xxl },
  chips: { flexDirection: 'row', gap: 8, paddingTop: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 999, backgroundColor: Colors.midGrey },
  chipOn: { backgroundColor: Colors.cream },
  chipText: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  chipTextOn: { color: Colors.surfaceBg },
  danger: { marginTop: Spacing.xl },
})
