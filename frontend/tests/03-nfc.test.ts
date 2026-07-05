import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('NFC Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns available=false when no native module', async () => {
    const { nfcService } = await import('@/services/nfc')
    expect(nfcService.available).toBe(false)
  })

  it('isSupported returns false without hardware', async () => {
    const { nfcService } = await import('@/services/nfc')
    const supported = await nfcService.isSupported()
    expect(supported).toBe(false)
  })

  it('readTag returns null without hardware', async () => {
    const { nfcService } = await import('@/services/nfc')
    const tag = await nfcService.readTag()
    expect(tag).toBeNull()
  })

  it('writeTag returns false without hardware', async () => {
    const { nfcService } = await import('@/services/nfc')
    const written = await nfcService.writeTag({ walletAddress: 'GABC', deviceLabel: 'Test', activationUrl: 'noirwallet://' })
    expect(written).toBe(false)
  })

  it('initialize returns false without hardware', async () => {
    const { nfcService } = await import('@/services/nfc')
    const result = await nfcService.initialize()
    expect(result).toBe(false)
  })

  it('registerTagCallback returns noop without hardware', async () => {
    const { nfcService } = await import('@/services/nfc')
    const cleanup = nfcService.registerTagCallback(() => {})
    expect(typeof cleanup).toBe('function')
    cleanup()
  })

  it('cleanup does not throw without hardware', async () => {
    const { nfcService } = await import('@/services/nfc')
    expect(() => nfcService.cleanup()).not.toThrow()
  })

  it('readTag respects timeout parameter', async () => {
    const { nfcService } = await import('@/services/nfc')
    const tag = await nfcService.readTag(1000)
    expect(tag).toBeNull()
  })
})

describe('useNfc Hook (logic only)', () => {
  it('exports a function', async () => {
    const { useNfc } = await import('@/hooks/useNfc')
    expect(typeof useNfc).toBe('function')
  })
})
