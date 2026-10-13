/**
 * Pure helpers for "you received a payment" notifications. Kept free of
 * native modules so they can be unit-tested; paymentNotifier wires them to
 * Horizon, storage and expo-notifications.
 */

/** The subset of a Horizon `/payments` record the notifier reads. */
export interface HorizonPaymentRecord {
  id: string
  paging_token: string
  type: string
  transaction_successful?: boolean
  from?: string
  to?: string
  amount?: string
  asset_type?: string
  asset_code?: string
  funder?: string
  account?: string
  starting_balance?: string
}

export interface IncomingPayment {
  id: string
  cursor: string
  from: string
  to: string
  amount: string
  assetCode: string
}

/**
 * Money that arrived at `account` from someone else, oldest first.
 *
 * `records` is a Horizon page in DESCENDING order (newest first). Only records
 * newer than `lastCursor` count. Transfers whose sender is one of `ownAccounts`
 * (main wallet → card top-ups, card → main sweeps) are not "received" and are
 * skipped, as are failed transactions.
 */
export function newIncomingPayments(
  records: HorizonPaymentRecord[],
  account: string,
  lastCursor: string,
  ownAccounts: ReadonlySet<string>,
): IncomingPayment[] {
  const out: IncomingPayment[] = []
  for (const r of records) {
    if (r.paging_token === lastCursor) break
    if (r.transaction_successful === false) continue
    const p = toIncoming(r)
    if (!p || p.to !== account || ownAccounts.has(p.from)) continue
    out.push(p)
  }
  return out.reverse()
}

function toIncoming(r: HorizonPaymentRecord): IncomingPayment | null {
  if (r.type === 'payment' && r.to && r.from && r.amount) {
    return {
      id: r.id,
      cursor: r.paging_token,
      from: r.from,
      to: r.to,
      amount: r.amount,
      assetCode: r.asset_type === 'native' ? 'XLM' : (r.asset_code ?? '?'),
    }
  }
  if (r.type === 'create_account' && r.account && r.funder && r.starting_balance) {
    return { id: r.id, cursor: r.paging_token, from: r.funder, to: r.account, amount: r.starting_balance, assetCode: 'XLM' }
  }
  return null
}

const shortKey = (k: string) => `${k.slice(0, 4)}…${k.slice(-4)}`

/** Notification copy for one received payment. `toLabel` names the receiving account ("your wallet", a card name). */
export function incomingNotification(p: IncomingPayment, toLabel: string): { title: string; body: string } {
  const amount = Number(p.amount)
  const shown = Number.isFinite(amount) ? amount.toFixed(2) : p.amount
  return {
    title: `Received ${shown} ${p.assetCode}`,
    body: `From ${shortKey(p.from)} to ${toLabel}`,
  }
}
