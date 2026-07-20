import { useState } from 'react'
import { View, Text, ScrollView, Switch } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { Button } from '@/components/Button'
import { Toast } from '@/components/Toast'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAppStore } from '@/store/useAppStore'
import type { ToastType } from '@/types'
import { walletService } from '@/services/wallet'
import { x402 } from '@/domain/x402'
import { apiService } from '@/services/api'

const TIMEOUT_OPTIONS = [30, 60, 120, 300]

export function SecurityScreen() {
  const router = useRouter()
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

  const handleShowRecoveryPhrase = async () => {
    const keys = await walletService.loadKeys()
    if (!keys?.mnemonic) {
      showToast('Not Available', 'No recovery phrase found on this device', 'error')
      return
    }
    showToast('Recovery Phrase', keys.mnemonic, 'info')
  }

  const handleShowPrivateKey = async () => {
    const keys = await walletService.loadKeys()
    if (!keys?.stellarSecret) {
      showToast('Not Available', 'No private key found on this device', 'error')
      return
    }
    showToast('Private Key', keys.stellarSecret, 'info')
  }

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text className="text-xl font-bold text-white">Security</Text>
        <View className="w-[24]" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-12">
        <View className="items-center py-6">
          <View className="w-20 h-20 rounded-full bg-gold/15 items-center justify-center mb-4">
            <Ionicons name="shield-checkmark" size={40} color={Colors.gold} />
          </View>
          <Text className="text-2xl font-bold text-white">Security Settings</Text>
          <Text className="text-sm text-mutedWhite text-center mt-1 leading-5">
            Keep your wallet and funds protected with these security options.
          </Text>
        </View>

        <View className="mt-6">
          <Text className="text-sm text-mutedWhite font-semibold uppercase tracking-[0.5] mb-2">Authentication</Text>
          <View className="bg-cardBg rounded-2xl border border-borderGrey overflow-hidden">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-4 flex-1">
                <Ionicons name="finger-print-outline" size={20} color={Colors.white} />
                <View className="flex-1">
                  <Text className="text-sm text-white font-medium">Biometric Lock</Text>
                  <Text className="text-xs text-mutedWhite mt-px">Use Face ID / fingerprint to unlock</Text>
                </View>
              </View>
              <Switch
                value={security.biometricLockEnabled}
                onValueChange={setBiometricLockEnabled}
                trackColor={{ false: '#2C2C2C', true: Colors.gold + '60' }}
                thumbColor={security.biometricLockEnabled ? Colors.gold : Colors.mutedWhite}
              />
            </View>

            <View className="h-px bg-borderGrey mx-4" />

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-4 flex-1">
                <Ionicons name="time-outline" size={20} color={Colors.white} />
                <View className="flex-1">
                  <Text className="text-sm text-white font-medium">Auto-Lock Timer</Text>
                  <Text className="text-xs text-mutedWhite mt-px">
                    Lock after {security.backgroundLockTimeoutSec}s in background
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row gap-2 px-4 pb-4">
              {TIMEOUT_OPTIONS.map((sec) => (
                <PressableScale
                  key={sec}
                  className={`px-4 py-2 rounded-full bg-[#2C2C2C] border border-borderGrey ${security.backgroundLockTimeoutSec === sec ? 'bg-gold/20 border-gold' : ''}`}
                  onPress={() => setBackgroundLockTimeoutSec(sec)}
                >
                  <Text
                    className={`text-sm text-mutedWhite font-medium ${security.backgroundLockTimeoutSec === sec ? 'text-gold font-semibold' : ''}`}
                  >
                    {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-sm text-mutedWhite font-semibold uppercase tracking-[0.5] mb-2">Passphrase & Keys</Text>
          <View className="bg-cardBg rounded-2xl border border-borderGrey overflow-hidden">
            <PressableScale className="flex-row items-center justify-between p-4" onPress={handleShowRecoveryPhrase}>
              <View className="flex-row items-center gap-4 flex-1">
                <Ionicons name="key-outline" size={20} color={Colors.white} />
                <View className="flex-1">
                  <Text className="text-sm text-white font-medium">Recovery Phrase</Text>
                  <Text className="text-xs text-mutedWhite mt-px">View or backup your 12-word phrase</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
            </PressableScale>

            <View className="h-px bg-borderGrey mx-4" />

            <PressableScale className="flex-row items-center justify-between p-4" onPress={handleShowPrivateKey}>
              <View className="flex-row items-center gap-4 flex-1">
                <Ionicons name="eye-off-outline" size={20} color={Colors.white} />
                <View className="flex-1">
                  <Text className="text-sm text-white font-medium">Private Key</Text>
                  <Text className="text-xs text-mutedWhite mt-px">Export Stellar private key</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
            </PressableScale>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-sm text-mutedWhite font-semibold uppercase tracking-[0.5] mb-2">Session Management</Text>
          <View className="bg-cardBg rounded-2xl border border-borderGrey overflow-hidden">
            <PressableScale className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-4 flex-1">
                <Ionicons name="laptop-outline" size={20} color={Colors.white} />
                <View className="flex-1">
                  <Text className="text-sm text-white font-medium">Active Sessions</Text>
                  <Text className="text-xs text-mutedWhite mt-px">1 active session on this device</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
            </PressableScale>

            <View className="h-px bg-borderGrey mx-4" />

            <PressableScale className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-4 flex-1">
                <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                <View className="flex-1">
                  <Text className="text-sm text-[#FF5A5F] font-medium">Sign Out All Devices</Text>
                  <Text className="text-xs text-mutedWhite mt-px">Revoke all sessions except this one</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.danger} />
            </PressableScale>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-sm text-[#FF5A5F] font-semibold uppercase tracking-[0.5] mb-2">Danger Zone</Text>
          <PressableScale
            className="flex-row items-center justify-center gap-2 p-4 rounded-xl border border-[#FF5A5F]/30 bg-[#FF5A5F]/8"
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            <Text className="text-sm text-[#FF5A5F] font-semibold">Delete Account</Text>
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
          try {
            await apiService.request('/auth/account', { method: 'DELETE' })
          } catch {}
          await walletService.clearKeys()
          await x402.clearAgent()
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
