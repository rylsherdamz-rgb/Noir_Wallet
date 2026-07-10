import { describe, it, expect } from 'vitest'

describe('Theme Constants', () => {
  it('exports Colors object with all required keys', async () => {
    const { Colors } = await import('@/constants/theme')
    const required = ['black', 'darkGrey', 'gold', 'goldDim', 'cream', 'mutedWhite', 'white', 'cardBg', 'borderGrey', 'success', 'danger', 'warning']
    for (const key of required) {
      expect(Colors).toHaveProperty(key)
      expect(typeof (Colors as Record<string, string>)[key]).toBe('string')
    }
  })

  it('Colors values are valid hex', async () => {
    const { Colors } = await import('@/constants/theme')
    for (const [key, val] of Object.entries(Colors)) {
      if (typeof val === 'string' && val.startsWith('#')) {
        expect(val).toMatch(/^#[0-9A-Fa-f]{3,8}$/)
      }
    }
  })

  it('Spacing values are positive numbers', async () => {
    const { Spacing } = await import('@/constants/theme')
    for (const [key, val] of Object.entries(Spacing)) {
      expect(typeof val).toBe('number')
      expect(val).toBeGreaterThanOrEqual(0)
    }
  })

  it('FontSize values are ordered correctly', async () => {
    const { FontSize } = await import('@/constants/theme')
    expect(FontSize.xs).toBeLessThan(FontSize.sm)
    expect(FontSize.sm).toBeLessThan(FontSize.md)
    expect(FontSize.md).toBeLessThan(FontSize.lg)
    expect(FontSize.lg).toBeLessThan(FontSize.xl)
    expect(FontSize.xl).toBeLessThan(FontSize.xxl)
    expect(FontSize.xxl).toBeLessThan(FontSize.xxxl)
    expect(FontSize.xxxl).toBeLessThan(FontSize.hero)
  })

  it('BorderRadius values are reasonable', async () => {
    const { BorderRadius } = await import('@/constants/theme')
    expect(BorderRadius.sm).toBeLessThan(BorderRadius.md)
    expect(BorderRadius.md).toBeLessThan(BorderRadius.lg)
    expect(BorderRadius.lg).toBeLessThan(BorderRadius.xl)
    expect(BorderRadius.full).toBe(9999)
  })
})

describe('Config Constants', () => {
  it('Config has horizon URL', async () => {
    const { Config } = await import('@/constants/config')
    expect(Config.horizonUrl).toContain('stellar.org')
    expect(Config.networkPassphrase).toContain('Test')
  })

  it('AppConfig has app name', async () => {
    const { AppConfig } = await import('@/constants/config')
    expect(AppConfig.appName).toBe('Noir Wallet')
    expect(AppConfig.appVersion).toBe('1.0.0')
  })

  it('AppConfig has NFC timeout settings', async () => {
    const { AppConfig } = await import('@/constants/config')
    expect(AppConfig.nfc.readTimeout).toBe(5000)
    expect(AppConfig.nfc.writeTimeout).toBe(10000)
  })

  it('AppConfig has terminal config keys', async () => {
    const { AppConfig } = await import('@/constants/config')
    expect(AppConfig.terminal).toHaveProperty('id')
    expect(AppConfig.terminal).toHaveProperty('apiKey')
    expect(AppConfig.terminal).toHaveProperty('publicKey')
  })

  it('AppConfig has limit settings', async () => {
    const { AppConfig } = await import('@/constants/config')
    expect(AppConfig.limits.defaultDailySpendCents).toBe(500000)
    expect(AppConfig.limits.maxTapAmountCents).toBe(5000000)
    expect(AppConfig.limits.minKycForHighLimits).toBe(2)
  })

  it('AppConfig has stellar config keys', async () => {
    const { AppConfig } = await import('@/constants/config')
    expect(AppConfig.stellar).toHaveProperty('masterKeyId')
    expect(AppConfig.stellar).toHaveProperty('channelSecretKey')
    expect(AppConfig.stellar).toHaveProperty('issuerAddress')
    expect(AppConfig.stellar).toHaveProperty('deviceRegistryContract')
  })
})

describe('Type Validation', () => {
  it('AssetCode matches expected values', () => {
    type AssetCode = 'USDC' | 'XLM' | 'PHP'
    const isValidAsset = (c: string): c is AssetCode => ['USDC', 'XLM', 'PHP'].includes(c)
    expect(isValidAsset('USDC')).toBe(true)
    expect(isValidAsset('XLM')).toBe(true)
    expect(isValidAsset('PHP')).toBe(true)
    expect(isValidAsset('BTC')).toBe(false)
  })

  it('TxFilter matches expected values', () => {
    type TxFilter = 'all' | 'pending' | 'confirmed' | 'failed'
    const isValidFilter = (f: string): f is TxFilter => ['all', 'pending', 'confirmed', 'failed'].includes(f)
    expect(isValidFilter('all')).toBe(true)
    expect(isValidFilter('pending')).toBe(true)
    expect(isValidFilter('unknown')).toBe(false)
  })

  it('Device status values are valid', () => {
    type DeviceStatus = 'active' | 'frozen' | 'lost' | 'deactivated'
    const isValidStatus = (s: string): s is DeviceStatus => ['active', 'frozen', 'lost', 'deactivated'].includes(s)
    expect(isValidStatus('active')).toBe(true)
    expect(isValidStatus('frozen')).toBe(true)
    expect(isValidStatus('unknown')).toBe(false)
  })

  it('Transaction status values are valid', () => {
    type TxStatus = 'pending' | 'confirmed' | 'failed'
    const isValidStatus = (s: string): s is TxStatus => ['pending', 'confirmed', 'failed'].includes(s)
    expect(isValidStatus('pending')).toBe(true)
    expect(isValidStatus('confirmed')).toBe(true)
    expect(isValidStatus('failed')).toBe(true)
    expect(isValidStatus('unknown')).toBe(false)
  })
})
