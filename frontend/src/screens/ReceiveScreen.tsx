import { useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, Share, TextInput, Animated, Easing, Platform } from 'react-native'
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
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </PressableScale>
        <Text className="text-xl font-bold text-white">Receive</Text>
        <View className="w-6" />
      </View>

      {/* Mode toggle */}
      <View className="flex-row justify-center gap-2 px-4 mb-6">
        <PressableScale
          className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-[#2C2C2C] border border-borderGrey ${mode === 'address' ? 'bg-gold border-gold' : ''}`}
          onPress={() => { setMode('address'); resetNfc() }}
        >
          <Ionicons name="qr-code-outline" size={16} color={mode === 'address' ? Colors.black : Colors.mutedWhite} />
          <Text className={`text-sm font-semibold ${mode === 'address' ? 'text-black' : 'text-mutedWhite'}`}>Address</Text>
        </PressableScale>
        <PressableScale
          className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-[#2C2C2C] border border-borderGrey ${mode === 'nfc' ? 'bg-gold border-gold' : ''}`}
           onPress={() => { setMode('nfc'); setSelectedAsset('XLM') }}
        >
          <Ionicons name="radio-outline" size={16} color={mode === 'nfc' ? Colors.black : Colors.mutedWhite} />
          <Text className={`text-sm font-semibold ${mode === 'nfc' ? 'text-black' : 'text-mutedWhite'}`}>NFC Tap</Text>
        </PressableScale>
      </View>

      <View className="flex-1 items-center px-4">
        {/* Address QR mode */}
        {mode === 'address' && (
          <>
              <View className="mb-8">
              <View className="p-4 bg-white rounded-2xl">
                <QRCode
                  value={`${address}?asset=${selectedAsset}`}
                  size={200}
                  backgroundColor={Colors.white}
                  color={Colors.black}
                />
              </View>
            </View>

            <View className="w-full bg-cardBg rounded-xl p-4 border border-borderGrey mb-4">
              <Text className="text-xs text-mutedWhite mb-2 uppercase tracking-[0.5px]">Your Stellar Address</Text>
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-sm text-white font-mono" numberOfLines={1}>
                  {address.slice(0, 12)}...{address.slice(-8)}
                </Text>
                <PressableScale className="w-9 h-9 rounded-full bg-[#C6A15B15] items-center justify-center" onPress={copyAddress}>
                  <Ionicons name="copy-outline" size={18} color={Colors.gold} />
                </PressableScale>
                <PressableScale className="w-9 h-9 rounded-full bg-[#C6A15B15] items-center justify-center" onPress={shareAddress}>
                  <Ionicons name="share-outline" size={18} color={Colors.gold} />
                </PressableScale>
              </View>
            </View>

            <View className="w-full bg-[#C6A15B10] rounded-xl p-4 border border-[#C6A15B25] items-center">
              <Text className="text-xs text-gold mb-1">Your {selectedAsset} Balance</Text>
              <Text className="text-2xl font-bold text-gold">
                {balanceAmount.toLocaleString()} {selectedAsset}
              </Text>
            </View>
          </>
        )}

        {/* NFC Receive mode */}
        {mode === 'nfc' && (
          <>
            <View className="w-full mb-6">
              <Text className="text-sm text-mutedWhite text-center leading-5">Have a friend tap their NFC card to send you payment</Text>
            </View>

            <View className="w-full items-center mb-8">
              <Text className="text-sm text-mutedWhite mb-2 uppercase tracking-[0.5px]">Amount to receive</Text>
              <TextInput
                className="text-2xl font-extrabold text-white text-center min-w-[200] py-2 border-b border-borderGrey"
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount in XLM"
                placeholderTextColor={Colors.mutedWhite}
                keyboardType="numeric"
                maxLength={10}
              />
              {amount ? <Text className="text-2xl text-gold mt-2 font-bold">{amount} XLM</Text> : null}
            </View>

            <View className="w-full items-center justify-center min-h-[200] mb-4">
              {nfcState === 'idle' && (
                <>
                  <PressableScale
                     className={`flex-row items-center gap-2 bg-gold py-6 px-8 rounded-full ${(amountUnits <= 0) ? 'bg-[#2C2C2C]' : ''}`}
                    onPress={handleNfcReceive}
                    disabled={amountUnits <= 0}
                  >
                    <Ionicons name="radio" size={28} color={amountUnits > 0 ? Colors.black : Colors.mutedWhite} />
                    <Text className={`text-xl font-bold ${(amountUnits <= 0) ? 'text-mutedWhite' : 'text-black'}`}>
                      Tap to Start NFC
                    </Text>
                  </PressableScale>
                  {amountUnits <= 0 && (
                    <Text className="text-xs text-mutedWhite mt-2 text-center">Enter an amount above to enable NFC</Text>
                  )}
                </>
              )}

              {nfcState === 'scanning' && (
                <View className="items-center justify-center w-[160] h-[160]">
                  <Animated.View className="absolute w-[120] h-[120] rounded-full border-2 border-gold" style={{ left: '50%', top: '50%', marginLeft: -60, marginTop: -60, transform: [{ scale: pulse }] }} />
                  <View className="w-[70] h-[70] rounded-full bg-[#C6A15B15] items-center justify-center">
                    <Ionicons name="radio" size={36} color={Colors.gold} />
                  </View>
                  <Text className="text-sm text-gold mt-4 font-medium">Hold card to phone...</Text>
                </View>
              )}

              {nfcState === 'processing' && (
                <View className="items-center gap-4">
                  <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                    <Ionicons name="sync" size={32} color={Colors.gold} />
                  </Animated.View>
                  <Text className="text-base text-gold">Authorizing payment...</Text>
                </View>
              )}

              {nfcState === 'success' && (
                <View className="items-center gap-2">
                  <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
                  <Text className="text-xl text-[#3ED598] font-bold text-center">{receivedAmount} XLM queued</Text>
                  <Text className="text-xs text-mutedWhite text-center mt-1 px-6">Payment submitted — you'll be notified when confirmed</Text>
                  <PressableScale className="mt-4 px-6 py-2 rounded-full border border-gold" onPress={resetNfc}>
                    <Text className="text-sm text-gold font-semibold">Receive Another</Text>
                  </PressableScale>
                </View>
              )}

              {nfcState === 'error' && (
                <View className="items-center gap-4">
                  <Ionicons name="close-circle" size={48} color={Colors.danger} />
                  <Text className="text-sm text-[#FF5A5F] text-center px-6">{nfcError}</Text>
                  <PressableScale className="mt-4 px-6 py-2 rounded-full border border-gold" onPress={resetNfc}>
                    <Text className="text-sm text-gold font-semibold">Try Again</Text>
                  </PressableScale>
                  {nfcError.includes('not linked') && (
                    <PressableScale className="mt-4 px-6 py-2 rounded-full bg-gold mt-2 flex-row items-center gap-1.5" onPress={() => router.push('/(tabs)/devices')}>
                      <Ionicons name="link-outline" size={18} color={Colors.black} />
                      <Text className="text-sm font-semibold text-black">Link in Settings</Text>
                    </PressableScale>
                  )}
                </View>
              )}
            </View>

            {nfcState === 'idle' && (
              <View className="flex-row items-center gap-1 px-6">
                <Ionicons name="information-circle-outline" size={14} color={Colors.mutedWhite} />
                <Text className="text-xs text-mutedWhite flex-1">
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
