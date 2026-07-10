import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useAppStore', () => {
  beforeEach(async () => {
    vi.resetModules()
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().reset()
  })

  it('exports a function', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    expect(typeof useAppStore).toBe('function')
  })

  it('initial state has empty user', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    const state = useAppStore.getState()
    expect(state.user).toBeNull()
  })

  it('setUser updates user', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    const user = { id: '1', email: 'test@test.com', phoneNumber: '+63912', stellarPublicKey: 'GABC', kycLevel: 1, role: 'consumer' as const, displayName: 'Test' }
    useAppStore.getState().setUser(user)
    expect(useAppStore.getState().user?.email).toBe('test@test.com')
  })

  it('setUser to null clears user', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setUser(null)
    expect(useAppStore.getState().user).toBeNull()
  })

  it('addDevice appends to devices array', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().addDevice({ id: 'd1', userId: 'u1', deviceUidHash: 'hash1', label: 'Card', agentPublicKey: 'GAGENT', status: 'active', dailySpendLimitCents: 500000, accumulatedTodayCents: 0, lastTapAt: null, createdAt: new Date().toISOString() })
    expect(useAppStore.getState().devices).toHaveLength(1)
    expect(useAppStore.getState().devices[0].agentPublicKey).toBe('GAGENT')
  })

  it('addTransaction prepends to transactions', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().addTransaction({ id: 'tx1', stellarTxHash: null, merchantId: 'm1', merchantName: 'Test', userId: 'u1', deviceId: 'd1', amountCents: 1000, assetCode: 'PHP', status: 'confirmed', errorMessage: null, createdAt: new Date().toISOString() })
    expect(useAppStore.getState().transactions).toHaveLength(1)
  })

  it('setBalance updates balance', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setBalance({ php: 1000, usdc: 100, xlm: 50, localTokens: {} })
    expect(useAppStore.getState().balance.php).toBe(1000)
    expect(useAppStore.getState().balance.xlm).toBe(50)
  })

  it('updateBalance merges partial', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setBalance({ php: 1000, usdc: 100, xlm: 50, localTokens: {} })
    useAppStore.getState().updateBalance({ xlm: 75 })
    expect(useAppStore.getState().balance.php).toBe(1000)
    expect(useAppStore.getState().balance.xlm).toBe(75)
  })

  it('removeDevice removes by id', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().addDevice({ id: 'd1', userId: 'u1', deviceUidHash: 'h1', label: 'C1', status: 'active', dailySpendLimitCents: 100, accumulatedTodayCents: 0, lastTapAt: null, createdAt: '' })
    useAppStore.getState().addDevice({ id: 'd2', userId: 'u1', deviceUidHash: 'h2', label: 'C2', status: 'active', dailySpendLimitCents: 100, accumulatedTodayCents: 0, lastTapAt: null, createdAt: '' })
    useAppStore.getState().removeDevice('d1')
    expect(useAppStore.getState().devices).toHaveLength(1)
    expect(useAppStore.getState().devices[0].id).toBe('d2')
  })

  it('updateDevice patches fields', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().addDevice({ id: 'd1', userId: 'u1', deviceUidHash: 'h1', label: 'Old', status: 'active', dailySpendLimitCents: 100, accumulatedTodayCents: 0, lastTapAt: null, createdAt: '' })
    useAppStore.getState().updateDevice('d1', { label: 'New Label', status: 'frozen' })
    expect(useAppStore.getState().devices[0].label).toBe('New Label')
    expect(useAppStore.getState().devices[0].status).toBe('frozen')
  })

  it('setNetwork updates network', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setNetwork('mainnet')
    expect(useAppStore.getState().network).toBe('mainnet')
  })

  it('setBiometricLockEnabled updates security', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setBiometricLockEnabled(true)
    expect(useAppStore.getState().security.biometricLockEnabled).toBe(true)
  })

  it('setBackgroundLockTimeoutSec updates timeout', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setBackgroundLockTimeoutSec(120)
    expect(useAppStore.getState().security.backgroundLockTimeoutSec).toBe(120)
  })

  it('reset restores initial state', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setUser({ id: '1', email: 't', phoneNumber: '+63', stellarPublicKey: 'G', kycLevel: 1, role: 'consumer', displayName: 'T' })
    useAppStore.getState().addDevice({ id: 'd1', userId: 'u1', deviceUidHash: 'h1', label: 'C', status: 'active', dailySpendLimitCents: 100, accumulatedTodayCents: 0, lastTapAt: null, createdAt: '' })
    useAppStore.getState().reset()
    expect(useAppStore.getState().user).toBeNull()
    expect(useAppStore.getState().devices).toHaveLength(0)
  })

  it('setBalanceStale toggles stale flag', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    useAppStore.getState().setBalanceStale(true)
    expect(useAppStore.getState().balanceStale).toBe(true)
  })

  it('setTransactions replaces transaction list', async () => {
    const { useAppStore } = await import('@/store/useAppStore')
    const txs: Array<import('@/types').Transaction> = [{ id: 'tx1', stellarTxHash: null, merchantId: 'm1', merchantName: 'M', userId: 'u1', deviceId: 'd1', amountCents: 100, assetCode: 'PHP' as const, status: 'confirmed' as const, errorMessage: null, createdAt: '' }]
    useAppStore.getState().setTransactions(txs)
    expect(useAppStore.getState().transactions).toHaveLength(1)
  })
})
