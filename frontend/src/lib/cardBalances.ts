import { x402 } from '@/domain/x402'
import { logger } from '@/lib/logger'
import type { Device } from '@/types'

/** On-chain money behind one linked card, in cents (2-dp display units). null = not loaded. */
export interface CardBalance {
  /** XLM held by the card's agent wallet. */
  agentCents: number | null
  /** XLM locked in the payment escrow for this card (tap balance). */
  tapCents: number | null
}

/** Reads every card's agent-wallet and tap balances in parallel, keyed by device id. */
export async function loadCardBalances(devices: Device[], owner?: string): Promise<Record<string, CardBalance>> {
  const agents = await x402.listAgents().catch(() => [])
  const entries = await Promise.all(devices.map(async (d): Promise<[string, CardBalance]> => {
    const agent = agents.find((a) => a.deviceHash === d.deviceUidHash) ?? agents.find((a) => a.publicKey === d.agentPublicKey)
    let tapCents: number | null = null
    if (owner) {
      try {
        tapCents = Number((await x402.getEscrowBalance(d.deviceUidHash, owner)) / 100_000n)
      } catch (e: any) {
        logger.debug('card balances: escrow read failed', e?.message)
      }
    }
    return [d.id, { agentCents: agent ? Math.round(agent.balanceStroops / 100_000) : null, tapCents }]
  }))
  return Object.fromEntries(entries)
}
