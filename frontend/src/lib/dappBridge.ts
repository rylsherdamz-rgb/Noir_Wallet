/**
 * dApp bridge for the Browse tab: the `window.noir` provider injected into
 * web pages, and the pure helpers the native side uses to validate requests
 * and describe a transaction before the user signs it.
 *
 * Trust model:
 * - The page only ever receives the wallet address and signed XDR. Keys stay
 *   in native code; there is no method that exposes them.
 * - The origin shown to the user comes from the WebView (native), never from
 *   the message payload.
 * - Messages must carry a per-session nonce that is injected into the main
 *   frame only, so iframes can't impersonate the page.
 * - Nothing is signed without an approval sheet; the dApp submits the
 *   transaction itself.
 */
import {
  Address,
  FeeBumpTransaction,
  Networks,
  Operation,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk/axios'

export type DappMethod =
  | 'isAllowed'
  | 'requestAccess'
  | 'getAddress'
  | 'getNetwork'
  | 'getNetworkDetails'
  | 'signTransaction'

const METHODS: readonly DappMethod[] = ['isAllowed', 'requestAccess', 'getAddress', 'getNetwork', 'getNetworkDetails', 'signTransaction']

export interface DappRequest {
  id: string
  method: DappMethod
  params: { xdr?: string; networkPassphrase?: string; address?: string }
}

/** Error codes returned to the page (Freighter-style shape: `{ error: { code, message } }`). */
export const DappError = {
  internal: -1,
  invalidRequest: -2,
  notConnected: -3,
  userDeclined: -4,
} as const

export interface DappErrorResult { error: { code: number; message: string } }

export function dappError(code: number, message: string): DappErrorResult {
  return { error: { code, message } }
}

/** Largest XDR we'll parse — a real envelope is a few KB. */
const MAX_XDR_LENGTH = 100_000

/** Parse a bridge message; null for anything that isn't a well-formed request from this session. */
export function parseBridgeMessage(raw: string, nonce: string): DappRequest | null {
  let msg: any
  try { msg = JSON.parse(raw) } catch { return null }
  if (!msg || typeof msg !== 'object' || msg.noir !== nonce) return null
  if (typeof msg.id !== 'string' || msg.id.length === 0 || msg.id.length > 64) return null
  if (!METHODS.includes(msg.method)) return null
  const p = msg.params && typeof msg.params === 'object' ? msg.params : {}
  const str = (v: unknown, max: number) => (typeof v === 'string' && v.length <= max ? v : undefined)
  return {
    id: msg.id,
    method: msg.method,
    params: {
      xdr: str(p.xdr, MAX_XDR_LENGTH),
      networkPassphrase: str(p.networkPassphrase, 200),
      address: str(p.address, 56),
    },
  }
}

/** Origin of an https page; null for anything else (http, file, data, about:blank). */
export function httpsOrigin(url: string): string | null {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' ? `${u.protocol}//${u.host}` : null
  } catch {
    return null
  }
}

export type WalletNetwork = 'testnet' | 'mainnet'

export function networkDetails(network: WalletNetwork) {
  return network === 'mainnet'
    ? { network: 'PUBLIC', networkPassphrase: Networks.PUBLIC }
    : { network: 'TESTNET', networkPassphrase: Networks.TESTNET }
}

export interface TxOperationSummary {
  label: string
  detail: string
  /** Changes who controls the account or empties it. */
  risky: boolean
  /** Operation acts on an account other than the signer's. */
  foreignSource: boolean
}

export interface TxSummary {
  source: string
  feeXlm: string
  memo: string | null
  feeBump: boolean
  operations: TxOperationSummary[]
  /** The account being signed for is not the transaction source. */
  foreignSource: boolean
}

const STROOPS_PER_XLM = 10_000_000

function trimAmount(amount: string): string {
  return amount.includes('.') ? amount.replace(/\.?0+$/, '') : amount
}

function assetLabel(asset: { isNative(): boolean; getCode(): string } | undefined): string {
  if (!asset) return 'asset'
  return asset.isNative() ? 'XLM' : asset.getCode()
}

function short(addr: string | undefined): string {
  return addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : '—'
}

function describeHostFunction(fn: xdr.HostFunction): string {
  if (fn.switch().value === xdr.HostFunctionType.hostFunctionTypeInvokeContract().value) {
    const call = fn.invokeContract()
    const contract = Address.fromScAddress(call.contractAddress()).toString()
    return `${call.functionName().toString()} on contract ${short(contract)}`
  }
  if (fn.switch().value === xdr.HostFunctionType.hostFunctionTypeUploadContractWasm().value) return 'Upload contract code'
  return 'Deploy a contract'
}

type TxOperation = Transaction['operations'][number]

function describeOperation(op: TxOperation): Pick<TxOperationSummary, 'label' | 'detail' | 'risky'> {
  switch (op.type) {
    case 'payment':
      return { label: 'Send', detail: `${trimAmount(op.amount)} ${assetLabel(op.asset)} to ${short(op.destination)}`, risky: false }
    case 'createAccount':
      return { label: 'Create account', detail: `${trimAmount(op.startingBalance)} XLM to ${short(op.destination)}`, risky: false }
    case 'pathPaymentStrictSend':
      return { label: 'Swap & send', detail: `${trimAmount(op.sendAmount)} ${assetLabel(op.sendAsset)} → at least ${trimAmount(op.destMin)} ${assetLabel(op.destAsset)} to ${short(op.destination)}`, risky: false }
    case 'pathPaymentStrictReceive':
      return { label: 'Swap & send', detail: `up to ${trimAmount(op.sendMax)} ${assetLabel(op.sendAsset)} → ${trimAmount(op.destAmount)} ${assetLabel(op.destAsset)} to ${short(op.destination)}`, risky: false }
    case 'changeTrust':
      return { label: 'Trust asset', detail: 'getCode' in op.line ? `${(op.line as any).getCode()}${Number(op.limit) === 0 ? ' (remove)' : ''}` : 'liquidity pool share', risky: false }
    case 'manageSellOffer':
    case 'manageBuyOffer':
    case 'createPassiveSellOffer':
      return { label: 'Trade offer', detail: `${assetLabel((op as any).selling)} for ${assetLabel((op as any).buying)}`, risky: false }
    case 'invokeHostFunction':
      return { label: 'Contract call', detail: describeHostFunction(op.func), risky: false }
    case 'accountMerge':
      return { label: 'Close account', detail: `Sends ALL XLM to ${short(op.destination)} and deletes the account`, risky: true }
    case 'setOptions': {
      const o = op as Operation.SetOptions
      const authChange = o.signer != null || o.masterWeight != null || o.lowThreshold != null || o.medThreshold != null || o.highThreshold != null
      return { label: 'Account settings', detail: authChange ? 'Changes who can sign for this account' : 'Updates account settings', risky: authChange }
    }
    default:
      return { label: op.type.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), detail: '', risky: false }
  }
}

/**
 * Decode an envelope for the approval sheet. Throws if it isn't valid XDR for
 * the given network (signatures are network-bound, so a mismatch must fail).
 */
export function summarizeTransaction(envelopeXdr: string, networkPassphrase: string, signer: string): TxSummary {
  const parsed = TransactionBuilder.fromXDR(envelopeXdr, networkPassphrase)
  const feeBump = parsed instanceof FeeBumpTransaction
  const tx: Transaction = feeBump ? (parsed as FeeBumpTransaction).innerTransaction : (parsed as Transaction)
  const source = feeBump ? (parsed as FeeBumpTransaction).feeSource : tx.source
  const memo = tx.memo.type === 'text' ? String(tx.memo.value) : tx.memo.type === 'none' ? null : `${tx.memo.type} memo`
  const operations = tx.operations.map((op) => {
    const opSource = op.source ?? tx.source
    return { ...describeOperation(op), foreignSource: opSource !== signer }
  })
  return {
    source,
    feeXlm: trimAmount((Number(parsed.fee) / STROOPS_PER_XLM).toFixed(7)),
    memo,
    feeBump,
    operations,
    foreignSource: source !== signer,
  }
}

/** JS injected into the main frame before page scripts run. */
export function buildProviderScript(nonce: string): string {
  return `(function () {
  if (window.noir || !window.ReactNativeWebView) return;
  var NONCE = ${JSON.stringify(nonce)};
  var pending = {};
  var seq = 0;
  function call(method, params) {
    return new Promise(function (resolve) {
      var id = 'n' + (++seq) + '_' + Date.now();
      pending[id] = resolve;
      window.ReactNativeWebView.postMessage(JSON.stringify({ noir: NONCE, id: id, method: method, params: params || {} }));
    });
  }
  Object.defineProperty(window, '__noirResolve', {
    value: function (id, result) { var r = pending[id]; if (r) { delete pending[id]; r(result); } },
  });
  var api = Object.freeze({
    isNoir: true,
    isConnected: function () { return Promise.resolve({ isConnected: true }); },
    isAllowed: function () { return call('isAllowed'); },
    requestAccess: function () { return call('requestAccess'); },
    getAddress: function () { return call('getAddress'); },
    getNetwork: function () { return call('getNetwork'); },
    getNetworkDetails: function () { return call('getNetworkDetails'); },
    signTransaction: function (xdr, opts) {
      opts = opts || {};
      return call('signTransaction', { xdr: xdr, networkPassphrase: opts.networkPassphrase, address: opts.address });
    },
  });
  Object.defineProperty(window, 'noir', { value: api });
  window.dispatchEvent(new Event('noir#initialized'));
})();
true;`
}

/** JS that delivers a result to the page's pending promise. */
export function buildResponseScript(id: string, result: unknown): string {
  // U+2028/2029 are valid in JSON but end a line in older JS engines.
  const safe = (v: unknown) => JSON.stringify(v).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
  return `window.__noirResolve && window.__noirResolve(${safe(id)}, ${safe(result)}); true;`
}
