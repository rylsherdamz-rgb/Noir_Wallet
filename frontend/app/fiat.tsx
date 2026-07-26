import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle}>
          {mode === 'cash-in' ? 'Cash In' : 'Cash Out'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.modeRow}>
        <PressableScale
          style={[styles.modeChip, mode === 'cash-in' && styles.modeChipActive]}
          onPress={() => { setMode('cash-in'); setError(null); setStep('amount') }}
        >
          <Ionicons name="arrow-down-outline" size={16} color={mode === 'cash-in' ? Colors.black : Colors.silver} />
          <Text style={[styles.modeChipLabel, mode === 'cash-in' && styles.modeChipLabelActive]}>
            Cash In
          </Text>
        </PressableScale>
        <PressableScale
          style={[styles.modeChip, mode === 'cash-out' && styles.modeChipActive]}
          onPress={() => { setMode('cash-out'); setError(null); setStep('amount') }}
        >
          <Ionicons name="arrow-up-outline" size={16} color={mode === 'cash-out' ? Colors.black : Colors.silver} />
          <Text style={[styles.modeChipLabel, mode === 'cash-out' && styles.modeChipLabelActive]}>
            Cash Out
          </Text>
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!balanceLoading && balances.length > 0 && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>PDAX Balance</Text>
            {balances.map((b, i) => (
              <View key={i} style={styles.balanceRow}>
                <Text style={styles.balanceCurrency}>{b.currency}</Text>
                <Text style={styles.balanceAmount}>{b.available}</Text>
              </View>
            ))}
          </View>
        )}
{mode === 'cash-out' && step === 'beneficiary' ? (
            <View style={styles.beneficiarySection}>
              <Text style={styles.beneficiaryTitle}>Bank Account Details</Text>
              <Text style={styles.textFieldLabel}>Bank Name</Text>
              <TextInput
                style={styles.textField}
                value={beneficiary.bankName}
                onChangeText={(t) => setBeneficiary((prev) => ({ ...prev, bankName: t }))}
                placeholder="e.g. BDO, BPI, Metrobank"
                placeholderTextColor={Colors.mutedWhite}
                autoCapitalize="words"
              />
              <Text style={styles.textFieldLabel}>Account Holder</Text>
              <TextInput
                style={styles.textField}
                value={beneficiary.accountName}
                onChangeText={(t) => setBeneficiary((prev) => ({ ...prev, accountName: t }))}
                placeholder="Full name as registered with bank"
                placeholderTextColor={Colors.mutedWhite}
                autoCapitalize="words"
              />
              <Text style={styles.textFieldLabel}>Account Number</Text>
              <TextInput
                style={styles.textField}
                value={beneficiary.accountNumber}
                onChangeText={(t) => setBeneficiary((prev) => ({ ...prev, accountNumber: t }))}
                placeholder="10-12 digit account number"
                placeholderTextColor={Colors.mutedWhite}
                keyboardType="number-pad"
              />
            </View>
          ) : (
            <View style={styles.amountSection}>
              <Text style={styles.currency}>PHP</Text>
              <Text style={styles.amountDisplay}>
                {amount || '0'}
                <Text style={styles.amountCursor}>|</Text>
              </Text>
              <Text style={styles.amountHint}>
                {mode === 'cash-in' ? 'Deposit PHP from your bank' : 'Withdraw PHP to your bank'}
              </Text>
            </View>
          )}
          {error && <ErrorMessage message={error} variant="inline" />}
      </ScrollView>

      <View style={styles.bottom}>
        <NumericKeypad value={amount} onChangeValue={setAmount} />
        <View style={styles.actionRow}>
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
            style={mode === 'cash-out' && step === 'beneficiary' ? styles.halfBtn : undefined}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  modeRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  modeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.lightGrey,
    borderWidth: 1, borderColor: Colors.borderGrey,
  },
  modeChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  modeChipLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontWeight: FontWeight.semibold },
  modeChipLabelActive: { color: Colors.black },
  scrollContent: { paddingHorizontal: Spacing.md },
  balanceCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderGrey,
    padding: Spacing.md, marginTop: Spacing.md,
  },
  balanceTitle: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  balanceCurrency: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  balanceAmount: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: FontWeight.bold },
  amountSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  beneficiarySection: { paddingVertical: Spacing.md },
  beneficiaryTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white, marginBottom: Spacing.md },
  textFieldLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite, fontWeight: FontWeight.semibold, marginBottom: 4, marginTop: Spacing.sm },
  textField: {
    backgroundColor: Colors.lightGrey, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.md, color: Colors.white,
  },
  currency: { fontSize: FontSize.md, color: Colors.mutedWhite, fontWeight: FontWeight.semibold },
  amountDisplay: { fontSize: FontSize.hero, fontWeight: FontWeight.heavy, color: Colors.white, letterSpacing: -1, marginTop: Spacing.sm },
  amountCursor: { color: Colors.gold },
  amountHint: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: Spacing.sm, textAlign: 'center' },
  bottom: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  halfBtn: { flex: 1 },
})
