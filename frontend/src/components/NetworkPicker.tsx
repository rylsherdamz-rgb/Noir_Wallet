import { useRef, useState } from 'react'
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { PressableScale } from '@/components/brand/PressableScale'
import { useAppStore } from '@/store/useAppStore'
import { confirmNetworkSwitch } from '@/lib/networkSwitch'
import { Colors, Spacing, FontSize, Fonts, Gradient } from '@/constants/theme'

type Net = 'testnet' | 'mainnet'

const NETWORKS: { key: Net; label: string; sub: string; color: string }[] = [
  { key: 'testnet', label: 'Testnet', sub: 'Test XLM · not real money', color: Colors.testnet },
  { key: 'mainnet', label: 'Mainnet', sub: 'Real XLM · payments are final', color: Colors.mainnet },
]

/**
 * Network chip + dropdown (Freighter / MetaMask style). The chip shows the
 * active network's dot and name; tapping opens a small menu anchored under it.
 * Choosing the other network still goes through confirmNetworkSwitch.
 * Network colours live only here — never on buttons (DESIGN.md → Color).
 */
export function NetworkPicker({ align = 'left' }: { align?: 'left' | 'right' }) {
  const network = useAppStore((s) => s.network) as Net
  const setNetwork = useAppStore((s) => s.setNetwork)
  const chip = useRef<View>(null)
  const [anchor, setAnchor] = useState<{ x: number; y: number; w: number } | null>(null)
  const active = NETWORKS.find((n) => n.key === network) ?? NETWORKS[0]

  const open = () => {
    Haptics.selectionAsync().catch(() => {})
    chip.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y: y + h + 6, w }))
  }
  const close = () => setAnchor(null)
  const choose = (net: Net) => {
    close()
    if (net !== network) confirmNetworkSwitch(net, () => setNetwork(net))
  }

  return (
    <>
      <View ref={chip} collapsable={false} style={styles.chipWrap}>
      <PressableScale
        style={styles.chip}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`Network: ${active.label}. Change network`}
        accessibilityState={{ expanded: !!anchor }}
      >
        <View style={[styles.dot, { backgroundColor: active.color }]} />
        <Text style={styles.chipText}>{active.label}</Text>
        <Ionicons name={anchor ? 'chevron-up' : 'chevron-down'} size={13} color={Colors.mutedWhite} />
      </PressableScale>
      </View>

      <Modal transparent visible={!!anchor} animationType="fade" onRequestClose={close} statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close network menu" />
        {anchor && (
          <View
            style={[styles.menu, { top: anchor.y }, align === 'left' ? { left: anchor.x } : { right: Spacing.md }]}
            accessibilityRole="menu"
          >
            {NETWORKS.map((n, i) => {
              const on = n.key === network
              return (
                <PressableScale
                  key={n.key}
                  style={[styles.item, i > 0 && styles.itemDivider]}
                  onPress={() => choose(n.key)}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: on }}
                >
                  <View style={[styles.dotLg, { backgroundColor: n.color }]} />
                  <View style={styles.itemText}>
                    <Text style={styles.itemLabel}>{n.label}</Text>
                    <Text style={styles.itemSub}>{n.sub}</Text>
                  </View>
                  {on && <Ionicons name="checkmark" size={18} color={Colors.gold} />}
                </PressableScale>
              )
            })}
          </View>
        )}
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  chipWrap: { alignSelf: 'flex-start' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 34, paddingHorizontal: 10, borderRadius: 999, backgroundColor: Colors.midGrey,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: FontSize.sm - 1, color: Colors.white, fontWeight: '500' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  menu: {
    position: 'absolute', width: 250, borderRadius: 16, overflow: 'hidden',
    backgroundColor: Gradient.elevated, borderWidth: 1, borderColor: Colors.borderGrey,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.55, shadowRadius: 30, elevation: 16,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.md, paddingVertical: 14 },
  itemDivider: { borderTopWidth: 1, borderTopColor: Gradient.panel },
  dotLg: { width: 10, height: 10, borderRadius: 5 },
  itemText: { flex: 1 },
  itemLabel: { fontFamily: Fonts.displayMd, fontSize: FontSize.md - 1, color: Colors.white },
  itemSub: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginTop: 2 },
})
