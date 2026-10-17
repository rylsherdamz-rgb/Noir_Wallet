import { scValToNative, xdr, type rpc } from '@stellar/stellar-sdk'
import type { NoirContracts } from './networks.js'
import { toHex } from './bytes.js'

/**
 * Every state change the three Noir contracts publish, decoded. These are the
 * hooks other apps react to: an agent appearing or being revoked, escrow moving,
 * a tap-to-pay authorization, a merchant claim.
 */
export type NoirEvent = NoirEventBase & (
  | { type: 'device.registered'; deviceHash: string; agent: string }
  | { type: 'device.revoked'; deviceHash: string }
  | { type: 'agent.registered'; deviceHash: string; agent: string }
  | { type: 'agent.revoked'; deviceHash: string }
  | { type: 'escrow.funded'; deviceHash: string; amount: bigint }
  | { type: 'escrow.defunded'; deviceHash: string; amount: bigint }
  | { type: 'escrow.swept'; deviceHash: string; amount: bigint }
  | { type: 'payment.authorized'; deviceHash: string; merchant: string; amount: bigint }
  | { type: 'payment.claimed'; merchant: string; amount: bigint }
)

export type NoirEventType = NoirEvent['type']

export interface NoirEventBase {
  /** Unique, stable event id from the RPC (safe to dedupe on). */
  id: string
  contractId: string
  ledger: number
  ledgerClosedAt: string
  txHash: string
}

export const NOIR_EVENT_TYPES: readonly NoirEventType[] = [
  'device.registered', 'device.revoked',
  'agent.registered', 'agent.revoked',
  'escrow.funded', 'escrow.defunded', 'escrow.swept',
  'payment.authorized', 'payment.claimed',
]

/** Contract event topic symbol → our event type, per contract. */
const TOPICS: Record<keyof NoirContracts, Record<string, NoirEventType>> = {
  deviceRegistry: { register: 'device.registered', revoke: 'device.revoked' },
  agentRegistry: { agent_reg: 'agent.registered', agent_rev: 'agent.revoked' },
  paymentEscrow: {
    fund: 'escrow.funded',
    defund: 'escrow.defunded',
    sweep: 'escrow.swept',
    authorize: 'payment.authorized',
    claim: 'payment.claimed',
  },
}

const hex = (v: xdr.ScVal) => toHex(scValToNative(v) as Uint8Array)
const addr = (v: xdr.ScVal) => String(scValToNative(v))
const amount = (v: xdr.ScVal) => BigInt(scValToNative(v) as bigint | number)

/**
 * Turns one raw RPC event into a NoirEvent, or null when it is not one of the
 * known Noir events (other contracts, failed calls, future event kinds).
 */
export function decodeEvent(raw: rpc.Api.EventResponse, contracts: NoirContracts): NoirEvent | null {
  if (!raw.inSuccessfulContractCall) return null
  const contractId = raw.contractId?.contractId()
  const which = (Object.keys(contracts) as (keyof NoirContracts)[]).find((k) => contracts[k] === contractId)
  if (!which || raw.topic.length === 0) return null

  let symbol: string
  try { symbol = String(scValToNative(raw.topic[0])) } catch { return null }
  const type = TOPICS[which][symbol]
  if (!type) return null

  const base: NoirEventBase = {
    id: raw.id,
    contractId: contractId!,
    ledger: raw.ledger,
    ledgerClosedAt: raw.ledgerClosedAt,
    txHash: raw.txHash,
  }
  const [, t1, t2] = raw.topic
  try {
    switch (type) {
      case 'device.registered':
      case 'agent.registered':
        return { ...base, type, deviceHash: hex(t1), agent: addr(raw.value) }
      case 'device.revoked':
      case 'agent.revoked':
        return { ...base, type, deviceHash: hex(t1) }
      case 'escrow.funded':
      case 'escrow.defunded':
      case 'escrow.swept':
        return { ...base, type, deviceHash: hex(t1), amount: amount(raw.value) }
      case 'payment.authorized':
        return { ...base, type, deviceHash: hex(t1), merchant: addr(t2), amount: amount(raw.value) }
      case 'payment.claimed':
        return { ...base, type, merchant: addr(t1), amount: amount(raw.value) }
    }
  } catch {
    return null // malformed payload: skip rather than break a watcher
  }
}

/** JSON-safe copy (bigint amounts as decimal strings), e.g. for webhook bodies. */
export function eventToJSON(e: NoirEvent): Record<string, unknown> {
  return Object.fromEntries(Object.entries(e).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v]))
}
