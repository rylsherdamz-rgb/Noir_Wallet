import { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useGlobalSearchParams } from 'expo-router'
import { Colors } from '@/constants/theme'
import { Button } from '@/components/Button'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ErrorMessage } from '@/components/ErrorMessage'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Avatar } from '@/components/Avatar'
import { SmartTip } from '@/components/SmartTip'
import { useAppStore } from '@/store/useAppStore'
import { walletService } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'

export function SendScreen() {
  const router = useRouter()
  const params = useGlobalSearchParams()
  const { balance, devices } = useAppStore()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState((params?.scannedAddress as string) || '')
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

  useEffect(() => {
    if (params?.scannedAddress) {
      setRecipient(params.scannedAddress as string)
      setStep('recipient')
      router.setParams({ scannedAddress: undefined })
    }
  }, [params?.scannedAddress])

  const amountNum = parseFloat(amount) || 0
  const insufficientFunds = amountNum > balance.xlm

  const handleContinue = () => {
    if (amountNum <= 0) {
      setError('Enter an amount greater than 0')
      return
    }
    if (insufficientFunds) {
      setError('Insufficient XLM balance')
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
      <SafeAreaView className="flex-1 bg-surfaceBg">
        <View className="flex-row items-center justify-between px-4 py-4">
          <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </PressableScale>
          <Text className="text-xl font-bold text-white">Send</Text>
          <View className="w-[24]" />
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-sm text-mutedWhite mt-2">XLM · Stellar Lumens</Text>
          <Text className="text-[64px] font-extrabold text-white tracking-[-1]">
            {amount || '0'}
          </Text>
          <Text className="text-sm text-mutedWhite mt-2">
            Balance: {balance.xlm.toLocaleString()} XLM
          </Text>
          {error ? <ErrorMessage message={error} variant="inline" /> : null}
        </View>

        <View className="px-4 pb-4">
          <NumericKeypad value={amount} onChangeValue={handleChangeValue} />
          <View className="flex-row gap-2 mt-4">
            <Button variant="ghost" label="Cancel" onPress={() => router.back()} />
            <Button
              label="Continue"
              onPress={handleContinue}
              disabled={amountNum <= 0 || insufficientFunds}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (step === 'recipient') {
    return (
      <SafeAreaView className="flex-1 bg-surfaceBg">
        <View className="flex-row items-center justify-between px-4 py-4">
          <PressableScale onPress={() => setStep('amount')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </PressableScale>
          <Text className="text-xl font-bold text-white">Send to</Text>
          <View className="w-[24]" />
        </View>

        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
          <View className="flex-row items-center bg-cardBg rounded-xl border border-borderGrey pl-4 mb-4">
            <TextInput
              className="flex-1 h-[52] text-base text-white font-mono"
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Enter Stellar address or scan NFC"
              placeholderTextColor={Colors.mutedWhite}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <PressableScale className="w-[52] h-[52] items-center justify-center border-l border-borderGrey" onPress={() => router.push('/scan-qr')}>
              <Ionicons name="qr-code-outline" size={20} color={Colors.gold} />
            </PressableScale>
          </View>

          <SmartTip
            title="Tip: NFC Scan"
            description="Tap the QR icon to scan a recipient's address from their NFC tag or QR code."
            variant="tip"
          />

          <Text className="text-sm text-mutedWhite font-semibold uppercase tracking-[0.5] mb-2 mt-4">Saved Devices</Text>
          {devices.length === 0 ? (
            <Text className="text-sm text-mutedWhite text-center py-6">No linked devices. Link one in the Devices tab.</Text>
          ) : (
            devices
              .filter((device) => !!device.agentPublicKey)
              .map((device) => (
              <PressableScale
                key={device.id}
                className="flex-row items-center bg-cardBg p-4 rounded-xl mb-2 border border-borderGrey gap-4"
                onPress={() => device.agentPublicKey && handleSelectRecipient(device.agentPublicKey)}
              >
                <Avatar name={device.label} size={44} variant="device" />
                <View className="flex-1">
                  <Text className="text-base text-white font-semibold">{device.label}</Text>
                  <Text className="text-xs text-mutedWhite font-mono mt-0.5">
                    {device.agentPublicKey?.slice(0, 8)}…{device.agentPublicKey?.slice(-6)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.mutedWhite} />
              </PressableScale>
            ))
          )}
        </ScrollView>

        <View className="px-4 pb-6">
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
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => setStep('recipient')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text className="text-xl font-bold text-white">Review Send</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        <View className="bg-cardBg rounded-2xl p-6 border border-borderGrey mt-4">
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-mutedWhite">Amount</Text>
            <Text className="text-base text-white font-semibold">
              {amount} XLM
            </Text>
          </View>
          <View className="h-px bg-borderGrey" />
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-mutedWhite">To</Text>
            <Text className="text-sm text-white font-mono max-w-[60%] text-right">{recipient}</Text>
          </View>
          <View className="h-px bg-borderGrey" />
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-mutedWhite">Fee</Text>
            <Text className="text-base text-white font-semibold">~0.00001 XLM</Text>
          </View>
          <View className="h-px bg-borderGrey" />
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-mutedWhite">Total</Text>
            <Text className="text-base text-gold font-bold">
              {amount} XLM + fee
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <TextInput
            className="bg-cardBg rounded-xl p-4 text-base text-white border border-borderGrey h-[52]"
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={Colors.mutedWhite}
          />
        </View>

        {error ? <ErrorMessage message={error} variant="card" onRetry={() => setError(null)} /> : null}
      </ScrollView>

      <View className="px-4 pb-6">
          <Button label="Confirm Send" onPress={() => setShowConfirm(true)} />
      </View>

      <ConfirmDialog
        visible={showConfirm}
        title="Confirm Send"
        message={`Send ${amount} XLM to ${recipient}? This cannot be undone.`}
        confirmLabel={sending ? 'Sending...' : 'Send'}
        icon="send-outline"
        onConfirm={handleSend}
        onCancel={() => setShowConfirm(false)}
        loading={sending}
      />
    </SafeAreaView>
  )
}
