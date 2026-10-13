import { describe, it, expect } from 'vitest'
import { toBrowserUrl } from '@/lib/browserUrl'

describe('Browse: address bar input', () => {
  it('ignores empty input', () => {
    expect(toBrowserUrl('   ')).toBeNull()
  })
  it('keeps https URLs and upgrades http to https', () => {
    expect(toBrowserUrl('https://stellar.expert')).toBe('https://stellar.expert')
    expect(toBrowserUrl('http://stellar.expert/x')).toBe('https://stellar.expert/x')
  })
  it('treats bare domains as https addresses', () => {
    expect(toBrowserUrl('lab.stellar.org')).toBe('https://lab.stellar.org')
    expect(toBrowserUrl('app.soroswap.finance/swap')).toBe('https://app.soroswap.finance/swap')
  })
  it('turns anything else into a web search', () => {
    expect(toBrowserUrl('stellar lumens')).toBe('https://duckduckgo.com/?q=stellar%20lumens')
  })
})

describe('Link card: default agent policy', () => {
  it('caps each payment at 100,000 XLM and never expires', async () => {
    const { buildAgentPolicy, DEFAULT_AGENT_CAP_XLM } = await import('@/domain/x402')
    expect(DEFAULT_AGENT_CAP_XLM).toBe(100_000)
    expect(buildAgentPolicy({ maxAmountXlm: DEFAULT_AGENT_CAP_XLM, expiryDays: 0 })).toEqual({
      maxAmountStroops: 1_000_000_000_000n,
      expiresAt: 0n,
    })
  })
})
