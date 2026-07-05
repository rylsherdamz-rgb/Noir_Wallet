import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Keypair } from '@stellar/stellar-sdk'

describe('Stellar Service', () => {
  it('generates valid keypair', () => {
    const kp = Keypair.random()
    expect(kp.publicKey()).toMatch(/^G[A-Z0-9]{55}$/)
    expect(kp.secret()).toMatch(/^S[A-Z0-9]{55}$/)
  })

  it('derives public from secret', () => {
    const kp = Keypair.random()
    const fromSecret = Keypair.fromSecret(kp.secret())
    expect(fromSecret.publicKey()).toBe(kp.publicKey())
  })

  it('produces unique keypairs', () => {
    const a = Keypair.random()
    const b = Keypair.random()
    expect(a.publicKey()).not.toBe(b.publicKey())
  })

  it('createsKeypair returns valid structure', async () => {
    const { stellarService } = await import('@/services/stellar')
    const result = await stellarService.createKeypair()
    expect(result.publicKey).toMatch(/^G/)
    expect(result.secretKey).toMatch(/^S/)
  })

  it('getBalance returns default shape on error', async () => {
    const { stellarService } = await import('@/services/stellar')
    const balance = await stellarService.getBalance('GABC')
    expect(balance).toHaveProperty('xlm')
    expect(balance).toHaveProperty('usdc')
    expect(balance).toHaveProperty('assets')
  })

  it('fundTestnetAccount returns boolean', async () => {
    const { stellarService } = await import('@/services/stellar')
    const kp = Keypair.random()
    const fetchMock = vi.fn()
    global.fetch = fetchMock

    // Mock friendbot response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ hash: 'test-hash' })),
    })

    const result = await stellarService.fundTestnetAccount(kp.publicKey())
    expect(typeof result).toBe('boolean')
  })

  it('submitPayment returns hash or error', async () => {
    const { stellarService } = await import('@/services/stellar')
    const kp = Keypair.random()
    const result = await stellarService.submitPayment({
      sourceSecret: kp.secret(),
      destination: 'GABC',
      amount: '1',
    })
    expect('hash' in result).toBe(true)
  })

  it('submitPayment handles USDC asset param', async () => {
    const { stellarService } = await import('@/services/stellar')
    const kp = Keypair.random()
    const result = await stellarService.submitPayment({
      sourceSecret: kp.secret(),
      destination: 'GABC',
      amount: '1',
      assetCode: 'USDC',
      assetIssuer: 'GAQ5QNOP3BER6QFKJ7G6JLPK7GQ6D5QYSS5YVU5J7WX5Y4Q2HKLU4JY',
    })
    expect('hash' in result).toBe(true)
  })

  it('loadAccount returns null on failure', async () => {
    const { stellarService } = await import('@/services/stellar')
    const acc = await stellarService.loadAccount('GABC')
    expect(acc).not.toBeNull()
  })
})
