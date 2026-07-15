import { describe, it, expect, vi, beforeEach } from 'vitest'

const STROOPS_PER_XLM = 10_000_000
const DEFAULT_BUDGET_XLM = 500

vi.mock('@/services/stellar-service', () => ({
  stellarService: {
    fundAccount: vi.fn().mockResolvedValue(true),
    submitPayment: vi.fn().mockResolvedValue({ hash: 'test-mock-hash' }),
    getBalance: vi.fn().mockResolvedValue({ xlm: 500 }),
    invokeContract: vi.fn().mockResolvedValue('mock-invoke-hash'),
    readContract: vi.fn().mockResolvedValue('0'),
    accountExists: vi.fn().mockResolvedValue(true),
    registerDevice: vi.fn().mockResolvedValue('mock-register-hash'),
    waitForAccount: vi.fn().mockResolvedValue(true),
    walletAddressScVal: vi.fn().mockReturnValue({}),
    deviceHashScVal: vi.fn().mockReturnValue({}),
  },
}))

// Pure logic extracted from x402 service
function calcBudgetAfterPayment(remainingStroops: number, amountXlm: string): number {
  const cost = Math.ceil(parseFloat(amountXlm) * STROOPS_PER_XLM)
  return Math.max(0, remainingStroops - cost)
}

function agentHasBudget(remainingStroops: number, paymentStroops: number): boolean {
  return remainingStroops >= paymentStroops
}

function totalSpentFromBudget(initialBudget: number, remaining: number): number {
  return Math.max(0, initialBudget - remaining)
}

describe('x402 Budget Math', () => {
  it('deducts exact XLM from budget', () => {
    expect(calcBudgetAfterPayment(500 * STROOPS_PER_XLM, '10')).toBe(490 * STROOPS_PER_XLM)
  })

  it('floors at zero when payment exceeds budget', () => {
    expect(calcBudgetAfterPayment(5 * STROOPS_PER_XLM, '10')).toBe(0)
  })

  it('ceil fractional stroop cost', () => {
    expect(calcBudgetAfterPayment(100, '0.00000005')).toBe(99)
  })

  it('zero amount does not change budget', () => {
    expect(calcBudgetAfterPayment(500 * STROOPS_PER_XLM, '0')).toBe(500 * STROOPS_PER_XLM)
  })

  it('handles tiny payments correctly', () => {
    expect(calcBudgetAfterPayment(500 * STROOPS_PER_XLM, '0.0000001')).toBe(500 * STROOPS_PER_XLM - 1)
  })

  it('budget sufficient returns true', () => {
    expect(agentHasBudget(100, 50)).toBe(true)
  })

  it('budget exact returns true', () => {
    expect(agentHasBudget(100, 100)).toBe(true)
  })

  it('budget insufficient returns false', () => {
    expect(agentHasBudget(50, 100)).toBe(false)
  })

  it('zero budget cannot pay', () => {
    expect(agentHasBudget(0, 1)).toBe(false)
  })

  it('tracks total spent correctly', () => {
    const initial = DEFAULT_BUDGET_XLM * STROOPS_PER_XLM
    const after1 = calcBudgetAfterPayment(initial, '50')
    const after2 = calcBudgetAfterPayment(after1, '30')
    expect(totalSpentFromBudget(initial, after1)).toBe(50 * STROOPS_PER_XLM)
    expect(totalSpentFromBudget(initial, after2)).toBe(80 * STROOPS_PER_XLM)
  })

  it('total spent never exceeds initial', () => {
    const initial = DEFAULT_BUDGET_XLM * STROOPS_PER_XLM
    let budget = initial
    const payments = ['100', '200', '300']
    for (const amt of payments) {
      budget = calcBudgetAfterPayment(budget, amt)
    }
    expect(totalSpentFromBudget(initial, budget)).toBeLessThanOrEqual(initial)
  })

  it('10 sequential payments stay within budget', () => {
    let budget = DEFAULT_BUDGET_XLM * STROOPS_PER_XLM
    const payments = ['0.5', '1.2', '0.3', '2.0', '0.8', '1.5', '3.0', '0.1', '0.9', '1.7']
    for (const amt of payments) {
      const cost = Math.ceil(parseFloat(amt) * STROOPS_PER_XLM)
      expect(agentHasBudget(budget, cost)).toBe(true)
      budget = calcBudgetAfterPayment(budget, amt)
    }
    expect(budget).toBeGreaterThan(0)
    expect(budget).toBeLessThan(DEFAULT_BUDGET_XLM * STROOPS_PER_XLM)
  })

  it('rejects payment exceeding entire budget', () => {
    expect(agentHasBudget(100 * STROOPS_PER_XLM, Math.ceil(150 * STROOPS_PER_XLM))).toBe(false)
  })

  it('exact budget boundary depletes to zero', () => {
    expect(calcBudgetAfterPayment(50 * STROOPS_PER_XLM, '50')).toBe(0)
  })

  it('accounts with no budget reject all payments', () => {
    expect(agentHasBudget(0, 1)).toBe(false)
    expect(calcBudgetAfterPayment(0, '1')).toBe(0)
  })
})

describe('x402 createAgent logic', () => {
  beforeEach(async () => {
    const { x402 } = await import('@/domain/x402')
    await x402.clearAgent()
    vi.clearAllMocks()
  })

  it('generates keypair on first creation', async () => {
    const { x402 } = await import('@/domain/x402')
    const agent = await x402.createAgent()
    expect(agent.publicKey).toMatch(/^G[A-Z0-9]{55}$/)
    expect(agent.isActive).toBe(true)
    expect(agent.spendingBudgetStroops).toBe(500 * 10_000_000)
    expect(agent.totalSpentStroops).toBe(0)
  })

  it('returns existing agent on second call', async () => {
    const { x402 } = await import('@/domain/x402')
    const first = await x402.createAgent()
    const second = await x402.createAgent()
    expect(second.publicKey).toBe(first.publicKey)
  })

  it('hasAgent returns true after creation', async () => {
    const { x402 } = await import('@/domain/x402')
    expect(await x402.hasAgent()).toBe(false)
    await x402.createAgent()
    expect(await x402.hasAgent()).toBe(true)
  })

  it('clearAgent removes agent', async () => {
    const { x402 } = await import('@/domain/x402')
    await x402.createAgent()
    await x402.clearAgent()
    expect(await x402.hasAgent()).toBe(false)
  })

  it('payWithAgent returns error when no agent', async () => {
    const { x402 } = await import('@/domain/x402')
    const result = await x402.payWithAgent({ destination: 'GABC', amount: '1' })
    expect('error' in result).toBe(true)
  })

  it('payWithAgent succeeds after creation', async () => {
    const { x402 } = await import('@/domain/x402')
    await x402.createAgent()
    const result = await x402.payWithAgent({
      destination: 'GA7OPG4EHTL7X7JQKRLFNIJF7E4X5Y4JT3Q2H6CVT6JKJNZ5DOJ3BNKC',
      amount: '1',
    })
    expect('hash' in result).toBe(true)
  })

  it('getAgent returns null before creation', async () => {
    const { x402 } = await import('@/domain/x402')
    expect(await x402.getAgent()).toBe(null)
  })

  it('getAgent returns agent data after creation', async () => {
    const { x402 } = await import('@/domain/x402')
    const created = await x402.createAgent()
    const fetched = await x402.getAgent()
    expect(fetched?.publicKey).toBe(created.publicKey)
    expect(fetched?.isActive).toBe(true)
  })

  it('budget decreases after payment', async () => {
    const { x402 } = await import('@/domain/x402')
    await x402.createAgent()
    const before = await x402.getAgent()
    await x402.payWithAgent({ destination: 'GABC', amount: '10' })
    const after = await x402.getAgent()
    expect(after!.totalSpentStroops).toBeGreaterThan(before!.totalSpentStroops)
  })
})
