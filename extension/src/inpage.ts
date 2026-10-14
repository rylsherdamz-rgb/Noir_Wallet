/**
 * Runs in the page (MAIN world) and exposes `window.noir.stellar`, a SEP-43
 * provider: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md
 * Every call resolves (never rejects) with the SEP-43 result, or `{ error }`.
 * It holds nothing secret; it only forwards requests to the extension.
 */
import { PAGE_SOURCE, RELAY_SOURCE, type DappMethod, type DappResponse, type SignOpts, type WalletError } from './shared/protocol'

type WithError<T> = T & { error?: WalletError }

let seq = 0
const waiting = new Map<string, (r: DappResponse) => void>()

window.addEventListener('message', (e: MessageEvent) => {
  if (e.source !== window || e.data?.source !== RELAY_SOURCE) return
  const done = waiting.get(e.data.id)
  if (done) { waiting.delete(e.data.id); done(e.data.response) }
})

function call<T>(method: DappMethod, params?: Record<string, unknown>): Promise<WithError<T>> {
  const id = `noir-${Date.now()}-${++seq}`
  return new Promise((resolve) => {
    waiting.set(id, (r) => resolve(r.ok ? (r.result as WithError<T>) : ({ error: r.error } as WithError<T>)))
    window.postMessage({ source: PAGE_SOURCE, id, request: { method, params } }, window.location.origin)
  })
}

const stellar = Object.freeze({
  isNoir: true as const,
  version: '0.1.0',
  isConnected: () => call<{ isConnected: boolean }>('isConnected'),
  isAllowed: () => call<{ isAllowed: boolean }>('isAllowed'),
  requestAccess: () => call<{ address: string }>('requestAccess'),
  getAddress: () => call<{ address: string }>('getAddress'),
  getNetwork: () => call<{ network: string; networkPassphrase: string }>('getNetwork'),
  signTransaction: (xdr: string, opts?: SignOpts) =>
    call<{ signedTxXdr: string; signerAddress: string }>('signTransaction', { xdr, opts }),
  signAuthEntry: (authEntry: string, opts?: SignOpts) =>
    call<{ signedAuthEntry: string; signerAddress: string }>('signAuthEntry', { authEntry, opts }),
  signMessage: (message: string, opts?: SignOpts) =>
    call<{ signedMessage: string; signerAddress: string }>('signMessage', { message, opts }),
})

const w = window as unknown as { noir?: { stellar: typeof stellar } }
if (!w.noir) {
  Object.defineProperty(window, 'noir', { value: Object.freeze({ stellar }), writable: false, configurable: false })
  window.dispatchEvent(new Event('noir#initialized'))
}
