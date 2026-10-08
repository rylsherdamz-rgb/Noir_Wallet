/**
 * Export Keys
 *
 * Reveals and copies the wallet's secrets: the 12-word recovery phrase, the
 * main Stellar secret key, and each per-card x402 agent secret.
 *
 * Security posture:
 * - Nothing is revealed until the user re-authenticates: the phone's own
 *   unlock (fingerprint, face or screen lock) when it has one, otherwise — or
 *   whenever the user prefers — the wallet password (or a legacy app PIN).
 * - Secrets are held in component state only while the screen is mounted and
 *   are wiped on unmount / when the screen is re-locked.
 * - Values are masked by default; revealing is per-item and explicit.
 * - Secrets are never logged, never sent over the network, and never written
 *   to a file. Copy-to-clipboard is the only egress, at the user's request.
 */
import { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Platform } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { PressableScale } from '@/components/brand/PressableScale'
import { Toast } from '@/components/Toast'
import { walletService } from '@/services/wallet'
import { x402 } from '@/domain/x402'
import { authenticate, checkAvailability } from '@/services/biometrics'
import { hasPin, verifyPin } from '@/services/pinLock'
import { hasPassword, verifyPassword } from '@/services/passwordLock'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import type { ToastType } from '@/types'

interface SecretItem {
  id: string
  label: string
  description: string
  value: string
  /** Recovery phrases render as wrapped words; keys render as a mono blob. */
  kind: 'phrase' | 'key'
}

export function ExportKeysScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [unlocked, setUnlocked] = useState(false)
  const [checking, setChecking] = useState(false)
  /** Which wallet secret the fallback form asks for, or null while it is hidden. */
  const [needsSecret, setNeedsSecret] = useState<'password' | 'pin' | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [items, setItems] = useState<SecretItem[]>([])
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; title: string; message?: string }>({
    visible: false, type: 'info', title: '',
  })

  const showToast = (title: string, message?: string, type: ToastType = 'info') =>
    setToast({ visible: true, type, title, message })

  /** Wipe secrets from memory when leaving the screen. */
  useEffect(() => {
    return () => {
      setItems([])
      setRevealed({})
      setPin('')
    }
  }, [])

  const loadSecrets = useCallback(async () => {
    const keys = await walletService.loadKeys()
    if (!keys) {
      showToast('No Wallet', 'No wallet is stored on this device.', 'error')
      return
    }

    const next: SecretItem[] = []
    if (keys.mnemonic) {
      next.push({
        id: 'mnemonic',
        label: 'Recovery Phrase',
        description: '12 words. Restores this wallet and every agent derived from it.',
        value: keys.mnemonic,
        kind: 'phrase',
      })
    }
    if (keys.stellarSecret) {
      next.push({
        id: 'stellarSecret',
        label: 'Main Wallet Secret',
        description: keys.stellarPublic
          ? `Secret key for ${keys.stellarPublic.slice(0, 8)}…${keys.stellarPublic.slice(-6)}`
          : 'Stellar secret key for your main wallet',
        value: keys.stellarSecret,
        kind: 'key',
      })
    }

    // Per-card agent secrets (multi-agent: one per linked NFC card).
    try {
      const agents = await x402.listAgents()
      for (const agent of agents) {
        const secret = await x402.getAgentSecret(agent.index)
        if (!secret) continue
        next.push({
          id: `agent-${agent.index}`,
          label: `Agent ${agent.index} — ${agent.label}`,
          description: `Agent secret for ${agent.publicKey.slice(0, 8)}…${agent.publicKey.slice(-6)}`,
          value: secret,
          kind: 'key',
        })
      }
    } catch {
      // Agent enumeration is non-critical; still show wallet secrets.
    }

    setItems(next)
    setUnlocked(true)
  }, [])

  /** Show the password (or legacy PIN) form — only for a secret that exists. */
  const showSecretForm = useCallback(async () => {
    setPinError('')
    setPin('')
    if (await hasPassword()) {
      setNeedsSecret('password')
      return
    }
    if (await hasPin()) {
      setNeedsSecret('pin')
      return
    }
    showToast(
      'Create a password first',
      'Set a wallet password in Security settings before exporting keys.',
      'error',
    )
  }, [])

  const handleUnlock = useCallback(async () => {
    setChecking(true)
    setPinError('')
    try {
      const availability = await checkAvailability()
      if (availability.available) {
        const result = await authenticate('Authenticate to export your keys')
        if (result.ok) {
          await loadSecrets()
          return
        }
        // Declining the phone prompt means "let me type my password instead".
        if (result.reason !== 'cancelled') showToast('Not Authenticated', result.message, 'error')
      }
      await showSecretForm()
    } finally {
      setChecking(false)
    }
  }, [loadSecrets, showSecretForm])

  const handleVerifyPin = useCallback(async () => {
    setChecking(true)
    setPinError('')
    try {
      const result = needsSecret === 'password' ? await verifyPassword(pin) : await verifyPin(pin)
      if (!result.ok) {
        setPinError(pinErrorMessage(result, needsSecret ?? 'pin'))
        setPin('')
        return
      }
      setNeedsSecret(null)
      setPin('')
      await loadSecrets()
    } finally {
      setChecking(false)
    }
  }, [pin, needsSecret, loadSecrets])

  const handleCopy = useCallback(async (item: SecretItem) => {
    await Clipboard.setStringAsync(item.value)
    showToast('Copied', `${item.label} copied to clipboard. Paste it somewhere safe, then clear your clipboard.`, 'success')
  }, [])

  const confirmReveal = useCallback((item: SecretItem) => {
    if (revealed[item.id]) {
      setRevealed((prev) => ({ ...prev, [item.id]: false }))
      return
    }
    const doReveal = () => setRevealed((prev) => ({ ...prev, [item.id]: true }))
    if (Platform.OS === 'web') { doReveal(); return }
    Alert.alert(
      'Reveal secret?',
      'Make sure nobody can see your screen. Anyone with this value can spend your funds.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reveal', style: 'destructive', onPress: doReveal },
      ],
    )
  }, [revealed])

  const relock = useCallback(() => {
    setUnlocked(false)
    setItems([])
    setRevealed({})
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle}>Export Keys</Text>
        {unlocked ? (
          <PressableScale onPress={relock} accessibilityLabel="Hide keys">
            <Ionicons name="lock-closed-outline" size={20} color={Colors.gold} />
          </PressableScale>
        ) : (
          <View style={styles.spacer24} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
      >
        {/* Danger notice — always visible */}
        <View style={styles.warnCard}>
          <Ionicons name="warning-outline" size={20} color={Colors.danger} />
          <View style={styles.warnTextWrap}>
            <Text style={styles.warnTitle}>Anyone with these keys owns your funds</Text>
            <Text style={styles.warnBody}>
              Never share them, never type them into a website, and never store them in a screenshot
              or cloud note. Noir Wallet staff will never ask for them.
            </Text>
          </View>
        </View>

        {!unlocked && !needsSecret && (
          <View style={styles.gate}>
            <View style={styles.gateIcon}>
              <Ionicons name="finger-print-outline" size={34} color={Colors.gold} />
            </View>
            <Text style={styles.gateTitle}>Authentication required</Text>
            <Text style={styles.gateBody}>
              Confirm it's you before your recovery phrase and secret keys are shown.
            </Text>
            <PressableScale
              style={styles.primaryBtn}
              onPress={handleUnlock}
              disabled={checking}
              accessibilityRole="button"
              accessibilityLabel="Authenticate to export keys"
            >
              <Text style={styles.primaryBtnLabel}>{checking ? 'Checking…' : 'Authenticate'}</Text>
            </PressableScale>
            <PressableScale
              onPress={showSecretForm}
              disabled={checking}
              accessibilityRole="button"
              accessibilityLabel="Use wallet password instead"
            >
              <Text style={styles.altLabel}>Use password instead</Text>
            </PressableScale>
          </View>
        )}

        {needsSecret && (
          <View style={styles.gate}>
            <View style={styles.gateIcon}>
              <Ionicons name="keypad-outline" size={34} color={Colors.gold} />
            </View>
            <Text style={styles.gateTitle}>
              {needsSecret === 'password' ? 'Enter your password' : 'Enter your PIN'}
            </Text>
            <Text style={styles.gateBody}>
              {needsSecret === 'password'
                ? 'Use the wallet password you created during setup.'
                : 'Use your app PIN to continue.'}
            </Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder={needsSecret === 'password' ? 'Wallet password' : '••••••'}
              placeholderTextColor={Colors.mutedWhite}
              keyboardType={needsSecret === 'password' ? 'default' : 'number-pad'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={needsSecret === 'password' ? 128 : 12}
              onSubmitEditing={handleVerifyPin}
              accessibilityLabel={needsSecret === 'password' ? 'Wallet password' : 'App PIN'}
            />
            {!!pinError && <Text style={styles.pinError}>{pinError}</Text>}
            <PressableScale
              style={styles.primaryBtn}
              onPress={handleVerifyPin}
              disabled={checking || pin.length === 0}
            >
              <Text style={styles.primaryBtnLabel}>{checking ? 'Verifying…' : 'Unlock'}</Text>
            </PressableScale>
          </View>
        )}

        {unlocked && items.length === 0 && (
          <Text style={styles.emptyText}>No exportable keys found on this device.</Text>
        )}

        {unlocked && items.map((item) => {
          const isRevealed = !!revealed[item.id]
          return (
            <View key={item.id} style={styles.secretCard}>
              <View style={styles.secretHeader}>
                <View style={styles.secretTitleWrap}>
                  <Text style={styles.secretLabel}>{item.label}</Text>
                  <Text style={styles.secretDesc}>{item.description}</Text>
                </View>
              </View>

              <View style={[styles.secretBox, item.kind === 'phrase' && styles.secretBoxPhrase]}>
                <Text
                  style={[styles.secretValue, !isRevealed && styles.secretMasked]}
                  selectable={isRevealed}
                >
                  {isRevealed ? item.value : maskValue(item.value, item.kind)}
                </Text>
              </View>

              <View style={styles.secretActions}>
                <PressableScale
                  style={styles.secretAction}
                  onPress={() => confirmReveal(item)}
                  accessibilityRole="button"
                  accessibilityLabel={isRevealed ? `Hide ${item.label}` : `Reveal ${item.label}`}
                >
                  <Ionicons name={isRevealed ? 'eye-off-outline' : 'eye-outline'} size={16} color={Colors.gold} />
                  <Text style={styles.secretActionLabel}>{isRevealed ? 'Hide' : 'Reveal'}</Text>
                </PressableScale>

                <PressableScale
                  style={styles.secretAction}
                  onPress={() => handleCopy(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Copy ${item.label}`}
                >
                  <Ionicons name="copy-outline" size={16} color={Colors.gold} />
                  <Text style={styles.secretActionLabel}>Copy</Text>
                </PressableScale>
              </View>
            </View>
          )
        })}
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

/** Human-readable message for a failed PIN verification. */
function pinErrorMessage(result: { reason: string; retryAfterMs?: number }, kind: 'password' | 'pin'): string {
  if (result.reason === 'locked') {
    const secs = Math.ceil((result.retryAfterMs ?? 0) / 1000)
    return secs > 0
      ? `Too many attempts. Try again in ${secs}s.`
      : 'Too many attempts. Try again shortly.'
  }
  if (result.reason === 'no-pin') return 'No PIN is set on this device.'
  if (result.reason === 'no-password') return 'No wallet password is set on this device.'
  return kind === 'password' ? 'Incorrect password' : 'Incorrect PIN'
}

/** Masked placeholder so the layout doesn't jump when revealing. */function maskValue(value: string, kind: 'phrase' | 'key'): string {
  if (kind === 'phrase') {
    return value
      .trim()
      .split(/\s+/)
      .map(() => '••••')
      .join('  ')
  }
  return '•'.repeat(Math.min(value.length, 56))
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  spacer24: { width: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },

  warnCard: {
    flexDirection: 'row', gap: Spacing.md,
    backgroundColor: colorWithOpacity(Colors.danger, 0.08),
    borderColor: colorWithOpacity(Colors.danger, 0.35), borderWidth: 1,
    borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.lg,
  },
  warnTextWrap: { flex: 1 },
  warnTitle: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.bold, marginBottom: 4 },
  warnBody: { fontSize: FontSize.xs, color: Colors.silver, lineHeight: 18 },

  // Auth gate
  gate: { alignItems: 'center', paddingVertical: Spacing.xl },
  gateIcon: {
    width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colorWithOpacity(Colors.gold, 0.1),
    borderWidth: 1, borderColor: colorWithOpacity(Colors.gold, 0.3),
    marginBottom: Spacing.md,
  },
  gateTitle: { fontFamily: Fonts.display, fontSize: FontSize.lg, color: Colors.white },
  gateBody: {
    fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center',
    marginTop: Spacing.sm, marginBottom: Spacing.lg, maxWidth: 300, lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 52,
    alignItems: 'center', justifyContent: 'center', minWidth: 200,
  },
  primaryBtnLabel: {
    fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.onGold,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  pinInput: {
    backgroundColor: Colors.midGrey, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderGrey,
    color: Colors.white, fontSize: FontSize.lg, letterSpacing: 6, textAlign: 'center',
    paddingVertical: Spacing.md, width: 220, marginBottom: Spacing.md,
  },
  altLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: Spacing.md },
  pinError: { fontSize: FontSize.xs, color: Colors.danger, marginBottom: Spacing.md },

  emptyText: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.xl },

  // Secret cards
  secretCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  secretHeader: { marginBottom: Spacing.sm },
  secretTitleWrap: { flex: 1 },
  secretLabel: { fontFamily: Fonts.display, fontSize: FontSize.sm, color: Colors.cream },
  secretDesc: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2, lineHeight: 16 },
  secretBox: {
    backgroundColor: Colors.midGrey, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  secretBoxPhrase: { minHeight: 76 },
  secretValue: { fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.white, lineHeight: 22 },
  secretMasked: { color: Colors.mutedWhite, letterSpacing: 1 },
  secretActions: { flexDirection: 'row', gap: Spacing.sm },
  secretAction: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: colorWithOpacity(Colors.gold, 0.35),
    minHeight: 44,
  },
  secretActionLabel: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.semibold },
})
