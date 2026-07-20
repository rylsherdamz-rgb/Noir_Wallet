import { View, Text, ScrollView, Share, Linking } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { Colors } from '@/constants/theme'
import { StatusPill } from '@/components/StatusPill'
import { Toast } from '@/components/Toast'
import { Avatar } from '@/components/Avatar'
import { useAppStore } from '@/store/useAppStore'
import { useState } from 'react'

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
  const formattedAmount = tx ? (tx.amountCents / 100).toFixed(2) : '0.00'
  const date = tx ? new Date(tx.createdAt) : new Date()
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const copyHash = async () => {
    if (tx?.stellarTxHash) {
      await Clipboard.setStringAsync(tx.stellarTxHash)
      setToast({ visible: true, type: 'success', title: 'Hash Copied', message: 'Transaction hash copied to clipboard' })
    }
  }

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
    await Share.share({
      message: `Noir Wallet Transaction\nAmount: ${formattedAmount} ${tx.assetCode}\nTo: ${tx.merchantName}\nStatus: ${tx.status}\nHash: ${tx.stellarTxHash || 'N/A'}`,
    })
  }

  if (!tx) {
    return (
      <SafeAreaView className="flex-1 bg-surfaceBg">
        <View className="flex-row items-center justify-between px-4 py-4">
          <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </PressableScale>
          <Text className="text-lg font-bold text-white">Transaction Details</Text>
          <View style={{ width: 22 }} />
        </View>
        <View className="flex-1 items-center justify-center gap-4">
          <Ionicons name="alert-circle-outline" size={48} color={Colors.mutedWhite} />
          <Text className="text-base text-mutedWhite">Transaction not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text className="text-lg font-bold text-white">Transaction Details</Text>
        <PressableScale onPress={shareTx} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="share-outline" size={22} color={Colors.gold} />
        </PressableScale>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}>
        <View className="items-center py-6">
          <Avatar name={tx.merchantName} size={64} variant="user" />
          <Text className="text-xl font-bold text-white mt-2 mb-1">{tx.merchantName}</Text>
          <View className="self-center mb-2">
            <StatusPill status={tx.status} />
          </View>
          <Text className={`text-5xl font-extrabold text-white mt-2 ${tx.status === 'failed' ? 'text-[#FF5A5F] line-through' : ''}`}>
            {tx.status === 'failed' ? '' : '-'}{formattedAmount} {tx.assetCode}
          </Text>
          {tx.status === 'failed' && tx.errorMessage && (
            <Text className="text-sm text-[#FF5A5F] mt-2">{tx.errorMessage}</Text>
          )}
        </View>

        <View className="bg-cardBg rounded-2xl border border-borderGrey p-4 mt-4">
          <DetailRow label="Transaction ID" value={tx.id} mono />
          <DetailRow label="Date" value={`${formattedDate} at ${formattedTime}`} />
          <DetailRow label="To" value={tx.merchantName} />
          <DetailRow label="Amount" value={`${formattedAmount} ${tx.assetCode}`} gold />
          <DetailRow label="Fee" value="~0.00001 XLM" />
          <DetailRow label="Status" value={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)} />
          <DetailRow label="Device" value={tx.deviceId} mono />
          {tx.stellarTxHash && (
            <View className="flex-row justify-between items-center py-4 border-b border-b-borderGrey">
              <Text className="text-sm text-mutedWhite">Stellar Tx Hash</Text>
              <PressableScale className="flex-row items-center gap-1 max-w-[55%]" onPress={copyHash}>
                <Text className="text-xs text-white font-mono" numberOfLines={1}>
                  {tx.stellarTxHash.slice(0, 16)}...{tx.stellarTxHash.slice(-8)}
                </Text>
                <Ionicons name="copy-outline" size={16} color={Colors.gold} />
              </PressableScale>
            </View>
          )}
          {tx.errorMessage && (
            <DetailRow label="Error" value={tx.errorMessage} error />
          )}
        </View>

        <View className="bg-cardBg rounded-2xl border border-borderGrey mt-4 overflow-hidden">
          <PressableScale className="flex-row items-center gap-4 p-4 border-b border-b-borderGrey" onPress={shareTx}>
            <Ionicons name="share-outline" size={18} color={Colors.gold} />
            <Text className="text-sm text-gold font-medium">Share Receipt</Text>
          </PressableScale>
          {tx.stellarTxHash && explorerUrl && (
            <PressableScale className="flex-row items-center gap-4 p-4 border-b border-b-borderGrey" onPress={openExplorer}>
              <Ionicons name="open-outline" size={18} color={Colors.gold} />
              <Text className="text-sm text-gold font-medium">View on Stellar Explorer</Text>
            </PressableScale>
          )}
          <PressableScale className="flex-row items-center gap-4 p-4">
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.gold} />
            <Text className="text-sm text-gold font-medium">Report an Issue</Text>
          </PressableScale>
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
    <View className="flex-row justify-between items-center py-4 border-b border-b-borderGrey">
      <Text className="text-sm text-mutedWhite">{label}</Text>
      <Text
        className={`${
          mono ? 'font-mono text-xs' : gold ? 'text-gold font-bold text-base' : 'text-sm text-white font-medium'
        } max-w-[55%] text-right${error ? ' text-[#FF5A5F]' : ''}`}
      >
        {value}
      </Text>
    </View>
  )
}
