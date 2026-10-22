/**
 * Live Testnet run of everything the popup can do with a card, through the
 * same Noir class the service worker uses: link → fund escrow → withdraw →
 * top up agent → change policy → pay → unlink. Opt-in, it needs the network:
 *   npm run test:testnet
 */
import { describe, expect, it } from 'vitest'
import { generateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { Keypair } from '@stellar/stellar-sdk'
import { deriveAgent, deriveFromSeed, seedOf } from '../src/shared/hd'
import { Noir, deviceHashOf, fromStroops } from '../src/shared/noir'

const live = process.env.NOIR_TESTNET === '1'
const friendbot = async (a: string) => {
  const r = await fetch(`https://friendbot.stellar.org/?addr=${a}`)
  if (!r.ok) throw new Error(`friendbot ${r.status}`)
}
const log = (k: string, v: unknown) => console.log(`  ${k}: ${v}`)

describe.skipIf(!live)('Testnet card lifecycle', () => {
  it('links, funds, withdraws, tops up, re-policies, pays and unlinks a card', async () => {
    const noir = new Noir('TESTNET')
    const seed = await seedOf(generateMnemonic(wordlist, 128))
    const wallet = await deriveFromSeed(seed, [44, 148, 0])
    const me = wallet.publicKey()
    await friendbot(me)
    log('wallet', me)

    // A random 7-byte NTAG213-style UID, as the popup would type or scan it.
    const uid = `04:${[...crypto.getRandomValues(new Uint8Array(6))].map((b) => b.toString(16).padStart(2, '0')).join(':')}`
    const deviceHash = await deviceHashOf(uid)
    log('uid', uid)

    const linked = await noir.link({ wallet, seed, deviceHash, maxXlm: 50, expiryDays: 0 })
    expect(linked.alreadyLinked).toBe(false)
    expect(linked.agent).toBe((await deriveAgent(seed, 2)).publicKey())
    let card = await noir.card(deviceHash, me)
    expect(card.active).toBe(true)
    expect(card.policy?.maxAmount).toBe(500_000_000n)
    log('linked, agent', linked.agent)

    // Linking again is a no-op, not a second agent.
    expect((await noir.link({ wallet, seed, deviceHash })).alreadyLinked).toBe(true)

    log('fund escrow', await noir.fundEscrow(wallet, deviceHash, 5))
    log('withdraw', await noir.withdrawEscrow(wallet, deviceHash, 2))
    expect(fromStroops((await noir.card(deviceHash, me)).escrow)).toBe(3)
    await expect(noir.withdrawEscrow(wallet, deviceHash, 10)).rejects.toThrow(/Only 3 XLM/)

    log('top up agent', await noir.topUpAgent(wallet, linked.agent, 3))
    expect((await noir.account(linked.agent)).xlm).toBe(3)

    log('set policy', await noir.setPolicy(wallet, deviceHash, 25, 7))
    card = await noir.card(deviceHash, me)
    expect(card.policy?.maxAmount).toBe(250_000_000n)
    expect(card.policy?.agent).toBe(linked.agent)
    expect(card.policy!.expiresAt! > new Date()).toBe(true)

    // The next card would get the next agent key: 2 is this card's, and its account exists.
    expect((await noir.allocateAgent(seed, me)).index).toBe(3)

    const stranger = Keypair.random().publicKey()
    log('pay (opens account)', await noir.pay(wallet, stranger, 1.5, 'noir test'))
    expect((await noir.account(stranger)).xlm).toBe(1.5)

    const before = (await noir.account(me)).xlm
    const r = await noir.unlink(wallet, deviceHash, await deriveAgent(seed, 2))
    log('unlink', JSON.stringify(r))
    expect(r.escrowReturned).toBe(3)
    expect(r.agentSwept).toBeGreaterThan(1.9)
    expect((await noir.ownership(deviceHash, me)).status).toBe('free')
    expect(await noir.policy(deviceHash)).toBeNull()
    expect((await noir.account(me)).xlm).toBeGreaterThan(before + 4.8)
    expect(await noir.cards(me)).toEqual([])
  }, 300_000)
})
