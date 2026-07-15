import { Keypair, xdr, Address } from '@stellar/stellar-sdk'
import { secureGetItem, secureSetItem, secureDeleteItem } from '@/services/secureStorage'
import { stellarService } from '@/services/stellar-service'
import { AppConfig } from '@/constants/config'

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
  escrowBalanceStroops: number
  isActive: boolean
  createdAt: string
}

function addressScVal(addr: string): xdr.ScVal {
  return Address.fromString(addr).toScVal()
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
        escrowBalanceStroops: 0,
        isActive: true,
        createdAt: created || new Date().toISOString(),
      }
    }

    const kp = Keypair.random()
    await SecureStore.setItemAsync(AGENT_PUBLIC_KEY, kp.publicKey())
    await SecureStore.setItemAsync(AGENT_SECRET_KEY, kp.secret())
    await SecureStore.setItemAsync(AGENT_BUDGET_KEY, String(DEFAULT_BUDGET_XLM * 10_000_000))
    await SecureStore.setItemAsync(AGENT_CREATED_KEY, new Date().toISOString())

    const funded = await stellarService.fundAccount(kp.publicKey())
    if (!funded) {
      console.warn('Agent funding skipped — friendbot may be unavailable. Keypair created, usable after manual funding.')
    }

    return {
      publicKey: kp.publicKey(),
      balanceStroops: 0,
      spendingBudgetStroops: DEFAULT_BUDGET_XLM * 10_000_000,
      totalSpentStroops: 0,
      escrowBalanceStroops: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
  },

  /** Legacy: classic Stellar Horizon payment. Kept for fallback. */
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

  /**
   * Register agent on-chain via agent_registry contract.
   * The wallet owner signs to authorize this agent for a device hash.
   */
  async registerAgentOnChain(params: {
    walletSecret: string
    deviceHashHex: string
    agentPublicKey: string
  }): Promise<string> {
    const contractId = AppConfig.stellar.agentRegistryContract
    if (!contractId) throw new Error('agentRegistryContract not configured')

    return stellarService.invokeContract({
      contractId,
      method: 'register_agent',
      args: [
        stellarService.walletAddressScVal(Keypair.fromSecret(params.walletSecret).publicKey()),
        stellarService.deviceHashScVal(params.deviceHashHex),
        stellarService.walletAddressScVal(params.agentPublicKey),
      ],
      signerSecret: params.walletSecret,
    })
  },

  /**
   * Fund escrow for a device. Wallet owner deposits XLM into the escrow
   * contract so the agent can authorize payments without per-tap submission.
   */
  async fundEscrow(params: {
    walletSecret: string
    deviceHashHex: string
    amountStroops: number
  }): Promise<string> {
    const contractId = AppConfig.stellar.paymentEscrowContract
    if (!contractId) throw new Error('paymentEscrowContract not configured')

    const walletKp = Keypair.fromSecret(params.walletSecret)
    // Native XLM token address on Soroban
    const nativeToken = Address.fromString(
      'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
    )

    return stellarService.invokeContract({
      contractId,
      method: 'fund_escrow',
      args: [
        addressScVal(nativeToken.toString()),
        addressScVal(walletKp.publicKey()),
        stellarService.deviceHashScVal(params.deviceHashHex),
        xdr.ScVal.scvI128(new xdr.Int128Parts({ lo: new xdr.Uint64(params.amountStroops), hi: new xdr.Int64(0) })),
      ],
      signerSecret: params.walletSecret,
    })
  },

  /**
   * Authorize a payment from escrow. Agent signs — no per-tap Horizon
   * submission needed. The merchant claims in batch later.
   */
  async authorizePayment(params: {
    agentSecret: string
    deviceHashHex: string
    merchantAddress: string
    amountStroops: number
  }): Promise<string> {
    const contractId = AppConfig.stellar.paymentEscrowContract
    if (!contractId) throw new Error('paymentEscrowContract not configured')

    return stellarService.invokeContract({
      contractId,
      method: 'authorize',
      args: [
        addressScVal(Keypair.fromSecret(params.agentSecret).publicKey()),
        stellarService.deviceHashScVal(params.deviceHashHex),
        addressScVal(params.merchantAddress),
        xdr.ScVal.scvI128(new xdr.Int128Parts({ lo: new xdr.Uint64(params.amountStroops), hi: new xdr.Int64(0) })),
      ],
      signerSecret: params.agentSecret,
    })
  },

  /**
   * Claim pending escrow payments as a merchant.
   */
  async claimPayments(params: {
    merchantSecret: string
  }): Promise<string> {
    const contractId = AppConfig.stellar.paymentEscrowContract
    if (!contractId) throw new Error('paymentEscrowContract not configured')

    const nativeToken = Address.fromString(
      'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
    )
    const merchantKp = Keypair.fromSecret(params.merchantSecret)

    return stellarService.invokeContract({
      contractId,
      method: 'claim',
      args: [
        addressScVal(nativeToken.toString()),
        addressScVal(merchantKp.publicKey()),
      ],
      signerSecret: params.merchantSecret,
    })
  },

  /**
   * Read escrow balance for a device hash.
   */
  async getEscrowBalance(deviceHashHex: string): Promise<number> {
    const contractId = AppConfig.stellar.paymentEscrowContract
    if (!contractId) return 0

    const source = await SecureStore.getItemAsync(AGENT_PUBLIC_KEY)
    if (!source) return 0

    const result = await stellarService.readContract({
      contractId,
      method: 'balance_of',
      args: [stellarService.deviceHashScVal(deviceHashHex)],
      source,
    })
    return Number(result)
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
      escrowBalanceStroops: 0,
      isActive: true,
      createdAt: created || new Date().toISOString(),
    }
  },

  async getAgentSecret(): Promise<string | null> {
    return SecureStore.getItemAsync(AGENT_SECRET_KEY)
  },

  async clearAgent(): Promise<void> {
    await SecureStore.deleteItemAsync(AGENT_SECRET_KEY)
    await SecureStore.deleteItemAsync(AGENT_PUBLIC_KEY)
    await SecureStore.deleteItemAsync(AGENT_BUDGET_KEY)
    await SecureStore.deleteItemAsync(AGENT_CREATED_KEY)
  },
}
