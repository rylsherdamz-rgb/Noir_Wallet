import { useState, useEffect, useCallback } from 'react'
import { View, Text, Modal, Alert } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { walletService, WalletListItem } from '@/services/wallet'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

interface WalletSwitcherProps {
  onImportRequest: () => void
}

export function WalletSwitcher({ onImportRequest }: WalletSwitcherProps) {
  const [wallets, setWallets] = useState<WalletListItem[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const list = await walletService.getWalletList()
    const idx = await walletService.getActiveWalletIndex()
    setWallets(list)
    setActiveIndex(idx)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (visible) refresh()
  }, [visible, refresh])

  const handleSwitch = async (index: number) => {
    await walletService.switchToWallet(index)
    setActiveIndex(index)
    setVisible(false)
  }

  const handleRemove = async (publicKey: string) => {
    if (publicKey === wallets[activeIndex]?.stellarPublic) {
      Alert.alert(
        'Cannot Remove Active Wallet',
        'Switch to another wallet first, then remove this one.',
        [{ text: 'OK' }],
      )
      setConfirmRemove(null)
      return
    }
    await walletService.removeWalletFromList(publicKey)
    if (activeIndex >= wallets.length - 1) {
      await walletService.switchToWallet(Math.max(0, activeIndex - 1))
    }
    setConfirmRemove(null)
    refresh()
  }

  const displayAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-4)}`

  return (
    <>
      <PressableScale
        className="flex-row items-center bg-cardBg p-4 rounded-xl mb-2 gap-4 border border-borderGrey"
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Switch wallet"
      >
        <Ionicons name="wallet-outline" size={18} color={Colors.gold} />
        <View className="flex-1 gap-1">
          <Text className="text-sm text-white">
            {wallets[activeIndex]?.label || `Wallet ${activeIndex + 1}`}
          </Text>
          <Text className="text-xs text-mutedWhite font-mono" numberOfLines={1}>
            {wallets[activeIndex]?.stellarPublic
              ? `${wallets[activeIndex].stellarPublic.slice(0, 8)}…${wallets[activeIndex].stellarPublic.slice(-6)}`
              : '—'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.mutedWhite} />
      </PressableScale>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-surfaceBg rounded-t-3xl px-6 pt-4 pb-8 max-h-[80%]">
            <View className="w-9 h-1 rounded-[2] bg-midGrey self-center mb-6" />
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl text-white font-bold">My Wallets</Text>
              <PressableScale onPress={() => setVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={Colors.mutedWhite} />
              </PressableScale>
            </View>

            {wallets.length === 0 ? (
              <View className="items-center py-12 gap-2">
                <Ionicons name="wallet-outline" size={48} color={Colors.mutedWhite} />
                <Text className="text-base text-mutedWhite font-medium">No wallets yet</Text>
                <Text className="text-sm text-mutedWhite text-center">Create or import a wallet to get started</Text>
              </View>
            ) : (
              <View className="mb-4">
                {wallets.map((w, i) => (
                  <PressableScale
                    key={w.stellarPublic}
                    className={`flex-row items-center py-4 px-2 rounded-xl mb-1 gap-4 bg-cardBg border ${
                      i === activeIndex ? 'border-gold' : 'border-borderGrey'
                    }`}
                    style={i === activeIndex ? { backgroundColor: Colors.gold + '10' } : undefined}
                    onPress={() => handleSwitch(i)}
                    onLongPress={() => setConfirmRemove(w.stellarPublic)}
                  >
                    <View className="w-10 h-10 rounded-[20] bg-[#2C2C2C] items-center justify-center">
                      <Ionicons
                        name="wallet"
                        size={20}
                        color={i === activeIndex ? Colors.gold : Colors.mutedWhite}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-base ${i === activeIndex ? 'text-gold' : 'text-white'} font-medium`}>
                        {w.label || `Wallet ${i + 1}`}
                      </Text>
                      <Text className="text-xs text-mutedWhite font-mono mt-0.5">{displayAddress(w.stellarPublic)}</Text>
                    </View>
                    {i === activeIndex ? (
                      <View className="px-2 py-1 rounded-full" style={{ backgroundColor: Colors.gold + '20' }}>
                        <Text className="text-xs text-gold font-semibold">Active</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={Colors.mutedWhite} />
                    )}
                  </PressableScale>
                ))}
              </View>
            )}

            <Button
              label="Import Another Wallet"
              variant="secondary"
              onPress={() => {
                setVisible(false)
                onImportRequest()
              }}
            />

            {confirmRemove && (
              <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
                <Card>
                  <Text className="text-base text-white font-bold mb-1">Remove Wallet?</Text>
                  <Text className="text-sm text-mutedWhite mb-4">
                    {displayAddress(confirmRemove)} will be removed from the list.
                    Keys remain accessible via recovery phrase.
                  </Text>
                  <View className="flex-row gap-4">
                    <PressableScale
                      className="flex-1 py-2 rounded-xl border border-borderGrey items-center"
                      onPress={() => setConfirmRemove(null)}
                    >
                      <Text className="text-sm text-mutedWhite">Keep</Text>
                    </PressableScale>
                    <PressableScale
                      className="flex-1 py-2 rounded-xl bg-[#FF5A5F] items-center"
                      onPress={() => handleRemove(confirmRemove)}
                    >
                      <Text className="text-sm text-white font-bold">Remove</Text>
                    </PressableScale>
                  </View>
                </Card>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}
