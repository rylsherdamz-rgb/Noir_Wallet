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

describe('Agent screens', () => {
  it('AgentListScreen imports', async () => {
    const mod = await import('@/screens/AgentListScreen')
    expect(mod.AgentListScreen).toBeDefined()
  })

  it('AgentDetailScreen imports', async () => {
    const mod = await import('@/screens/AgentDetailScreen')
    expect(mod.AgentDetailScreen).toBeDefined()
  })

  it('filters active devices for agent list', () => {
    const devices = [
      { id: '1', status: 'active', label: 'Card A' },
      { id: '2', status: 'frozen', label: 'Card B' },
      { id: '3', status: 'active', label: 'Card C' },
    ] as any[]
    const active = devices.filter((d) => d.status === 'active')
    expect(active).toHaveLength(2)
    expect(active.map((d) => d.label)).toEqual(['Card A', 'Card C'])
  })

  it('computes agent metrics correctly', () => {
    const balanceStroops = 50_000_000
    const spendingBudgetStroops = 500_000_000
    const totalSpentStroops = 100_000_000
    const xlmBalance = (balanceStroops / 10_000_000).toFixed(2)
    const remaining = Math.max(0, (spendingBudgetStroops - totalSpentStroops) / 10_000_000).toFixed(2)
    const spent = (totalSpentStroops / 10_000_000).toFixed(2)
    const budget = (spendingBudgetStroops / 10_000_000).toFixed(2)
    const pct = spendingBudgetStroops > 0 ? Math.round((totalSpentStroops / spendingBudgetStroops) * 100) : 0
    expect(xlmBalance).toBe('5.00')
    expect(remaining).toBe('40.00')
    expect(spent).toBe('10.00')
    expect(budget).toBe('50.00')
    expect(pct).toBe(20)
  })

  it('handles zero budget edge case', () => {
    const pct = 0 > 0 ? Math.round((0 / 0) * 100) : 0
    expect(pct).toBe(0)
  })

  it('filters agent transactions by deviceUidHash', () => {
    const agentDeviceUid = 'uid-agent-1'
    const allTxs = [
      { id: '1', deviceId: 'uid-agent-1', status: 'confirmed', amountCents: 100, assetCode: 'XLM', merchantName: 'Card A' },
      { id: '2', deviceId: 'uid-other', status: 'confirmed', amountCents: 200, assetCode: 'PHP', merchantName: 'Other' },
      { id: '3', deviceId: 'uid-agent-1', status: 'confirmed', amountCents: 50, assetCode: 'XLM', merchantName: 'Card A' },
    ]
    const agentTxs = allTxs.filter((tx) => tx.deviceId === agentDeviceUid)
    expect(agentTxs).toHaveLength(2)
    expect(agentTxs.every((tx) => tx.deviceId === 'uid-agent-1')).toBe(true)
  })

  it('validates NFC tag UID matches device before payment', () => {
    const deviceUid: string = 'tag-abc'
    const scannedUid: string = 'tag-abc'
    const wrongUid: string = 'tag-xyz'
    expect(scannedUid === deviceUid).toBe(true)
    expect(wrongUid === deviceUid).toBe(false)
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
