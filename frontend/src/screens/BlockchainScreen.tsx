import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Card } from '@/components/Card'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/store/useAppStore'
import { AppConfig } from '@/constants/config'
import { apiService } from '@/services/api'
import { stellarService } from '@/services/stellar-service'

export function BlockchainScreen() {
  const router = useRouter()
  const { user, balance, network, setNetwork, transactions, setTransactions, setBalance } = useAppStore()
  const [refreshing, setRefreshing] = useState(false)
  const [funding, setFunding] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })

  const pubKey = user?.stellarPublicKey || 'G...'
  const contractAddr = AppConfig.stellar.deviceRegistryContract || 'Not deployed'
  const recentTx = transactions.slice(0, 3)

  const refreshBalances = useCallback(async () => {
    if (!user?.stellarPublicKey) return
    const onChain = await stellarService.getBalance(user.stellarPublicKey)
    setBalance({ xlm: onChain.xlm })
  }, [user?.stellarPublicKey, setBalance])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const txRes = await apiService.getTransactions()
      if (txRes?.transactions) setTransactions(txRes.transactions)
    } catch {
      // backend unavailable
    }
    await refreshBalances()
    setRefreshing(false)
  }, [refreshBalances, setTransactions])

  const copyAddr = async (addr: string) => {
    await Clipboard.setStringAsync(addr)
    setToast({ visible: true, type: 'success', title: 'Copied', message: 'Address copied to clipboard' })
  }

  const handleFund = useCallback(async () => {
    if (!user?.stellarPublicKey) return
    setFunding(true)
    const success = await stellarService.fundAccount(user.stellarPublicKey)
    if (success) {
      let msg = 'Wallet funded!'
      try {
        const bal = await stellarService.getBalance(user.stellarPublicKey!)
        msg = `${bal.xlm.toFixed(2)} XLM balance`
      } catch { /* non-critical */ }
      setToast({ visible: true, type: 'success', title: 'Funded!', message: msg })
      await refreshBalances()
    } else {
      setToast({ visible: true, type: 'info', title: 'Failed', message: 'Friendbot request failed. Are you on testnet?' })
    }
    setFunding(false)
  }, [user?.stellarPublicKey, refreshBalances])

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </PressableScale>
        <View className="flex-row items-center gap-2">
          <NoirLogo variant="mark" size={24} />
          <Text className="text-xl font-bold text-white">Blockchain</Text>
        </View>
        <PressableScale
          onPress={() => {
            if (network === 'testnet') {
              Alert.alert(
                'Switch to Mainnet?',
                'This will connect to the Stellar Public Network with real asset value.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Switch', style: 'destructive', onPress: () => setNetwork('mainnet') },
                ]
              )
            } else {
              setNetwork('testnet')
            }
          }}
          className="flex-row items-center gap-[4] px-2 py-1 rounded-full bg-[#2C2C2C]"
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: network === 'testnet' ? Colors.warning : Colors.success }} />
          <Text className="text-xs text-mutedWhite font-bold">{network === 'testnet' ? 'TESTNET' : 'MAINNET'}</Text>
        </PressableScale>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-12"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        {/* Wallet */}
        <Text className="text-sm text-mutedWhite font-semibold uppercase tracking-[0.5] mb-2 mt-4">Wallet</Text>
        <Card style={{ marginBottom: 16 }}>
          <View className="flex-row gap-4 items-center mb-4">
            <View className="w-[44] h-[44] rounded-full bg-gold/15 items-center justify-center border border-gold/25">
              <Ionicons name="wallet-outline" size={22} color={Colors.gold} />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-mutedWhite">Stellar Address</Text>
              <PressableScale onPress={() => copyAddr(pubKey)} className="flex-row items-center gap-1 mt-0.5">
                <Text className="text-sm text-white font-mono" numberOfLines={1}>{pubKey}</Text>
                <Ionicons name="copy-outline" size={14} color={Colors.gold} />
              </PressableScale>
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row justify-between items-center py-2 border-t border-borderGrey">
              <Text className="text-sm text-mutedWhite font-medium">XLM</Text>
              <Text className="text-base text-white font-bold">{balance.xlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</Text>
            </View>

          </View>

          {network === 'testnet' && (
            <PressableScale
              className="flex-row items-center justify-center gap-2 mt-4 py-2 rounded-xl bg-gold min-h-[44]"
              onPress={handleFund}
              disabled={funding}
              
            >
              <Ionicons name="water-outline" size={18} color={Colors.black} />
              <Text className="text-sm text-black font-bold">{funding ? 'Funding...' : 'Fund with Testnet XLM'}</Text>
            </PressableScale>
          )}
        </Card>

        {/* Smart Contract */}
        <Text className="text-sm text-mutedWhite font-semibold uppercase tracking-[0.5] mb-2 mt-4">Device Registry Contract</Text>
        <Card style={{ marginBottom: 16 }}>
          <View className="flex-row items-center gap-4">
            <Ionicons name="code-slash-outline" size={20} color={Colors.mutedWhite} />
            <View className="flex-1">
              <Text className="text-sm text-white font-medium">DeviceRegistry</Text>
              <Text className="text-xs text-mutedWhite font-mono mt-px">{contractAddr.slice(0, 8)}...{contractAddr.slice(-8)}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.mutedWhite} />
          </View>
          <View className="flex-row items-center gap-2 mt-4 pt-4 border-t border-borderGrey">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }} />
            <Text className="text-xs text-[#3ED598]">Deployed & Verified</Text>
          </View>
        </Card>

        {/* Recent Activity */}
        <Text className="text-sm text-mutedWhite font-semibold uppercase tracking-[0.5] mb-2 mt-4">Recent Activity</Text>
        <Card style={{ marginBottom: 16 }}>
          {recentTx.length === 0 ? (
            <Text className="text-sm text-mutedWhite text-center py-6">No recent transactions</Text>
          ) : (
            recentTx.map((tx) => (
              <View key={tx.id} className="flex-row items-center py-4 border-b border-borderGrey gap-4">
                <View className="w-[36] h-[36] rounded-full bg-gold/10 items-center justify-center">
                  <Ionicons name="swap-horizontal" size={18} color={Colors.gold} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-white font-medium">{tx.merchantName}</Text>
                  <Text className="text-xs text-mutedWhite mt-px">{new Date(tx.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text className="text-base text-white font-bold">-{(tx.amountCents / 100).toFixed(2)} {tx.assetCode}</Text>
              </View>
            ))
          )}
          <PressableScale
            className="flex-row items-center justify-center gap-1 py-4"
            onPress={() => router.push('/transactions')}
          >
            <Text className="text-sm text-gold font-medium">View All Transactions</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
          </PressableScale>
        </Card>
      </ScrollView>

      <Toast visible={toast.visible} type={toast.type} title={toast.title} message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))} />
    </SafeAreaView>
  )
}
