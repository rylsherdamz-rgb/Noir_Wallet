import { colorWithOpacity } from '@/constants/designTokens'
import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native'
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
import { authenticate, checkAvailability, unavailableMessage } from '@/services/biometrics'
import { useToast } from '@/components/ToastProvider'

const TIMEOUT_OPTIONS = [30, 60, 120, 300]

export function SecurityScreen() {
  const router = useRouter()
  // The recovery phrase and private key can be revealed on this screen.
  usePreventScreenCapture('security-settings')

  // The app-wide host, so a message survives the navigation away from here.
  const appToast = useToast()

  const {
    security,
    setBiometricLockEnabled,
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

  /**
   * Turning the switch on has to prove the device can actually do this, and
   * that the person flipping it owns the enrolled biometric — otherwise the
   * setting is a claim rather than a control.
   */
  const handleBiometricToggle = async (next: boolean) => {
    if (!next) {
      setBiometricLockEnabled(false)
      return
    }
    const availability = await checkAvailability()
    if (!availability.available) {
      showToast('Biometrics Unavailable', unavailableMessage(availability.reason), 'error')
      return
    }
    const result = await authenticate('Confirm to enable biometric unlock')
    if (!result.ok) {
      showToast('Not Enabled', result.message, 'error')
      return
    }
    setBiometricLockEnabled(true)
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.spacer24} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={40} color={Colors.gold} />
          </View>
          <Text style={styles.heroTitle}>Security Settings</Text>
          <Text style={styles.heroDesc}>
            Keep your wallet and funds protected with these security options.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="finger-print-outline" size={20} color={Colors.white} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Biometric Lock</Text>
                  <Text style={styles.settingDesc}>Use Face ID / fingerprint to unlock</Text>
                </View>
              </View>
              <Switch
                value={security.biometricLockEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: Colors.lightGrey, true: colorWithOpacity(Colors.gold, 0.38) }}
                thumbColor={security.biometricLockEnabled ? Colors.gold : Colors.mutedWhite}
                accessibilityRole="switch"
                accessibilityLabel="Biometric lock"
                accessibilityHint="Requires Face ID or fingerprint to unlock the wallet"
                accessibilityState={{ checked: security.biometricLockEnabled }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="time-outline" size={20} color={Colors.white} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Auto-Lock Timer</Text>
                  <Text style={styles.settingDesc}>
                    Lock after {security.backgroundLockTimeoutSec}s in background
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.timeoutOptions}>
              {TIMEOUT_OPTIONS.map((sec) => (
                <PressableScale
                  key={sec}
                  style={[
                    styles.timeoutChip,
                    security.backgroundLockTimeoutSec === sec && styles.timeoutChipActive,
                  ]}
                  onPress={() => setBackgroundLockTimeoutSec(sec)}
                >
                  <Text
                    style={[
                      styles.timeoutLabel,
                      security.backgroundLockTimeoutSec === sec && styles.timeoutLabelActive,
                    ]}
                  >
                    {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passphrase & Keys</Text>
          <View style={styles.card}>
            <PressableScale style={styles.settingRow} onPress={handleShowRecoveryPhrase}>
              <View style={styles.settingInfo}>
                <Ionicons name="key-outline" size={20} color={Colors.white} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Recovery Phrase</Text>
                  <Text style={styles.settingDesc}>View or backup your 12-word phrase</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
            </PressableScale>

            <View style={styles.divider} />

            <PressableScale style={styles.settingRow} onPress={handleShowPrivateKey}
              accessibilityLabel="Hide"
            >
              <View style={styles.settingInfo}>
                <Ionicons name="eye-off-outline" size={20} color={Colors.white} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Private Key</Text>
                  <Text style={styles.settingDesc}>Export Stellar private key</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
            </PressableScale>

            <View style={styles.divider} />

            <PressableScale
              style={styles.settingRow}
              onPress={() => router.push('/settings/export-keys')}
              accessibilityRole="button"
              accessibilityLabel="Export all keys"
              accessibilityHint="Reveal and copy your recovery phrase, wallet secret, and agent keys"
            >
              <View style={styles.settingInfo}>
                <Ionicons name="download-outline" size={20} color={Colors.gold} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Export All Keys</Text>
                  <Text style={styles.settingDesc}>Recovery phrase, wallet secret & per-card agent keys</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
            </PressableScale>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Management</Text>
          <View style={styles.card}>
            <PressableScale style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="laptop-outline" size={20} color={Colors.white} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Active Sessions</Text>
                  <Text style={styles.settingDesc}>1 active session on this device</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
            </PressableScale>

            <View style={styles.divider} />

            <PressableScale style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, styles.settingLabelDanger]}>Sign Out All Devices</Text>
                  <Text style={styles.settingDesc}>Revoke all sessions except this one</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.danger} />
            </PressableScale>
          </View>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <PressableScale
            style={styles.deleteBtn}
            onPress={() => setShowDeleteConfirm(true)}
          
            accessibilityLabel="Delete"
          >
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            <Text style={styles.deleteLabel}>Delete Account</Text>
          </PressableScale>
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
        title="Delete Account"
        message="This permanently deletes your account and all associated data. Make sure your recovery phrase is backed up. This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete Forever'}
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
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colorWithOpacity(Colors.gold, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  heroDesc: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedWhite,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.medium,
  },
  settingDesc: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGrey,
    marginHorizontal: Spacing.md,
  },
  timeoutOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  timeoutChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  timeoutChipActive: {
    backgroundColor: colorWithOpacity(Colors.gold, 0.12),
    borderColor: Colors.gold,
  },
  timeoutLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
  },
  timeoutLabelActive: {
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
  dangerZone: {
    marginTop: Spacing.xl,
  },
  dangerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colorWithOpacity(Colors.danger, 0.2),
    backgroundColor: colorWithOpacity(Colors.danger, 0.03),
  },
  deleteLabel: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    fontWeight: FontWeight.semibold,
  },
  spacer24: { width: 24 },
  settingLabelDanger: { color: Colors.danger },
})
