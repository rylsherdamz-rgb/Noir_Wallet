import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Keypair } from '@stellar/stellar-sdk/axios'
import { PressableScale } from '@/components/brand/PressableScale'
import { AmountEntry } from '@/components/flow/AmountEntry'
import { ProcessingOverlay, stepsAt, type ProcessingStep } from '@/components/flow/ProcessingOverlay'
import { useAppStore } from '@/store/useAppStore'
import { x402, InsufficientFundsError, DeviceNotLinkedError, DeviceOwnedByOtherWalletError } from '@/domain/x402'
import { stellarService } from '@/services/stellar-service'
import { spendableBalance } from '@/lib/stellarAccount'
import { keypadValueToNumber } from '@/lib/keypadInput'
import { formatAmount, shortAddress } from '@/lib/txFormat'
import { openReceipt } from '@/lib/receipt'
import { startLocalTx, settleLocalTx, dropLocalTx } from '@/lib/localTx'
import { describeContractError } from '@/domain/contractErrors'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { logger } from '@/lib/logger'
import { humanizeStellarError } from '@/lib/stellarErrors'
import { ScreenHeader } from '@/components/ScreenHeader'
import { KeyValueRow } from '@/components/ui/List'
import { Button } from '@/components/Button'
import { AmountText } from '@/screens/SendScreen'
import { ErrorState } from '@/components/ui/ErrorState'

type Mode = 'topup' | 'escrow'

interface AgentLookup {
  /** Agent index whose key is on this phone; null when it isn't. */
  index: number | null
  pub: string | null
}

/** Stellar needs 1 XLM (2 × 0.5 base reserve) to open a brand-new account. */
const MIN_CREATE_ACCOUNT_XLM = 1

const COPY: Record<Mode, { title: string; explainer: string; cta: string; receiptTitle: string; note: string }> = {
  // "Top up" — the one funding action in the UI. It funds the card's
  // agent wallet, which is what a tap pays from.
  topup: {
    title: 'Top up',
    explainer: 'Moves XLM from your main wallet onto this card. Taps on this card pay from this balance. Revoking the card returns what’s left to your main wallet.',
    cta: 'Review',
    receiptTitle: 'Card top-up',
    note: 'Balance for',
  },
  escrow: {
    title: 'Add to tap balance',
    explainer: 'Locks XLM in the payment escrow contract for this card. Taps are paid from it instantly, within the card’s spending policy. You can withdraw what’s left at any time.',
    cta: 'Review deposit',
    receiptTitle: 'Tap balance deposit',
    note: 'Prepaid tap balance for',
  },
}

export function AgentFundScreen() {
  const router = useRouter()
  const { id, mode: modeParam } = useLocalSearchParams<{ id: string; mode?: string }>()
  const mode: Mode = modeParam === 'escrow' ? 'escrow' : 'topup'
  const copy = COPY[mode]
  const { devices, user, balance } = useAppStore()
  const device = devices.find((d) => d.id === id) ?? null

  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'amount' | 'review'>('amount')
  // Seed from the cached dashboard balance so the screen is usable instantly; refreshed below.
  const [spendable, setSpendable] = useState<number | null>(
    balance.xlm > 0 ? spendableBalance(balance.xlm, balance.subentryCount ?? 0) : null,
  )
  const [balanceFailed, setBalanceFailed] = useState(false)
  const [agentPub, setAgentPub] = useState<string | null>(null)
  const [agentExists, setAgentExists] = useState(true)
  // Which agent wallet this card funds. topUpAgent() falls back to agent 1
  // when no index is passed, which on a phone with several cards would pay
  // the wrong agent — so submit always waits for this. It is kept as a
  // promise, not a gate on the button: SecureStore reads on Android are slow
  // and queue behind other screens, so Confirm stays tappable and the wait
  // shows up as the first step of the progress screen instead.
  const lookupRef = useRef<Promise<AgentLookup> | null>(null)
  const [lookupMissing, setLookupMissing] = useState(false)
  const [processing, setProcessing] = useState<ProcessingStep[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Main-wallet balance, refreshed in the background.
  useEffect(() => {
    let cancelled = false
    if (!user?.stellarPublicKey) return
    stellarService.getBalance(user.stellarPublicKey)
      .then((bal) => { if (!cancelled) setSpendable(spendableBalance(bal.xlm, bal.subentryCount ?? 0)) })
      .catch((e: any) => {
        logger.warn('fund: balance read failed', e?.message)
        if (!cancelled) setBalanceFailed(true)
      })
    return () => { cancelled = true }
  }, [user?.stellarPublicKey])

  const startLookup = (): Promise<AgentLookup> => {
    if (!device) return Promise.resolve({ index: null, pub: null })
    const p = (async (): Promise<AgentLookup> => {
      const index = await x402.resolveAgentIndex(device.deviceUidHash, device.agentPublicKey)
      // The key is on this phone, so derive the address locally instead of a network read.
      const secret = index != null ? await x402.getAgentSecret(index) : null
      return { index: secret ? index : null, pub: secret ? Keypair.fromSecret(secret).publicKey() : device.agentPublicKey ?? null }
    })()
    lookupRef.current = p
    p.then((r) => {
      if (lookupRef.current !== p) return
      setAgentPub(r.pub)
      setLookupMissing(mode === 'topup' && r.index == null)
      // Only matters for the 1 XLM first-deposit minimum; never blocks anything.
      if (mode === 'topup' && r.pub) stellarService.accountExists(r.pub).then(setAgentExists).catch(() => {})
    }).catch((e: any) => {
      logger.warn('fund: agent lookup failed', e?.message)
      // Forget the failure so the next Confirm retries it.
      if (lookupRef.current === p) lookupRef.current = null
    })
    return p
  }

  useEffect(() => {
    startLookup()
  }, [device?.id, mode])

  const value = keypadValueToNumber(amount)
  const validation = (() => {
    if (value <= 0) return null
    if (spendable != null && value > spendable) return `Only ${formatAmount(Math.floor(spendable * 100))} XLM available after the network reserve`
    if (mode === 'topup' && !agentExists && value < MIN_CREATE_ACCOUNT_XLM) {
      return `The first deposit to a card must be at least ${MIN_CREATE_ACCOUNT_XLM} XLM to open its wallet on Stellar`
    }
    return null
  })()

  const caption = spendable != null
    ? `Available ${formatAmount(Math.floor(spendable * 100))} XLM in your main wallet`
    : balanceFailed ? 'Couldn’t check your balance' : 'Checking your balance…'
  const cardLabel = device?.label ?? 'this card'

  const submit = async () => {
    if (!device || processing) return
    setError(null)
    const steps = (active: number) => stepsAt(
      ['Finding your card', 'Signing with your wallet', mode === 'topup' ? 'Sending to your card' : 'Depositing to escrow contract', 'Confirming on Stellar'],
      active,
    )
    // Progress screen first, immediately — everything slow happens under it.
    setProcessing(steps(0))
    // Shows in Activity (wallet and this card) as Pending straight away.
    const localId = startLocalTx({
      merchantName: `Top up · ${cardLabel}`,
      amountCents: Math.round(value * 100),
      direction: 'out',
      deviceId: device.deviceUidHash,
    })
    let reachedNetwork = false
    try {
      const { walletService } = await import('@/services/wallet')
      const keysP = walletService.loadKeys()
      const lookup = await (lookupRef.current ?? startLookup())
      if (mode === 'topup' && lookup.index == null) throw new Error('This card’s agent key isn’t on this phone, so it can’t be topped up from here.')
      setProcessing(steps(1))
      const keys = await keysP
      if (!keys?.stellarSecret) throw new Error('No wallet keys found on this device')
      setProcessing(steps(2))
      reachedNetwork = true

      let hash: string
      if (mode === 'topup') {
        hash = await x402.topUpAgent(value, keys.stellarSecret, lookup.index!)
      } else {
        hash = await x402.fundEscrow({ walletSecret: keys.stellarSecret, deviceHashHex: device.deviceUidHash, amountXlm: value })
      }
      setProcessing(steps(4))
      settleLocalTx(localId, { stellarTxHash: hash, status: 'confirmed' })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})

      openReceipt(router, {
        title: copy.receiptTitle,
        amountCents: Math.round(value * 100),
        assetCode: 'XLM',
        direction: 'out',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        counterpartyLabel: 'To',
        counterparty: mode === 'topup' ? lookup.pub ?? agentPub ?? undefined : undefined,
        hash,
        note: `${copy.note} ${cardLabel}`,
      })
    } catch (e: any) {
      // Failed before anything was sent → no activity entry; after → a failed one.
      if (reachedNetwork) settleLocalTx(localId, { status: 'failed', errorMessage: e?.message ?? 'Transaction failed' })
      else dropLocalTx(localId)
      setProcessing(null)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
      if (e instanceof InsufficientFundsError || e instanceof DeviceNotLinkedError || e instanceof DeviceOwnedByOtherWalletError) setError(e.message)
      // Escrow failures carry payment_escrow error codes; a top-up is a plain payment.
      else setError(mode === 'escrow' ? describeContractError('payment_escrow', e) : humanizeStellarError(e))
      setStep('amount')
    }
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={copy.title} onBackPress={() => router.back()} />
        <ErrorState icon="search-outline" tone="neutral" title="Card not found" message="This card is no longer linked to this phone." primary={{ label: 'Back', onPress: () => router.back() }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={step === 'review' ? 'Review' : copy.title} onBackPress={() => (step === 'review' ? setStep('amount') : router.back())} />

      {step === 'amount' ? (
        <>
          <AmountEntry
            value={amount}
            onChangeValue={(v) => { setError(null); setAmount(v) }}
            caption={caption}
            error={error ?? validation}
            quickAmounts={[10, 25, 50, 100]}
            ctaLabel="Review"
            onSubmit={() => setStep('review')}
            ctaDisabled={value <= 0 || !!validation}
          />
        </>
      ) : (
        <View style={styles.review}>
          <View style={styles.reviewHero}>
            <Text style={styles.reviewLabel}>You’re adding</Text>
            <AmountText value={formatAmount(Math.round(value * 100))} size={44} />
          </View>
          <KeyValueRow label="From" value="Main wallet" />
          <KeyValueRow label="To" value={mode === 'topup' ? cardLabel : `${cardLabel} tap balance`} />
          <KeyValueRow label="Network fee" value="~0.00001 XLM" last />
          <Text style={styles.explainer}>{copy.explainer}</Text>
          <View style={styles.flex} />
          {lookupMissing ? (
            <Text style={styles.lookupError} accessibilityLiveRegion="polite">
              This card’s agent key isn’t on this phone, so it can’t be topped up from here.
            </Text>
          ) : null}
          <Button
            label="Confirm"
            icon="finger-print-outline"
            onPress={submit}
            disabled={lookupMissing}
            fullWidth
          />
        </View>
      )}

      <ProcessingOverlay
        visible={!!processing}
        title={mode === 'topup' ? 'Topping up' : 'Adding to tap balance'}
        subtitle={`${formatAmount(Math.round(value * 100))} XLM for ${cardLabel}`}
        steps={processing ?? undefined}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  flex: { flex: 1 },
  missing: { color: Colors.mutedWhite, textAlign: 'center', marginTop: Spacing.xxl },
  review: { flex: 1, paddingHorizontal: 20, paddingBottom: Spacing.lg },
  reviewHero: { alignItems: 'center', gap: 6, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  reviewLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite },
  lookupError: { fontSize: FontSize.sm, color: Colors.danger, textAlign: 'center', paddingBottom: Spacing.md },
  explainer: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, lineHeight: 19, paddingTop: Spacing.md },
})
