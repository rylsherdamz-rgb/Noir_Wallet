import { describe, it, expect, vi, afterEach } from 'vitest'
import { Keypair } from '@stellar/stellar-sdk'
import { logger, redactSecrets } from '@/lib/logger'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('secret redaction', () => {
  it('redacts a Stellar public key down to a recognisable stub', () => {
    const pk = Keypair.random().publicKey()
    const out = redactSecrets(pk) as string
    expect(out).not.toBe(pk)
    expect(out).not.toContain(pk)
    expect(out).toContain(pk.slice(0, 4))
    expect(out).toContain(pk.slice(-4))
  })

  it('redacts a secret seed — the value that must never reach a log', () => {
    const secret = Keypair.random().secret()
    const out = redactSecrets(secret) as string
    expect(out).not.toContain(secret)
    expect(out.length).toBeLessThan(secret.length)
  })

  it('redacts keys embedded in a longer sentence, leaving the rest intact', () => {
    const pk = Keypair.random().publicKey()
    const out = redactSecrets(`payment to ${pk} failed`) as string
    expect(out).toMatch(/^payment to /)
    expect(out).toMatch(/ failed$/)
    expect(out).not.toContain(pk)
  })

  it('leaves non-strings untouched so structured logs survive', () => {
    const obj = { a: 1 }
    expect(redactSecrets(obj)).toBe(obj)
    expect(redactSecrets(42)).toBe(42)
    expect(redactSecrets(null)).toBe(null)
  })

  it('does not mangle ordinary text that merely starts with G or S', () => {
    expect(redactSecrets('Something went wrong')).toBe('Something went wrong')
    expect(redactSecrets('GET /balance')).toBe('GET /balance')
  })
})

describe('logger levels', () => {
  it('routes error through console.error so crashes stay traceable', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.error('boom')
    expect(spy).toHaveBeenCalledWith('boom')
  })

  it('exposes the four levels the app uses', () => {
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })

  it('never throws on any input', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => logger.debug(undefined, null, { a: 1 })).not.toThrow()
    expect(() => logger.error(new Error('x'))).not.toThrow()
    expect(spy).toHaveBeenCalled()
  })
})
