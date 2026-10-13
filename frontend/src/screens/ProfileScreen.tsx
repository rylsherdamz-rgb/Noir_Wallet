import { colorWithOpacity } from '@/constants/designTokens'
import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { Button } from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { Card } from '@/components/Card'
import { Toast } from '@/components/Toast'
import { WalletSwitcher } from '@/components/WalletSwitcher'
import { useAppStore } from '@/store/useAppStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { SectionLabel, ListRow, TextAction } from '@/components/ui/List'

export function ProfileScreen() {
  const router = useRouter()
  const { user, setUser } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.displayName || '')
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info' | 'error'; title: string; message?: string }>({
    visible: false,
    type: 'info',
    title: '',
  })
  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ visible: true, type, title, message })
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      showToast('Name required', 'Enter a display name', 'error')
      return
    }
    if (user) {
      setUser({ ...user, displayName: trimmed })
    }
    setEditing(false)
    setToast({ visible: true, type: 'success', title: 'Profile Updated', message: 'Your changes have been saved' })
  }

  const display = user?.displayName?.trim() || 'My wallet'
  const key = user?.stellarPublicKey

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Profile" onBackPress={() => router.back()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{display.charAt(0).toUpperCase()}</Text></View>
            <Text style={styles.name}>{display}</Text>
            <PressableScale
              style={styles.addr}
              onPress={async () => { if (key) { await Clipboard.setStringAsync(key); showToast('Address copied', 'Your Stellar address is on the clipboard.', 'success') } }}
              disabled={!key}
              accessibilityRole="button"
              accessibilityLabel="Copy Stellar address"
            >
              <Text style={styles.addrText}>{key ? `${key.slice(0, 8)}…${key.slice(-6)}` : '—'}</Text>
              {!!key && <Ionicons name="copy-outline" size={12} color={Colors.mutedWhite} />}
            </PressableScale>
          </View>

          <SectionLabel title="Profile" />
          {editing ? (
            <View style={styles.edit}>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Display name" placeholderTextColor={Colors.mutedWhite} maxLength={32} autoFocus accessibilityLabel="Display name" />
              <Button label="Save" onPress={handleSave} fullWidth />
              <TextAction label="Cancel" color={Colors.mutedWhite} onPress={() => { setEditing(false); setName(user?.displayName || '') }} />
            </View>
          ) : (
            <ListRow title="Display name" value={user?.displayName || 'Not set'} chevron last onPress={() => setEditing(true)} />
          )}

          <SectionLabel title="Wallets" />
          <WalletSwitcher onImportRequest={() => router.push('/import-wallet')} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast visible={toast.visible} type={toast.type} title={toast.title} message={toast.message} onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', gap: 8, paddingVertical: Spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#5a4a2c', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.display, fontSize: 28, color: Colors.cream },
  name: { fontFamily: Fonts.display, fontSize: 20, color: Colors.cream, marginTop: 6 },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addrText: { fontFamily: Fonts.mono, fontSize: FontSize.xs, color: Colors.mutedWhite },
  edit: { gap: Spacing.sm, paddingTop: Spacing.sm },
  input: { height: 52, paddingHorizontal: Spacing.md, borderRadius: 14, backgroundColor: Colors.midGrey, color: Colors.white, fontSize: FontSize.md },
})
