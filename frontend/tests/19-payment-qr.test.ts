import { describe, it, expect } from 'vitest'
import { Keypair } from '@stellar/stellar-sdk'
import { buildPaymentRequestUri, parsePaymentQr } from '@/lib/paymentQr'

const G = Keypair.random().publicKey()

describe('payment request QR', () => {
  it('builds a SEP-0007 pay URI with the amount', () => {
    expect(buildPaymentRequestUri({ destination: G, amount: '10.50' })).toBe(`web+stellar:pay?destination=${G}&amount=10.5`)
  })

  it('omits the amount when none is requested', () => {
    expect(buildPaymentRequestUri({ destination: G })).toBe(`web+stellar:pay?destination=${G}`)
  })

  it('round-trips destination, amount and memo', () => {
    const uri = buildPaymentRequestUri({ destination: G, amount: '25', memo: 'Coffee' })
    expect(parsePaymentQr(uri)).toEqual({ destination: G, amount: '25', memo: 'Coffee' })
  })

  it('reads a bare address and the legacy G…?asset=XLM form', () => {
    expect(parsePaymentQr(G)).toEqual({ destination: G })
    expect(parsePaymentQr(`${G}?asset=XLM`)).toEqual({ destination: G })
  })

  it('rejects junk, bad addresses and non-XLM requests', () => {
    expect(parsePaymentQr('hello')).toBeNull()
    expect(parsePaymentQr('web+stellar:pay?destination=GBAD')).toBeNull()
    expect(parsePaymentQr(`web+stellar:pay?destination=${G}&asset_code=USDC&asset_issuer=${G}`)).toBeNull()
  })

  it('drops a malformed amount but keeps the address', () => {
    expect(parsePaymentQr(`web+stellar:pay?destination=${G}&amount=abc`)).toEqual({ destination: G })
  })
})

describe('resolveCardRecipient', () => {
  it('pays your own card’s agent, another wallet’s card owner, and refuses unlinked cards', async () => {
    const { vi } = await import('vitest')
    const { x402 } = await import('@/domain/x402')
    const { resolveCardRecipient } = await import('@/lib/cardTap')
    const me = Keypair.random().publicKey()
    const owner = Keypair.random().publicKey()
    const agent = Keypair.random().publicKey()
    const devices = [{ deviceUidHash: 'aa', agentPublicKey: agent, label: 'Black card' }]

    await expect(resolveCardRecipient('aa', devices, me)).resolves.toEqual({ address: agent, label: 'Black card (your card)' })

    const spy = vi.spyOn(x402, 'getDeviceOwnership')
    spy.mockResolvedValueOnce({ status: 'other', owner, agent, createdAt: null, active: true })
    await expect(resolveCardRecipient('bb', devices, me)).resolves.toEqual({ address: owner, label: 'Card owner' })

    spy.mockResolvedValueOnce({ status: 'free' })
    await expect(resolveCardRecipient('cc', devices, me)).rejects.toThrow(/isn’t linked/)

    spy.mockResolvedValueOnce({ status: 'mine', owner: me, agent, createdAt: null, active: true })
    await expect(resolveCardRecipient('dd', devices, me)).rejects.toThrow(/your own card/)
    spy.mockRestore()
  })
})
