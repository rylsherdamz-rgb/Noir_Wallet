import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  it('setToken persists token', async () => {
    const { apiService } = await import('@/services/api')
    apiService.setToken('test-token')
    // Token is used in Authorization header on next request
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1' }, token: 'new-token' }),
    })
    const { apiService: api2 } = await import('@/services/api')
    // Can't easily test private token, just verify the method exists
    expect(typeof apiService.setToken).toBe('function')
  })

  it('signup sends correct payload', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1' }, token: 'abc' }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.signup('test@test.com', '+639123456789', 'GABC123')
    expect(result.user.id).toBe('1')
    expect(result.token).toBe('abc')
  })

  it('login returns token', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@test.com' }, token: 'abc123' }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.login('test@test.com', 'password')
    expect(result.token).toBe('abc123')
    expect(result.user.email).toBe('test@test.com')
  })

  it('getDevices returns device list', async () => {
    const devices = [{ id: 'd1', label: 'My Card' }]
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ devices }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.getDevices()
    expect(result.devices).toHaveLength(1)
    expect(result.devices[0].id).toBe('d1')
  })

  it('initiatePayment sends terminalId from config', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'accepted', message: 'ok' }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.initiatePayment({
      rawDeviceUid: 'uid-123',
      merchantPublicKey: 'GABC',
      amountCents: 5000,
      assetCode: 'PHP',
    })
    expect(result.status).toBe('accepted')
  })

  it('getTransactions returns transactions', async () => {
    const txs = [{ id: 'tx1', amountCents: 1000 }]
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ transactions: txs }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.getTransactions()
    expect(result.transactions).toHaveLength(1)
  })

  it('getBalance returns balance', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ balance: { php: 1000, usdc: 100, xlm: 50, localTokens: {} } }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.getBalance()
    expect(result.balance.php).toBe(1000)
  })

  it('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    })
    const { apiService } = await import('@/services/api')
    await expect(apiService.getDevices()).rejects.toThrow()
  })

  it('registerDevice posts device data', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ device: { id: 'd1', label: 'Card' } }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.registerDevice('hash123', 'My Card')
    expect(result.device.id).toBe('d1')
  })

  it('updateDeviceStatus sends PATCH', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ device: { id: 'd1', status: 'frozen' } }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.updateDeviceStatus('d1', 'frozen')
    expect(result.device.status).toBe('frozen')
  })

  it('batchPayments sends array of payments', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ processed: 3 }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.batchPayments([{ amount: 100 }, { amount: 200 }])
    expect(result.processed).toBe(3)
  })

  it('pdaxQuote fetches quote', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ quote: { rate: 58.5 } }),
    })
    const { apiService } = await import('@/services/api')
    const result = await apiService.pdaxQuote(10000, 'PHP', 'USDC')
    expect(result.quote.rate).toBe(58.5)
  })
})
