import { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  Platform,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
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
  const [lastError, setLastError] = useState<string | null>(null)

  // Amounts above this (in cents) require a card PIN — mirrors the backend
  // threshold (100,000,000 stroops).
  const PIN_REQUIRED_ABOVE_CENTS = 100_000

  const displayAmount = amount ? `${(parseFloat(amount)).toFixed(2)} XLM` : ''
  const isActive = amount !== '' && parseFloat(amount) > 0

  const handleTap = useCallback(async () => {
    if (!amount || parseFloat(amount) === 0) {
      // Provide feedback if no amount entered
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      }
      setLastError('Enter an amount first')
      setPaymentState('error')
      setTimeout(() => {
        setPaymentState('idle')
        setLastError(null)
      }, 2000)
      return
    }

    // Large amounts require a card PIN — collect it before tapping.
    if (parseFloat(amount) > PIN_REQUIRED_ABOVE_CENTS && !enteredPin) {
      setPinModalVisible(true)
      return
    }

    setPaymentState('processing')
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }

    let tag: NFCTag | null = null
    let scannedHash: string | null = null
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
      scannedHash = Buffer.from(hashBytes).toString('hex')

      console.log('Tag hash:', scannedHash)

      const linkedDevice = devices.find((d) => d.deviceUidHash === scannedHash)
      const hasAgent = await x402.hasAgent()
      let txHash: string | null = null

      if (hasAgent && linkedDevice?.agentPublicKey) {
        console.log('Paying from agent wallet')
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
        console.log('Using custodial UID-authorized tap payment')
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
        console.log('Payment queued:', txHash)
        setPaymentState('success')

        const { addPendingTxHash } = useAppStore.getState()
        addTransaction({
          id: Math.random().toString(36).slice(2),
          stellarTxHash: txHash,
          merchantId: 'me',
          merchantName: 'Tap Pay',
          userId: user?.id || 'local',
          deviceId: scannedHash,
          amountCents: Math.round(parseFloat(amount) * 100),
          assetCode: 'XLM',
          status: 'pending',
          errorMessage: null,
          createdAt: new Date().toISOString(),
        })
        addPendingTxHash(txHash)

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
      setLastError(err?.message ?? 'Unknown error')
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }

      // Queue payment for offline retry
      if (amount && parseFloat(amount) > 0) {
        const queued: QueuedPayment = {
          id: Math.random().toString(36).slice(2),
          rawDeviceUid: tag?.uid || 'unknown',
          deviceUidHash: scannedHash ?? undefined,
          merchantPublicKey: user?.stellarPublicKey || '',
          amountCents: Math.round(parseFloat(amount) * 100),
          assetCode: 'XLM',
          terminalId: undefined,
          nonce: Math.random().toString(36).slice(2, 10),
          createdAt: new Date().toISOString(),
          retryCount: 0,
        }
        addPendingPayment(queued)
      }

      // Error remains shown until the user taps the indicator to dismiss.
      // resetPaymentState() (bound below) clears state on tap.
    }
  }, [amount, user, addTransaction, devices, addPendingPayment, enteredPin])

  const resetPaymentState = useCallback(() => {
    setPaymentState('idle')
    setLastError(null)
    setAgentMode(false)
    setEnteredPin('')
  }, [])

  const recentTxs = transactions
    .filter((t) => t.merchantName === 'Tap Pay' || t.merchantName === 'NFC Receive')
    .slice(0, 5)

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg" >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 flex-shrink-0">
          <PressableScale
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </PressableScale>
          <Text className="text-2xl font-bold text-white" accessibilityRole="header">
            Tap to Pay
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 justify-start" style={{ paddingBottom: Math.max(insets.bottom + 80, 100) }}>
          {/* === Tap Indicator + Button === */}
          <View className="items-center px-6 pt-4 flex-shrink-0">
            <PressableScale
              onPress={resetPaymentState}
              disabled={paymentState !== 'error'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole={paymentState === 'error' ? 'button' : undefined}
              accessibilityLabel={paymentState === 'error' ? 'Dismiss error and try again' : undefined}
              accessibilityHint={paymentState === 'error' ? 'Tap to dismiss error' : undefined}
            >
              <ReadyToTapIndicator
                amount={displayAmount}
                isActive={isActive}
                state={paymentState}
                testID="merchant-pos-indicator"
              />
              {paymentState === 'error' && lastError && (
                <Text className="text-sm text-[#FF5A5F] text-center px-6 mt-4" numberOfLines={2}>{lastError}</Text>
              )}
            </PressableScale>

            <PressableScale
              style={[
                !isActive && { opacity: 0.6 },
              ]}
              className={`flex-row items-center justify-center px-8 py-6 rounded-full border-2 gap-2 mt-1 min-h-[56] ${isActive && paymentState === 'idle' ? 'bg-gold border-gold' : 'bg-cardBg border-borderGrey'}`}
              onPress={handleTap}
              disabled={!isActive || paymentState === 'processing'}
              accessibilityRole="button"
              accessibilityLabel={
                paymentState === 'processing'
                  ? agentMode ? 'Agent signing transaction' : 'Processing payment'
                  : isActive ? 'Tap NFC tag to process payment' : 'Enter an amount first'
              }
              accessibilityState={{ disabled: !isActive || paymentState === 'processing' }}
            >
              <Ionicons
                name={paymentState === 'processing' ? 'sync' : 'radio'}
                size={DesignTokens.iconSize.md}
                color={isActive && paymentState !== 'processing' ? Colors.black : Colors.mutedWhite}
              />
              <Text className={`text-xl font-bold ${isActive && paymentState !== 'processing' ? 'text-black' : 'text-mutedWhite'}`}>
                {paymentState === 'processing'
                  ? agentMode ? 'Agent Signing...' : 'Processing...'
                  : 'Tap NFC Tag'}
              </Text>
            </PressableScale>
          </View>

          {/* === Keypad === */}
          <View className="flex-shrink-0">
            <NumericKeypad value={amount} onChangeValue={setAmount} maxDigits={8} />
          </View>



          {/* Recent Transactions */}
          {recentTxs.length > 0 ? (
            <View className="flex-shrink-0 max-h-[160]">
              <Text className="text-xs text-mutedWhite font-medium mb-4 uppercase tracking-[2px]" accessibilityRole="header">Recent</Text>
              {recentTxs.map((tx) => (
                <View
                  key={tx.id}
                  className="flex-row justify-between items-center py-2 border-b border-borderGrey"
                  accessibilityLabel={`${tx.merchantName}, ${(tx.amountCents / 100).toFixed(2)} XLM`}
                >
                  <Text className="text-sm text-white flex-1 mr-4" numberOfLines={1}>{tx.merchantName}</Text>
                  <Text className="text-sm text-gold font-semibold">{(tx.amountCents / 100).toFixed(2)} XLM</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-shrink-0 max-h-[160]">
              <Text className="text-sm text-mutedWhite text-center py-8">No payments yet — tap a card when ready.</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* PIN Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-surfaceBg rounded-t-3xl px-6 pt-6 pb-8 items-center">
            <Text className="text-2xl text-white font-bold">Enter Card PIN</Text>
            <Text className="text-sm text-mutedWhite mt-1 mb-4 text-center">
              Required for amounts over {PIN_REQUIRED_ABOVE_CENTS.toLocaleString()} XLM (4-digit card PIN)
            </Text>
            <Text className="text-2xl text-gold tracking-[6px] mb-4 min-h-[28]">{'•'.repeat(enteredPin.length) || '—'}</Text>
            <NumericKeypad value={enteredPin} onChangeValue={setEnteredPin} maxDigits={6} />
            <View className="flex-row gap-4 w-full mt-4">
              <PressableScale
                className="flex-1 py-4 rounded-xl border border-borderGrey items-center"
                onPress={() => { setPinModalVisible(false); setEnteredPin('') }}
                accessibilityRole="button"
                accessibilityLabel="Cancel PIN entry"
              >
                <Text className="text-base text-mutedWhite font-semibold">Cancel</Text>
              </PressableScale>
              <PressableScale
                className={`flex-2 py-4 rounded-xl bg-gold items-center ${enteredPin.length < 4 ? 'bg-[#2C2C2C]' : ''}`}
                disabled={enteredPin.length < 4}
                onPress={() => { setPinModalVisible(false); handleTap() }}
                accessibilityRole="button"
                accessibilityLabel="Confirm PIN and tap"
              >
                <Text className={`text-base font-bold ${enteredPin.length < 4 ? 'text-mutedWhite' : 'text-black'}`}>Confirm & Tap</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
