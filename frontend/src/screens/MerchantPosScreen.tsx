import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { AppConfig } from '@/constants/config'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ReadyToTapIndicator } from '@/components/ReadyToTapIndicator'
import { DesignTokens } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

export function MerchantPosScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { transactions, addTransaction, user, devices, addPendingPayment } = useAppStore()
  const [amount, setAmount] = useState('')
  const [paymentState, setPaymentState] = useState<'idle' | 'active' | 'processing' | 'success' | 'error'>('idle')
  const [agentMode, setAgentMode] = useState(false)
  const [pinModalVisible, setPinModalVisible] = useState(false)
  const [enteredPin, setEnteredPin] = useState('')

  // Amounts above this (in cents) require a card PIN — mirrors the backend
  // threshold (100,000,000 stroops).
  const PIN_REQUIRED_ABOVE_CENTS = 100_000

  const displayAmount = amount ? `₱${(parseInt(amount) / 100).toFixed(2)}` : ''
  const isActive = amount !== '' && parseInt(amount) > 0

  const handleTap = useCallback(async () => {
    if (!amount || parseInt(amount) === 0) {
      // Provide feedback if no amount entered
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      }
      return
    }

    // Large amounts require a card PIN — collect it before tapping.
    if (parseInt(amount) > PIN_REQUIRED_ABOVE_CENTS && !enteredPin) {
      setPinModalVisible(true)
      return
    }

    setPaymentState('processing')
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }

    let tag: NFCTag | null = null
    try {
      // Read NFC tag
      tag = await nfcService.readTag(10000) // 10 second timeout
      
      if (!tag) {
        console.log('No NFC tag detected')
        setPaymentState('error')
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
        setTimeout(() => setPaymentState('idle'), 2000)
        return
      }

      console.log('NFC tag detected:', tag.uid)
      const scanned = tag

      // Hash the UID
      const hashBytes = sha256(new TextEncoder().encode(scanned.uid))
      const scannedHash = Buffer.from(hashBytes).toString('hex')
      
      console.log('Tag hash:', scannedHash)
      
      const linkedDevice = devices.find((d) => d.deviceUidHash === scannedHash)
      const hasAgent = await x402.hasAgent()
      let txHash: string | null = null

      if (hasAgent && linkedDevice?.agentPublicKey) {
        const agentSecret = await x402.getAgentSecret()
        const escrowContractId = AppConfig.stellar.paymentEscrowContract

        if (escrowContractId && agentSecret) {
          console.log('Using escrow payment')
          setAgentMode(true)
          const amountStroops = parseInt(amount) * 1000
          const merchantAddr = user?.stellarPublicKey || ''
          if (!merchantAddr) throw new Error('No merchant wallet configured')

          txHash = await x402.authorizePayment({
            agentSecret,
            deviceHashHex: linkedDevice.deviceUidHash,
            merchantAddress: merchantAddr,
            amountStroops,
          })
        } else {
          console.log('Using classic agent payment (no escrow contract)')
          setAgentMode(true)
          const result = await x402.payWithAgent({
            destination: user?.stellarPublicKey || '',
            amount: (parseInt(amount) / 100).toFixed(2),
          })
          if ('error' in result) throw new Error(result.error)
          txHash = result.hash
        }
      } else {
        // Passive NFC card: it only carries a UID and cannot sign. The merchant
        // sends the UID + amount to the backend, which signs from the card's
        // custodied wallet and fee-bumps it. Verified end-to-end on testnet.
        console.log('Using custodial UID-authorized tap payment')
        const merchant = user?.stellarPublicKey || ''
        if (!merchant) throw new Error('No merchant wallet configured')

        // 1 cent -> 1000 stroops (0.0001 XLM), matching backend convention.
        const amountStroops = parseInt(amount) * 1000
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
        console.log('Payment successful:', txHash)
        setPaymentState('success')
        addTransaction({
          id: Math.random().toString(36).slice(2),
          stellarTxHash: txHash,
          merchantId: 'me',
          merchantName: 'Tap Pay',
          userId: user?.id || 'local',
          deviceId: scanned.uid,
          amountCents: parseInt(amount),
          assetCode: 'PHP',
          status: 'confirmed',
          errorMessage: null,
          createdAt: new Date().toISOString(),
        })

        // Reset after showing success
        setTimeout(() => {
          setAmount('')
          setPaymentState('idle')
          setAgentMode(false)
          setEnteredPin('')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setPaymentState('error')
      
      // Queue payment for offline retry
      if (amount && parseInt(amount) > 0) {
        const queued: QueuedPayment = {
          id: Math.random().toString(36).slice(2),
          rawDeviceUid: tag?.uid || 'unknown',
          merchantPublicKey: user?.stellarPublicKey || '',
          amountCents: parseInt(amount),
          assetCode: 'PHP',
          terminalId: undefined,
          nonce: Math.random().toString(36).slice(2, 10),
          createdAt: new Date().toISOString(),
          retryCount: 0,
        }
        addPendingPayment(queued)
      }

      // Reset error state after delay
      setTimeout(() => {
        setPaymentState('idle')
        setAgentMode(false)
        setEnteredPin('')
      }, 3000)
    }
  }, [amount, user, addTransaction, devices, addPendingPayment, enteredPin])

  const recentTxs = transactions.slice(0, 5)

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Tap to Pay
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tap Section */}
        <View style={styles.tapSection}>
          <ReadyToTapIndicator
            amount={displayAmount}
            isActive={isActive}
            state={paymentState}
            testID="merchant-pos-indicator"
          />

          <TouchableOpacity
            style={[
              styles.tapBtn,
              !isActive && styles.tapBtnDisabled,
              isActive && paymentState === 'idle' && styles.tapBtnActive,
            ]}
            onPress={handleTap}
            disabled={!isActive || paymentState === 'processing'}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              paymentState === 'processing'
                ? agentMode
                  ? 'Agent signing transaction'
                  : 'Processing payment'
                : isActive
                ? 'Tap NFC tag to process payment'
                : 'Enter an amount first'
            }
            accessibilityState={{ disabled: !isActive || paymentState === 'processing' }}
          >
            <Ionicons
              name={paymentState === 'processing' ? 'sync' : 'radio'}
              size={DesignTokens.iconSize.md}
              color={isActive && paymentState !== 'processing' ? Colors.black : Colors.mutedWhite}
            />
            <Text
              style={[
                styles.tapBtnText,
                isActive && paymentState !== 'processing' && { color: Colors.black },
              ]}
            >
              {paymentState === 'processing'
                ? agentMode
                  ? 'Agent Signing...'
                  : 'Processing...'
                : 'Tap NFC Tag'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Keypad Section */}
        <View style={styles.keypadSection}>
          <NumericKeypad value={amount} onChangeValue={setAmount} maxDigits={8} />
        </View>

        {/* Recent Transactions */}
        {recentTxs.length > 0 && (
          <View style={[styles.recentSection, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}>
            <Text style={styles.recentTitle} accessibilityRole="header">
              Recent
            </Text>
            {recentTxs.map((tx) => (
              <View
                key={tx.id}
                style={styles.recentRow}
                accessibilityLabel={`${tx.merchantName}, ${(tx.amountCents / 100).toFixed(2)} pesos`}
              >
                <Text style={styles.recentName} numberOfLines={1}>
                  {tx.merchantName}
                </Text>
                <Text style={styles.recentAmount}>₱{(tx.amountCents / 100).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </KeyboardAvoidingView>

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
              Required for amounts over ₱{(PIN_REQUIRED_ABOVE_CENTS / 100).toLocaleString()}
            </Text>
            <Text style={styles.pinDots}>{'•'.repeat(enteredPin.length) || '—'}</Text>
            <NumericKeypad value={enteredPin} onChangeValue={setEnteredPin} maxDigits={6} />
            <View style={styles.pinActions}>
              <TouchableOpacity
                style={styles.pinCancel}
                onPress={() => {
                  setPinModalVisible(false)
                  setEnteredPin('')
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancel PIN entry"
              >
                <Text style={styles.pinCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pinConfirm, enteredPin.length < 4 && styles.pinDisabled]}
                disabled={enteredPin.length < 4}
                onPress={() => {
                  setPinModalVisible(false)
                  handleTap()
                }}
                accessibilityRole="button"
                accessibilityLabel="Confirm PIN and tap"
              >
                <Text style={styles.pinConfirmText}>Confirm &amp; Tap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBg,
    paddingBottom: 0,
  },
  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  pinCard: {
    backgroundColor: Colors.surfaceBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  pinTitle: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  pinSub: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pinDots: {
    fontSize: FontSize.xl,
    color: Colors.gold,
    letterSpacing: 6,
    marginBottom: Spacing.md,
    minHeight: 28,
  },
  pinActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    marginTop: Spacing.md,
  },
  pinCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    alignItems: 'center',
  },
  pinCancelText: {
    fontSize: FontSize.md,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.semibold,
  },
  pinConfirm: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gold,
    alignItems: 'center',
  },
  pinConfirmText: {
    fontSize: FontSize.md,
    color: Colors.black,
    fontWeight: FontWeight.bold,
  },
  pinDisabled: {
    backgroundColor: Colors.lightGrey,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  tapSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  tapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.borderGrey,
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    minHeight: DesignTokens.touchTarget.comfortable,
    ...DesignTokens.shadows.card,
  },
  tapBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
    ...DesignTokens.shadows.goldGlow,
  },
  tapBtnDisabled: {
    opacity: DesignTokens.opacity.strong,
  },
  tapBtnText: {
    fontSize: FontSize.lg,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.bold,
  },
  keypadSection: {
    paddingBottom: Spacing.sm,
  },
  recentSection: {
    paddingHorizontal: Spacing.lg,
    flexShrink: 0,
    maxHeight: 180,
  },
  recentTitle: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: DesignTokens.typography.letterSpacing.wider,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  recentName: {
    fontSize: FontSize.sm,
    color: Colors.white,
    flex: 1,
    marginRight: Spacing.md,
  },
  recentAmount: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
})
