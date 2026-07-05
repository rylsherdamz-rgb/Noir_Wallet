import { getItem, setItem } from './storage'

export interface FxRates {
  usdToPhp: number
  xlmToUsd: number
  timestamp: number
}

const CACHE_KEY = 'fx_rates'
const CACHE_TTL_MS = 5 * 60 * 1000

export class FxRateService {
  private cached: FxRates | null = null

  async getRates(): Promise<FxRates> {
    if (this.cached && Date.now() - this.cached.timestamp < CACHE_TTL_MS) {
      return this.cached
    }

    const stored = await getItem<FxRates>(CACHE_KEY)
    if (stored && Date.now() - stored.timestamp < CACHE_TTL_MS) {
      this.cached = stored
      return stored
    }

    try {
      const [usdRes, xlmRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=php'),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd'),
      ])

      const usdData = await usdRes.json()
      const xlmData = await xlmRes.json()

      const rates: FxRates = {
        usdToPhp: usdData['usd-coin']?.php ?? 58,
        xlmToUsd: xlmData['stellar']?.usd ?? 0.12,
        timestamp: Date.now(),
      }

      await setItem(CACHE_KEY, rates)
      this.cached = rates
      return rates
    } catch {
      return stored ?? { usdToPhp: 58, xlmToUsd: 0.12, timestamp: Date.now() }
    }
  }
}

export const fxRateService = new FxRateService()
