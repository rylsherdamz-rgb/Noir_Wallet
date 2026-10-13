/**
 * Shared presentation rules for a Transaction, so the dashboard, the history
 * list and the detail screen can never disagree about sign or wording.
 */
import type { Transaction } from '@/types'

// Local records written before on-chain history carried `direction`.
const LEGACY_INCOMING_NAMES = new Set(['NFC Receive', 'NFC Payment'])

/** Money coming in? On-chain history says so explicitly via `direction`. */
export function isIncomingTx(tx: Pick<Transaction, 'direction' | 'merchantName'>): boolean {
  if (tx.direction) return tx.direction === 'in'
  return LEGACY_INCOMING_NAMES.has(tx.merchantName)
}

/** 1000000 cents → "10,000.00" (grouping done by hand; no Intl dependency). */
export function formatAmount(amountCents: number): string {
  const negative = amountCents < 0
  const fixed = (Math.abs(amountCents) / 100).toFixed(2)
  const [whole, frac] = fixed.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${negative ? '-' : ''}${grouped}.${frac}`
}

/** "+10,000.00 XLM" / "−25.00 XLM"; failed transactions moved nothing, so no sign. */
export function formatSignedAmount(tx: Pick<Transaction, 'direction' | 'merchantName' | 'amountCents' | 'assetCode' | 'status'>): string {
  const sign = tx.status === 'failed' ? '' : isIncomingTx(tx) ? '+' : '−'
  return `${sign}${formatAmount(tx.amountCents ?? 0)} ${tx.assetCode || 'XLM'}`
}

/**
 * On-chain history names a record "Account funded · GABC…WXYZ". The title is
 * the part before the separator; the counterparty is shown on its own row.
 */
export function txTitle(tx: Pick<Transaction, 'merchantName'>): string {
  return (tx.merchantName || 'Transaction').split(' · ')[0]
}

/** "GABCD…WXYZ" for a Stellar address; anything else is returned unchanged. */
export function shortAddress(value: string | null | undefined): string {
  if (!value) return ''
  return /^[GC][A-Z2-7]{55}$/.test(value) ? `${value.slice(0, 5)}…${value.slice(-5)}` : value
}
