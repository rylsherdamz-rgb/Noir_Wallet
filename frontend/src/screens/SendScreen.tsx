import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useGlobalSearchParams } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Button } from '@/components/Button'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ErrorMessage } from '@/components/ErrorMessage'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Avatar } from '@/components/Avatar'
import { SmartTip } from '@/components/SmartTip'
import { useAppStore } from '@/store/useAppStore'
import { walletService } from '@/services/wallet'
import { stellarService } from '@/services/stellar'
import { AssetCode } from '@/types'

export function SendScreen() {
  const router = useRouter()
  const params = useGlobalSearchParams()
  const { balance, devices } = useAppStore()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState((params?.scannedAddress as string) || '')
  const [asset, setAsset] = useState<AssetCode>('USDC')
  const [note, setNote] = useState('')
  const [step, setStep] = useState<'amount' | 'recipient' | 'review'>('amount')
  const [showRecipients, setShowRecipients] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChangeValue = useCallback((val: string) => {
    setError(null)
    setAmount(val)
  }, [])

  const amountNum = parseFloat(amount) || 0
  const maxBalance = asset === 'USDC' ? balance.usdc : asset === 'XLM' ? balance.xlm : balance.php
  const insufficientFunds = amountNum > maxBalance

  const handleContinue = () => {
    if (amountNum <= 0) {
      setError('Enter an amount greater than 0')
      return
    }
    if (insufficientFunds) {
      setError(`Insufficient ${asset} balance`)
      return
    }
    setStep('recipient')
  }

  const handleSelectRecipient = (addr: string) => {
    setRecipient(addr)
    setShowRecipients(false)
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
        destination: recipient,
        amount: amount,
        assetCode: asset === 'PHP' ? 'USDC' : asset,
      })
      if ('error' in result) {
        throw new Error(result.error)
      }
      setShowConfirm(false)
      router.back()
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    } finally {
      setSending(false)
    }
  }

  if (step === 'amount') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.amountSection}>
          <View style={styles.assetRow}>
            {(['USDC', 'XLM', 'PHP'] as AssetCode[]).map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.assetChip, asset === a && styles.assetChipActive]}
                onPress={() => setAsset(a)}
              >
                <Text style={[styles.assetChipLabel, asset === a && styles.assetChipLabelActive]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.amountDisplay}>
            {amount || '0'}
            <Text style={styles.amountCursor}>|</Text>
          </Text>
          <Text style={styles.balanceLabel}>
            Balance: {maxBalance.toLocaleString()} {asset}
          </Text>
          {error && <ErrorMessage message={error} variant="inline" />}
        </View>

        <View style={styles.keypadSection}>
          <NumericKeypad value={amount} onChangeValue={handleChangeValue} />
          <View style={styles.amountActions}>
            <Button variant="ghost" label="Cancel" onPress={() => router.back()} />
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('amount')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send to</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.addressInput}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Enter Stellar address or scan NFC"
              placeholderTextColor={Colors.mutedWhite}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scan-qr')}>
              <Ionicons name="qr-code-outline" size={20} color={Colors.gold} />
            </TouchableOpacity>
          </View>

          <SmartTip
            title="Tip: NFC Scan"
            description="Tap the QR icon to scan a recipient's address from their NFC tag or QR code."
            variant="tip"
          />

          <Text style={styles.sectionLabel}>Saved Devices</Text>
          {devices.length === 0 ? (
            <Text style={styles.noDevices}>No linked devices. Link one in the Devices tab.</Text>
          ) : (
            devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={styles.recipientRow}
                onPress={() => handleSelectRecipient(device.deviceUidHash)}
                activeOpacity={0.7}
              >
                <Avatar name={device.label} size={44} variant="merchant" />
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{device.label}</Text>
                  <Text style={styles.recipientAddress}>{device.deviceUidHash.slice(0, 12)}...</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View style={styles.bottomActions}>
          <Button
            label="Review Send"
            onPress={() => setStep('review')}
            disabled={!recipient.trim()}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('recipient')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Send</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.reviewCard}>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Amount</Text>
            <Text style={styles.reviewValue}>
              {amount} {asset}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>To</Text>
            <Text style={styles.reviewValueMono}>{recipient}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Fee</Text>
            <Text style={styles.reviewValue}>~0.00001 XLM</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Total</Text>
            <Text style={styles.reviewValueGold}>
              {amount} {asset} + fee
            </Text>
          </View>
        </View>

        <View style={styles.noteSection}>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={Colors.mutedWhite}
          />
        </View>

        {error && <ErrorMessage message={error} variant="card" onRetry={() => setError(null)} />}
      </ScrollView>

      <View style={styles.bottomActions}>
          <Button label="Confirm Send" onPress={() => setShowConfirm(true)} />
      </View>

      <ConfirmDialog
        visible={showConfirm}
        title="Confirm Send"
        message={`Send ${amount} ${asset} to ${recipient}? This cannot be undone.`}
        confirmLabel={sending ? 'Sending...' : 'Send'}
        icon="send-outline"
        onConfirm={handleSend}
        onCancel={() => setShowConfirm(false)}
        loading={sending}
      />
    </SafeAreaView>
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
  amountCursor: {
    color: Colors.gold,
  },
  balanceLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginTop: Spacing.sm,
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
  noDevices: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.lg },
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
  bottomActions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
})
