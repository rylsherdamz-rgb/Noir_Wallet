import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Keypair } from '@stellar/stellar-sdk/axios'
import { PressableScale } from '@/components/brand/PressableScale'
import { AmountEntry } from '@/components/flow/AmountEntry'
import { ProcessingOverlay, type ProcessingStep } from '@/components/flow/ProcessingOverlay'
import { useAppStore } from '@/store/useAppStore'
import { x402, InsufficientFundsError, DeviceNotLinkedError, DeviceOwnedByOtherWalletError } from '@/domain/x402'
import { stellarService } from '@/services/stellar-service'
import { spendableBalance } from '@/lib/stellarAccount'
import { keypadValueToNumber } from '@/lib/keypadInput'
import { formatAmount, shortAddress } from '@/lib/txFormat'
import { openReceipt } from '@/lib/receipt'
import { describeContractError } from '@/domain/contractErrors'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { logger } from '@/lib/logger'
import { ScreenHeader } from '@/components/ScreenHeader'
import { KeyValueRow } from '@/components/ui/List'
import { Button } from '@/components/Button'
import { AmountText } from '@/screens/SendScreen'
import { ErrorState } from '@/components/ui/ErrorState'

type Mode = 'topup' | 'escrow'

/** Stellar needs 1 XLM (2 × 0.5 base reserve) to open a brand-new account. */
const MIN_CREATE_ACCOUNT_XLM = 1

const COPY: Record<Mode, { title: string; explainer: string; cta: string; receiptTitle: string; note: string }> = {
  topup: {
    title: 'Top up agent wallet',
    explainer: 'Moves XLM from your main wallet into this card’s agent wallet. The agent pays from this balance when the card is tapped.',
    cta: 'Review top-up',
    receiptTitle: 'Agent wallet top-up',
    note: 'Agent wallet balance for',
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
  const [agentIndex, setAgentIndex] = useState<number | null>(null)
  const [agentExists, setAgentExists] = useState(true)
  // Which agent wallet this card tops up. Confirm waits on it: topUpAgent()
  // falls back to agent 1 when no index is passed, which on a phone with
  // several cards would pay the wrong agent.
  const [agentLookup, setAgentLookup] = useState<'loading' | 'ready' | 'missing' | 'failed'>('loading')
  const [lookupAttempt, setLookupAttempt] = useState(0)
  const [processing, setProcessing] = useState<ProcessingStep[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!device || !user?.stellarPublicKey) return
      // Balance and agent lookup run in parallel — neither should hold up the other.
      stellarService.getBalance(user.stellarPublicKey)
        .then((bal) => { if (!cancelled) setSpendable(spendableBalance(bal.xlm, bal.subentryCount ?? 0)) })
        .catch((e: any) => {
          logger.warn('fund: balance read failed', e?.message)
          if (!cancelled) setBalanceFailed(true)
        })
      setAgentLookup('loading')
      try {
        let idx = await x402.getAgentIndexForDevice(device.deviceUidHash)
        if (idx == null) {
          const all = await x402.listAgents()
          idx = all.find((a) => a.publicKey === device.agentPublicKey)?.index ?? null
        }
        // The key is on this phone, so derive the address locally instead of a network read.
        const secret = idx != null ? await x402.getAgentSecret(idx) : null
        const pub = secret ? Keypair.fromSecret(secret).publicKey() : device.agentPublicKey ?? null
        if (cancelled) return
        setAgentIndex(idx)
        setAgentPub(pub)
        // Escrow deposits are keyed by the card, not the agent key.
        setAgentLookup(mode === 'escrow' || secret ? 'ready' : 'missing')
        if (mode === 'topup' && pub) {
          try { setAgentExists(await stellarService.accountExists(pub)) } catch { /* assume exists */ }
        }
      } catch (e: any) {
        logger.warn('fund: agent lookup failed', e?.message)
        if (!cancelled) setAgentLookup('failed')
      }
    })()
    return () => { cancelled = true }
  }, [device?.id, user?.stellarPublicKey, mode, lookupAttempt])

  const value = keypadValueToNumber(amount)
  const validation = (() => {
    if (value <= 0) return null
    if (spendable != null && value > spendable) return `Only ${formatAmount(Math.floor(spendable * 100))} XLM available after the network reserve`
    if (mode === 'topup' && !agentExists && value < MIN_CREATE_ACCOUNT_XLM) {
      return `The first top-up must be at least ${MIN_CREATE_ACCOUNT_XLM} XLM to open the agent wallet on Stellar`
    }
    return null
  })()

  const caption = spendable != null
    ? `Available ${formatAmount(Math.floor(spendable * 100))} XLM in your main wallet`
    : balanceFailed ? 'Couldn’t check your balance' : 'Checking your balance…'
  const cardLabel = device?.label ?? 'this card'

  const submit = async () => {
    if (!device || agentLookup !== 'ready') return
    setError(null)
    const steps = (active: number): ProcessingStep[] =>
      ['Signing with your wallet', mode === 'topup' ? 'Sending to agent wallet' : 'Depositing to escrow contract', 'Confirming on Stellar']
        .map((label, i) => ({ label, state: i < active ? 'done' : i === active ? 'active' : 'pending' }))
    setProcessing(steps(0))
    try {
      const { walletService } = await import('@/services/wallet')
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret) throw new Error('No wallet keys found on this device')
      setProcessing(steps(1))

      let hash: string
      if (mode === 'topup') {
        if (agentIndex == null) throw new Error('This card’s agent wallet isn’t on this phone')
        hash = await x402.topUpAgent(value, keys.stellarSecret, agentIndex)
      } else {
        hash = await x402.fundEscrow({ walletSecret: keys.stellarSecret, deviceHashHex: device.deviceUidHash, amountXlm: value })
      }
      setProcessing(steps(3))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})

      openReceipt(router, {
        title: copy.receiptTitle,
        amountCents: Math.round(value * 100),
        assetCode: 'XLM',
        direction: 'out',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        counterpartyLabel: 'To',
        counterparty: mode === 'topup' ? agentPub ?? undefined : undefined,
        hash,
        note: `${copy.note} ${cardLabel}`,
      })
    } catch (e: any) {
      setProcessing(null)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
      if (e instanceof InsufficientFundsError || e instanceof DeviceNotLinkedError || e instanceof DeviceOwnedByOtherWalletError) setError(e.message)
      // Escrow failures carry payment_escrow error codes; a top-up is a plain payment.
      else setError(mode === 'escrow' ? describeContractError('payment_escrow', e) : e?.message ?? 'Transaction failed')
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
      <ScreenHeader title={step === 'review' ? 'Review' : mode === 'topup' ? 'Top up' : 'Add tap balance'} onBackPress={() => (step === 'review' ? setStep('amount') : router.back())} />

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
            <Text style={styles.reviewLabel}>{mode === 'topup' ? 'You’re topping up' : 'You’re adding'}</Text>
            <AmountText value={formatAmount(Math.round(value * 100))} size={44} />
          </View>
          <KeyValueRow label="From" value="Main wallet" />
          <KeyValueRow label="To" value={mode === 'topup' ? `${cardLabel} agent` : `${cardLabel} tap balance`} />
          <KeyValueRow label="Network fee" value="~0.00001 XLM" last />
          <Text style={styles.explainer}>{copy.explainer}</Text>
          <View style={styles.flex} />
          {agentLookup === 'missing' || agentLookup === 'failed' ? (
            <Text style={styles.lookupError} accessibilityLiveRegion="polite">
              {agentLookup === 'missing'
                ? 'This card’s agent wallet key isn’t on this phone, so it can’t be topped up from here.'
                : 'Couldn’t load this card’s agent wallet. Check your connection and try again.'}
            </Text>
          ) : null}
          {agentLookup === 'failed' ? (
            <Button label="Try again" icon="refresh" variant="secondary" onPress={() => setLookupAttempt((n) => n + 1)} fullWidth />
          ) : (
            <Button
              label="Confirm"
              icon="finger-print-outline"
              onPress={submit}
              loading={agentLookup === 'loading'}
              disabled={!!processing || agentLookup !== 'ready'}
              fullWidth
            />
          )}
        </View>
      )}

      <ProcessingOverlay
        visible={!!processing}
        title={mode === 'topup' ? 'Topping up agent wallet' : 'Adding to tap balance'}
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
