import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Button } from '@/components/Button'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Toast } from '@/components/Toast'
import { apiService } from '@/services/api'

type Mode = 'cash-in' | 'cash-out'

export default function FiatScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('cash-in')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  })

  const amountCents = Math.round(parseFloat(amount) * 100) || 0

  const handleSubmit = async () => {
    if (amountCents <= 0) {
      setError('Enter an amount greater than 0')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = mode === 'cash-in'
        ? await apiService.pdaxCashIn(amountCents)
        : await apiService.pdaxCashOut(amountCents)
      setToast({
        visible: true,
        type: 'success',
        title: mode === 'cash-in' ? 'Cash In Initiated' : 'Cash Out Initiated',
        message: `Reference: ${res.reference}`,
      })
      setAmount('')
    } catch (e: any) {
      setError(e.message || 'Transaction failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'cash-in' ? 'Cash In' : 'Cash Out'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'cash-in' && styles.modeChipActive]}
          onPress={() => { setMode('cash-in'); setError(null) }}
        >
          <Ionicons name="arrow-down-outline" size={16} color={mode === 'cash-in' ? Colors.black : Colors.silver} />
          <Text style={[styles.modeChipLabel, mode === 'cash-in' && styles.modeChipLabelActive]}>
            Cash In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeChip, mode === 'cash-out' && styles.modeChipActive]}
          onPress={() => { setMode('cash-out'); setError(null) }}
        >
          <Ionicons name="arrow-up-outline" size={16} color={mode === 'cash-out' ? Colors.black : Colors.silver} />
          <Text style={[styles.modeChipLabel, mode === 'cash-out' && styles.modeChipLabelActive]}>
            Cash Out
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.amountSection}>
          <Text style={styles.currency}>PHP</Text>
          <Text style={styles.amountDisplay}>
            {amount || '0'}
            <Text style={styles.amountCursor}>|</Text>
          </Text>
          <Text style={styles.amountHint}>
            {mode === 'cash-in' ? 'Deposit PHP from your bank' : 'Withdraw PHP to your bank'}
          </Text>
          {error && <ErrorMessage message={error} variant="inline" />}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <NumericKeypad value={amount} onChangeValue={setAmount} />
        <View style={styles.actionRow}>
          <Button
            variant="ghost"
            label={mode === 'cash-in' ? 'Switch to Cash Out' : 'Switch to Cash In'}
            onPress={() => { setMode(mode === 'cash-in' ? 'cash-out' : 'cash-in'); setError(null) }}
          />
          <Button
            label={busy ? 'Processing...' : mode === 'cash-in' ? 'Cash In' : 'Cash Out'}
            onPress={handleSubmit}
            disabled={amountCents <= 0 || busy}
            style={styles.halfBtn}
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
  amountSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  currency: { fontSize: FontSize.md, color: Colors.mutedWhite, fontWeight: FontWeight.semibold },
  amountDisplay: { fontSize: FontSize.hero, fontWeight: FontWeight.heavy, color: Colors.white, letterSpacing: -1, marginTop: Spacing.sm },
  amountCursor: { color: Colors.gold },
  amountHint: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: Spacing.sm, textAlign: 'center' },
  bottom: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  halfBtn: { flex: 1 },
})
