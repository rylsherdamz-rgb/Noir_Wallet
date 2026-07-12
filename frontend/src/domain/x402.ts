import { Keypair } from '@stellar/stellar-sdk'
import { secureGetItem, secureSetItem, secureDeleteItem } from '@/services/secureStorage'
// The network-aware singleton (NOT the legacy '@/services/stellar', whose
// network is frozen at startup). Keeps the agent wallet on the same network
// as the rest of the app when the user toggles testnet/mainnet.
import { stellarService } from '@/services/stellar-service'

// Platform-aware secure storage: expo-secure-store on native, localStorage on
// web preview. Redirected here so the existing SecureStore.* call sites below
// keep working without change.
const SecureStore = {
  getItemAsync: secureGetItem,
  setItemAsync: secureSetItem,
  deleteItemAsync: secureDeleteItem,
}

const AGENT_SECRET_KEY = 'x402.agent.secret'
const AGENT_PUBLIC_KEY = 'x402.agent.public'
const AGENT_BUDGET_KEY = 'x402.agent.budget'
const AGENT_CREATED_KEY = 'x402.agent.created'

const DEFAULT_BUDGET_XLM = 500

export interface AgentWallet {
  publicKey: string
  balanceStroops: number
  spendingBudgetStroops: number
  totalSpentStroops: number
  isActive: boolean
  createdAt: string
}

export const x402 = {
  async createAgent(): Promise<AgentWallet> {
    const existingSecret = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
    if (existingSecret) {
      const pub = await SecureStore.getItemAsync(AGENT_PUBLIC_KEY)
      const created = await SecureStore.getItemAsync(AGENT_CREATED_KEY)
      return {
        publicKey: pub || '',
        balanceStroops: 0,
        spendingBudgetStroops: DEFAULT_BUDGET_XLM * 10_000_000,
        totalSpentStroops: 0,
        isActive: true,
        createdAt: created || new Date().toISOString(),
      }
    }

    const kp = Keypair.random()
    await SecureStore.setItemAsync(AGENT_PUBLIC_KEY, kp.publicKey())
    await SecureStore.setItemAsync(AGENT_SECRET_KEY, kp.secret())
    await SecureStore.setItemAsync(AGENT_BUDGET_KEY, String(DEFAULT_BUDGET_XLM * 10_000_000))
    await SecureStore.setItemAsync(AGENT_CREATED_KEY, new Date().toISOString())

    // Fund agent account and wait for it to be created on-chain
    const funded = await stellarService.fundAccount(kp.publicKey())
    if (!funded) {
      console.warn('Agent account funding failed - account may not be usable immediately')
    }

    return {
      publicKey: kp.publicKey(),
      balanceStroops: 0,
      spendingBudgetStroops: DEFAULT_BUDGET_XLM * 10_000_000,
      totalSpentStroops: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
  },

  async payWithAgent(params: {
    destination: string
    amount: string
    assetCode?: string
    assetIssuer?: string
  }): Promise<{ hash: string } | { error: string }> {
    const secret = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
    if (!secret) return { error: 'No agent wallet' }

    const result = await stellarService.submitPayment({
      sourceSecret: secret,
      ...params,
    })

    if ('hash' in result) {
      const budget = parseInt(await SecureStore.getItemAsync(AGENT_BUDGET_KEY) || '0', 10)
      const cost = Math.ceil(parseFloat(params.amount) * 10_000_000)
      await SecureStore.setItemAsync(AGENT_BUDGET_KEY, String(Math.max(0, budget - cost)))
    }

    return result
  },

  async hasAgent(): Promise<boolean> {
    return !!(await SecureStore.getItemAsync(AGENT_SECRET_KEY))
  },

  async getAgent(): Promise<AgentWallet | null> {
    const secret = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
    if (!secret) return null
    const pub = await SecureStore.getItemAsync(AGENT_PUBLIC_KEY)
    const budgetRaw = await SecureStore.getItemAsync(AGENT_BUDGET_KEY)
    const created = await SecureStore.getItemAsync(AGENT_CREATED_KEY)
    const kp = Keypair.fromSecret(secret)
    const onChain = await stellarService.getBalance(kp.publicKey())
    const budget = budgetRaw ? parseInt(budgetRaw, 10) : DEFAULT_BUDGET_XLM * 10_000_000
    const totalSpent = DEFAULT_BUDGET_XLM * 10_000_000 - budget
    return {
      publicKey: pub || kp.publicKey(),
      balanceStroops: Math.floor(onChain.xlm * 10_000_000),
      spendingBudgetStroops: budget,
      totalSpentStroops: Math.max(0, totalSpent),
      isActive: true,
      createdAt: created || new Date().toISOString(),
    }
  },

  async clearAgent(): Promise<void> {
    await SecureStore.deleteItemAsync(AGENT_SECRET_KEY)
    await SecureStore.deleteItemAsync(AGENT_PUBLIC_KEY)
    await SecureStore.deleteItemAsync(AGENT_BUDGET_KEY)
    await SecureStore.deleteItemAsync(AGENT_CREATED_KEY)
  },
}
