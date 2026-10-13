import type { Ionicons } from '@expo/vector-icons'

/**
 * Apps listed on the Browse tab. Each opens in the in-app browser; none gets
 * a bridge to the wallet unless the user connects it.
 *
 * `scf: true` = the project received a Stellar Community Fund award, checked
 * against communityfund.stellar.org/projects (2026-10-09). Re-check links
 * before adding to or reordering this list; projects do shut down.
 */
export interface StellarApp {
  name: string
  url: string
  /** Opened instead of `url` while the wallet is on Testnet. */
  testnetUrl?: string
  desc: string
  icon: keyof typeof Ionicons.glyphMap
  scf?: boolean
}

export const SCF_DIRECTORY_URL = 'https://communityfund.stellar.org/projects'

export const POPULAR_APPS: StellarApp[] = [
  { name: 'StellarExpert', url: 'https://stellar.expert/explorer/public', testnetUrl: 'https://stellar.expert/explorer/testnet', desc: 'Explorer', icon: 'search-outline' },
  { name: 'Stellar Lab', url: 'https://lab.stellar.org', desc: 'Developer tools', icon: 'flask-outline' },
  { name: 'Soroswap', url: 'https://app.soroswap.finance', desc: 'Swap tokens', icon: 'swap-horizontal-outline', scf: true },
  { name: 'Aquarius', url: 'https://aqua.network', desc: 'Liquidity & rewards', icon: 'water-outline', scf: true },
  { name: 'Blend', url: 'https://mainnet.blend.capital', testnetUrl: 'https://testnet.blend.capital', desc: 'Lend & borrow', icon: 'layers-outline' },
  { name: 'StellarTerm', url: 'https://stellarterm.com', desc: 'Trade', icon: 'trending-up-outline' },
]

/** SCF-funded apps not already in POPULAR_APPS, most broadly useful first. */
export const SCF_APPS: StellarApp[] = [
  { name: 'Phoenix', url: 'https://app.phoenix-hub.io', desc: 'Swap, pools & staking', icon: 'flame-outline', scf: true },
  { name: 'Stellar Broker', url: 'https://stellar.broker', desc: 'Best-price swaps across DEXs', icon: 'git-merge-outline', scf: true },
  { name: 'DeFindex', url: 'https://app.defindex.io', desc: 'Yield vaults', icon: 'pie-chart-outline', scf: true },
  { name: 'Allbridge Core', url: 'https://core.allbridge.io', desc: 'Bridge stablecoins to other chains', icon: 'git-compare-outline', scf: true },
  { name: 'FxDAO', url: 'https://app.fxdao.io', desc: 'Stablecoin vaults', icon: 'cash-outline', scf: true },
  { name: 'Orbit CDP', url: 'https://orbitcdp.finance', desc: 'Decentralized stablecoins', icon: 'planet-outline', scf: true },
  { name: 'Laina', url: 'https://laina-de.fi', desc: 'Lend & borrow', icon: 'business-outline', scf: true },
  { name: 'Hoops Finance', url: 'https://hoops.fi', desc: 'Liquidity pool analytics', icon: 'analytics-outline', scf: true },
  { name: 'Trustless Work', url: 'https://www.trustlesswork.com', desc: 'Escrow for payments', icon: 'shield-checkmark-outline', scf: true },
  { name: 'Reflector', url: 'https://reflector.network', desc: 'Price oracle', icon: 'pulse-outline', scf: true },
  { name: 'Scopuly', url: 'https://scopuly.com', desc: 'Wallet & DEX', icon: 'telescope-outline', scf: true },
  { name: 'Litemint', url: 'https://litemint.com', desc: 'Games & collectibles', icon: 'game-controller-outline', scf: true },
]

/** Text for the share sheet when someone recommends an app. */
export function recommendMessage(app: StellarApp): string {
  const funded = app.scf ? ' (funded by the Stellar Community Fund)' : ''
  return `${app.name}: ${app.desc} on Stellar${funded}. ${app.url}`
}
