import { popup } from '@/components/popup/Popup'
import { hasContractsConfigured } from '@/constants/config'

/**
 * One confirmation for every place that switches networks (Dashboard badge,
 * Settings). Crossing between test and real money is worth a deliberate tap,
 * and a network with no deployed contracts is a dead end worth naming.
 */
export function confirmNetworkSwitch(target: 'testnet' | 'mainnet', onConfirm: () => void) {
  const toMainnet = target === 'mainnet'
  const missingContracts = !hasContractsConfigured(target)
  popup.confirm({
    title: toMainnet ? 'Switch to mainnet?' : 'Switch to testnet?',
    icon: toMainnet ? 'globe-outline' : 'flask-outline',
    tone: toMainnet ? 'warning' : 'brand',
    message: [
      toMainnet
        ? 'Mainnet moves real XLM. Transactions cannot be reversed.'
        : 'Testnet uses free test XLM. Balances and history are not real.',
      missingContracts
        ? `No ${target} contract IDs are configured in this build, so card and agent features will not work there.`
        : '',
    ].filter(Boolean).join(' '),
    confirmLabel: toMainnet ? 'Use mainnet' : 'Use testnet',
  }).then((ok) => { if (ok) onConfirm() })
}
