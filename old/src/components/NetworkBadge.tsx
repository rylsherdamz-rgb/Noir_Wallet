import { View, Text, StyleSheet } from 'react-native'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { StellarNetwork } from '@/types'

interface NetworkBadgeProps {
  network: StellarNetwork
  size?: 'sm' | 'md'
}

export function NetworkBadge({ network, size = 'sm' }: NetworkBadgeProps) {
  const isTestnet = network === 'testnet'
  return (
    <View style={[styles.badge, size === 'md' && styles.badgeMd, isTestnet ? styles.testnet : styles.mainnet]}>
      <View style={[styles.dot, isTestnet ? styles.dotTestnet : styles.dotMainnet]} />
      <Text style={[styles.label, size === 'md' && styles.labelMd]}>
        {isTestnet ? 'TESTNET' : 'MAINNET'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  testnet: {
    backgroundColor: Colors.warning + '15',
  },
  mainnet: {
    backgroundColor: Colors.success + '15',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotTestnet: {
    backgroundColor: Colors.warning,
  },
  dotMainnet: {
    backgroundColor: Colors.success,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.mutedWhite,
  },
  labelMd: {
    fontSize: FontSize.sm,
  },
})
