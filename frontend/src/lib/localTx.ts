import type { Transaction } from '@/types'
import { useAppStore } from '@/store/useAppStore'

/**
 * Local activity entries for payments this phone starts.
 *
 * Horizon only lists a payment once it is in a ledger, so a send, card
 * top-up or NFC tap was invisible in Activity while it was in flight. Each
 * flow now records a pending entry the moment it starts and settles it when
 * Stellar answers. `mergeHistory` keeps those entries until Horizon has the
 * same hash, and carries the card link and label over to the on-chain row so
 * a card's own Activity doesn't lose the payment once it confirms.
 */

export function startLocalTx(fields: {
  merchantName: string
  amountCents: number
  direction: 'in' | 'out'
  deviceId?: string
  merchantId?: string
}): string {
  const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const { user, addTransaction } = useAppStore.getState()
  addTransaction({
    id,
    stellarTxHash: null,
    merchantId: fields.merchantId ?? '',
    merchantName: fields.merchantName,
    userId: user?.id || 'local',
    deviceId: fields.deviceId ?? '',
    amountCents: fields.amountCents,
    assetCode: 'XLM',
    status: 'pending',
    errorMessage: null,
    createdAt: new Date().toISOString(),
    direction: fields.direction,
  })
  return id
}

/** Attach the hash and/or final status once Stellar answers. */
export function settleLocalTx(id: string, updates: Partial<Pick<Transaction, 'stellarTxHash' | 'status' | 'errorMessage'>>): void {
  useAppStore.getState().updateTransaction(id, updates)
}

/** Nothing reached the network (e.g. the card's key is missing) — remove the entry. */
export function dropLocalTx(id: string): void {
  useAppStore.getState().removeTransaction(id)
}

/**
 * Merge Horizon history with local entries, newest first. A local entry is
 * replaced by the on-chain row with the same hash; the on-chain row inherits
 * its card link (`deviceId`) and its label when it has none of its own.
 */
export function mergeHistory(onChain: Transaction[], local: Transaction[]): Transaction[] {
  const localByHash = new Map(local.filter((t) => t.stellarTxHash).map((t) => [t.stellarTxHash!, t]))
  const chainHashes = new Set(onChain.map((t) => t.stellarTxHash).filter(Boolean))
  const chainIds = new Set(onChain.map((t) => t.id))
  const enriched = onChain.map((t) => {
    const mine = t.stellarTxHash ? localByHash.get(t.stellarTxHash) : undefined
    return mine?.deviceId && !t.deviceId ? { ...t, deviceId: mine.deviceId, merchantName: mine.merchantName } : t
  })
  const localOnly = local.filter((t) => !chainIds.has(t.id) && !(t.stellarTxHash && chainHashes.has(t.stellarTxHash)))
  return [...enriched, ...localOnly].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
