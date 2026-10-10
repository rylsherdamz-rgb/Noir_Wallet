/**
 * Receipt data passed to the /receipt route. Route params are strings, so the
 * shape is flat and (de)serialised here in one place.
 */
import type { useRouter } from 'expo-router'
import type { Transaction } from '@/types'
import { isIncomingTx, txTitle } from '@/lib/txFormat'

export interface ReceiptData {
  title: string
  amountCents: number
  assetCode: string
  direction: 'in' | 'out'
  status: 'confirmed' | 'pending' | 'failed'
  /** ISO 8601 */
  createdAt: string
  counterpartyLabel?: string
  counterparty?: string
  hash?: string
  /** One short line of context, e.g. "Prepaid tap balance for Card ••A1F3". */
  note?: string
}

export type ReceiptParams = Record<keyof ReceiptData, string>

export function toReceiptParams(r: ReceiptData): Partial<ReceiptParams> {
  const p: Partial<ReceiptParams> = {
    title: r.title,
    amountCents: String(r.amountCents),
    assetCode: r.assetCode,
    direction: r.direction,
    status: r.status,
    createdAt: r.createdAt,
  }
  if (r.counterpartyLabel) p.counterpartyLabel = r.counterpartyLabel
  if (r.counterparty) p.counterparty = r.counterparty
  if (r.hash) p.hash = r.hash
  if (r.note) p.note = r.note
  return p
}

export function fromReceiptParams(p: Partial<Record<string, string | string[]>>): ReceiptData | null {
  const get = (k: string) => {
    const v = p[k]
    return Array.isArray(v) ? v[0] : v
  }
  const title = get('title')
  const amount = Number(get('amountCents'))
  if (!title || !Number.isFinite(amount)) return null
  const status = get('status')
  return {
    title,
    amountCents: amount,
    assetCode: get('assetCode') || 'XLM',
    direction: get('direction') === 'in' ? 'in' : 'out',
    status: status === 'pending' || status === 'failed' ? status : 'confirmed',
    createdAt: get('createdAt') || new Date().toISOString(),
    counterpartyLabel: get('counterpartyLabel'),
    counterparty: get('counterparty'),
    hash: get('hash'),
    note: get('note'),
  }
}

/** Receipt for an existing history entry (Transaction Detail → "Receipt"). */
export function receiptFromTransaction(tx: Transaction): ReceiptData {
  const incoming = isIncomingTx(tx)
  const counterparty = tx.merchantId && tx.merchantId !== tx.userId && tx.merchantId !== 'me' ? tx.merchantId : undefined
  return {
    title: txTitle(tx),
    amountCents: tx.amountCents,
    assetCode: tx.assetCode,
    direction: incoming ? 'in' : 'out',
    status: tx.status,
    createdAt: tx.createdAt,
    counterpartyLabel: counterparty ? (incoming ? 'From' : 'To') : undefined,
    counterparty,
    hash: tx.stellarTxHash ?? undefined,
  }
}

/**
 * Show the receipt after a finished flow. `replace` so Back from the receipt
 * doesn't land on the spent amount-entry screen.
 */
export function openReceipt(router: ReturnType<typeof useRouter>, r: ReceiptData, how: 'replace' | 'push' = 'replace') {
  const target = { pathname: '/receipt' as const, params: toReceiptParams(r) }
  if (how === 'push') router.push(target)
  else router.replace(target)
}
