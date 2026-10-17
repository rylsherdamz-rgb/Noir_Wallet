/**
 * Messages between the page provider (inpage.ts), the content-script relay
 * (content.ts) and the background service worker. Results follow SEP-43:
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md
 */

export const PAGE_SOURCE = 'noir-wallet-page'
export const RELAY_SOURCE = 'noir-wallet-relay'

export type DappMethod =
  | 'isConnected' | 'isAllowed' | 'requestAccess' | 'getAddress' | 'getNetwork'
  | 'signTransaction' | 'signAuthEntry' | 'signMessage'

export interface SignOpts { networkPassphrase?: string; address?: string }

export interface DappRequest {
  method: DappMethod
  params?: { xdr?: string; authEntry?: string; message?: string; opts?: SignOpts }
}

/** SEP-43 error shape. Codes follow the kit/Freighter convention. */
export interface WalletError { code: number; message: string; ext?: string[] }

export const ERR = {
  internal: (message: string): WalletError => ({ code: -1, message }),
  invalid: (message: string): WalletError => ({ code: -2, message }),
  unsupported: (message: string): WalletError => ({ code: -3, message }),
  rejected: (): WalletError => ({ code: -4, message: 'The user rejected this request.' }),
}

export type DappResponse = { ok: true; result: unknown } | { ok: false; error: WalletError }

/** What the approval window is asked to show. */
export type ApprovalKind = 'connect' | 'signTransaction' | 'signAuthEntry' | 'signMessage'

export interface PendingApproval {
  id: string
  kind: ApprovalKind
  origin: string
  favicon?: string
  payload?: string
  networkPassphrase: string
  createdAt: number
}

/** Popup/approval window → background. */
export type UiMessage =
  | { type: 'state' }
  | { type: 'create'; password: string; mnemonic: string }
  | { type: 'unlock'; password: string }
  | { type: 'lock' }
  | { type: 'setNetwork'; network: 'TESTNET' | 'PUBLIC' }
  | { type: 'revokeOrigin'; origin: string }
  | { type: 'revealMnemonic'; password: string }
  | { type: 'reset' }
  | { type: 'pending'; id: string }
  | { type: 'resolve'; id: string; approve: boolean }
