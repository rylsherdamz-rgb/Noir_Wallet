import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('FX Rate Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  it('exports fxRateService', async () => {
    const { fxRateService } = await import('@/services/fxRates')
    expect(fxRateService).toBeDefined()
  })

  it('getRates returns default values when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
    const { fxRateService } = await import('@/services/fxRates')
    const rates = await fxRateService.getRates()
    expect(rates).toHaveProperty('usdToPhp')
    expect(rates).toHaveProperty('xlmToUsd')
    expect(typeof rates.usdToPhp).toBe('number')
    expect(typeof rates.xlmToUsd).toBe('number')
  })

  it('getRates returns fetched values', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: { PHP: 58.5 }, base: 'USD' }),
    })

    const { fxRateService } = await import('@/services/fxRates')
    const rates = await fxRateService.getRates()
    expect(rates.usdToPhp).toBeGreaterThan(0)
  })

  it('handles fallback gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('timeout'))
    const { fxRateService } = await import('@/services/fxRates')
    const rates = await fxRateService.getRates()
    expect(rates.usdToPhp).toBe(58)
    expect(rates.xlmToUsd).toBe(0.12)
  })
})
