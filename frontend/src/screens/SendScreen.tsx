import { colorWithOpacity } from '@/constants/designTokens'
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
import { Colors, Spacing, FontSize, FontWeight, FontScaleCap, Fonts, Gradient } from '@/constants/theme'
import { Button } from '@/components/Button'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ErrorMessage } from '@/components/ErrorMessage'
import { SignSheet } from '@/components/popup/Popup'
import { Avatar } from '@/components/Avatar'
import { EmptyState } from '@/components/EmptyState'
import { KeyboardAwareScreen } from '@/components/KeyboardAwareScreen'
import { useAppStore } from '@/store/useAppStore'
import { readCardHash, resolveCardRecipient } from '@/lib/cardTap'
import { sendXlm } from '@/lib/sendPayment'
import { parsePaymentQr } from '@/lib/paymentQr'
import { Segmented } from '@/components/ui/Segmented'
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
import { ProcessingOverlay } from '@/components/flow/ProcessingOverlay'
import { openReceipt } from '@/lib/receipt'
import { formatAmount } from '@/lib/txFormat'
import { ScreenHeader } from '@/components/ScreenHeader'
import { SectionLabel, ListRow, KeyValueRow } from '@/components/ui/List'
import { TapGlyph, StellarMark } from '@/components/brand/BrandGlyph'
import { ErrorState } from '@/components/ui/ErrorState'

export function SendScreen() {
  const router = useRouter()
  const params = useGlobalSearchParams()
  const { balance, devices, user } = useAppStore()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [recipientTouched, setRecipientTouched] = useState(false)
  const [note, setNote] = useState('')
  const [step, setStep] = useState<'amount' | 'recipient' | 'review'>('amount')
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Recipient picked by tapping their card: who it is, shown on Review.
  const [recipientMode, setRecipientMode] = useState<'address' | 'nfc' | 'qr'>('address')
  const [recipientLabel, setRecipientLabel] = useState<string | null>(null)
  const [nfcState, setNfcState] = useState<'idle' | 'scanning' | 'resolving'>('idle')
  /** Raw failure from the last submit — drives the full "Payment failed" state. */
  const [sendFailed, setSendFailed] = useState<string | null>(null)

  const handleChangeValue = useCallback((val: string) => {
    setError(null)
    setAmount(val)
  }, [])

  // A scanned QR: a bare address, or a payment request (SEP-0007) that may
  // also carry the amount and a memo. A request with an amount goes straight
  // to Review; otherwise the user still confirms the recipient.
  useEffect(() => {
    const raw = params?.scannedAddress as string | undefined
    if (!raw) return
    router.setParams({ scannedAddress: undefined })
    const req = parsePaymentQr(raw)
    if (!req) {
      setError('That QR code isn’t a Stellar address or payment request.')
      setStep('recipient')
      return
    }
    setError(null)
    setRecipientLabel(null)
    setRecipient(req.destination)
    setRecipientTouched(true)
    if (req.memo) setNote(req.memo)
    if (req.amount) setAmount(req.amount)
    setStep(req.amount || parseFloat(amount) > 0 ? 'review' : 'amount')
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

  /**
   * Pay by tapping the recipient's card: read its UID, hash it the same way
   * linking does, and look up who owns it in device_registry. Your own card
   * resolves to its agent wallet (same as the "Your cards" list).
   */
  const handleTapRecipient = async () => {
    setError(null)
    setNfcState('scanning')
    try {
      const card = await readCardHash()
      if (!card) {
        setError('No card detected — hold the card flat against the back of the phone and try again.')
        return
      }
      setNfcState('resolving')
      if (!user?.stellarPublicKey) throw new Error('No wallet configured')
      const to = await resolveCardRecipient(card.hash, devices, user.stellarPublicKey)
      setRecipient(to.address)
      setRecipientLabel(to.label)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      setRecipientTouched(true)
      setStep('review')
    } catch (e: any) {
      setError(humanizeStellarError(e))
    } finally {
      setNfcState('idle')
    }
  }

  const handleSelectRecipient = (addr: string) => {
    setRecipientLabel(null)
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
    setShowConfirm(false)
    setSending(true)
    setError(null)
    try {
      const hash = await sendXlm({
        destination: trimmedRecipient,
        amountXlm: amountNum,
        memo: note,
        label: recipientLabel ? `Sent · ${recipientLabel}` : `Sent · ${trimmedRecipient.slice(0, 4)}…${trimmedRecipient.slice(-4)}`,
      })
      setShowConfirm(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      openReceipt(router, {
        title: 'Sent XLM',
        amountCents: Math.round(amountNum * 100),
        assetCode: 'XLM',
        direction: 'out',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        counterpartyLabel: 'To',
        counterparty: trimmedRecipient,
        hash,
        note: note.trim() ? `Memo: ${note.trim()}` : undefined,
      })
    } catch (e: any) {
      setError(humanizeStellarError(e))
      setSendFailed(e?.message ? String(e.message) : String(e))
    } finally {
      setSending(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 7 })
  const linked = devices.filter((d) => !!d.agentPublicKey)

  if (sendFailed) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="" onBackPress={() => router.back()} />
        <ErrorState
          icon="close-circle-outline"
          tone="danger"
          title="Payment failed"
          message={error ?? 'Stellar rejected the payment.'}
          details={sendFailed}
          primary={{ label: 'Edit payment', onPress: () => { setSendFailed(null); setError(null); setStep('review') } }}
          secondary={{ label: 'Done', onPress: () => router.back() }}
        >
          <View style={styles.failRows}>
            <KeyValueRow label="Amount" value={`${toStellarAmount(amountNum)} XLM`} />
            <KeyValueRow label="To" value={`${trimmedRecipient.slice(0, 6)}…${trimmedRecipient.slice(-6)}`} mono />
            <KeyValueRow label="Sent" value="Nothing — XLM still in your wallet" valueStyle={{ color: Colors.success }} last />
          </View>
        </ErrorState>
      </SafeAreaView>
    )
  }

  if (step === 'amount') {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Send" onBackPress={() => router.back()} />
        <View style={styles.amountArea}>
          <AssetChip />
          <AmountText value={amount} />
          <View style={styles.availRow}>
            <Text style={styles.avail}>Available {fmt(spendable)} XLM</Text>
            <PressableScale style={styles.maxPill} onPress={() => handleChangeValue(toStellarAmount(spendable))} disabled={spendable <= 0} accessibilityRole="button" accessibilityLabel="Send the maximum">
              <Text style={styles.maxText}>Max</Text>
            </PressableScale>
          </View>
          <Text style={styles.reserve}>{toStellarAmount(reserve)} XLM stays reserved by Stellar</Text>
          {error ? <ErrorMessage message={error} variant="inline" /> : insufficientFunds ? <Text style={styles.warn}>More than you can send</Text> : null}
        </View>
        <NumericKeypad value={amount} onChangeValue={handleChangeValue} allowDecimal />
        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} disabled={amountNum <= 0 || insufficientFunds} fullWidth />
        </View>
      </SafeAreaView>
    )
  }

  if (step === 'recipient') {
    return (
      <KeyboardAwareScreen scroll contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Send to" onBackPress={() => setStep('amount')} />
        <View style={styles.pad}>
          <Text style={styles.sending}>Sending <Text style={styles.sendingAmt}>{formatAmount(Math.round(amountNum * 100))} XLM</Text></Text>
          <Segmented
            value={recipientMode}
            onChange={(m) => { setError(null); setRecipientMode(m) }}
            options={[{ value: 'address', label: 'Address' }, { value: 'nfc', label: 'NFC tap' }, { value: 'qr', label: 'QR' }]}
            style={styles.segment}
          />
          {recipientMode === 'qr' ? (
            <>
              <View style={styles.nfcStage}>
                <Ionicons name="qr-code-outline" size={44} color={Colors.gold} />
                <Text style={styles.nfcPrompt}>Scan the recipient’s address or payment-request QR. If it asks for an amount, that amount is used. You’ll review before anything is sent.</Text>
              </View>
              {error ? <ErrorMessage message={error} variant="inline" /> : null}
            </>
          ) : recipientMode === 'nfc' ? (
            <>
              <View style={styles.nfcStage}>
                <TapGlyph size={44} color={Colors.gold} />
                <Text style={styles.nfcPrompt}>Hold the recipient’s Noir card to the back of your phone. You’ll review before anything is sent.</Text>
              </View>
              {error ? <ErrorMessage message={error} variant="inline" /> : null}
            </>
          ) : (
          <>
          <View style={[styles.field, recipientError && styles.fieldError]}>
            <Text style={styles.fieldLabel}>To</Text>
            <TextInput
              style={styles.addressInput}
              value={recipient}
              onChangeText={(text) => { setError(null); setRecipientLabel(null); setRecipient(text) }}
              onBlur={() => setRecipientTouched(true)}
              placeholder="Stellar address"
              placeholderTextColor={Colors.mutedWhite}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Recipient Stellar address"
            />
            <PressableScale onPress={() => router.push('/scan-qr')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Scan a QR code">
              <Ionicons name="scan-outline" size={22} color={Colors.gold} />
            </PressableScale>
          </View>
          {recipientError ? <ErrorMessage message={recipientError} variant="inline" /> : null}
          {error ? <ErrorMessage message={error} variant="inline" /> : null}

          {linked.length > 0 && (
            <>
              <SectionLabel title="Your cards" />
              {linked.map((d, i) => (
                <ListRow
                  key={d.id}
                  iconNode={<TapGlyph size={22} color={Colors.gold} />}
                  title={d.label}
                  subtitle={`${d.agentPublicKey?.slice(0, 8)}…${d.agentPublicKey?.slice(-6)}`}
                  subtitleMono
                  chevron
                  last={i === linked.length - 1}
                  onPress={() => d.agentPublicKey && handleSelectRecipient(d.agentPublicKey)}
                  accessibilityLabel={`Send to ${d.label}`}
                />
              ))}
            </>
          )}
          </>
          )}
        </View>
        <View style={styles.flexSpacer} />
        <View style={styles.footer}>
          {recipientMode === 'qr' ? (
            <Button label="Scan QR code" icon="scan-outline" onPress={() => router.push('/scan-qr')} fullWidth />
          ) : recipientMode === 'nfc' ? (
            <Button label="Tap card to pay" icon="wifi-outline" onPress={handleTapRecipient} fullWidth />
          ) : (
            <Button label="Review" onPress={handleReview} disabled={!recipientValid} fullWidth />
          )}
        </View>

        <ProcessingOverlay
          visible={nfcState !== 'idle'}
          variant={nfcState === 'scanning' ? 'nfc' : 'verify'}
          title={nfcState === 'scanning' ? 'Hold their card to your phone' : 'Finding the card’s owner'}
          subtitle={`Sending ${formatAmount(Math.round(amountNum * 100))} XLM`}
          steps={[
            { label: nfcState === 'scanning' ? 'Waiting for card' : 'Card detected', state: nfcState === 'scanning' ? 'active' : 'done' },
            { label: 'Looking up the owner on Stellar', state: nfcState === 'resolving' ? 'active' : 'pending' },
            { label: 'Review payment', state: 'pending' },
          ]}
          footnote="Nothing is sent until you confirm on the next screen."
        />
      </KeyboardAwareScreen>
    )
  }

  return (
    <KeyboardAwareScreen scroll contentContainerStyle={styles.scrollContent}>
      <ScreenHeader title="Review" onBackPress={() => setStep('recipient')} />
      <View style={styles.pad}>
        <View style={styles.reviewHero}>
          <Text style={styles.reviewLabel}>You’re sending</Text>
          <AmountText value={toStellarAmount(amountNum)} size={44} />
        </View>
        {recipientLabel ? <KeyValueRow label="To" value={recipientLabel} /> : null}
        <KeyValueRow label={recipientLabel ? 'Address' : 'To'} value={`${trimmedRecipient.slice(0, 6)}…${trimmedRecipient.slice(-6)}`} mono />
        <KeyValueRow label="Network fee" value={`${toStellarAmount(BASE_FEE_XLM)} XLM`} />
        <KeyValueRow label="Total" value={`${toStellarAmount(total)} XLM`} valueStyle={styles.total} last />
        <View style={[styles.noteField, !memoValid && styles.fieldError]}>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (public on-chain)"
            placeholderTextColor={Colors.mutedWhite}
            accessibilityLabel="Transaction note, sent as a public Stellar memo"
          />
          <Text style={[styles.noteCount, !memoValid && styles.noteCountError]}>{memoByteLength(note)}/{MEMO_TEXT_MAX_BYTES}</Text>
        </View>
        {error ? <ErrorMessage message={error} variant="card" onRetry={() => setError(null)} /> : null}
      </View>
      <View style={styles.flexSpacer} />
      <View style={styles.footer}>
        <Button label="Confirm & send" icon="finger-print-outline" onPress={() => setShowConfirm(true)} disabled={!memoValid || !recipientValid || amountNum <= 0} fullWidth />
      </View>

      <SignSheet
        visible={showConfirm}
        title={`Send ${toStellarAmount(amountNum)} XLM?`}
        message="Stellar payments are final."
        details={[
          ...(recipientLabel ? [{ label: 'To', value: recipientLabel }] : []),
          { label: recipientLabel ? 'Address' : 'To', value: `${trimmedRecipient.slice(0, 6)}…${trimmedRecipient.slice(-6)}`, mono: true },
          { label: 'Network fee', value: `${toStellarAmount(BASE_FEE_XLM)} XLM` },
          { label: 'Total', value: `${toStellarAmount(total)} XLM`, emphasis: true },
        ]}
        signLabel="Sign & send"
        onSign={handleSend}
        onClose={() => setShowConfirm(false)}
        loading={sending}
      />

      <ProcessingOverlay
        visible={sending}
        title={`Sending ${formatAmount(Math.round(amountNum * 100))} XLM`}
        subtitle={`to ${trimmedRecipient.slice(0, 5)}…${trimmedRecipient.slice(-5)}`}
        steps={[
          { label: 'Signed with your wallet', state: 'done' },
          { label: 'Submitting to Stellar', state: 'active' },
          { label: 'Receipt', state: 'pending' },
        ]}
      />
    </KeyboardAwareScreen>
  )
}

/** XLM asset chip shown above amounts (single-asset wallet for now). */
export function AssetChip() {
  return (
    <View style={styles.assetChip}>
      <View style={styles.assetIcon}><StellarMark size={14} color={Colors.gold} /></View>
      <Text style={styles.assetText}>XLM</Text>
    </View>
  )
}

/** Big centred amount + muted asset code (DESIGN.md → Money screens). */
export function AmountText({ value, size = 52, asset = 'XLM' }: { value: string; size?: number; asset?: string }) {
  return (
    <View style={styles.amountRow}>
      <Text style={[styles.amountBig, { fontSize: size }, !value && styles.amountEmpty]} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={FontScaleCap.display}>
        {value || '0'}
      </Text>
      <Text style={styles.amountAsset}>{asset}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  scrollContent: { flexGrow: 1, paddingBottom: Spacing.sm },
  pad: { paddingHorizontal: 20 },
  flexSpacer: { flex: 1 },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },

  amountArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8, maxWidth: '100%' },
  amountBig: { fontFamily: Fonts.display, color: Colors.white, letterSpacing: -0.5, fontVariant: ['tabular-nums'], flexShrink: 1 },
  amountEmpty: { color: Colors.mutedWhite },
  amountAsset: { fontFamily: Fonts.displayMd, fontSize: FontSize.lg - 2, color: Colors.mutedWhite },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avail: { fontSize: FontSize.sm, color: Colors.mutedWhite },
  maxPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.midGrey },
  maxText: { fontSize: FontSize.sm - 1, color: Colors.gold, fontWeight: FontWeight.medium },
  reserve: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  warn: { fontSize: FontSize.sm, color: Colors.warning },
  assetChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingLeft: 6, paddingRight: 12, borderRadius: 999, backgroundColor: Colors.midGrey },
  assetIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1d1a12', alignItems: 'center', justifyContent: 'center' },
  assetText: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },

  segment: { marginTop: Spacing.xs },
  nfcStage: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl, paddingHorizontal: Spacing.lg },
  nfcPrompt: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 20 },
  sending: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.sm },
  sendingAmt: { color: Colors.white },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 14, borderRadius: 14, backgroundColor: Colors.midGrey, marginTop: Spacing.sm },
  fieldError: { borderWidth: 1, borderColor: Colors.danger },
  fieldLabel: { fontSize: FontSize.md - 1, color: Colors.mutedWhite },
  addressInput: { flex: 1, fontSize: FontSize.md - 1, color: Colors.white, fontFamily: Fonts.mono, paddingVertical: Spacing.sm },

  reviewHero: { alignItems: 'center', gap: 6, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  reviewLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite },
  total: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.cream },
  noteField: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Colors.midGrey, marginTop: Spacing.md },
  noteInput: { flex: 1, fontSize: FontSize.md - 1, color: Colors.white, paddingVertical: Spacing.sm },
  noteCount: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  noteCountError: { color: Colors.danger },
  failRows: { alignSelf: 'stretch', marginTop: Spacing.sm },
})
