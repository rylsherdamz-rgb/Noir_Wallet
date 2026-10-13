import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { Ionicons } from '@expo/vector-icons'
import { colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { walletService, WalletListItem } from '@/services/wallet'
import { Button } from '@/components/Button'
import { Sheet, popup } from '@/components/popup/Popup'
import { TextAction } from '@/components/ui/List'

interface WalletSwitcherProps {
  onImportRequest: () => void
}

export function WalletSwitcher({ onImportRequest }: WalletSwitcherProps) {
  const [wallets, setWallets] = useState<WalletListItem[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(false)

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
      popup.notice({
        title: 'This wallet is active',
        message: 'Switch to another wallet first, then remove this one.',
        icon: 'swap-horizontal-outline',
        buttonLabel: 'OK',
      })
      return
    }
    const ok = await popup.confirm({
      title: 'Remove wallet?',
      message: 'It disappears from this list only. You can restore it any time with its recovery phrase.',
      icon: 'trash-outline',
      tone: 'danger',
      details: [{ label: 'Wallet', value: displayAddress(publicKey), mono: true }],
      confirmLabel: 'Remove',
      cancelLabel: 'Keep',
    })
    if (!ok) return
    await walletService.removeWalletFromList(publicKey)
    if (activeIndex >= wallets.length - 1) {
      await walletService.switchToWallet(Math.max(0, activeIndex - 1))
    }
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

      <Sheet
        visible={visible}
        onClose={() => setVisible(false)}
        title="My Wallets"
        subtitle="Tap to switch. Long-press to remove."
        footer={
          <TextAction label="Import another wallet" icon="download-outline" onPress={() => { setVisible(false); onImportRequest() }} />
        }
      >
        {wallets.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={40} color={Colors.mutedWhite} />
            <Text style={styles.emptyText}>No wallets yet</Text>
            <Text style={styles.emptySub}>Create or import a wallet to get started</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {wallets.map((w, i) => {
              const active = i === activeIndex
              return (
                <PressableScale
                  key={w.stellarPublic}
                  style={[styles.walletRow, active && styles.walletRowActive]}
                  onPress={() => handleSwitch(i)}
                  onLongPress={() => handleRemove(w.stellarPublic)}
                  accessibilityRole="button"
                  accessibilityLabel={`${w.label || `Wallet ${i + 1}`}${active ? ', active' : ''}`}
                  accessibilityHint="Long-press to remove"
                >
                  <View style={[styles.walletDot, active && styles.walletDotActive]} />
                  <View style={styles.walletInfo}>
                    <Text style={[styles.walletLabel, active && styles.walletLabelActive]}>
                      {w.label || `Wallet ${i + 1}`}
                    </Text>
                    <Text style={styles.walletAddress}>{displayAddress(w.stellarPublic)}</Text>
                  </View>
                  {active && <Ionicons name="checkmark" size={20} color={Colors.gold} accessibilityLabel="Active" />}
                </PressableScale>
              )
            })}
          </View>
        )}
      </Sheet>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: Spacing.sm,
    gap: 14,
  },
  triggerInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  triggerText: {
    fontSize: FontSize.md - 1,
    color: Colors.white,
    fontWeight: FontWeight.medium,
  },
  triggerSubText: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: Fonts.mono,
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
  list: {},
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: Spacing.sm,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.midGrey,
  },
  walletRowActive: {},
  walletDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.borderGrey, marginHorizontal: 9 },
  walletDotActive: { backgroundColor: Colors.gold },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconActive: {
    backgroundColor: colorWithOpacity(Colors.gold, 0.12),
    borderWidth: 1,
    borderColor: colorWithOpacity(Colors.gold, 0.35),
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSize.md,
    color: Colors.cream,
  },
  walletLabelActive: {},
  walletAddress: {
    fontSize: FontSize.xs,
    color: Colors.mutedWhite,
    fontFamily: Fonts.mono,
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: colorWithOpacity(Colors.gold, 0.12),
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold },
  activeBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
})