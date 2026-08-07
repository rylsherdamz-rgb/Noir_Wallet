import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, Modal, ScrollView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { sha256 } from '@noble/hashes/sha2.js'
import { Buffer } from 'buffer'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { NFCTag, QueuedPayment } from '@/types'
import { nfcService } from '@/services/nfc'
import { x402 } from '@/domain/x402'
import { NumericKeypad } from '@/components/NumericKeypad'
import { Button } from '@/components/Button'
import { ErrorMessage } from '@/components/ErrorMessage'
import { PressableScale } from '@/components/brand/PressableScale'
import { Toast } from '@/components/Toast'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { logger } from '@/lib/logger'

export function MerchantPosScreen() {
  const router = useRouter()
  const { transactions, addTransaction, user, devices, addPendingPayment } = useAppStore()
  const [amount, setAmount] = useState('')
  const [paymentState, setPaymentState] = useState<'idle' | 'processing'>('idle')
  const [agentMode, setAgentMode] = useState(false)
  const [pinModalVisible, setPinModalVisible] = useState(false)
  const [enteredPin, setEnteredPin] = useState('')
  const [lastError, setLastError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })

  // Amounts above this (in cents) require a card PIN — mirrors the backend
  // threshold (100,000,000 stroops).
  const PIN_REQUIRED_ABOVE_CENTS = 100_000

  const amountCents = Math.round(parseFloat(amount) * 100) || 0
  const isActive = amount !== '' && parseFloat(amount) > 0

  const handleTap = useCallback(async () => {
    if (amountCents <= 0) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      }
      setLastError('Enter an amount greater than 0')
      return
    }

    // Large amounts require a card PIN — collect it before tapping.
    if (parseFloat(amount) > PIN_REQUIRED_ABOVE_CENTS && !enteredPin) {
      setPinModalVisible(true)
      return
    }

    setPaymentState('processing')
    setLastError(null)
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }

    let tag: NFCTag | null = null
    let scannedHash: string | null = null
    try {
      // Read NFC tag
      tag = await nfcService.readTag(10000) // 10 second timeout

      if (!tag) {
        logger.debug('No NFC tag detected')
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
        setLastError('No NFC tag detected — hold a card near the reader')
        setPaymentState('idle')
        return
      }

      logger.debug('NFC tag detected:', tag.uid)
      const scanned = tag

      // Hash the UID
      const hashBytes = sha256(new TextEncoder().encode(scanned.uid))
      scannedHash = Buffer.from(hashBytes).toString('hex')

      logger.debug('Tag hash:', scannedHash)

      const linkedDevice = user ? devices.find((d) => d.deviceUidHash === scannedHash) : undefined
      const hasAgent = await x402.hasAgent()
      let txHash: string | null = null

      if (hasAgent && linkedDevice?.agentPublicKey) {
        logger.debug('Paying from agent wallet')
        setAgentMode(true)
        const result = await x402.payWithAgent({
          destination: user?.stellarPublicKey || '',
          amount: (parseFloat(amount)).toFixed(7),
        })
        if ('error' in result) throw new Error(result.error)
        txHash = result.hash
      } else {
        // Passive NFC card: it only carries a UID and cannot sign. The merchant
        // sends the UID + amount to the backend, which signs from the card's
        // custodied wallet and fee-bumps it. Verified end-to-end on testnet.
        logger.debug('Using custodial UID-authorized tap payment')
        const merchant = user?.stellarPublicKey || ''
        if (!merchant) throw new Error('No merchant wallet configured')

        // 1 XLM = 10,000,000 stroops
        const amountStroops = Math.round(parseFloat(amount) * 10_000_000)
        const pay = await apiService.tapPay({
          deviceSerial: scanned.uid,
          destinationWallet: merchant,
          amountStroops,
          idempotencyKey: `${scanned.uid}-${Date.now()}`,
          memo: 'Noir tap',
          pin: enteredPin || undefined,
        })
        if (pay.error) throw new Error(pay.error)
        txHash = pay.stellar_tx_hash || null
        if (!txHash) throw new Error('Tap payment not submitted')
      }

      if (txHash) {
        logger.debug('Payment queued:', txHash)
        const { addPendingTxHash } = useAppStore.getState()
        addTransaction({
          id: Math.random().toString(36).slice(2),
          stellarTxHash: txHash,
          merchantId: 'me',
          merchantName: 'Tap Pay',
          userId: user?.id || 'local',
          deviceId: scannedHash,
          amountCents,
          assetCode: 'XLM',
          status: 'pending',
          errorMessage: null,
          createdAt: new Date().toISOString(),
        })
        addPendingTxHash(txHash)

        setToast({
          visible: true,
          type: 'success',
          title: 'Payment Sent',
          message: `${(amountCents / 100).toFixed(2)} XLM paid`,
        })
        setPaymentState('idle')

        // Reset after showing success
        setTimeout(() => {
          setAmount('')
          setEnteredPin('')
          setAgentMode(false)
        }, 2000)
      }
    } catch (err: any) {
      logger.error('Payment error:', err)
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      setLastError(err?.message ?? 'Unknown error')
      setPaymentState('idle')

      // Queue payment for offline retry
      if (amountCents > 0) {
        const queued: QueuedPayment = {
          id: Math.random().toString(36).slice(2),
          rawDeviceUid: tag?.uid || 'unknown',
          deviceUidHash: scannedHash ?? undefined,
          merchantPublicKey: user?.stellarPublicKey || '',
          amountCents,
          assetCode: 'XLM',
          terminalId: undefined,
          nonce: Math.random().toString(36).slice(2, 10),
          createdAt: new Date().toISOString(),
          retryCount: 0,
        }
        addPendingPayment(queued)
      }
    }
  }, [amount, amountCents, user, addTransaction, devices, addPendingPayment, enteredPin])

  const recentTxs = transactions
    .filter((t) => t.merchantName === 'Tap Pay' || t.merchantName === 'NFC Receive')
    .slice(0, 3)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Tap to Pay
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.amountSection}>
          <Text style={styles.currency}>XLM</Text>
          <Text style={styles.amountDisplay}>
            {amount || '0'}
            <Text style={styles.amountCursor}>|</Text>
          </Text>
          <Text style={styles.amountHint}>
            Tap your NFC card against the reader to pay
          </Text>
        </View>

        {lastError && <ErrorMessage message={lastError} variant="inline" />}

        {recentTxs.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent</Text>
            {recentTxs.map((tx) => (
              <View
                key={tx.id}
                style={styles.recentRow}
                accessibilityLabel={`${tx.merchantName}, ${(tx.amountCents / 100).toFixed(2)} XLM`}
              >
                <Text style={styles.recentName} numberOfLines={1}>{tx.merchantName}</Text>
                <Text style={styles.recentAmount}>{(tx.amountCents / 100).toFixed(2)} XLM</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottom}>
        <NumericKeypad value={amount} onChangeValue={setAmount} maxDigits={8} />
        <View style={styles.actionRow}>
          <Button
            label={paymentState === 'processing' ? (agentMode ? 'Agent Signing...' : 'Processing...') : 'Tap to Pay'}
            onPress={handleTap}
            disabled={!isActive || paymentState === 'processing'}
            loading={paymentState === 'processing'}
            icon="radio"
            accessibilityLabel="Tap NFC tag to process payment"
          />
        </View>
      </View>

      {/* PIN Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.pinOverlay}>
          <View style={styles.pinCard}>
            <Text style={styles.pinTitle}>Enter Card PIN</Text>
            <Text style={styles.pinSub}>
              Required for amounts over {PIN_REQUIRED_ABOVE_CENTS.toLocaleString()} XLM (4-digit card PIN)
            </Text>
            <Text style={styles.pinDots}>{'•'.repeat(enteredPin.length) || '—'}</Text>
            <NumericKeypad value={enteredPin} onChangeValue={setEnteredPin} maxDigits={6} />
            <View style={styles.pinActions}>
              <PressableScale
                style={styles.pinCancel}
                onPress={() => { setPinModalVisible(false); setEnteredPin('') }}
                accessibilityRole="button"
                accessibilityLabel="Cancel PIN entry"
              >
                <Text style={styles.pinCancelText}>Cancel</Text>
              </PressableScale>
              <PressableScale
                style={[styles.pinConfirm, enteredPin.length < 4 && styles.pinDisabled]}
                disabled={enteredPin.length < 4}
                onPress={() => { setPinModalVisible(false); handleTap() }}
                accessibilityRole="button"
                accessibilityLabel="Confirm PIN and tap"
              >
                <Text style={styles.pinConfirmText}>Confirm & Tap</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },

  // ── Header ────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },

  // ── Amount ────────────────────────────────────────────────────
  scrollContent: { paddingHorizontal: Spacing.md },
  amountSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  currency: { fontSize: FontSize.md, color: Colors.mutedWhite, fontWeight: FontWeight.semibold },
  amountDisplay: { fontSize: FontSize.hero, fontWeight: FontWeight.heavy, color: Colors.white, letterSpacing: -1, marginTop: Spacing.sm },
  amountCursor: { color: Colors.gold },
  amountHint: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: Spacing.sm, textAlign: 'center' },

  // ── Recent Transactions ───────────────────────────────────────
  recentSection: { marginTop: Spacing.lg },
  recentTitle: {
    fontSize: FontSize.xs, color: Colors.mutedWhite, fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1,
  },
  recentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderGrey,
  },
  recentName: { fontSize: FontSize.sm, color: Colors.white, flex: 1, marginRight: Spacing.md },
  recentAmount: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.semibold },

  // ── Bottom (keypad + CTA) ─────────────────────────────────────
  bottom: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },

  // ── PIN Modal ─────────────────────────────────────────────────
  pinOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  pinCard: {
    backgroundColor: Colors.surfaceBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  pinTitle: { fontSize: FontSize.xl, color: Colors.white, fontWeight: FontWeight.bold },
  pinSub: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: Spacing.xs, marginBottom: Spacing.md, textAlign: 'center' },
  pinDots: { fontSize: FontSize.xl, color: Colors.gold, letterSpacing: 6, marginBottom: Spacing.md, minHeight: 28 },
  pinActions: { flexDirection: 'row', gap: Spacing.md, width: '100%', marginTop: Spacing.md },
  pinCancel: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.borderGrey, alignItems: 'center',
  },
  pinCancelText: { fontSize: FontSize.md, color: Colors.mutedWhite, fontWeight: FontWeight.semibold },
  pinConfirm: {
    flex: 2, paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold, alignItems: 'center',
  },
  pinConfirmText: { fontSize: FontSize.md, color: Colors.black, fontWeight: FontWeight.bold },
  pinDisabled: { backgroundColor: Colors.lightGrey },
})