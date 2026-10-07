/**
 * Export Keys
 *
 * Reveals and copies the wallet's secrets: the 12-word recovery phrase, the
 * main Stellar secret key, and each per-card x402 agent secret.
 *
 * Security posture:
 * - Nothing is revealed until the user re-authenticates (biometrics, or PIN
 *   when biometrics are unavailable/not enrolled).
 * - Secrets are held in component state only while the screen is mounted and
 *   are wiped on unmount / when the screen is re-locked.
 * - Values are masked by default; revealing is per-item and explicit.
 * - Secrets are never logged, never sent over the network, and never written
 *   to a file. Copy-to-clipboard is the only egress, at the user's request.
 */
import { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Platform, TextInput } from 'react-native'
import { popup } from '@/components/popup/Popup'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { PressableScale } from '@/components/brand/PressableScale'
import { Toast } from '@/components/Toast'
import { walletService } from '@/services/wallet'
import { x402 } from '@/domain/x402'
import { authenticateWithDevice } from '@/services/biometrics'
import { hasPassword, verifyPassword } from '@/services/appPassword'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import type { ToastType } from '@/types'
import { ScreenHeader } from '@/components/ScreenHeader'
import { SectionLabel, TextAction } from '@/components/ui/List'
import { Button } from '@/components/Button'

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
  const [needsPassword, setNeedsPassword] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
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

  const handleUnlock = useCallback(async () => {
    setChecking(true)
    try {
      // Same gate as the app lock: the phone's own screen lock
      // (biometrics with device PIN/pattern fallback).
      const result = await authenticateWithDevice('Authenticate to export your keys')
      if (!result.ok) {
        // No screen lock on this phone: fall back to the backup password.
        if (result.reason === 'no-device-lock' && (await hasPassword())) {
          setNeedsPassword(true)
          return
        }
        if (result.reason !== 'cancelled') showToast('Not Authenticated', result.message, 'error')
        return
      }
      await loadSecrets()
    } finally {
      setChecking(false)
    }
  }, [loadSecrets])

  const handlePassword = useCallback(async () => {
    if (!pw) return
    setChecking(true)
    setPwError('')
    try {
      const result = await verifyPassword(pw)
      setPw('')
      if (!result.ok) {
        setPwError(result.retryAfterMs > 0
          ? `Too many attempts. Try again in ${Math.ceil(result.retryAfterMs / 1000)}s.`
          : 'Incorrect password')
        return
      }
      setNeedsPassword(false)
      await loadSecrets()
    } finally {
      setChecking(false)
    }
  }, [pw, loadSecrets])

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
    popup.confirm({
      title: `Reveal ${item.label}?`,
      message: 'Make sure nobody can see your screen. Anyone with this value can spend your funds.',
      icon: 'eye-outline',
      tone: 'danger',
      confirmLabel: 'Reveal',
    }).then((ok) => { if (ok) doReveal() })
  }, [revealed])

  const relock = useCallback(() => {
    setUnlocked(false)
    setItems([])
    setRevealed({})
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Export keys"
        onBackPress={() => router.back()}
        rightAction={unlocked ? (
          <PressableScale onPress={relock} hitSlop={10} accessibilityRole="button" accessibilityLabel="Hide keys">
            <Ionicons name="lock-closed-outline" size={20} color={Colors.gold} />
          </PressableScale>
        ) : undefined}
      />

      {!unlocked && (
        <View style={styles.gateWrap}>
          <View style={styles.gate}>
            <Ionicons name={needsPassword ? 'key-outline' : 'finger-print-outline'} size={48} color={Colors.gold} />
            <Text style={styles.gateTitle}>{needsPassword ? 'Enter your password' : 'Confirm it’s you'}</Text>
            <Text style={styles.gateBody}>
              {needsPassword ? 'Your phone has no screen lock, so confirm with your backup password.' : 'Your recovery phrase and keys are shown after you unlock.'}
            </Text>
            {needsPassword && (
              <>
                <TextInput
                  style={styles.pwInput}
                  value={pw}
                  onChangeText={(v) => { setPwError(''); setPw(v) }}
                  placeholder="Password"
                  placeholderTextColor={Colors.mutedWhite}
                  secureTextEntry
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handlePassword}
                  accessibilityLabel="Password"
                />
                {!!pwError && <Text style={styles.pwError}>{pwError}</Text>}
              </>
            )}
          </View>
          <View style={styles.warn}>
            <Ionicons name="warning-outline" size={18} color={Colors.danger} />
            <Text style={styles.warnText}>Anyone with these keys can take your funds. Never share them, type them into a website, or screenshot them.</Text>
          </View>
          <View style={styles.footer}>
            <Button
              label={checking ? 'Checking…' : 'Unlock'}
              icon={needsPassword ? 'lock-open-outline' : 'finger-print-outline'}
              onPress={needsPassword ? handlePassword : handleUnlock}
              disabled={checking || (needsPassword && !pw)}
              fullWidth
            />
          </View>
        </View>
      )}

      {unlocked && (
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
          {items.length === 0 && <Text style={styles.emptyText}>No exportable keys found on this device.</Text>}
          {items.map((item) => {
            const isRevealed = !!revealed[item.id]
            return (
              <View key={item.id}>
                <SectionLabel title={item.label} />
                <Text style={styles.desc}>{item.description}</Text>
                <PressableScale
                  style={styles.secretBox}
                  onPress={isRevealed ? () => handleCopy(item) : () => confirmReveal(item)}
                  accessibilityRole="button"
                  accessibilityLabel={isRevealed ? `Copy ${item.label}` : `Reveal ${item.label}`}
                >
                  {item.kind === 'phrase' ? (
                    <View style={styles.phraseGrid}>
                      {item.value.trim().split(/\s+/).map((word, i) => (
                        <View key={i} style={styles.phraseCell}>
                          <Text style={styles.phraseIndex}>{i + 1}</Text>
                          <Text style={[styles.phraseWord, !isRevealed && styles.masked]} numberOfLines={1}>{isRevealed ? word : '••••'}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    splitKey(item.value).map((line, i) => (
                      <Text key={i} style={[styles.keyLine, !isRevealed && styles.masked]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                        {isRevealed ? line : '•'.repeat(line.length)}
                      </Text>
                    ))
                  )}
                  {!isRevealed && <Text style={styles.tapHint}>Tap to reveal</Text>}
                  {isRevealed && <Text style={styles.tapHint}>Tap to copy</Text>}
                </PressableScale>
                <View style={styles.rowActions}>
                  <TextAction label={isRevealed ? 'Hide' : 'Reveal'} onPress={() => confirmReveal(item)} center={false} />
                  <TextAction label="Copy" onPress={() => handleCopy(item)} center={false} />
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}

      <Toast visible={toast.visible} type={toast.type} title={toast.title} message={toast.message} onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))} />
    </SafeAreaView>
  )
}

/** Masked placeholder so the layout doesn't jump when revealing. */
function splitKey(value: string): string[] {
  const half = Math.ceil(value.length / 2)
  return [value.slice(0, half), value.slice(half)].filter(Boolean)
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  gateWrap: { flex: 1 },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  gateTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.cream, marginTop: 8 },
  gateBody: { fontSize: FontSize.md - 1, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 22, maxWidth: 300 },
  pwInput: { alignSelf: 'stretch', height: 52, paddingHorizontal: Spacing.md, borderRadius: 14, backgroundColor: Colors.midGrey, color: Colors.white, fontSize: FontSize.md, marginTop: Spacing.sm },
  pwError: { fontSize: FontSize.sm, color: Colors.danger },
  warn: { flexDirection: 'row', gap: 10, marginHorizontal: 20, padding: 14, borderRadius: 12, backgroundColor: Colors.midGrey },
  warnText: { flex: 1, fontSize: FontSize.sm - 1, color: Colors.silver, lineHeight: 19 },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  emptyText: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.xl },
  desc: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginBottom: Spacing.sm },
  secretBox: { borderRadius: 12, backgroundColor: Colors.midGrey, padding: 14, minHeight: 76, justifyContent: 'center' },
  phraseGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  // Two columns so 8-letter words never wrap or clip.
  phraseCell: { width: '50%', flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingRight: Spacing.sm },
  phraseIndex: { fontSize: FontSize.xs, color: Colors.mutedWhite, minWidth: 20, textAlign: 'right' },
  phraseWord: { flexShrink: 1, fontFamily: Fonts.mono, fontSize: FontSize.sm + 1, color: Colors.white },
  keyLine: { fontFamily: Fonts.mono, fontSize: FontSize.sm, color: Colors.white, lineHeight: 22, textAlign: 'center' },
  masked: { color: Colors.mutedWhite, letterSpacing: 1 },
  tapHint: { fontSize: FontSize.xs, color: Colors.mutedWhite, textAlign: 'center', marginTop: Spacing.sm },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.lg },
})
