import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { NFCTag, QueuedPayment } from '@/types'
import { nfcService } from '@/services/nfc'
import { x402 } from '@/domain/x402'
import { NumericKeypad } from '@/components/NumericKeypad'
import { ReadyToTapIndicator } from '@/components/ReadyToTapIndicator'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

export function MerchantPosScreen() {
  const { transactions, addTransaction, user, devices, addPendingPayment } = useAppStore()
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<'success' | 'failed' | null>(null)
  const [agentMode, setAgentMode] = useState(false)

  const displayAmount = amount ? `₱${(parseInt(amount) / 100).toFixed(2)}` : ''

  const handleTap = useCallback(async () => {
    if (!amount || parseInt(amount) === 0) return
    setIsProcessing(true)
    setLastResult(null)

    let tag: NFCTag | null = null
    try {
      tag = await nfcService.readTag()
      if (!tag) { setIsProcessing(false); return }
      const scanned = tag

      const linkedDevice = devices.find((d) => d.deviceUidHash === scanned.uid)
      const hasAgent = await x402.hasAgent()
      let txHash: string | null = null

      if (hasAgent && linkedDevice?.agentPublicKey) {
        setAgentMode(true)
        const result = await x402.payWithAgent({
          destination: user?.stellarPublicKey || '',
          amount: (parseInt(amount) / 100).toFixed(2),
        })
        if ('error' in result) throw new Error(result.error)
        txHash = result.hash
      } else {
        const res = await apiService.initiatePayment({
          rawDeviceUid: scanned.uid,
          merchantPublicKey: user?.stellarPublicKey || '',
          amountCents: parseInt(amount),
          assetCode: 'PHP',
        })
        if (res.status === 'accepted' || res.status === 'confirmed') {
          txHash = res.txHash || null
        } else {
          throw new Error(res.message)
        }
      }

      if (txHash) {
        setLastResult('success')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setAmount('')
        addTransaction({
          id: Math.random().toString(36).slice(2),
          stellarTxHash: txHash,
          merchantId: 'me',
          merchantName: 'Tap Pay',
          userId: user?.id || 'local',
          deviceId: scanned.uid,
          amountCents: parseInt(amount),
          assetCode: 'PHP',
          status: 'confirmed',
          errorMessage: null,
          createdAt: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      setLastResult('failed')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      // Queue payment for offline retry
      if (amount && parseInt(amount) > 0) {
        const queued: QueuedPayment = {
          id: Math.random().toString(36).slice(2),
          rawDeviceUid: tag?.uid || 'unknown',
          merchantPublicKey: user?.stellarPublicKey || '',
          amountCents: parseInt(amount),
          assetCode: 'PHP',
          terminalId: undefined,
          nonce: Math.random().toString(36).slice(2, 10),
          createdAt: new Date().toISOString(),
          retryCount: 0,
        }
        addPendingPayment(queued)
      }
    } finally {
      setIsProcessing(false)
      setAgentMode(false)
      setTimeout(() => setLastResult(null), 3000)
    }
  }, [amount, user, addTransaction, devices])

  const recentTxs = transactions.slice(0, 5)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <NoirLogo variant="mark" size={28} />
          <Text style={styles.headerTitle}>Tap to Pay</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.tapSection}>
          <ReadyToTapIndicator amount={displayAmount} isActive={!!amount && !isProcessing} />

          <TouchableOpacity
            style={[
              styles.tapBtn,
              (!amount || isProcessing) && styles.tapBtnDisabled,
              amount && !isProcessing && styles.tapBtnActive,
            ]}
            onPress={handleTap}
            disabled={!amount || isProcessing}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isProcessing ? 'sync' : 'radio'}
              size={24}
              color={amount && !isProcessing ? Colors.black : Colors.mutedWhite}
            />
            <Text style={[styles.tapBtnText, amount && !isProcessing && { color: Colors.black }]}>
              {isProcessing && agentMode ? 'Agent Signing...' : isProcessing ? 'Processing...' : 'Tap NFC Tag'}
            </Text>
          </TouchableOpacity>

          {lastResult === 'success' && (
            <View style={styles.resultRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.resultSuccess}>Payment Sent</Text>
            </View>
          )}
          {lastResult === 'failed' && (
            <View style={styles.resultRow}>
              <Ionicons name="close-circle" size={20} color={Colors.danger} />
              <Text style={styles.resultFailed}>Payment Failed</Text>
            </View>
          )}
        </View>

        <View style={styles.keypadSection}>
          <NumericKeypad value={amount} onChangeValue={setAmount} maxDigits={8} />
        </View>

        {recentTxs.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent</Text>
            {recentTxs.map((tx) => (
              <View key={tx.id} style={styles.recentRow}>
                <Text style={styles.recentName}>{tx.merchantName}</Text>
                <Text style={styles.recentAmount}>₱{(tx.amountCents / 100).toFixed(2)}</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  tapSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  tapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tapBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  tapBtnDisabled: {
    opacity: 0.5,
  },
  tapBtnText: {
    fontSize: FontSize.lg,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.bold,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  resultSuccess: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: FontWeight.semibold,
  },
  resultFailed: {
    fontSize: FontSize.md,
    color: Colors.danger,
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
  recentName: {
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  recentAmount: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
})
