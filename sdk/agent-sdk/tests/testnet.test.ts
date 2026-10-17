import { describe, it, expect } from 'vitest'
import { Keypair } from '@stellar/stellar-sdk'
import { NoirAgentClient, keypairSigner, NoirContractError } from '../src/index.js'

/** Live reads/writes against Noir's Testnet contracts. Opt in: npm run test:testnet */
describe.runIf(process.env.NOIR_TESTNET === '1')('Noir Testnet (live)', () => {
  const noir = new NoirAgentClient()
  const unknownDevice = '00'.repeat(32)

  it('reads: an unregistered device has no policy, no owner, zero escrow', async () => {
    expect(await noir.getPolicy(unknownDevice)).toBeNull()
    expect(await noir.getDeviceOwner(unknownDevice)).toBeNull()
    expect(await noir.getEscrowBalance(unknownDevice)).toBe(0n)
  }, 60_000)

  it('checkPayment refuses an agent that was never authorized', async () => {
    const check = await noir.checkPayment({
      deviceHash: unknownDevice, agent: Keypair.random().publicKey(),
      asset: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC', amount: 1n,
    })
    expect(check).toEqual({ ok: false, reason: 'no_agent' })
  }, 60_000)

  it('writes: claim with nothing pending is refused with NothingToClaim', async () => {
    const kp = Keypair.random()
    const res = await fetch(`https://friendbot.stellar.org/?addr=${kp.publicKey()}`)
    expect(res.ok).toBe(true)
    const err = await noir.claim({ merchant: keypairSigner(kp.secret()), token: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC' }).catch((e) => e)
    expect(err).toBeInstanceOf(NoirContractError)
    expect((err as NoirContractError).errorName).toBe('NothingToClaim')
  }, 90_000)

  it('events: pages through the last ~day of Noir events up to the latest ledger', async () => {
    const { latestLedger } = await noir.getEvents()
    const events = await noir.pastEvents(latestLedger - 17_000)
    // Quiet days are fine; whatever comes back must be decoded, ordered and ours.
    const ours = new Set(Object.values(noir.contracts))
    for (const e of events) expect(ours.has(e.contractId)).toBe(true)
    expect(events.map((e) => e.ledger)).toEqual([...events.map((e) => e.ledger)].sort((a, b) => a - b))
  }, 180_000)
})
