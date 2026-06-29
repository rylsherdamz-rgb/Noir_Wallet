import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '@/store/useAppStore'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ReadyToTapIndicator } from '@/components/ReadyToTapIndicator'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

export function MerchantPosScreen() {
  const { setActiveRole, transactions } = useAppStore()
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<'success' | 'failed' | null>(null)

  const displayAmount = amount
    ? `₱${(parseInt(amount) / 100).toFixed(2)}`
    : ''

  const handleTap = useCallback(async () => {
    if (!amount || parseInt(amount) === 0) return

    setIsProcessing(true)
    setLastResult(null)

    // Simulate NFC tap processing
    await new Promise((r) => setTimeout(r, 2000))

    const success = Math.random() > 0.2
    setLastResult(success ? 'success' : 'failed')
    setIsProcessing(false)

    if (success) {
      setAmount('')
      setTimeout(() => setLastResult(null), 3000)
    }
  }, [amount])

  const recentTxs = transactions.slice(0, 5)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>POS Terminal</Text>
          <TouchableOpacity
            style={styles.roleBadge}
            onPress={() => setActiveRole('consumer')}
          >
            <Ionicons name="swap-horizontal" size={14} color={Colors.accentGreen} />
            <Text style={styles.roleBadgeText}>Consumer</Text>
          </TouchableOpacity>
        </View>

        {/* Ready to Tap / Amount Display */}
        <View style={styles.tapSection}>
          <ReadyToTapIndicator
            amount={displayAmount}
            isActive={!!amount && !isProcessing}
          />

          {/* NFC Tap Button */}
          <TouchableOpacity
            style={[
              styles.tapButton,
              (!amount || isProcessing) && styles.tapButtonDisabled,
            ]}
            onPress={handleTap}
            disabled={!amount || isProcessing}
            activeOpacity={0.8}
          >
            <Ionicons name="radio" size={28} color={Colors.black} />
            <Text style={styles.tapButtonText}>
              {isProcessing ? 'Processing...' : 'Tap Card Here'}
            </Text>
          </TouchableOpacity>

          {lastResult === 'success' && (
            <View style={styles.resultSuccess}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.accentGreen} />
              <Text style={styles.resultText}>Payment Complete</Text>
            </View>
          )}
          {lastResult === 'failed' && (
            <View style={styles.resultFailed}>
              <Ionicons name="close-circle" size={24} color={Colors.accentRed} />
              <Text style={[styles.resultText, { color: Colors.accentRed }]}>
                Transaction Failed
              </Text>
            </View>
          )}
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypadSection}>
          <NumericKeypad value={amount} onChangeValue={setAmount} maxDigits={8} />
        </View>

        {/* Recent Taps */}
        {recentTxs.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Taps</Text>
            {recentTxs.map((tx) => (
              <View key={tx.id} style={styles.recentRow}>
                <Text style={styles.recentMerchant}>{tx.merchantName}</Text>
                <Text style={styles.recentAmount}>
                  ₱{(tx.amountCents / 100).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accentGreen + '15',
    borderWidth: 1,
    borderColor: Colors.accentGreen + '30',
    gap: 4,
  },
  roleBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.accentGreen,
    fontWeight: FontWeight.semibold,
  },
  tapSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  tapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tapButtonDisabled: {
    backgroundColor: Colors.lightGrey,
  },
  tapButtonText: {
    fontSize: FontSize.lg,
    color: Colors.black,
    fontWeight: FontWeight.bold,
  },
  resultSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  resultFailed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  resultText: {
    fontSize: FontSize.md,
    color: Colors.accentGreen,
    fontWeight: FontWeight.semibold,
  },
  keypadSection: {
    marginBottom: Spacing.md,
  },
  recentSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  recentTitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  recentMerchant: {
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  recentAmount: {
    fontSize: FontSize.sm,
    color: Colors.accentGreen,
    fontWeight: FontWeight.semibold,
  },
})
