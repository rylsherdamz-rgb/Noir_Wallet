import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Button } from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { Card } from '@/components/Card'
import { Toast } from '@/components/Toast'
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
  const kycColors = [Colors.danger, Colors.warning, Colors.gold, Colors.success]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={editing ? 'close' : 'create-outline'} size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <Avatar name={user?.displayName} size={80} />
          <Text style={styles.displayName}>{user?.displayName || 'Your Name'}</Text>
          <Text style={styles.walletAddress} numberOfLines={1}>
            {user?.stellarPublicKey ? `${user.stellarPublicKey.slice(0, 8)}...${user.stellarPublicKey.slice(-4)}` : 'No wallet'}
          </Text>
        </View>

        <Card>
          {editing ? (
            <View style={styles.editContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={Colors.mutedWhite}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={Colors.mutedWhite}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <Button label="Save Changes" onPress={handleSave} />
            </View>
          ) : (
            <>
              <ProfileRow icon="person-outline" label="Display Name" value={user?.displayName || 'Not set'} />
              <View style={styles.divider} />
              <ProfileRow icon="mail-outline" label="Email" value={user?.email || 'Not set'} />
              <View style={styles.divider} />
              <ProfileRow icon="phone-portrait-outline" label="Phone" value={user?.phoneNumber || 'Not set'} />
              <View style={styles.divider} />
              <ProfileRow icon="key-outline" label="Stellar Key" value={`${user?.stellarPublicKey?.slice(0, 8) || 'No'}...`} mono />
            </>
          )}
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification</Text>
          <View style={styles.kycCard}>
            <View style={styles.kycRow}>
              <Text style={styles.kycLabel}>KYC Level</Text>
              <View style={[styles.kycBadge, { backgroundColor: kycColors[kycLevel] + '20' }]}>
                <Text style={[styles.kycBadgeLabel, { color: kycColors[kycLevel] }]}>
                  {kycLabels[kycLevel]}
                </Text>
              </View>
            </View>
            <View style={styles.kycProgress}>
              {[1, 2, 3].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.kycStep,
                    level <= kycLevel && { backgroundColor: kycColors[kycLevel] },
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.kycAction} onPress={() => showToast('KYC Upgrade', 'KYC verification flow coming soon. Please check back later.')}>
              <Text style={styles.kycActionLabel}>
                {kycLevel < 3 ? 'Upgrade KYC for higher limits' : 'Verification complete'}
              </Text>
              {kycLevel < 3 && <Ionicons name="chevron-forward" size={16} color={Colors.gold} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/settings/notifications')}>
            <Ionicons name="notifications-outline" size={20} color={Colors.white} />
            <Text style={styles.settingLabel}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/settings/security')}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.white} />
            <Text style={styles.settingLabel}>Security Settings</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
          </TouchableOpacity>
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
    <View style={styles.profileRow}>
      <Ionicons name={icon} size={18} color={Colors.mutedWhite} />
      <View style={styles.profileText}>
        <Text style={styles.profileLabel}>{label}</Text>
        <Text style={[styles.profileValue, mono && styles.profileMono]}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  displayName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  walletAddress: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: 'monospace',
    marginTop: Spacing.xs,
  },
  editContent: {
    gap: Spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  profileText: {
    flex: 1,
  },
  profileLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
  },
  profileValue: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
  profileMono: {
    fontFamily: 'monospace',
    fontSize: FontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGrey,
    marginVertical: Spacing.xs,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.lightGrey,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    height: 48,
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
  kycCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    padding: Spacing.md,
  },
  kycRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  kycLabel: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.medium,
  },
  kycBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  kycBadgeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  kycProgress: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  kycStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.lightGrey,
  },
  kycAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
  },
  kycActionLabel: {
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  settingLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
})
