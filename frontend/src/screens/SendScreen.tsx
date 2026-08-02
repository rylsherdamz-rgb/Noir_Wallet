import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useGlobalSearchParams } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, FontScaleCap } from '@/constants/theme'
import { Button } from '@/components/Button'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ErrorMessage } from '@/components/ErrorMessage'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Avatar } from '@/components/Avatar'
import { SmartTip } from '@/components/SmartTip'
import { EmptyState } from '@/components/EmptyState'
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen'
import { useToast } from '@/components/ToastProvider'
import { useAppStore } from '@/store/useAppStore'
import { walletService } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'
import {
  isValidStellarAddress,
  isValidMemoText,
  memoByteLength,
  spendableBalance,
  minimumBalance,
  toStellarAmount,
  BASE_FEE_XLM,
  MEMO_TEXT_MAX_BYTES,
} from '@/lib/stellarAccount'
import { humanizeStellarError } from '@/lib/stellarErrors'

export function SendScreen() {
  const router = useRouter()
  const params = useGlobalSearchParams()
  const toast = useToast()
  const { balance, devices } = useAppStore()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState((params?.scannedAddress as string) || '')
  const [recipientTouched, setRecipientTouched] = useState(false)
  const [note, setNote] = useState('')
  const [step, setStep] = useState<'amount' | 'recipient' | 'review'>('amount')
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChangeValue = useCallback((val: string) => {
    setError(null)
    setAmount(val)
  }, [])

  useEffect(() => {
    if (params?.scannedAddress) {
      setRecipient(params.scannedAddress as string)
      setStep('recipient')
      router.setParams({ scannedAddress: undefined })
    }
  }, [params?.scannedAddress])

  const amountNum = parseFloat(amount) || 0

  // The network holds back two base reserves plus one per subentry, and the fee
  // comes out on top. Checking against the raw balance is what made "send max"
  // fail on chain *after* the user had already confirmed.
  const spendable = useMemo(
    () => spendableBalance(balance.xlm, balance.subentryCount ?? 0),
    [balance.xlm, balance.subentryCount]
  )
  const reserve = minimumBalance(balance.subentryCount ?? 0)
  const insufficientFunds = amountNum > spendable

  const trimmedRecipient = recipient.trim()
  const recipientValid = isValidStellarAddress(trimmedRecipient)
  const recipientError =
    recipientTouched && trimmedRecipient.length > 0 && !recipientValid
      ? 'That is not a valid Stellar address. It should start with G and be 56 characters.'
      : null

  const memoValid = isValidMemoText(note)
  const total = amountNum + BASE_FEE_XLM

  const handleContinue = () => {
    if (amountNum <= 0) {
      setError('Enter an amount greater than 0')
      return
    }
    if (insufficientFunds) {
      setError(
        `You can send at most ${toStellarAmount(spendable)} XLM. ${toStellarAmount(reserve)} XLM stays locked as the account reserve, plus the network fee.`
      )
      return
    }
    setStep('recipient')
  }

  const handleSelectRecipient = (addr: string) => {
    setRecipient(addr)
    setRecipientTouched(true)
    setStep('review')
  }

  const handleReview = () => {
    setRecipientTouched(true)
    if (!recipientValid) {
      setError('Enter a valid Stellar address before continuing.')
      return
    }
    setError(null)
    setStep('review')
  }

  const handleSend = async () => {
    setSending(true)
    setError(null)
    try {
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret) {
        throw new Error('Wallet not initialized')
      }
      const result = await stellarService.submitPayment({
        sourceSecret: keys.stellarSecret,
        destination: trimmedRecipient,
        amount: toStellarAmount(amountNum),
        memo: note.trim() || undefined,
      })
      if ('error' in result) {
        throw new Error(result.error)
      }
      setShowConfirm(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      toast.success(
        `Sent ${toStellarAmount(amountNum)} XLM`,
        `To ${trimmedRecipient.slice(0, 6)}…${trimmedRecipient.slice(-4)} · ${result.hash.slice(0, 8)}…`
      )
      router.back()
    } catch (e: any) {
      setError(humanizeStellarError(e))
    } finally {
      setSending(false)
    }
  }

  if (step === 'amount') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </PressableScale>
          <Text style={styles.headerTitle}>Send</Text>
          <View style={styles.spacer24} />
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.balanceLabel}>XLM · Stellar Lumens</Text>
          <Text style={styles.amountDisplay} maxFontSizeMultiplier={FontScaleCap.display}>
            {amount || '0'}
          </Text>
          <Text style={styles.balanceLabel}>
            Balance: {balance.xlm.toLocaleString()} XLM
          </Text>
          <Text style={styles.spendableLabel}>
            Available to send: {toStellarAmount(spendable)} XLM
            {'  ·  '}
            {toStellarAmount(reserve)} XLM reserved
          </Text>
          {error ? <ErrorMessage message={error} variant="inline" /> : null}
        </View>

        <View style={styles.keypadSection}>
          <NumericKeypad value={amount} onChangeValue={handleChangeValue} />
          <View style={styles.amountActions}>
            <Button variant="ghost" label="Cancel" onPress={() => router.back()} />
            <Button
              label="Max"
              variant="ghost"
              onPress={() => handleChangeValue(toStellarAmount(spendable))}
              disabled={spendable <= 0}
            />
            <Button
              label="Continue"
              onPress={handleContinue}
              disabled={amountNum <= 0 || insufficientFunds}
              style={styles.halfBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (step === 'recipient') {
    return (
      <KeyboardAwareScreen scroll contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <PressableScale
            onPress={() => setStep('amount')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Back to amount"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </PressableScale>
          <Text style={styles.headerTitle}>Send to</Text>
          <View style={styles.spacer24} />
        </View>

        <View style={[styles.inputWrap, recipientError && styles.inputWrapError]}>
          <TextInput
            style={styles.addressInput}
            value={recipient}
            onChangeText={(text) => {
              setError(null)
              setRecipient(text)
            }}
            onBlur={() => setRecipientTouched(true)}
            placeholder="Enter Stellar address or scan NFC"
            placeholderTextColor={Colors.mutedWhite}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Recipient Stellar address"
          />
          <PressableScale
            style={styles.scanBtn}
            onPress={() => router.push('/scan-qr')}
            accessibilityRole="button"
            accessibilityLabel="Scan a QR code"
            accessibilityHint="Opens the camera to read a recipient address"
          >
            <Ionicons name="qr-code-outline" size={20} color={Colors.gold} />
          </PressableScale>
        </View>

        {recipientError ? <ErrorMessage message={recipientError} variant="inline" /> : null}
        {error ? <ErrorMessage message={error} variant="inline" /> : null}

        <SmartTip
          title="Tip: NFC Scan"
          description="Tap the QR icon to scan a recipient's address from their NFC tag or QR code."
          variant="tip"
        />

        <Text style={styles.sectionLabel}>Saved Devices</Text>
        {devices.filter((device) => !!device.agentPublicKey).length === 0 ? (
          <EmptyState
            icon="hardware-chip-outline"
            title="No linked devices"
            description="Link a card in the Devices tab to send to it by name."
          />
        ) : (
          devices
            .filter((device) => !!device.agentPublicKey)
            .map((device) => (
              <PressableScale
                key={device.id}
                style={styles.recipientRow}
                onPress={() => device.agentPublicKey && handleSelectRecipient(device.agentPublicKey)}
                accessibilityRole="button"
                accessibilityLabel={`Send to ${device.label}`}
              >
                <Avatar name={device.label} size={44} variant="device" />
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{device.label}</Text>
                  <Text style={styles.recipientAddress}>
                    {device.agentPublicKey?.slice(0, 8)}…{device.agentPublicKey?.slice(-6)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
              </PressableScale>
            ))
        )}

        <View style={styles.bottomActions}>
          <Button label="Review Send" onPress={handleReview} disabled={!recipientValid} />
        </View>
      </KeyboardAwareScreen>
    )
  }

  return (
    <KeyboardAwareScreen scroll contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => setStep('recipient')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Back to recipient"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle}>Review Send</Text>
        <View style={styles.spacer24} />
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel} maxFontSizeMultiplier={FontScaleCap.row}>Amount</Text>
          <Text style={styles.reviewValue} maxFontSizeMultiplier={FontScaleCap.row}>{toStellarAmount(amountNum)} XLM</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel} maxFontSizeMultiplier={FontScaleCap.row}>To</Text>
          <Text style={styles.reviewValueMono} maxFontSizeMultiplier={FontScaleCap.row}>{trimmedRecipient}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel} maxFontSizeMultiplier={FontScaleCap.row}>Network fee</Text>
          <Text style={styles.reviewValue} maxFontSizeMultiplier={FontScaleCap.row}>{toStellarAmount(BASE_FEE_XLM)} XLM</Text>
        </View>
        {note.trim() ? (
          <>
            <View style={styles.divider} />
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel} maxFontSizeMultiplier={FontScaleCap.row}>Note</Text>
              <Text style={styles.reviewValueMono} maxFontSizeMultiplier={FontScaleCap.row}>{note.trim()}</Text>
            </View>
          </>
        ) : null}
        <View style={styles.divider} />
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel} maxFontSizeMultiplier={FontScaleCap.row}>Total</Text>
          <Text style={styles.reviewValueGold} maxFontSizeMultiplier={FontScaleCap.row}>{toStellarAmount(total)} XLM</Text>
        </View>
      </View>

      <View style={styles.noteSection}>
        <TextInput
          style={[styles.noteInput, !memoValid && styles.noteInputError]}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note (optional) — sent on-chain"
          placeholderTextColor={Colors.mutedWhite}
          accessibilityLabel="Transaction note, sent as a public Stellar memo"
        />
        <Text style={[styles.noteHint, !memoValid && styles.noteHintError]}>
          {memoValid
            ? `Public on-chain memo · ${memoByteLength(note)}/${MEMO_TEXT_MAX_BYTES} bytes`
            : `Too long — ${memoByteLength(note)}/${MEMO_TEXT_MAX_BYTES} bytes`}
        </Text>
      </View>

      {error ? <ErrorMessage message={error} variant="card" onRetry={() => setError(null)} /> : null}

      <View style={styles.bottomActions}>
        <Button
          label="Confirm Send"
          onPress={() => setShowConfirm(true)}
          disabled={!memoValid || !recipientValid || amountNum <= 0}
        />
      </View>

      <ConfirmDialog
        visible={showConfirm}
        title="Confirm Send"
        message={`Send ${toStellarAmount(amountNum)} XLM to ${trimmedRecipient}? Total with fee: ${toStellarAmount(total)} XLM. This cannot be undone.`}
        confirmLabel={sending ? 'Sending...' : 'Send'}
        icon="send-outline"
        onConfirm={handleSend}
        onCancel={() => setShowConfirm(false)}
        loading={sending}
      />
    </KeyboardAwareScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBg,
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
  amountSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  assetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  assetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  assetChipActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  assetChipLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.semibold,
  },
  assetChipLabelActive: {
    color: Colors.gold,
  },
  amountDisplay: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.heavy,
    color: Colors.white,
    letterSpacing: -1,
  },
  balanceLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginTop: Spacing.sm,
  },
  spendableLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  keypadSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  amountActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  halfBtn: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingLeft: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputWrapError: {
    borderColor: Colors.danger,
  },
  addressInput: {
    flex: 1,
    height: 52,
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: 'monospace',
  },
  scanBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.borderGrey,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedWhite,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    gap: Spacing.md,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  recipientAddress: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    marginTop: Spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  reviewLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
  },
  reviewValue: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  reviewValueMono: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: 'monospace',
    maxWidth: '60%',
    textAlign: 'right',
  },
  reviewValueGold: {
    fontSize: FontSize.md,
    color: Colors.gold,
    fontWeight: FontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderGrey,
  },
  noteSection: {
    marginTop: Spacing.md,
  },
  noteInput: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    height: 52,
  },
  noteInputError: {
    borderColor: Colors.danger,
  },
  noteHint: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: Spacing.xs,
  },
  noteHintError: {
    color: Colors.danger,
  },
  bottomActions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  spacer24: { width: 24 },
})
