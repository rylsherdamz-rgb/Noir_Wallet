import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Modal, Alert } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
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
        style={styles.trigger}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Switch wallet"
      >
        <Ionicons name="wallet-outline" size={18} color={Colors.gold} />
        <View style={styles.triggerInfo}>
          <Text style={styles.triggerText}>
            {wallets[activeIndex]?.label || `Wallet ${activeIndex + 1}`}
          </Text>
          <Text style={styles.triggerSubText} numberOfLines={1}>
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
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>My Wallets</Text>
              <PressableScale onPress={() => setVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={Colors.mutedWhite} />
              </PressableScale>
            </View>

            {wallets.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="wallet-outline" size={48} color={Colors.mutedWhite} />
                <Text style={styles.emptyText}>No wallets yet</Text>
                <Text style={styles.emptySub}>Create or import a wallet to get started</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {wallets.map((w, i) => (
                  <PressableScale
                    key={w.stellarPublic}
                    style={[styles.walletRow, i === activeIndex && styles.walletRowActive]}
                    onPress={() => handleSwitch(i)}
                    onLongPress={() => setConfirmRemove(w.stellarPublic)}
                  >
                    <View style={styles.walletIcon}>
                      <Ionicons
                        name="wallet"
                        size={20}
                        color={i === activeIndex ? Colors.gold : Colors.mutedWhite}
                      />
                    </View>
                    <View style={styles.walletInfo}>
                      <Text style={[styles.walletLabel, i === activeIndex && styles.walletLabelActive]}>
                        {w.label || `Wallet ${i + 1}`}
                      </Text>
                      <Text style={styles.walletAddress}>{displayAddress(w.stellarPublic)}</Text>
                    </View>
                    {i === activeIndex ? (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
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
              <View style={styles.confirmOverlay}>
                <Card>
                  <Text style={styles.confirmTitle}>Remove Wallet?</Text>
                  <Text style={styles.confirmSub}>
                    {displayAddress(confirmRemove)} will be removed from the list.
                    Keys remain accessible via recovery phrase.
                  </Text>
                  <View style={styles.confirmActions}>
                    <PressableScale
                      style={styles.confirmCancel}
                      onPress={() => setConfirmRemove(null)}
                    >
                      <Text style={styles.confirmCancelText}>Keep</Text>
                    </PressableScale>
                    <PressableScale
                      style={styles.confirmDelete}
                      onPress={() => handleRemove(confirmRemove)}
                    >
                      <Text style={styles.confirmDeleteText}>Remove</Text>
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

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  triggerInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  triggerText: {
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  triggerSubText: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: Fonts.mono,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.midGrey,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.medium,
  },
  emptySub: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
  },
  list: {
    marginBottom: Spacing.md,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    gap: Spacing.md,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  walletRowActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '10',
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.white,
  },
  walletLabelActive: {
    color: Colors.gold,
  },
  walletAddress: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  activeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '20',
  },
  activeBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  confirmTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  confirmSub: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginBottom: Spacing.md,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
  },
  confirmDelete: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.danger,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
})