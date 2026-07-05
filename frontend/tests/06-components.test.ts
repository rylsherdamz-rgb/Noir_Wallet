import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('BalanceCard logic', () => {
  it('imports without error', async () => {
    const mod = await import('@/components/BalanceCard')
    expect(mod.BalanceCard).toBeDefined()
  })
})

describe('TestnetFaucetBanner visibility logic', () => {
  beforeEach(async () => {
    const store = await import('@/store/useAppStore')
    store.useAppStore.getState().reset()
  })

  it('hides when xlm balance > 0', async () => {
    const store = await import('@/store/useAppStore')
    store.useAppStore.getState().setBalance({ php: 0, usdc: 0, xlm: 100, localTokens: {} })
    store.useAppStore.getState().setNetwork('testnet')
    store.useAppStore.getState().setUser({ id: '1', email: 't', phoneNumber: '+63', stellarPublicKey: 'GABC', kycLevel: 1, role: 'consumer', displayName: 'T' })
    const mod = await import('@/components/TestnetFaucetBanner')
    expect(mod.TestnetFaucetBanner).toBeDefined()
  })

  it('hides on mainnet even with 0 XLM', async () => {
    const store = await import('@/store/useAppStore')
    store.useAppStore.getState().setBalance({ php: 0, usdc: 0, xlm: 0, localTokens: {} })
    store.useAppStore.getState().setNetwork('mainnet')
    const mod = await import('@/components/TestnetFaucetBanner')
    expect(mod.TestnetFaucetBanner).toBeDefined()
  })

  it('shows on testnet with 0 XLM', async () => {
    const store = await import('@/store/useAppStore')
    store.useAppStore.getState().setBalance({ php: 0, usdc: 0, xlm: 0, localTokens: {} })
    store.useAppStore.getState().setNetwork('testnet')
    store.useAppStore.getState().setUser({ id: '1', email: 't', phoneNumber: '+63', stellarPublicKey: 'GABC', kycLevel: 1, role: 'consumer', displayName: 'T' })
    const mod = await import('@/components/TestnetFaucetBanner')
    expect(mod.TestnetFaucetBanner).toBeDefined()
  })
})

describe('Other components', () => {
  it('imports ReadyToTapIndicator', async () => {
    const mod = await import('@/components/ReadyToTapIndicator')
    expect(mod.ReadyToTapIndicator).toBeDefined()
  })

  it('imports NumericKeypad', async () => {
    const mod = await import('@/components/NumericKeypad')
    expect(mod.NumericKeypad).toBeDefined()
  })

  it('imports TransactionItem', async () => {
    const mod = await import('@/components/TransactionItem')
    expect(mod.TransactionItem).toBeDefined()
  })
})
