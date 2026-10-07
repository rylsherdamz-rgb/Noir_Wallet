import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native'
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
import { ScreenHeader } from '@/components/ScreenHeader'
import { AmountText } from '@/screens/SendScreen'

export function MerchantPosScreen() {
  const router = useRouter()
  const { addTransaction, user, devices, addPendingPayment } = useAppStore()
  const [amount, setAmount] = useState('')
  const [paymentState, setPaymentState] = useState<'idle' | 'processing'>('idle')
  const [agentMode, setAgentMode] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })

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
        const agentIndex = await x402.getAgentIndexForDevice(scannedHash)
        const result = await x402.payWithAgent({
          agentIndex: agentIndex ?? undefined,
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
  }, [amount, amountCents, user, addTransaction, devices, addPendingPayment])

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Tap to pay" onBackPress={() => router.back()} />
      <View style={styles.amountArea}>
        <AmountText value={amount} />
        <Text style={styles.hint}>Hold the payer’s card to the back of the phone</Text>
        {lastError ? <ErrorMessage message={lastError} variant="inline" /> : null}
      </View>
      <NumericKeypad value={amount} onChangeValue={setAmount} maxDigits={8} />
      <View style={styles.footer}>
        <Button
          label={paymentState === 'processing' ? (agentMode ? 'Agent signing…' : 'Processing…') : 'Ready to tap'}
          onPress={handleTap}
          disabled={!isActive || paymentState === 'processing'}
          loading={paymentState === 'processing'}
          icon="radio"
          fullWidth
          accessibilityLabel="Tap NFC card to take payment"
        />
      </View>

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
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  amountArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  hint: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
})
