import { Networks } from '@stellar/stellar-sdk'

export type NetworkId = 'TESTNET' | 'PUBLIC'

export interface NetworkInfo {
  id: NetworkId
  /** SEP-43 network name. */
  name: NetworkId
  passphrase: string
  horizonUrl: string
  explorer: string
}

export const NETWORKS: Record<NetworkId, NetworkInfo> = {
  TESTNET: {
    id: 'TESTNET', name: 'TESTNET', passphrase: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org', explorer: 'https://stellar.expert/explorer/testnet',
  },
  PUBLIC: {
    id: 'PUBLIC', name: 'PUBLIC', passphrase: Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org', explorer: 'https://stellar.expert/explorer/public',
  },
}

export const networkByPassphrase = (p: string): NetworkInfo | undefined =>
  Object.values(NETWORKS).find((n) => n.passphrase === p)
