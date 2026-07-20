import { useState } from 'react'
import { View, Text, ScrollView, TextInput, Alert } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { Button } from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { Card } from '@/components/Card'
import { Toast } from '@/components/Toast'
import { WalletSwitcher } from '@/components/WalletSwitcher'
import { useAppStore } from '@/store/useAppStore'

export function ProfileScreen() {
  const router = useRouter()
  const { user, setUser } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info' | 'error'; title: string; message?: string }>({
    visible: false,
    type: 'info',
    title: '',
  })
  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ visible: true, type, title, message })
  }

  const handleSave = () => {
    if (user) {
      setUser({ ...user, displayName: name, email })
    }
    setEditing(false)
    setToast({ visible: true, type: 'success', title: 'Profile Updated', message: 'Your changes have been saved' })
  }

  const kycLevel = user?.kycLevel || 0
  const kycLabels = ['Unverified', 'Basic', 'Advanced', 'Full']
  const kycColors = ['#FF5A5F', '#F0B429', '#C6A15B', '#3ED598']

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text className="text-lg font-bold text-white">Profile</Text>
        <PressableScale onPress={() => setEditing(!editing)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={editing ? 'close' : 'create-outline'} size={22} color="#C6A15B" />
        </PressableScale>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}>
        <View className="items-center py-8">
          <Avatar name={user?.displayName} size={80} />
          <Text className="text-xl text-white font-bold mt-4">{user?.displayName || 'Your Name'}</Text>
          <PressableScale
            className="flex-row items-center"
            onPress={async () => {
              if (user?.stellarPublicKey) {
                await Clipboard.setStringAsync(user.stellarPublicKey)
                Alert.alert('Copied', 'Wallet address copied to clipboard')
              }
            }}
          >
            <Text className="text-xs text-mutedWhite font-mono mt-1" numberOfLines={1}>
              {user?.stellarPublicKey ? `${user.stellarPublicKey.slice(0, 12)}…${user.stellarPublicKey.slice(-8)}` : '—'}
            </Text>
            <Ionicons name="copy-outline" size={13} color="#A9A9A9" style={{ marginLeft: 4 }} />
          </PressableScale>
        </View>

        <Card>
          {editing ? (
            <View className="gap-4">
              <View className="gap-1">
                <Text className="text-xs text-mutedWhite uppercase tracking-[0.5]">Display Name</Text>
                <TextInput
                  className="bg-[#2C2C2C] rounded-xl p-4 text-base text-white border border-borderGrey h-12"
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="#A9A9A9"
                />
              </View>
              <View className="gap-1">
                <Text className="text-xs text-mutedWhite uppercase tracking-[0.5]">Email</Text>
                <TextInput
                  className="bg-[#2C2C2C] rounded-xl p-4 text-base text-white border border-borderGrey h-12"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor="#A9A9A9"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <Button label="Save Changes" onPress={handleSave} />
            </View>
          ) : (
            <>
              <ProfileRow icon="person-outline" label="Display Name" value={user?.displayName || 'Not set'} />
              <View className="h-px bg-borderGrey my-1" />
              <ProfileRow icon="mail-outline" label="Email" value={user?.email || 'Not set'} />
              <View className="h-px bg-borderGrey my-1" />
              <ProfileRow icon="phone-portrait-outline" label="Phone" value={user?.phoneNumber || 'Not set'} />
              <View className="h-px bg-borderGrey my-1" />
              <ProfileRow icon="key-outline" label="Stellar Key" value={`${user?.stellarPublicKey?.slice(0, 8) || 'No'}...`} mono />
            </>
          )}
        </Card>

        <View className="mt-6">
          <Text className="text-sm font-semibold text-mutedWhite uppercase tracking-[0.5] mb-2">Verification</Text>
          <View className="bg-cardBg rounded-xl border border-borderGrey p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm text-white font-medium">KYC Level</Text>
              <View className="px-4 py-1 rounded-full" style={{ backgroundColor: kycColors[kycLevel] + '20' }}>
                <Text className="text-xs font-semibold" style={{ color: kycColors[kycLevel] }}>
                  {kycLabels[kycLevel]}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1 mb-4">
              {[1, 2, 3].map((level) => (
                <View
                  key={level}
                  className="flex-1 h-1 rounded-sm"
                  style={{
                    backgroundColor: level <= kycLevel ? kycColors[kycLevel] : '#2C2C2C',
                  }}
                />
              ))}
            </View>
            <PressableScale className="flex-row items-center justify-between pt-2 border-t border-t-borderGrey" onPress={() => showToast('KYC Upgrade', 'KYC verification flow coming soon. Please check back later.')}>
              <Text className="text-xs text-gold">
                {kycLevel < 3 ? 'Upgrade KYC for higher limits' : 'Verification complete'}
              </Text>
              {kycLevel < 3 && <Ionicons name="chevron-forward" size={16} color="#C6A15B" />}
            </PressableScale>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-sm font-semibold text-mutedWhite uppercase tracking-[0.5] mb-2">Wallet Management</Text>
          <WalletSwitcher
            onImportRequest={() => router.push('/import-wallet')}
          />
        </View>

        <View className="mt-6">
          <Text className="text-sm font-semibold text-mutedWhite uppercase tracking-[0.5] mb-2">Preferences</Text>
          <PressableScale className="flex-row items-center bg-cardBg p-4 rounded-xl mb-2 gap-4 border border-borderGrey" onPress={() => router.push('/settings/notifications')}>
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text className="flex-1 text-sm text-white">Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={18} color="#A9A9A9" />
          </PressableScale>
          <PressableScale className="flex-row items-center bg-cardBg p-4 rounded-xl mb-2 gap-4 border border-borderGrey" onPress={() => router.push('/settings/security')}>
            <Ionicons name="shield-checkmark-outline" size={20} color="white" />
            <Text className="flex-1 text-sm text-white">Security Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#A9A9A9" />
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
    </SafeAreaView>
  )
}

function ProfileRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <View className="flex-row items-center gap-4 py-2">
      <Ionicons name={icon} size={18} color="#A9A9A9" />
      <View className="flex-1">
        <Text className="text-xs text-mutedWhite">{label}</Text>
        <Text className={`${mono ? 'font-mono text-sm' : 'text-base text-white font-medium'} mt-px`}>{value}</Text>
      </View>
    </View>
  )
}
