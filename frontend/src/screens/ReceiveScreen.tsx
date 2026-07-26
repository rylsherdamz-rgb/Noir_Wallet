import { useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Share, TextInput, Animated, Easing, Platform } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import QRCode from 'react-native-qrcode-svg'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import { sha256 } from '@noble/hashes/sha2.js'
import { Buffer } from 'buffer'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/store/useAppStore'
import { nfcService } from '@/services/nfc'
import { x402 } from '@/domain/x402'
import { stellarService } from '@/services/stellar-service'
import { AppConfig } from '@/constants/config'

type ReceiveMode = 'address' | 'nfc'

export function ReceiveScreen() {
  const router = useRouter()
  const { user, balance, devices, addTransaction, setBalance } = useAppStore()
  const [mode, setMode] = useState<ReceiveMode>('address')
  const [selectedAsset, setSelectedAsset] = useState<'XLM'>('XLM')
  const [amount, setAmount] = useState('')
  const [nfcState, setNfcState] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle')
  const [nfcError, setNfcError] = useState('')
  const [receivedAmount, setReceivedAmount] = useState('')
  const pulse = useState(new Animated.Value(1))[0]
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rotateAnim = useRef(new Animated.Value(0)).current
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  })

  const address = user?.stellarPublicKey || 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  const balanceAmount = balance.xlm

  const amountUnits = amount ? parseFloat(amount) : 0

  const copyAddress = async () => {
    await Clipboard.setStringAsync(address)
    setToast({ visible: true, type: 'success', title: 'Address Copied', message: 'Stellar address copied to clipboard' })
  }

  const shareAddress = async () => {
    await Share.share({ message: `Send ${selectedAsset} to my Noir Wallet: ${address}` })
  }

  const handleNfcReceive = useCallback(async () => {
    if (amountUnits <= 0) {
      setNfcState('error')
      setNfcError('Enter an amount above first')
      return
    }

    setNfcState('scanning')
    setNfcError('')
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.6, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    anim.start()

    try {
      const tag = await nfcService.readTag(10000)
      anim.stop()

      if (!tag?.uid) {
        setNfcState('error')
        setNfcError('No NFC tag detected — hold the card steady against the phone')
        return
      }

      if (__DEV__) console.log('[Receive NFC] tag detected:', tag.uid)
      setNfcState('processing')

      const hashBytes = sha256(new TextEncoder().encode(tag.uid))
      const scannedHash = Buffer.from(hashBytes).toString('hex')

      // Look up the device in our list — if it has an agent, we use it
      const linkedDevice = devices.find((d) => d.deviceUidHash === scannedHash)
      const hasAgent = await x402.hasAgent()
      const agentSecret = await x402.getAgentSecret()

      if (!hasAgent || !agentSecret || !linkedDevice?.agentPublicKey) {
        setNfcState('error')
        setNfcError('This card is not linked to your agent. Link it first in Settings → Devices.')
        return
      }

      // Pay directly from the agent wallet to your address
      const merchantAddr = user?.stellarPublicKey
      if (!merchantAddr) throw new Error('No wallet configured')

      const amountXLM = amountUnits.toFixed(7)
      if (__DEV__) console.log('[Receive NFC] paying', amountXLM, 'XLM from agent to', merchantAddr.slice(0, 8))
      const payResult = await x402.payWithAgent({
        destination: merchantAddr,
        amount: amountXLM,
      })
      if ('error' in payResult) throw new Error(payResult.error)
      const txHash = payResult.hash

      if (__DEV__) console.log('[Receive NFC] queued:', txHash)
      setNfcState('success')
      setReceivedAmount(amount)
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

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
          setBalance({ xlm: onChain.xlm })
        } catch { /* non-critical */ }
      }

      resetTimerRef.current = setTimeout(() => { setNfcState('idle') }, 5000)
    } catch (e: any) {
      anim.stop()
      console.error('[Receive NFC] error:', e?.message)
      setNfcState('error')
      setNfcError(e?.message ?? 'NFC receive failed')
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [amountUnits, devices, user, addTransaction, selectedAsset, pulse])

  const resetNfc = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
    setNfcState('idle')
    setNfcError('')
  }

  useEffect(() => {
    if (nfcState === 'scanning' || nfcState === 'processing') {
      const loop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      )
      loop.start()
      return () => loop.stop()
    }
  }, [nfcState])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle}>Receive</Text>
        <View style={styles.spacer24} />
      </View>

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <PressableScale
          style={[styles.modeChip, mode === 'address' && styles.modeChipActive]}
          onPress={() => { setMode('address'); resetNfc() }}
        >
          <Ionicons name="qr-code-outline" size={16} color={mode === 'address' ? Colors.black : Colors.mutedWhite} />
          <Text style={[styles.modeChipLabel, mode === 'address' && styles.modeChipLabelActive]}>Address</Text>
        </PressableScale>
        <PressableScale
          style={[styles.modeChip, mode === 'nfc' && styles.modeChipActive]}
           onPress={() => { setMode('nfc'); setSelectedAsset('XLM') }}
        >
          <Ionicons name="radio-outline" size={16} color={mode === 'nfc' ? Colors.black : Colors.mutedWhite} />
          <Text style={[styles.modeChipLabel, mode === 'nfc' && styles.modeChipLabelActive]}>NFC Tap</Text>
        </PressableScale>
      </View>

      <View style={styles.content}>
        {/* Address QR mode */}
        {mode === 'address' && (
          <>
              <View style={styles.qrWrap}>
              <View style={styles.qrBorder}>
                <QRCode
                  value={`${address}?asset=${selectedAsset}`}
                  size={200}
                  backgroundColor={Colors.white}
                  color={Colors.black}
                />
              </View>
            </View>

            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>Your Stellar Address</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {address.slice(0, 12)}...{address.slice(-8)}
                </Text>
                <PressableScale style={styles.copyBtn} onPress={copyAddress}>
                  <Ionicons name="copy-outline" size={18} color={Colors.gold} />
                </PressableScale>
                <PressableScale style={styles.shareBtn} onPress={shareAddress}>
                  <Ionicons name="share-outline" size={18} color={Colors.gold} />
                </PressableScale>
              </View>
            </View>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Your {selectedAsset} Balance</Text>
              <Text style={styles.balanceValue}>
                {balanceAmount.toLocaleString()} {selectedAsset}
              </Text>
            </View>
          </>
        )}

        {/* NFC Receive mode */}
        {mode === 'nfc' && (
          <>
            <View style={styles.nfcSection}>
              <Text style={styles.nfcPrompt}>Have a friend tap their NFC card to send you payment</Text>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Amount to receive</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount in XLM"
                placeholderTextColor={Colors.mutedWhite}
                keyboardType="numeric"
                maxLength={10}
              />
              {amount ? <Text style={styles.amountPreview}>{amount} XLM</Text> : null}
            </View>

            <View style={styles.nfcTapArea}>
              {nfcState === 'idle' && (
                <>
                  <PressableScale
                     style={[styles.nfcBtn, (amountUnits <= 0) && styles.nfcBtnDisabled]}
                    onPress={handleNfcReceive}
                    disabled={amountUnits <= 0}
                  >
                    <Ionicons name="radio" size={28} color={amountUnits > 0 ? Colors.black : Colors.mutedWhite} />
                    <Text style={[styles.nfcBtnText, (amountUnits <= 0) && { color: Colors.mutedWhite }]}>
                      Tap to Start NFC
                    </Text>
                  </PressableScale>
                  {amountUnits <= 0 && (
                    <Text style={styles.nfcBtnHelper}>Enter an amount above to enable NFC</Text>
                  )}
                </>
              )}

              {nfcState === 'scanning' && (
                <View style={styles.nfcScanWrap}>
                  <Animated.View style={[styles.nfcScanRing, { transform: [{ scale: pulse }] }]} />
                  <View style={styles.nfcScanCenter}>
                    <Ionicons name="radio" size={36} color={Colors.gold} />
                  </View>
                  <Text style={styles.nfcScanText}>Hold card to phone...</Text>
                </View>
              )}

              {nfcState === 'processing' && (
                <View style={styles.nfcProcessing}>
                  <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                    <Ionicons name="sync" size={32} color={Colors.gold} />
                  </Animated.View>
                  <Text style={styles.nfcProcessingText}>Authorizing payment...</Text>
                </View>
              )}

              {nfcState === 'success' && (
                <View style={styles.nfcSuccess}>
                  <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
                  <Text style={styles.nfcSuccessText}>{receivedAmount} XLM queued</Text>
                  <Text style={styles.nfcSuccessSub}>Payment submitted — you'll be notified when confirmed</Text>
                  <PressableScale style={styles.nfcResetBtn} onPress={resetNfc}>
                    <Text style={styles.nfcResetBtnText}>Receive Another</Text>
                  </PressableScale>
                </View>
              )}

              {nfcState === 'error' && (
                <View style={styles.nfcError}>
                  <Ionicons name="close-circle" size={48} color={Colors.danger} />
                  <Text style={styles.nfcErrorText}>{nfcError}</Text>
                  <PressableScale style={styles.nfcResetBtn} onPress={resetNfc}>
                    <Text style={styles.nfcResetBtnText}>Try Again</Text>
                  </PressableScale>
                  {nfcError.includes('not linked') && (
                    <PressableScale style={[styles.nfcResetBtn, { backgroundColor: Colors.gold, marginTop: Spacing.sm }]} onPress={() => router.push('/(tabs)/devices')}>
                      <Ionicons name="link-outline" size={18} color={Colors.black} />
                      <Text style={[styles.nfcResetBtnText, { color: Colors.black }]}>Link in Settings</Text>
                    </PressableScale>
                  )}
                </View>
              )}
            </View>

            {nfcState === 'idle' && (
              <View style={styles.nfcInfo}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.mutedWhite} />
                <Text style={styles.nfcInfoText}>
                  Agent wallet pays from its XLM balance
                </Text>
              </View>
            )}
          </>
        )}
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
  spacer24: { width: 24 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },

  // Mode toggle
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  modeChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  modeChipLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.semibold,
  },
  modeChipLabelActive: {
    color: Colors.black,
  },

  // Address QR mode
  assetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
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
  qrWrap: {
    marginBottom: Spacing.xl,
  },
  qrBorder: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },
  addressSection: {
    width: '100%',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    marginBottom: Spacing.md,
  },
  addressLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: 'monospace',
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    width: '100%',
    backgroundColor: Colors.gold + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold + '25',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
  },

  // NFC receive mode
  nfcSection: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  nfcPrompt: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    lineHeight: 20,
  },
  amountSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  amountLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountInput: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.heavy,
    color: Colors.white,
    textAlign: 'center',
    minWidth: 200,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  amountPreview: {
    fontSize: FontSize.xl,
    color: Colors.gold,
    marginTop: Spacing.sm,
    fontWeight: FontWeight.bold,
  },
  nfcTapArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: Spacing.md,
  },
  nfcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  nfcBtnDisabled: {
    backgroundColor: Colors.lightGrey,
  },
  nfcBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.black,
  },
  nfcScanWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  nfcScanRing: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 120,
    height: 120,
    marginLeft: -60,
    marginTop: -60,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  nfcScanCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcScanText: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    marginTop: Spacing.md,
    fontWeight: FontWeight.medium,
  },
  nfcProcessing: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  nfcProcessingText: {
    fontSize: FontSize.md,
    color: Colors.gold,
  },
  nfcSuccess: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nfcSuccessText: {
    fontSize: FontSize.lg,
    color: Colors.success,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  nfcSuccessSub: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  nfcError: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  nfcErrorText: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  nfcResetBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  nfcResetBtnText: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
  nfcInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  nfcInfoText: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    flex: 1,
  },
  nfcBtnHelper: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
})
