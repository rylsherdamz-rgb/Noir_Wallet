import { describe, it, expect, vi, beforeEach } from 'vitest'

const STROOPS_PER_XLM = 10_000_000
const DEFAULT_BUDGET_XLM = 500

// In-memory SecureStore for the multi-agent x402 store.
const mockSecure = new Map<string, string>()
vi.mock('@/services/secureStorage', () => ({
  secureGetItem: vi.fn((k: string) => Promise.resolve(mockSecure.get(k) ?? null)),
  secureSetItem: vi.fn((k: string, v: string) => { mockSecure.set(k, v); return Promise.resolve() }),
  secureDeleteItem: vi.fn((k: string) => { mockSecure.delete(k); return Promise.resolve() }),
}))

vi.mock('@/services/stellar-service', () => ({
  stellarService: {
    fundAccount: vi.fn().mockResolvedValue(true),
    submitPayment: vi.fn().mockResolvedValue({ hash: 'test-mock-hash' }),
    submitCreateAccount: vi.fn().mockResolvedValue({ hash: 'test-create-hash' }),
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

import { Keypair } from '@stellar/stellar-sdk'

// A valid 12-word BIP39 mnemonic for deterministic HD derivation in tests.
const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

// Functional in-memory wallet mock supporting the multi-agent API. Uses the
// real WalletService derivation so agents are deterministic per index.
vi.mock('@/services/wallet', async () => {
  const actual = await vi.importActual<typeof import('@/services/wallet')>('@/services/wallet')
  const svc = new actual.WalletService()
  const state: { agentIndexNext: number; retired: number[] } = { agentIndexNext: 2, retired: [] }
  const derivedMain = Keypair.random()
  return {
    ...actual,
    walletService: {
      loadKeys: vi.fn().mockImplementation(async () => ({
        mnemonic: TEST_MNEMONIC,
        stellarSecret: derivedMain.secret(),
        stellarPublic: derivedMain.publicKey(),
        agentSecret: svc.deriveAgentAt(TEST_MNEMONIC, 1).secret,
        agentPublic: svc.deriveAgentAt(TEST_MNEMONIC, 1).public,
        agentIndexNext: state.agentIndexNext,
        retiredAgentIndexes: state.retired,
      })),
      deriveAgentAt: (m: string, i: number) => svc.deriveAgentAt(m, i),
      saveKeys: vi.fn().mockImplementation(async (k: any) => {
        if (typeof k?.agentIndexNext === 'number') state.agentIndexNext = k.agentIndexNext
        if (Array.isArray(k?.retiredAgentIndexes)) state.retired = [...k.retiredAgentIndexes]
      }),
      allocateAgentIndex: vi.fn().mockImplementation(async () => {
        let index = state.agentIndexNext
        while (state.retired.includes(index)) index++
        state.agentIndexNext = index + 1
        return svc.deriveAgentAt(TEST_MNEMONIC, index)
      }),
      retireAgentIndex: vi.fn().mockImplementation(async (i: number) => {
        if (!state.retired.includes(i)) state.retired.push(i)
      }),
      isAgentIndexRetired: vi.fn().mockImplementation(async (i: number) => state.retired.includes(i)),
      __reset: () => { state.agentIndexNext = 2; state.retired = [] },
    },
  }
})

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

describe('x402 multi-agent logic', () => {
  beforeEach(async () => {
    mockSecure.clear()
    vi.clearAllMocks()
    const walletMod = await import('@/services/wallet') as any
    walletMod.walletService.__reset?.()
    const { stellarService } = await import('@/services/stellar-service')
    ;(stellarService.accountExists as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    ;(stellarService.getBalance as ReturnType<typeof vi.fn>).mockResolvedValue({ xlm: 500 })
  })

  it('createAgent generates a valid keypair and default budget', async () => {
    const { x402 } = await import('@/domain/x402')
    const agent = await x402.createAgent({ label: 'Card A' })
    expect(agent.publicKey).toMatch(/^G[A-Z0-9]{55}$/)
    expect(agent.isActive).toBe(true)
    expect(agent.spendingBudgetStroops).toBe(500 * 10_000_000)
    expect(agent.totalSpentStroops).toBe(0)
    expect(agent.label).toBe('Card A')
  })

  it('each createAgent call produces a NEW, distinct agent', async () => {
    const { x402 } = await import('@/domain/x402')
    const a = await x402.createAgent({ label: 'Card A' })
    const b = await x402.createAgent({ label: 'Card B' })
    expect(b.publicKey).not.toBe(a.publicKey)
    expect(b.index).not.toBe(a.index)
    const list = await x402.listAgents()
    // legacy migrated agent (index 1) + two new = 3
    expect(list.length).toBeGreaterThanOrEqual(2)
  })

  it('budgets are isolated per agent', async () => {
    const { x402 } = await import('@/domain/x402')
    const a = await x402.createAgent({ label: 'Card A' })
    const b = await x402.createAgent({ label: 'Card B' })
    await x402.payWithAgent({ agentIndex: a.index, destination: 'GABC', amount: '10' })
    const afterA = await x402.getAgent(a.index)
    const afterB = await x402.getAgent(b.index)
    expect(afterA!.totalSpentStroops).toBeGreaterThan(0)
    expect(afterB!.totalSpentStroops).toBe(0) // untouched
  })

  it('hasAgent is true once an agent exists', async () => {
    const { x402 } = await import('@/domain/x402')
    await x402.createAgent()
    expect(await x402.hasAgent()).toBe(true)
  })

  it('linkAgentToDevice + getAgentIndexForDevice resolve correctly', async () => {
    const { x402 } = await import('@/domain/x402')
    const a = await x402.createAgent({ label: 'Card A', deviceHash: 'deadbeef' })
    const idx = await x402.getAgentIndexForDevice('deadbeef')
    expect(idx).toBe(a.index)
  })

  it('retireAgent permanently retires the index (never reused)', async () => {
    const { x402 } = await import('@/domain/x402')
    const walletMod = await import('@/services/wallet') as any
    const a = await x402.createAgent({ label: 'Card A' })
    const owner = 'GA7OPG4EHTL7X7JQKRLFNIJF7E4X5Y4JT3Q2H6CVT6JKJNZ5DOJ3BNKC'
    await x402.retireAgent(a.index, owner)
    // index recorded as retired
    expect(await walletMod.walletService.isAgentIndexRetired(a.index)).toBe(true)
    // agent no longer listed
    const list = await x402.listAgents()
    expect(list.find((x: any) => x.index === a.index)).toBeUndefined()
    // a subsequent allocation SKIPS the retired index
    const b = await x402.createAgent({ label: 'Card B' })
    expect(b.index).not.toBe(a.index)
  })

  it('retireAgent sweeps agent XLM back to the owner', async () => {
    const { x402 } = await import('@/domain/x402')
    const { stellarService } = await import('@/services/stellar-service')
    const a = await x402.createAgent({ label: 'Card A' })
    const owner = 'GA7OPG4EHTL7X7JQKRLFNIJF7E4X5Y4JT3Q2H6CVT6JKJNZ5DOJ3BNKC'
    await x402.retireAgent(a.index, owner)
    // sweep issues a payment to the owner
    expect(stellarService.submitPayment).toHaveBeenCalledWith(
      expect.objectContaining({ destination: owner }),
    )
  })

  it('payWithAgent returns error when the target agent does not exist', async () => {
    const { x402 } = await import('@/domain/x402')
    const result = await x402.payWithAgent({ agentIndex: 999, destination: 'GABC', amount: '1' })
    expect('error' in result).toBe(true)
  })

  it('payWithAgent succeeds after creation', async () => {
    const { x402 } = await import('@/domain/x402')
    const a = await x402.createAgent()
    const result = await x402.payWithAgent({
      agentIndex: a.index,
      destination: 'GA7OPG4EHTL7X7JQKRLFNIJF7E4X5Y4JT3Q2H6CVT6JKJNZ5DOJ3BNKC',
      amount: '1',
    })
    expect('hash' in result).toBe(true)
  })

  it('getAgent returns agent data after createAgent', async () => {
    const { x402 } = await import('@/domain/x402')
    const created = await x402.createAgent()
    const fetched = await x402.getAgent(created.index)
    expect(fetched?.publicKey).toBe(created.publicKey)
    expect(fetched?.isActive).toBe(true)
  })

  it('budget decreases after payment', async () => {
    const { x402 } = await import('@/domain/x402')
    const a = await x402.createAgent()
    const before = await x402.getAgent(a.index)
    await x402.payWithAgent({ agentIndex: a.index, destination: 'GABC', amount: '10' })
    const after = await x402.getAgent(a.index)
    expect(after!.totalSpentStroops).toBeGreaterThan(before!.totalSpentStroops)
  })

  it('rejects payment exceeding remaining budget', async () => {
    const { x402 } = await import('@/domain/x402')
    const a = await x402.createAgent()
    const result = await x402.payWithAgent({ agentIndex: a.index, destination: 'GABC', amount: '600' })
    expect('error' in result).toBe(true)
  })

  it('does not submit when budget is exceeded', async () => {
    const { x402 } = await import('@/domain/x402')
    const { stellarService } = await import('@/services/stellar-service')
    const a = await x402.createAgent()
    await x402.payWithAgent({ agentIndex: a.index, destination: 'GABC', amount: '600' })
    expect(stellarService.submitPayment).not.toHaveBeenCalled()
  })

  it('does not friendbot-fund the agent', async () => {
    const { x402 } = await import('@/domain/x402')
    const { stellarService } = await import('@/services/stellar-service')
    await x402.createAgent()
    expect(stellarService.fundAccount).not.toHaveBeenCalled()
  })

  it('payWithAgent returns error when agent account missing on-chain', async () => {
    const { x402 } = await import('@/domain/x402')
    const { stellarService } = await import('@/services/stellar-service')
    ;(stellarService.accountExists as ReturnType<typeof vi.fn>).mockResolvedValue(false)
    const a = await x402.createAgent()
    const result = await x402.payWithAgent({ agentIndex: a.index, destination: 'GABC', amount: '1' })
    expect('error' in result).toBe(true)
    expect(stellarService.submitPayment).not.toHaveBeenCalled()
  })

  it('syncAgentsFromDevices rebuilds agents from persisted devices (no agents after login)', async () => {
    const { x402 } = await import('@/domain/x402')
    const { walletService } = await import('@/services/wallet')

    // Simulate a fresh login: device list survives, but NO local agent metadata.
    const agent2 = (walletService as any).deriveAgentAt(TEST_MNEMONIC, 2)
    mockSecure.clear()

    const before = await x402.listAgents()
    expect(before.find((a) => a.publicKey === agent2.public)).toBeUndefined()

    const healed = await x402.syncAgentsFromDevices([
      { deviceUidHash: 'aabbcc', agentPublicKey: agent2.public, label: 'Office Card' },
    ])
    expect(healed).toBeGreaterThan(0)

    // The agent is now materialized and linked to its device.
    const after = await x402.listAgents()
    expect(after.find((a) => a.publicKey === agent2.public)).toBeDefined()
    expect(await x402.getAgentIndexForDevice('aabbcc')).toBe(2)
  })

  it('syncAgentsFromDevices never resurrects a retired agent', async () => {
    const { x402 } = await import('@/domain/x402')
    const { walletService } = await import('@/services/wallet')
    const a = await x402.createAgent({ label: 'Card A', deviceHash: 'ddeeff' })
    const pub = a.publicKey
    await x402.retireAgent(a.index, 'GA7OPG4EHTL7X7JQKRLFNIJF7E4X5Y4JT3Q2H6CVT6JKJNZ5DOJ3BNKC')
    expect(await walletService.isAgentIndexRetired(a.index)).toBe(true)

    // Even with the device still referencing it, the retired agent stays gone.
    await x402.syncAgentsFromDevices([
      { deviceUidHash: 'ddeeff', agentPublicKey: pub, label: 'Card A' },
    ])
    const after = await x402.listAgents()
    expect(after.find((x) => x.publicKey === pub)).toBeUndefined()
  })


  it('sweepAgentFunds sends full balance minus fee', async () => {
    const { x402 } = await import('@/domain/x402')
    const { stellarService } = await import('@/services/stellar-service')
    const a = await x402.createAgent()
    const result = await x402.sweepAgentFunds('GA7OPG4EHTL7X7JQKRLFNIJF7E4X5Y4JT3Q2H6CVT6JKJNZ5DOJ3BNKC', a.index)
    expect('hash' in result).toBe(true)
    expect(stellarService.submitPayment).toHaveBeenCalledWith(
      expect.objectContaining({ amount: '499.9990000' }),
    )
  })

  it('sweepAgentFunds bypasses the budget check', async () => {
    const { x402 } = await import('@/domain/x402')
    const a = await x402.createAgent()
    const result = await x402.sweepAgentFunds('GABC', a.index)
    expect('hash' in result).toBe(true)
  })

  it('topUpAgent creates the account when agent missing on-chain', async () => {
    const { x402 } = await import('@/domain/x402')
    const { stellarService } = await import('@/services/stellar-service')
    const a = await x402.createAgent()
    ;(stellarService.accountExists as ReturnType<typeof vi.fn>).mockResolvedValue(false)
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    expect(keys).not.toBeNull()
    const hash = await x402.topUpAgent(50, keys!.stellarSecret, a.index)
    expect(hash).toBe('test-create-hash')
    expect(stellarService.submitCreateAccount).toHaveBeenCalledWith(
      expect.objectContaining({ amount: '50.0000000' }),
    )
    expect(stellarService.submitPayment).not.toHaveBeenCalled()
  })

  it('topUpAgent pays normally when agent exists on-chain', async () => {
    const { x402 } = await import('@/domain/x402')
    const { stellarService } = await import('@/services/stellar-service')
    const a = await x402.createAgent()
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    expect(keys).not.toBeNull()
    const hash = await x402.topUpAgent(50, keys!.stellarSecret, a.index)
    expect(hash).toBe('test-mock-hash')
    expect(stellarService.submitPayment).toHaveBeenCalledWith(
      expect.objectContaining({ amount: '50.0000000' }),
    )
  })
})
