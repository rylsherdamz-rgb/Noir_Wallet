import { Address, scValToNative, StrKey, TransactionBuilder, xdr, type FeeBumpTransaction, type Transaction } from '@stellar/stellar-sdk'
import { parseAuthPreimage } from './signing'

/** Plain-language rows the approval window shows before anything is signed. */
export interface Described {
  title: string
  rows: { label: string; value: string; mono?: boolean }[]
  warnings: string[]
}

const short = (s: string) => (s.length > 14 ? `${s.slice(0, 6)}…${s.slice(-6)}` : s)
/** '12.5000000' → '12.5' */
const amt = (s: string) => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s)
const stroopsToXlm = (s: string | number) => (Number(s) / 1e7).toLocaleString(undefined, { maximumFractionDigits: 7 })

function nativeArg(v: xdr.ScVal): string {
  try {
    const n = scValToNative(v)
    return JSON.stringify(n, (_k, x) => (typeof x === 'bigint' ? x.toString() : x instanceof Uint8Array ? Buffer.from(x).toString('hex') : x))
  } catch {
    return v.switch().name
  }
}

function describeInvocation(fn: xdr.SorobanAuthorizedFunction | xdr.HostFunction): { label: string; value: string }[] {
  const name = fn.switch().name
  if (name === 'sorobanAuthorizedFunctionTypeContractFn' || name === 'hostFunctionTypeInvokeContract') {
    const args = (fn as xdr.SorobanAuthorizedFunction).contractFn?.() ?? (fn as xdr.HostFunction).invokeContract()
    const contract = Address.fromScAddress(args.contractAddress()).toString()
    const fnName = args.functionName().toString()
    return [
      { label: 'Contract', value: contract },
      { label: 'Function', value: fnName },
      ...args.args().map((a, i) => ({ label: `Argument ${i + 1}`, value: nativeArg(a) })),
    ]
  }
  return [{ label: 'Action', value: name.replace(/^.*Type/, '') }]
}

export function describeTransaction(txXdr: string, passphrase: string, myAddress: string): Described {
  let tx: Transaction | FeeBumpTransaction
  try {
    tx = TransactionBuilder.fromXDR(txXdr, passphrase)
  } catch {
    return { title: 'Unreadable transaction', rows: [], warnings: ['This is not a valid transaction for the selected network. Rejecting is recommended.'] }
  }
  const warnings: string[] = []
  const inner = 'innerTransaction' in tx ? tx.innerTransaction : tx
  const rows: Described['rows'] = [
    { label: 'Source account', value: inner.source, mono: true },
    { label: 'Max fee', value: `${stroopsToXlm(tx.fee)} XLM` },
  ]
  if (inner.source !== myAddress) warnings.push(`The transaction's source account (${short(inner.source)}) is not your wallet.`)
  if (inner.memo && inner.memo.type !== 'none') rows.push({ label: 'Memo', value: String(inner.memo.value) })

  inner.operations.forEach((op, i) => {
    const n = inner.operations.length > 1 ? ` ${i + 1}` : ''
    const source = op.source && op.source !== inner.source ? ` (from ${short(op.source)})` : ''
    switch (op.type) {
      case 'payment':
        rows.push({ label: `Payment${n}${source}`, value: `${amt(op.amount)} ${op.asset.isNative() ? 'XLM' : op.asset.getCode()} → ${op.destination}` })
        break
      case 'createAccount':
        rows.push({ label: `Create account${n}`, value: `${amt(op.startingBalance)} XLM → ${op.destination}` })
        break
      case 'changeTrust':
        rows.push({ label: `Trust asset${n}`, value: 'code' in op.line ? `${op.line.getCode()} (limit ${op.limit})` : 'liquidity pool' })
        break
      case 'invokeHostFunction':
        rows.push({ label: `Contract call${n}`, value: '' })
        for (const r of describeInvocation(op.func)) rows.push({ ...r, mono: true })
        if (op.auth?.length) rows.push({ label: 'Authorizations', value: String(op.auth.length) })
        break
      case 'setOptions':
        rows.push({ label: `Set options${n}`, value: 'Account settings change' })
        warnings.push('This changes account settings (signers, thresholds or flags). Only approve if you expected it.')
        break
      case 'accountMerge':
        rows.push({ label: `Merge account${n}`, value: `All XLM → ${op.destination}` })
        warnings.push('This closes the account and sends every lumen to another address.')
        break
      default:
        rows.push({ label: `Operation${n}`, value: op.type })
    }
  })
  return { title: inner.operations.length === 1 ? 'Sign transaction' : `Sign transaction (${inner.operations.length} operations)`, rows, warnings }
}

export function describeAuthEntry(authEntry: string): Described {
  try {
    const auth = parseAuthPreimage(authEntry).sorobanAuthorization()
    const rows = [
      ...describeInvocation(auth.invocation().function()).map((r) => ({ ...r, mono: true })),
      { label: 'Valid until ledger', value: String(auth.signatureExpirationLedger()) },
    ]
    const subs = auth.invocation().subInvocations().length
    if (subs) rows.push({ label: 'Nested calls', value: String(subs), mono: true })
    return { title: 'Authorize a contract call', rows, warnings: [] }
  } catch (e) {
    return { title: 'Unreadable authorization', rows: [], warnings: [String((e as Error).message)] }
  }
}

export const isAccount = (a: string) => StrKey.isValidEd25519PublicKey(a)
