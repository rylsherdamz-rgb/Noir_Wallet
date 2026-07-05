import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import QRCode from 'react-native-qrcode-svg'
import * as Clipboard from 'expo-clipboard'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Button } from '@/components/Button'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/store/useAppStore'
import { AssetCode } from '@/types'

export function ReceiveScreen() {
  const router = useRouter()
  const { user, balance } = useAppStore()
  const [selectedAsset, setSelectedAsset] = useState<AssetCode>('USDC')
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'info'; title: string; message?: string }>({
    visible: false,
    type: 'success',
    title: '',
  })

  const address = user?.stellarPublicKey || 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  const amount = selectedAsset === 'USDC' ? balance.usdc : selectedAsset === 'XLM' ? balance.xlm : balance.php

  const copyAddress = async () => {
    await Clipboard.setStringAsync(address)
    setToast({ visible: true, type: 'success', title: 'Address Copied', message: 'Stellar address copied to clipboard' })
  }

  const shareAddress = async () => {
    await Share.share({ message: `Send ${selectedAsset} to my Noir Wallet: ${address}` })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.assetRow}>
          {(['USDC', 'XLM', 'PHP'] as AssetCode[]).map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.assetChip, selectedAsset === a && styles.assetChipActive]}
              onPress={() => setSelectedAsset(a)}
            >
              <Text style={[styles.assetChipLabel, selectedAsset === a && styles.assetChipLabelActive]}>
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.qrWrap}>
          <View style={styles.qrBorder}>
            <QRCode
              value={`${address}?asset=${selectedAsset}`}
              size={200}
              backgroundColor={Colors.white}
              color={Colors.black}
            />
          </View>
        </View>

        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Your Stellar Address</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressText} numberOfLines={1}>
              {address.slice(0, 12)}...{address.slice(-8)}
            </Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyAddress}>
              <Ionicons name="copy-outline" size={18} color={Colors.gold} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={shareAddress}>
              <Ionicons name="share-outline" size={18} color={Colors.gold} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your {selectedAsset} Balance</Text>
          <Text style={styles.balanceValue}>
            {amount.toLocaleString()} {selectedAsset}
          </Text>
        </View>
      </View>

      <View style={styles.bottomActions}>
        <Button label="Done" onPress={() => router.back()} />
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  assetRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  assetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  assetChipActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  assetChipLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.semibold,
  },
  assetChipLabelActive: {
    color: Colors.gold,
  },
  qrWrap: {
    marginBottom: Spacing.xl,
  },
  qrBorder: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },
  addressSection: {
    width: '100%',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    marginBottom: Spacing.md,
  },
  addressLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: 'monospace',
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    width: '100%',
    backgroundColor: Colors.gold + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold + '25',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
  },
  bottomActions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
})
