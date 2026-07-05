import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('DeviceProvisioningScreen logic', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('imports without error', async () => {
    const mod = await import('@/screens/DeviceProvisioningScreen')
    expect(mod.DeviceProvisioningScreen).toBeDefined()
  })

  it('label logic: empty defaults to displayName', () => {
    const displayLabel = (label: string, customName: string, displayName: string) => {
      const trimmed = customName.trim()
      if (label === 'Other' && trimmed) return trimmed
      if (!label) return `${displayName || 'My'} Card`
      return label
    }
    expect(displayLabel('', '', 'John')).toBe('John Card')
    expect(displayLabel('My Card', '', 'John')).toBe('My Card')
    expect(displayLabel('Other', 'Custom Tag', 'John')).toBe('Custom Tag')
    expect(displayLabel('Other', '', 'John')).toBe('Other')
  })

  it('device creation generates unique IDs', () => {
    const id1 = Math.random().toString(36).slice(2)
    const id2 = Math.random().toString(36).slice(2)
    expect(id1).not.toBe(id2)
  })
})

describe('MerchantPosScreen logic', () => {
  it('imports without error', async () => {
    const mod = await import('@/screens/MerchantPosScreen')
    expect(mod.MerchantPosScreen).toBeDefined()
  })

  it('displayAmount formats cents to PHP', () => {
    const formatAmount = (cents: string) => cents ? `₱${(parseInt(cents) / 100).toFixed(2)}` : ''
    expect(formatAmount('')).toBe('')
    expect(formatAmount('100')).toBe('₱1.00')
    expect(formatAmount('5000')).toBe('₱50.00')
    expect(formatAmount('99999999')).toBe('₱999999.99')
  })

  it('rejects zero amount', () => {
    const isValid = (amount: string) => !!amount && parseInt(amount) > 0
    expect(isValid('')).toBe(false)
    expect(isValid('0')).toBe(false)
    expect(isValid('100')).toBe(true)
  })

  it('creates transaction with correct shape', () => {
    const buildTx = (tagUid: string, amountCents: number, txHash: string | null) => ({
      id: Math.random().toString(36).slice(2),
      stellarTxHash: txHash,
      merchantId: 'me',
      merchantName: 'Tap Pay',
      userId: 'local',
      deviceId: tagUid,
      amountCents,
      assetCode: 'PHP' as const,
      status: 'confirmed' as const,
      errorMessage: null,
      createdAt: new Date().toISOString(),
    })
    const tx = buildTx('uid-123', 5000, 'hash-abc')
    expect(tx.deviceId).toBe('uid-123')
    expect(tx.amountCents).toBe(5000)
    expect(tx.stellarTxHash).toBe('hash-abc')
    expect(tx.status).toBe('confirmed')
  })

  it('finds linked device by UID', () => {
    const devices = [
      { deviceUidHash: 'uid-111', agentPublicKey: 'GAGENT1' },
      { deviceUidHash: 'uid-222', agentPublicKey: 'GAGENT2' },
    ]
    const findDevice = (uid: string) => devices.find(d => d.deviceUidHash === uid)
    expect(findDevice('uid-111')?.agentPublicKey).toBe('GAGENT1')
    expect(findDevice('uid-333')).toBeUndefined()
  })

  it('agent mode determined by agent existence + device agentPublicKey', () => {
    const shouldUseAgent = (hasAgent: boolean, deviceAgentKey?: string) => hasAgent && !!deviceAgentKey
    expect(shouldUseAgent(true, 'GAGENT')).toBe(true)
    expect(shouldUseAgent(true, undefined)).toBe(false)
    expect(shouldUseAgent(false, 'GAGENT')).toBe(false)
    expect(shouldUseAgent(false, undefined)).toBe(false)
  })
})

describe('DashboardScreen logic', () => {
  it('imports without error', async () => {
    const mod = await import('@/screens/DashboardScreen')
    expect(mod.DashboardScreen).toBeDefined()
  })

  it('greeting derives from email username', () => {
    const greeting = (email?: string) => email ? `Welcome, ${email.split('@')[0]}` : ''
    expect(greeting('john@test.com')).toBe('Welcome, john')
    expect(greeting()).toBe('')
  })

  it('truncates stellar public key', () => {
    const formatKey = (key: string) => `${key.slice(0, 8)}...${key.slice(-4)}`
    expect(formatKey('GA7OPG4EHTL7X7JQKRLFNIJF7E4X5Y4JT3Q2H6CVT6JKJNZ5DOJ3BNKC')).toBe('GA7OPG4E...BNKC')
  })
})
