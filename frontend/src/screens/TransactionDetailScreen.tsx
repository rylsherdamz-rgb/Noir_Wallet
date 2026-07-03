import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { StatusPill } from '@/components/StatusPill'
import { Toast } from '@/components/Toast'
import { Avatar } from '@/components/Avatar'
import { Transaction } from '@/types'
import { useState } from 'react'

const MOCK_TX: Transaction = {
  id: '1',
  stellarTxHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  merchantId: 'm1',
  merchantName: '7-Eleven',
  userId: 'u1',
  deviceId: 'd1',
  amountCents: 4500,
  assetCode: 'USDC',
  status: 'confirmed',
  errorMessage: null,
  createdAt: new Date().toISOString(),
}

export function TransactionDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  })

  const tx = MOCK_TX
  const formattedAmount = (tx.amountCents / 100).toFixed(2)
  const date = new Date(tx.createdAt)
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const copyHash = async () => {
    if (tx.stellarTxHash) {
      await Clipboard.setStringAsync(tx.stellarTxHash)
      setToast({ visible: true, type: 'success', title: 'Hash Copied', message: 'Transaction hash copied to clipboard' })
    }
  }

  const shareTx = async () => {
    await Share.share({
      message: `Noir Wallet Transaction\nAmount: ${formattedAmount} ${tx.assetCode}\nMerchant: ${tx.merchantName}\nStatus: ${tx.status}\nHash: ${tx.stellarTxHash || 'N/A'}`,
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity onPress={shareTx} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="share-outline" size={22} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Avatar name={tx.merchantName} size={64} variant="merchant" />
          <Text style={styles.merchantName}>{tx.merchantName}</Text>
          <StatusPill status={tx.status} />
          <Text style={[styles.amount, tx.status === 'failed' && styles.amountFailed]}>
            {tx.status === 'failed' ? '' : '-'}{formattedAmount} {tx.assetCode}
          </Text>
          {tx.status === 'failed' && tx.errorMessage && (
            <Text style={styles.errorMsg}>{tx.errorMessage}</Text>
          )}
        </View>

        <View style={styles.detailsCard}>
          <DetailRow label="Transaction ID" value={tx.id} mono />
          <DetailRow label="Date" value={`${formattedDate} at ${formattedTime}`} />
          <DetailRow label="Merchant" value={tx.merchantName} />
          <DetailRow label="Amount" value={`${formattedAmount} ${tx.assetCode}`} gold />
          <DetailRow label="Fee" value="~0.00001 XLM" />
          <DetailRow label="Status" value={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)} />
          <DetailRow label="Device" value={tx.deviceId} mono />
          {tx.stellarTxHash && (
            <View style={styles.hashRow}>
              <Text style={styles.detailLabel}>Stellar Tx Hash</Text>
              <TouchableOpacity style={styles.hashValueRow} onPress={copyHash}>
                <Text style={styles.hashValue} numberOfLines={1}>
                  {tx.stellarTxHash.slice(0, 16)}...{tx.stellarTxHash.slice(-8)}
                </Text>
                <Ionicons name="copy-outline" size={16} color={Colors.gold} />
              </TouchableOpacity>
            </View>
          )}
          {tx.errorMessage && (
            <DetailRow label="Error" value={tx.errorMessage} error />
          )}
        </View>

        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={shareTx} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={18} color={Colors.gold} />
            <Text style={styles.actionLabel}>Share Receipt</Text>
          </TouchableOpacity>
          {tx.stellarTxHash && (
            <TouchableOpacity style={styles.actionRow} onPress={copyHash} activeOpacity={0.7}>
              <Ionicons name="open-outline" size={18} color={Colors.gold} />
              <Text style={styles.actionLabel}>View on Stellar Explorer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.gold} />
            <Text style={styles.actionLabel}>Report an Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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

function DetailRow({
  label,
  value,
  mono,
  gold,
  error,
}: {
  label: string
  value: string
  mono?: boolean
  gold?: boolean
  error?: boolean
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          mono && styles.detailMono,
          gold && styles.detailGold,
          error && styles.detailError,
        ]}
      >
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  merchantName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  amount: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  amountFailed: {
    color: Colors.danger,
    textDecorationLine: 'line-through',
  },
  errorMsg: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    marginTop: Spacing.sm,
  },
  detailsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
  },
  detailValue: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.medium,
    maxWidth: '55%',
    textAlign: 'right',
  },
  detailMono: {
    fontFamily: 'monospace',
    fontSize: FontSize.xs,
  },
  detailGold: {
    color: Colors.gold,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  detailError: {
    color: Colors.danger,
  },
  hashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  hashValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: '55%',
  },
  hashValue: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontFamily: 'monospace',
  },
  actionsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
  },
})
