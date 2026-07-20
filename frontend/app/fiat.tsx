import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors } from '@/constants/theme'
import { Button } from '@/components/Button'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Toast } from '@/components/Toast'
import { apiService } from '@/services/api'

type Mode = 'cash-in' | 'cash-out'

interface BalanceEntry {
  currency: string
  available: string
  [key: string]: any
}

interface BeneficiaryInfo {
  bankName: string
  accountName: string
  accountNumber: string
}

export default function FiatScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ mode?: string }>()
  const [mode, setMode] = useState<Mode>(params.mode === 'cash-out' ? 'cash-out' : 'cash-in')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  })
  const [balances, setBalances] = useState<BalanceEntry[]>([])
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [step, setStep] = useState<'amount' | 'beneficiary'>('amount')
  const [beneficiary, setBeneficiary] = useState<BeneficiaryInfo>({
    bankName: '',
    accountName: '',
    accountNumber: '',
  })

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.pdaxBalance()
        const list = Array.isArray(res) ? res : (res as any)?.balances ?? []
        setBalances(list)
      } catch {
        // PDAX balance unavailable
      }
      setBalanceLoading(false)
    })()
  }, [])

  const amountCents = Math.round(parseFloat(amount) * 100) || 0

  const handleSubmit = async () => {
    if (amountCents <= 0) {
      setError('Enter an amount greater than 0')
      return
    }

    if (mode === 'cash-out' && step === 'amount') {
      if (amountCents <= 0) return
      setStep('beneficiary')
      return
    }

    if (mode === 'cash-out' && step === 'beneficiary') {
      if (!beneficiary.bankName.trim()) { setError('Enter bank name'); return }
      if (!beneficiary.accountName.trim()) { setError('Enter account holder name'); return }
      if (!beneficiary.accountNumber.trim()) { setError('Enter account number'); return }
    }

    setBusy(true)
    setError(null)
    try {
      const res = mode === 'cash-in'
        ? await apiService.pdaxCashIn(amountCents)
        : await apiService.pdaxCashOut(amountCents, beneficiary)
      setToast({
        visible: true,
        type: 'success',
        title: mode === 'cash-in' ? 'Cash In Initiated' : 'Cash Out Initiated',
        message: `Reference: ${res.reference}`,
      })
      setAmount('')
      setStep('amount')
      setBeneficiary({ bankName: '', accountName: '', accountNumber: '' })
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </PressableScale>
        <Text className="text-xl font-bold text-white">
          {mode === 'cash-in' ? 'Cash In' : 'Cash Out'}
        </Text>
        <View className="w-6" />
      </View>

      <View className="flex-row justify-center gap-2 px-4 mb-4">
        <PressableScale
          className={`flex-row items-center gap-[6px] px-4 py-2 rounded-full bg-[#2C2C2C] border border-borderGrey ${mode === 'cash-in' ? 'bg-gold border-gold' : ''}`}
          onPress={() => { setMode('cash-in'); setError(null); setStep('amount') }}
        >
          <Ionicons name="arrow-down-outline" size={16} color={mode === 'cash-in' ? Colors.black : Colors.silver} />
          <Text className={`text-sm text-mutedWhite font-semibold ${mode === 'cash-in' ? 'text-black' : ''}`}>
            Cash In
          </Text>
        </PressableScale>
        <PressableScale
          className={`flex-row items-center gap-[6px] px-4 py-2 rounded-full bg-[#2C2C2C] border border-borderGrey ${mode === 'cash-out' ? 'bg-gold border-gold' : ''}`}
          onPress={() => { setMode('cash-out'); setError(null); setStep('amount') }}
        >
          <Ionicons name="arrow-up-outline" size={16} color={mode === 'cash-out' ? Colors.black : Colors.silver} />
          <Text className={`text-sm text-mutedWhite font-semibold ${mode === 'cash-out' ? 'text-black' : ''}`}>
            Cash Out
          </Text>
        </PressableScale>
      </View>

      <ScrollView contentContainerClassName="px-4">
        {!balanceLoading && balances.length > 0 && (
          <View className="bg-cardBg rounded-xl border border-borderGrey p-4 mt-4">
            <Text className="text-sm text-mutedWhite font-semibold mb-2">PDAX Balance</Text>
            {balances.map((b, i) => (
              <View key={i} className="flex-row justify-between py-1">
                <Text className="text-sm text-white font-medium">{b.currency}</Text>
                <Text className="text-sm text-gold font-bold">{b.available}</Text>
              </View>
            ))}
          </View>
        )}
{mode === 'cash-out' && step === 'beneficiary' ? (
            <View className="py-4">
              <Text className="text-base font-bold text-white mb-4">Bank Account Details</Text>
              <Text className="text-sm text-mutedWhite font-semibold mb-1 mt-2">Bank Name</Text>
              <TextInput
                className="bg-[#2C2C2C] rounded-xl border border-borderGrey px-4 py-2 text-base text-white"
                value={beneficiary.bankName}
                onChangeText={(t) => setBeneficiary((prev) => ({ ...prev, bankName: t }))}
                placeholder="e.g. BDO, BPI, Metrobank"
                placeholderTextColor={Colors.mutedWhite}
                autoCapitalize="words"
              />
              <Text className="text-sm text-mutedWhite font-semibold mb-1 mt-2">Account Holder</Text>
              <TextInput
                className="bg-[#2C2C2C] rounded-xl border border-borderGrey px-4 py-2 text-base text-white"
                value={beneficiary.accountName}
                onChangeText={(t) => setBeneficiary((prev) => ({ ...prev, accountName: t }))}
                placeholder="Full name as registered with bank"
                placeholderTextColor={Colors.mutedWhite}
                autoCapitalize="words"
              />
              <Text className="text-sm text-mutedWhite font-semibold mb-1 mt-2">Account Number</Text>
              <TextInput
                className="bg-[#2C2C2C] rounded-xl border border-borderGrey px-4 py-2 text-base text-white"
                value={beneficiary.accountNumber}
                onChangeText={(t) => setBeneficiary((prev) => ({ ...prev, accountNumber: t }))}
                placeholder="10-12 digit account number"
                placeholderTextColor={Colors.mutedWhite}
                keyboardType="number-pad"
              />
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-base text-mutedWhite font-semibold">PHP</Text>
              <Text className="text-[64px] font-heavy text-white tracking-tight mt-2">
                {amount || '0'}
                <Text className="text-gold">|</Text>
              </Text>
              <Text className="text-sm text-mutedWhite mt-2 text-center">
                {mode === 'cash-in' ? 'Deposit PHP from your bank' : 'Withdraw PHP to your bank'}
              </Text>
            </View>
          )}
          {error && <ErrorMessage message={error} variant="inline" />}
      </ScrollView>

      <View className="px-4 pb-4">
        <NumericKeypad value={amount} onChangeValue={setAmount} />
        <View className="flex-row gap-2 mt-4">
          <Button
            variant="ghost"
            label={mode === 'cash-in' ? 'Switch to Cash Out' : 'Switch to Cash In'}
            onPress={() => { setMode(mode === 'cash-in' ? 'cash-out' : 'cash-in'); setError(null); setStep('amount') }}
          />
          {mode === 'cash-out' && step === 'beneficiary' && (
            <Button
              variant="ghost"
              label="Back"
              onPress={() => { setStep('amount'); setError(null) }}
            />
          )}
          <Button
            label={busy ? 'Processing...'
              : mode === 'cash-out' && step === 'amount' ? 'Next'
              : mode === 'cash-in' ? 'Cash In'
              : 'Confirm Cash Out'}
            onPress={handleSubmit}
            disabled={amountCents <= 0 || busy}
            style={mode === 'cash-out' && step === 'beneficiary' ? { flex: 1 } : undefined}
          />
        </View>
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
