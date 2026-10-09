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
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { logger } from '@/lib/logger'
import { openReceipt } from '@/lib/receipt'
import { startLocalTx, settleLocalTx, dropLocalTx } from '@/lib/localTx'
import { ScreenHeader } from '@/components/ScreenHeader'
import { AmountText } from '@/screens/SendScreen'
import { Segmented } from '@/components/ui/Segmented'
import { ProcessingOverlay } from '@/components/flow/ProcessingOverlay'
import { PaymentRequestQr } from '@/components/flow/PaymentRequestQr'
import { TextAction } from '@/components/ui/List'
import { popup } from '@/components/popup/Popup'
import { readCardHash, resolveCardRecipient } from '@/lib/cardTap'
import { sendXlm } from '@/lib/sendPayment'
import { humanizeStellarError } from '@/lib/stellarErrors'
import { spendableBalance, toStellarAmount, BASE_FEE_XLM } from '@/lib/stellarAccount'
import { formatAmount } from '@/lib/txFormat'

type TapMode = 'receive' | 'send' | 'qr'

export function MerchantPosScreen() {
  const router = useRouter()
  const { user, devices, addPendingPayment } = useAppStore()
  const [amount, setAmount] = useState('')
  const [paymentState, setPaymentState] = useState<'idle' | 'processing'>('idle')
  const [agentMode, setAgentMode] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  // Receive = tap the payer's card; Send = tap the recipient's card;
  // QR = show a payment-request QR for the amount.
  const [mode, setMode] = useState<TapMode>('receive')
  const [showQr, setShowQr] = useState(false)
  const [sendState, setSendState] = useState<'idle' | 'scanning' | 'resolving' | 'sending'>('idle')
  const balance = useAppStore((st) => st.balance)

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
    let localId: string | null = null
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
      let txHash: string | null = null
      // Pending in Activity (wallet and the card) while the payment goes through.
      localId = startLocalTx({
        merchantName: linkedDevice ? `Tap · ${linkedDevice.label}` : 'Tap Pay',
        merchantId: linkedDevice?.agentPublicKey,
        amountCents,
        direction: 'in',
        deviceId: scannedHash,
      })

      if (linkedDevice?.agentPublicKey) {
        logger.debug('Paying from agent wallet')
        setAgentMode(true)
        // Never fall back to agent 1 — that paid from the wrong card.
        const agentIndex = await x402.resolveAgentIndex(scannedHash, linkedDevice.agentPublicKey)
        if (agentIndex == null) throw new Error(`${linkedDevice.label}’s agent key isn’t on this phone, so it can’t pay from here.`)
        const result = await x402.payWithAgent({
          agentIndex,
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
        // Hash attached; txMonitor flips it to confirmed when the ledger closes.
        settleLocalTx(localId, { stellarTxHash: txHash })
        useAppStore.getState().addPendingTxHash(txHash)
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        setPaymentState('idle')
        setAmount('')
        setAgentMode(false)
        openReceipt(router, {
          title: 'Tap payment received',
          amountCents,
          assetCode: 'XLM',
          direction: 'in',
          // Submitted, not yet final — the receipt says so honestly.
          status: 'pending',
          createdAt: new Date().toISOString(),
          counterpartyLabel: 'From',
          counterparty: linkedDevice?.agentPublicKey,
          hash: txHash,
          note: linkedDevice ? `Paid by ${linkedDevice.label}` : 'Paid by NFC card',
        }, 'push')
      }
    } catch (err: any) {
      logger.error('Payment error:', err)
      // The tap is queued for retry below, so drop the in-flight entry rather than show it as failed.
      if (localId) dropLocalTx(localId)
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
  }, [amount, amountCents, user, devices, addPendingPayment, router])

  /** Send mode: tap the recipient's card, sign in a sheet, pay its owner. */
  const handleTapSend = async () => {
    const value = parseFloat(amount) || 0
    if (value <= 0 || !user?.stellarPublicKey) return
    const spendable = spendableBalance(balance.xlm, balance.subentryCount ?? 0)
    if (value > spendable) {
      setLastError(`You can send at most ${toStellarAmount(spendable)} XLM after the network reserve.`)
      return
    }
    setLastError(null)
    setSendState('scanning')
    try {
      const card = await readCardHash()
      if (!card) {
        setLastError('No card detected — hold the card flat against the back of the phone and try again.')
        return
      }
      setSendState('resolving')
      const to = await resolveCardRecipient(card.hash, devices, user.stellarPublicKey)
      setSendState('idle')
      const short = `${to.address.slice(0, 6)}…${to.address.slice(-6)}`
      const ok = await popup.sign({
        title: `Send ${toStellarAmount(value)} XLM?`,
        message: 'Stellar payments are final.',
        details: [
          { label: 'To', value: to.label },
          { label: 'Address', value: short, mono: true },
          { label: 'Total', value: `${toStellarAmount(value + BASE_FEE_XLM)} XLM`, emphasis: true },
        ],
        confirmLabel: 'Sign & send',
      })
      if (!ok) return
      setSendState('sending')
      const hash = await sendXlm({ destination: to.address, amountXlm: value, label: `Sent · ${to.label}` })
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setAmount('')
      openReceipt(router, {
        title: 'Sent XLM',
        amountCents: Math.round(value * 100),
        assetCode: 'XLM',
        direction: 'out',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        counterpartyLabel: 'To',
        counterparty: to.address,
        hash,
        note: `Paid by tapping ${to.label === 'Card owner' ? 'their card' : to.label}`,
      }, 'push')
    } catch (e: any) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setLastError(humanizeStellarError(e))
    } finally {
      setSendState('idle')
    }
  }

  const switchMode = (m: TapMode) => {
    setMode(m)
    setShowQr(false)
    setLastError(null)
  }

  const value = parseFloat(amount) || 0
  const hint = mode === 'receive'
    ? 'Hold the payer’s card to the back of the phone'
    : mode === 'send'
      ? 'Hold the recipient’s card to the back of the phone'
      : 'Show a QR the payer scans with any Stellar wallet'

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Tap to pay" onBackPress={() => router.back()} />
      <Segmented
        value={mode}
        onChange={switchMode}
        options={[{ value: 'receive', label: 'Receive' }, { value: 'send', label: 'Send' }, { value: 'qr', label: 'QR' }]}
        style={styles.segment}
      />

      {mode === 'qr' && showQr && user?.stellarPublicKey ? (
        <ScrollView contentContainerStyle={styles.qrArea}>
          <PaymentRequestQr
            address={user.stellarPublicKey}
            amountXlm={value}
            onPaid={(p) => {
              if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              setShowQr(false)
              setAmount('')
              openReceipt(router, {
                title: 'QR payment received',
                amountCents: Math.round(p.amountXlm * 100),
                assetCode: 'XLM',
                direction: 'in',
                status: 'confirmed',
                createdAt: new Date().toISOString(),
                counterpartyLabel: 'From',
                counterparty: p.from,
                hash: p.hash,
                note: 'Paid by QR',
              }, 'push')
            }}
          />
          <TextAction label="Change amount" icon="create-outline" onPress={() => setShowQr(false)} />
        </ScrollView>
      ) : (
        <>
          <View style={styles.amountArea}>
            <AmountText value={amount} />
            <Text style={styles.hint}>{hint}</Text>
            {lastError ? <ErrorMessage message={lastError} variant="inline" /> : null}
          </View>
          <NumericKeypad value={amount} onChangeValue={(v) => { setLastError(null); setAmount(v) }} maxDigits={8} />
          <View style={styles.footer}>
            {mode === 'receive' ? (
              <Button
                label={paymentState === 'processing' ? (agentMode ? 'Agent signing…' : 'Processing…') : 'Ready to tap'}
                onPress={handleTap}
                disabled={!isActive || paymentState === 'processing'}
                loading={paymentState === 'processing'}
                icon="radio"
                fullWidth
                accessibilityLabel="Tap NFC card to take payment"
              />
            ) : mode === 'send' ? (
              <Button label="Tap card to pay" icon="radio" onPress={handleTapSend} disabled={!isActive || sendState !== 'idle'} fullWidth />
            ) : (
              <Button label="Show QR" icon="qr-code-outline" onPress={() => setShowQr(true)} disabled={!isActive} fullWidth />
            )}
          </View>
        </>
      )}

      <ProcessingOverlay
        visible={sendState !== 'idle'}
        variant={sendState === 'scanning' ? 'nfc' : 'verify'}
        title={sendState === 'scanning' ? 'Hold their card to your phone' : sendState === 'resolving' ? 'Finding the card’s owner' : `Sending ${formatAmount(Math.round(value * 100))} XLM`}
        subtitle={sendState === 'sending' ? 'Submitting to Stellar' : `Sending ${formatAmount(Math.round(value * 100))} XLM`}
        steps={[
          { label: sendState === 'scanning' ? 'Waiting for card' : 'Card detected', state: sendState === 'scanning' ? 'active' : 'done' },
          { label: 'Looking up the owner on Stellar', state: sendState === 'resolving' ? 'active' : sendState === 'sending' ? 'done' : 'pending' },
          { label: 'Signed & sent', state: sendState === 'sending' ? 'active' : 'pending' },
        ]}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  amountArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  segment: { marginHorizontal: 20, marginTop: Spacing.xs },
  qrArea: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.lg, paddingHorizontal: 20 },
  hint: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
})
