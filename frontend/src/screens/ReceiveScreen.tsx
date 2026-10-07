import { colorWithOpacity } from '@/constants/designTokens'
import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, Share, Platform } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import QRCode from 'react-native-qrcode-svg'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import { sha256 } from '@noble/hashes/sha2.js'
import { Buffer } from 'buffer'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts, Gradient } from '@/constants/theme'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/store/useAppStore'
import { nfcService } from '@/services/nfc'
import { x402 } from '@/domain/x402'
import { stellarService } from '@/services/stellar-service'
import { AppConfig } from '@/constants/config'
import { logger } from '@/lib/logger'
import { AmountEntry } from '@/components/flow/AmountEntry'
import { ProcessingOverlay } from '@/components/flow/ProcessingOverlay'
import { keypadValueToNumber } from '@/lib/keypadInput'
import { openReceipt } from '@/lib/receipt'
import { formatAmount } from '@/lib/txFormat'
import { ScreenHeader } from '@/components/ScreenHeader'
import { TextAction } from '@/components/ui/List'
import { Button } from '@/components/Button'

type ReceiveMode = 'address' | 'nfc'

export function ReceiveScreen() {
  const router = useRouter()
  const { user, balance, devices, addTransaction, setBalance } = useAppStore()
  const [mode, setMode] = useState<ReceiveMode>('address')
  const [selectedAsset, setSelectedAsset] = useState<'XLM'>('XLM')
  const [amount, setAmount] = useState('')
  const [nfcState, setNfcState] = useState<'idle' | 'scanning' | 'processing'>('idle')
  const [nfcError, setNfcError] = useState('')
  const [notLinked, setNotLinked] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  })

  const address = user?.stellarPublicKey || 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  const balanceAmount = balance.xlm

  const amountUnits = keypadValueToNumber(amount)

  const copyAddress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await Clipboard.setStringAsync(address)
    setToast({ visible: true, type: 'success', title: 'Address Copied', message: 'Stellar address copied to clipboard' })
  }

  const shareAddress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await Share.share({ message: `Send ${selectedAsset} to my Noir Wallet: ${address}` })
  }

  const handleNfcReceive = useCallback(async () => {
    if (amountUnits <= 0) return
    const fail = (msg: string, linkHint = false) => {
      setNfcState('idle')
      setNfcError(msg)
      setNotLinked(linkHint)
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    setNfcState('scanning')
    setNfcError('')
    setNotLinked(false)
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      const tag = await nfcService.readTag(10000)

      if (!tag?.uid) {
        fail('No card detected — hold the card flat against the back of the phone and try again.')
        return
      }

      if (__DEV__) logger.debug('[Receive NFC] tag detected:', tag.uid)
      setNfcState('processing')

      const hashBytes = sha256(new TextEncoder().encode(tag.uid))
      const scannedHash = Buffer.from(hashBytes).toString('hex')

      // Look up the device in our list — if it has an agent, we use it
      const linkedDevice = devices.find((d) => d.deviceUidHash === scannedHash)
      const hasAgent = await x402.hasAgent()
      const agentIndex = await x402.getAgentIndexForDevice(scannedHash)
      const agentSecret = await x402.getAgentSecret(agentIndex ?? undefined)

      if (!hasAgent || !agentSecret || !linkedDevice?.agentPublicKey) {
        fail('This card isn’t linked to an agent on this phone yet.', true)
        return
      }

      // Pay directly from the agent wallet to your address
      const merchantAddr = user?.stellarPublicKey
      if (!merchantAddr) throw new Error('No wallet configured')

      const amountXLM = amountUnits.toFixed(7)
      if (__DEV__) logger.debug('[Receive NFC] paying', amountXLM, 'XLM from agent to', merchantAddr.slice(0, 8))
      const payResult = await x402.payWithAgent({
        agentIndex: agentIndex ?? undefined,
        destination: merchantAddr,
        amount: amountXLM,
      })
      if ('error' in payResult) throw new Error(payResult.error)
      const txHash = payResult.hash

      if (__DEV__) logger.debug('[Receive NFC] queued:', txHash)

      const txId = Math.random().toString(36).slice(2)
      const { addPendingTxHash } = useAppStore.getState()
      addTransaction({
        id: txId,
        stellarTxHash: txHash,
        merchantId: 'me',
        merchantName: 'NFC Receive',
        userId: user?.id || 'local',
        deviceId: scannedHash,
        amountCents: Math.round(amountUnits * 100),
        assetCode: 'XLM',
        status: 'pending',
        errorMessage: null,
        createdAt: new Date().toISOString(),
      })
      addPendingTxHash(txHash)

      // Refresh on-chain wallet balance so the Dashboard shows latest
      if (user?.stellarPublicKey) {
        try {
          const onChain = await stellarService.getBalance(user.stellarPublicKey)
          setBalance({ xlm: onChain.xlm, subentryCount: onChain.subentryCount })
        } catch { /* non-critical */ }
      }

      setNfcState('idle')
      setAmount('')
      openReceipt(router, {
        title: 'NFC payment received',
        amountCents: Math.round(amountUnits * 100),
        assetCode: 'XLM',
        direction: 'in',
        // Submitted, not yet final — the receipt says so honestly.
        status: 'pending',
        createdAt: new Date().toISOString(),
        counterpartyLabel: 'From',
        counterparty: linkedDevice.agentPublicKey,
        hash: txHash,
        note: `Paid by ${linkedDevice.label}`,
      }, 'push')
    } catch (e: any) {
      logger.error('[Receive NFC] error:', e?.message)
      fail(e?.message ?? 'NFC receive failed')
    }
  }, [amountUnits, devices, user, addTransaction, router])

  const resetNfc = () => {
    setNfcState('idle')
    setNfcError('')
    setNotLinked(false)
  }

  const network = useAppStore.getState().network
  const name = user?.displayName?.trim() || 'My wallet'

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Receive" onBackPress={() => router.back()} />
      <View style={styles.segment} accessibilityRole="tablist">
        {(['address', 'nfc'] as ReceiveMode[]).map((m) => (
          <PressableScale
            key={m}
            style={[styles.segItem, mode === m && styles.segItemOn]}
            onPress={() => { if (m === 'address') { setMode('address'); resetNfc() } else { setMode('nfc'); setSelectedAsset('XLM') } }}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === m }}
          >
            <Text style={[styles.segText, mode === m && styles.segTextOn]}>{m === 'address' ? 'Address' : 'NFC tap'}</Text>
          </PressableScale>
        ))}
      </View>

      {mode === 'address' && (
        <>
          <ScrollView contentContainerStyle={styles.addressArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.walletName}>{name}</Text>
            <View style={styles.qrCard}>
              <QRCode value={`${address}?asset=${selectedAsset}`} size={196} backgroundColor={Colors.white} color={Colors.black} />
            </View>
            <Text style={styles.fullAddress} selectable>{address}</Text>
            <View style={styles.netNote}>
              <Ionicons name="information-circle-outline" size={16} color={network === 'mainnet' ? Colors.mainnet : Colors.testnet} />
              <Text style={styles.netNoteText}>Only send Stellar assets on {network === 'mainnet' ? 'Mainnet' : 'Testnet'}</Text>
            </View>
            <Text style={styles.balanceLine}>Balance {balanceAmount.toLocaleString()} XLM</Text>
          </ScrollView>
          <View style={styles.footerRow}>
            <View style={styles.flex1}><Button label="Copy" icon="copy-outline" onPress={copyAddress} fullWidth /></View>
            <View style={styles.flex1}><Button label="Share" icon="share-outline" variant="secondary" onPress={shareAddress} fullWidth /></View>
          </View>
        </>
      )}

      {mode === 'nfc' && (
        <>
          <Text style={styles.nfcPrompt}>Enter the amount, then have the payer tap their card on your phone.</Text>
          <AmountEntry
            value={amount}
            onChangeValue={(v) => { setNfcError(''); setNotLinked(false); setAmount(v) }}
            caption="Paid from the card’s agent wallet"
            error={nfcError || null}
            quickAmounts={[5, 10, 25, 50]}
            ctaLabel="Tap card to receive"
            onSubmit={handleNfcReceive}
            ctaDisabled={amountUnits <= 0 || nfcState !== 'idle'}
          />
          {notLinked && (
            <TextAction label="Link this card" icon="link-outline" onPress={() => router.push('/link-device')} />
          )}
        </>
      )}

      <ProcessingOverlay
        visible={nfcState !== 'idle'}
        variant={nfcState === 'scanning' ? 'nfc' : 'verify'}
        title={nfcState === 'scanning' ? 'Hold the card to your phone' : 'Authorizing payment'}
        subtitle={`Receiving ${formatAmount(Math.round(amountUnits * 100))} XLM`}
        steps={[
          { label: nfcState === 'scanning' ? 'Waiting for card' : 'Card detected', state: nfcState === 'scanning' ? 'active' : 'done' },
          { label: 'Agent signs the payment', state: nfcState === 'processing' ? 'active' : 'pending' },
          { label: 'Submitted to Stellar', state: 'pending' },
        ]}
      />

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
  flex1: { flex: 1 },
  segment: { flexDirection: 'row', padding: 3, marginHorizontal: 20, borderRadius: 999, backgroundColor: Colors.midGrey },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  segItemOn: { backgroundColor: Gradient.elevated },
  segText: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontWeight: FontWeight.medium },
  segTextOn: { color: Colors.white },
  addressArea: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 20, paddingVertical: Spacing.lg },
  walletName: { fontFamily: Fonts.display, fontSize: FontSize.md + 1, color: Colors.cream },
  qrCard: { padding: Spacing.md, backgroundColor: Colors.white, borderRadius: 20 },
  fullAddress: { fontFamily: Fonts.mono, fontSize: FontSize.sm - 1, lineHeight: 20, color: Colors.silver, textAlign: 'center', maxWidth: 280 },
  netNote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.midGrey },
  netNoteText: { fontSize: FontSize.sm - 1, color: Colors.silver },
  balanceLine: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  footerRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  nfcPrompt: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
})
