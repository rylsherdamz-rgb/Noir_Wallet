import { View, Text, StyleSheet, ScrollView, Share, Linking } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { StatusPill } from '@/components/StatusPill'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/store/useAppStore'
import { useState } from 'react'
import { colorWithOpacity } from '@/constants/designTokens'
import { isIncomingTx, formatAmount, formatSignedAmount, txTitle, shortAddress } from '@/lib/txFormat'
import { openReceipt, receiptFromTransaction } from '@/lib/receipt'
import { ScreenHeader } from '@/components/ScreenHeader'
import { KeyValueRow, TextAction } from '@/components/ui/List'
import { ErrorState } from '@/components/ui/ErrorState'

export function TransactionDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { transactions, network } = useAppStore()
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  })

  const tx = transactions.find((t) => t.id === id) ?? null
  // Sign, title and counterparty all come from the shared rules so this
  // screen matches the list it was opened from.
  const isIncoming = tx ? isIncomingTx(tx) : false
  const failed = tx?.status === 'failed'
  const title = tx ? txTitle(tx) : ''
  const signedAmount = tx ? formatSignedAmount(tx) : ''
  const plainAmount = tx ? `${formatAmount(tx.amountCents)} ${tx.assetCode}` : ''
  const counterpartyLabel = isIncoming ? 'From' : 'To'
  // On-chain records keep the full counterparty address in merchantId.
  const counterparty = tx?.merchantId && tx.merchantId !== tx.userId ? tx.merchantId : ''
  const accent = failed ? Colors.danger : isIncoming ? Colors.success : Colors.white
  const date = tx ? new Date(tx.createdAt) : new Date()
  const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const copyValue = async (value: string, what: string) => {
    await Clipboard.setStringAsync(value)
    setToast({ visible: true, type: 'success', title: `${what} Copied`, message: `${what} copied to clipboard` })
  }
  const copyHash = () => tx?.stellarTxHash && copyValue(tx.stellarTxHash, 'Hash')

  const explorerUrl = tx?.stellarTxHash
    ? network === 'testnet'
      ? `https://stellar.expert/explorer/testnet/tx/${tx.stellarTxHash}`
      : `https://stellar.expert/explorer/public/tx/${tx.stellarTxHash}`
    : null

  const openExplorer = () => {
    if (explorerUrl) Linking.openURL(explorerUrl)
  }

  const shareTx = async () => {
    if (!tx) return
    const lines = [
      `Noir — ${title}`,
      `Amount: ${signedAmount}`,
      counterparty ? `${counterpartyLabel}: ${counterparty}` : null,
      `Date: ${formattedDate}, ${formattedTime}`,
      `Status: ${tx.status}`,
      `Hash: ${tx.stellarTxHash || 'N/A'}`,
    ]
    await Share.share({ message: lines.filter(Boolean).join('\n') })
  }

  if (!tx) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Transaction" onBackPress={() => router.back()} />
        <ErrorState icon="search-outline" tone="neutral" title="Transaction not found" message="It may still be syncing from Stellar. Pull to refresh your activity, then try again." primary={{ label: 'Back', onPress: () => router.back() }} />
      </SafeAreaView>
    )
  }

  const statusColor = failed ? Colors.danger : tx.status === 'pending' ? Colors.warning : Colors.success
  const statusText = tx.status.charAt(0).toUpperCase() + tx.status.slice(1)

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Transaction"
        onBackPress={() => router.back()}
        rightAction={
          <PressableScale onPress={shareTx} hitSlop={10} accessibilityRole="button" accessibilityLabel="Share">
            <Ionicons name="share-outline" size={22} color={Colors.white} />
          </PressableScale>
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.name} numberOfLines={2}>{title}</Text>
          <Text style={[styles.amount, { color: accent }, failed && styles.amountFailed]} numberOfLines={1} adjustsFontSizeToFit>{signedAmount}</Text>
          <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
          {failed && tx.errorMessage ? <Text style={styles.errorMsg}>{tx.errorMessage}</Text> : null}
        </View>

        <KeyValueRow label="Type" value={isIncoming ? 'Received' : 'Sent'} />
        <KeyValueRow label="Amount" value={plainAmount} />
        {counterparty ? (
          <KeyValueRow
            label={counterpartyLabel}
            right={
              <PressableScale style={styles.copyVal} onPress={() => copyValue(counterparty, 'Address')} accessibilityRole="button" accessibilityLabel={`Copy ${counterpartyLabel.toLowerCase()} address`}>
                <Text style={styles.mono}>{shortAddress(counterparty)}</Text>
                <Ionicons name="copy-outline" size={14} color={Colors.mutedWhite} />
              </PressableScale>
            }
          />
        ) : null}
        <KeyValueRow label="Date" value={`${formattedDate}, ${formattedTime}`} />
        {!isIncoming && !failed && <KeyValueRow label="Network fee" value="~0.00001 XLM" />}
        {!!tx.deviceId && <KeyValueRow label="Card" value={tx.deviceId} mono />}
        {tx.stellarTxHash ? (
          <KeyValueRow
            label="Transaction"
            last
            right={
              <PressableScale style={styles.copyVal} onPress={copyHash} accessibilityRole="button" accessibilityLabel="Copy transaction hash">
                <Text style={styles.mono}>{tx.stellarTxHash.slice(0, 8)}…{tx.stellarTxHash.slice(-8)}</Text>
                <Ionicons name="copy-outline" size={14} color={Colors.mutedWhite} />
              </PressableScale>
            }
          />
        ) : (
          <KeyValueRow label="Operation" value={tx.id} mono last />
        )}

        <View style={styles.actions}>
          <TextAction label="Receipt" icon="receipt-outline" onPress={() => openReceipt(router, receiptFromTransaction(tx), 'push')} center={false} />
          {tx.stellarTxHash && explorerUrl && <TextAction label="Explorer" icon="open-outline" onPress={openExplorer} center={false} />}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: FontSize.md, color: Colors.mutedWhite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  headerTitle: { fontFamily: Fonts.display, fontSize: 17, color: Colors.cream },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', gap: 6, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  name: { fontSize: FontSize.md - 1, color: Colors.mutedWhite, textAlign: 'center' },
  amount: { fontFamily: Fonts.display, fontSize: 40, fontVariant: ['tabular-nums'] },
  amountFailed: { textDecorationLine: 'line-through' },
  status: { fontSize: FontSize.sm - 1, fontWeight: FontWeight.medium },
  errorMsg: { fontSize: FontSize.sm, color: Colors.danger, textAlign: 'center', marginTop: Spacing.xs },
  copyVal: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  mono: { fontFamily: Fonts.mono, fontSize: FontSize.sm - 1, color: Colors.white },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, paddingTop: Spacing.lg },
})
