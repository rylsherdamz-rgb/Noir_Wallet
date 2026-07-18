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
  isActive: boolean
  createdAt: string
}

function addressScVal(addr: string): xdr.ScVal {
  return Address.fromString(addr).toScVal()
}

const deviceNonces = new Map<string, number>()

async function ensureAgentInSecureStore(): Promise<void> {
  const { walletService } = await import('@/services/wallet')
  const keys = await walletService.loadKeys()
  if (keys?.agentSecret) {
    const cached = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
    if (cached !== keys.agentSecret) {
      await SecureStore.setItemAsync(AGENT_SECRET_KEY, keys.agentSecret)
      await SecureStore.setItemAsync(AGENT_PUBLIC_KEY, keys.agentPublic)
    }
  }
}

async function syncCreatedTimestamp(): Promise<string> {
  let created = await SecureStore.getItemAsync(AGENT_CREATED_KEY)
  if (!created) {
    created = new Date().toISOString()
    await SecureStore.setItemAsync(AGENT_CREATED_KEY, created)
  }
  return created
}

export const x402 = {
  async createAgent(): Promise<AgentWallet> {
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    if (!keys?.agentSecret) {
      throw new Error('Wallet must be initialized before creating agent')
    }

    await SecureStore.setItemAsync(AGENT_PUBLIC_KEY, keys.agentPublic)
    await SecureStore.setItemAsync(AGENT_SECRET_KEY, keys.agentSecret)
    await SecureStore.setItemAsync(AGENT_BUDGET_KEY, String(DEFAULT_BUDGET_XLM * 10_000_000))

    const created = await syncCreatedTimestamp()

    try {
      await stellarService.fundAccount(keys.agentPublic)
    } catch {
      console.warn('Agent funding skipped — friendbot may be unavailable.')
    }

    let balanceStroops = 0
    try {
      const onChain = await stellarService.getBalance(keys.agentPublic)
      balanceStroops = Math.floor(onChain.xlm * 10_000_000)
    } catch { /* non-critical */ }

    return {
      publicKey: keys.agentPublic,
      balanceStroops,
      spendingBudgetStroops: balanceStroops,
      totalSpentStroops: 0,
      isActive: true,
      createdAt: created,
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

    // Ensure agent account exists on-chain before paying
    const agentPub = Keypair.fromSecret(secret).publicKey()
    const exists = await stellarService.accountExists(agentPub)
    if (!exists) {
      const funded = await stellarService.fundAccount(agentPub)
      if (!funded) {
        return { error: 'Agent wallet not funded — fund your wallet first via Settings → Fund Wallet' }
      }
    }

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
   * Register both device and agent in sequence, sharing one Horizon account
   * load to eliminate redundant network calls.
   * Each step independently handles AlreadyRegistered so a re-provision doesn't
   * block the other from completing.
   */
  async registerDeviceAndAgentOnChain(params: {
    walletSecret: string
    deviceHashHex: string
    agentPublicKey: string
  }): Promise<void> {
    const contractIdDevice = AppConfig.stellar.deviceRegistryContract
    const contractIdAgent = AppConfig.stellar.agentRegistryContract
    if (!contractIdDevice) throw new Error('deviceRegistryContract not configured')
    if (!contractIdAgent) throw new Error('agentRegistryContract not configured')

    const isAlreadyRegistered = (e: any) => {
      const msg = e?.message ?? ''
      return msg.includes('Error(Contract, #4)') || msg.includes('Error(Contract, #3)') || msg.includes('AlreadyRegistered')
    }

    const kp = Keypair.fromSecret(params.walletSecret)
    const pub = kp.publicKey()
    const account = await stellarService.loadSourceAccount(pub)

    try {
      await stellarService.invokeContract({
        contractId: contractIdDevice,
        method: 'register',
        args: [
          stellarService.walletAddressScVal(pub),
          stellarService.deviceHashScVal(params.deviceHashHex),
          stellarService.walletAddressScVal(params.agentPublicKey),
        ],
        signerSecret: params.walletSecret,
        sourceAccount: account,
      })
    } catch (e: any) {
      if (!isAlreadyRegistered(e)) throw e
    }

    account.incrementSequenceNumber()

    try {
      await stellarService.invokeContract({
        contractId: contractIdAgent,
        method: 'register_agent',
        args: [
          stellarService.walletAddressScVal(pub),
          stellarService.deviceHashScVal(params.deviceHashHex),
          stellarService.walletAddressScVal(params.agentPublicKey),
        ],
        signerSecret: params.walletSecret,
        sourceAccount: account,
      })
    } catch (e: any) {
      if (!isAlreadyRegistered(e)) throw e
    }
  },

  // ── device_registry contract ──

  async registerDeviceOnChain(params: {
    walletSecret: string
    deviceHashHex: string
    agentPublicKey: string
  }): Promise<string> {
    const contractId = AppConfig.stellar.deviceRegistryContract
    if (!contractId) throw new Error('deviceRegistryContract not configured')

    return stellarService.invokeContract({
      contractId,
      method: 'register',
      args: [
        stellarService.walletAddressScVal(Keypair.fromSecret(params.walletSecret).publicKey()),
        stellarService.deviceHashScVal(params.deviceHashHex),
        stellarService.walletAddressScVal(params.agentPublicKey),
      ],
      signerSecret: params.walletSecret,
    })
  },

  async revokeDeviceOnChain(params: {
    walletSecret: string
    deviceHashHex: string
  }): Promise<string> {
    const contractId = AppConfig.stellar.deviceRegistryContract
    if (!contractId) throw new Error('deviceRegistryContract not configured')

    return stellarService.invokeContract({
      contractId,
      method: 'revoke',
      args: [
        stellarService.walletAddressScVal(Keypair.fromSecret(params.walletSecret).publicKey()),
        stellarService.deviceHashScVal(params.deviceHashHex),
      ],
      signerSecret: params.walletSecret,
    })
  },

  // ── agent_registry contract ──

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

  async revokeAgentOnChain(params: {
    walletSecret: string
    deviceHashHex: string
  }): Promise<string> {
    const contractId = AppConfig.stellar.agentRegistryContract
    if (!contractId) throw new Error('agentRegistryContract not configured')

    return stellarService.invokeContract({
      contractId,
      method: 'revoke_agent',
      args: [
        stellarService.walletAddressScVal(Keypair.fromSecret(params.walletSecret).publicKey()),
        stellarService.deviceHashScVal(params.deviceHashHex),
      ],
      signerSecret: params.walletSecret,
    })
  },

  async getEscrowBalance(deviceHashHex: string): Promise<number> {
    const contractId = AppConfig.stellar.paymentEscrowContract
    if (!contractId) return 0

    await ensureAgentInSecureStore()
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
    const cached = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
    if (cached) return true
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    return !!keys?.agentSecret
  },

  async getAgent(): Promise<AgentWallet | null> {
    await ensureAgentInSecureStore()
    const agentSecret = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
    if (!agentSecret) return null

    const pub = await SecureStore.getItemAsync(AGENT_PUBLIC_KEY)
    const budgetRaw = await SecureStore.getItemAsync(AGENT_BUDGET_KEY)
    const created = await SecureStore.getItemAsync(AGENT_CREATED_KEY)
    const kp = Keypair.fromSecret(agentSecret)
    const onChain = await stellarService.getBalance(kp.publicKey())

    const budgetCap = DEFAULT_BUDGET_XLM * 10_000_000
    const remainingBudget = budgetRaw ? parseInt(budgetRaw, 10) : budgetCap
    const totalSpent = Math.max(0, budgetCap - remainingBudget)

    return {
      publicKey: pub || kp.publicKey(),
      balanceStroops: Math.floor(onChain.xlm * 10_000_000),
      spendingBudgetStroops: budgetCap,
      totalSpentStroops: totalSpent,
      isActive: true,
      createdAt: created || new Date().toISOString(),
    }
  },

  async getAgentSecret(): Promise<string | null> {
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    if (keys?.agentSecret) {
      const cached = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
      if (cached !== keys.agentSecret) {
        await SecureStore.setItemAsync(AGENT_SECRET_KEY, keys.agentSecret)
        await SecureStore.setItemAsync(AGENT_PUBLIC_KEY, keys.agentPublic)
      }
      return keys.agentSecret
    }
    return SecureStore.getItemAsync(AGENT_SECRET_KEY)
  },

  async getPendingBalance(merchantAddress: string): Promise<number> {
    const contractId = AppConfig.stellar.paymentEscrowContract
    if (!contractId) return 0

    await ensureAgentInSecureStore()
    const source = await SecureStore.getItemAsync(AGENT_PUBLIC_KEY)
    if (!source) return 0

    const result = await stellarService.readContract({
      contractId,
      method: 'pending_balance',
      args: [addressScVal(merchantAddress)],
      source,
    })
    return Number(result)
  },

  async clearAgent(): Promise<void> {
    await SecureStore.deleteItemAsync(AGENT_SECRET_KEY)
    await SecureStore.deleteItemAsync(AGENT_PUBLIC_KEY)
    await SecureStore.deleteItemAsync(AGENT_BUDGET_KEY)
    await SecureStore.deleteItemAsync(AGENT_CREATED_KEY)
  },

  async getAgentBalanceXlm(): Promise<number> {
    const secret = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
    if (!secret) return 0
    const kp = Keypair.fromSecret(secret)
    const bal = await stellarService.getBalance(kp.publicKey())
    return bal.xlm
  },

  async topUpAgent(amountXlm: number, fromSecret: string): Promise<string> {
    const secret = await SecureStore.getItemAsync(AGENT_SECRET_KEY)
    if (!secret) throw new Error('No agent wallet configured')
    const agentPub = Keypair.fromSecret(secret).publicKey()
    const result = await stellarService.submitPayment({
      sourceSecret: fromSecret,
      destination: agentPub,
      amount: amountXlm.toFixed(7),
      assetCode: 'XLM',
    })
    if ('error' in result) throw new Error(result.error)
    return result.hash
  },

  /**
   * Query the device_registry contract for all devices owned by a wallet.
   * Returns an array of { deviceUidHash, agentPublicKey, createdAt }.
   * Throws if the contract is not configured or query fails.
   */
  async getOnChainDevices(walletAddress: string): Promise<{
    deviceUidHash: string
    agentPublicKey: string
    createdAt: string
  }[]> {
    const contractId = AppConfig.stellar.deviceRegistryContract
    if (!contractId) throw new Error('deviceRegistryContract not configured')

    const countScVal = await stellarService.readContract({
      contractId,
      method: 'wallet_device_count',
      args: [stellarService.walletAddressScVal(walletAddress)],
      source: walletAddress,
    })
    const count = Number(countScVal)

    const devices: { deviceUidHash: string; agentPublicKey: string; createdAt: string }[] = []
    for (let i = 0; i < count; i++) {
      const hashScVal = await stellarService.readContract({
        contractId,
        method: 'wallet_device_at',
        args: [stellarService.walletAddressScVal(walletAddress), xdr.ScVal.scvU32(i)],
        source: walletAddress,
      })
      const raw: Uint8Array = hashScVal.bytes()
      const deviceHashHex = Buffer.from(raw).toString('hex')

      const agentScVal = await stellarService.readContract({
        contractId,
        method: 'get_agent',
        args: [stellarService.deviceHashScVal(deviceHashHex)],
        source: walletAddress,
      })
      const agentAddr = Address.fromScVal(agentScVal).toString()

      let createdAt = ''
      try {
        const devScVal = await stellarService.readContract({
          contractId,
          method: 'get_device',
          args: [stellarService.deviceHashScVal(deviceHashHex)],
          source: walletAddress,
        })
        const devVec = devScVal.vec()
        if (devVec && devVec.length >= 4) {
          createdAt = new Date(Number(devVec[3]) * 1000).toISOString()
        }
      } catch { /* non-critical */ }

      devices.push({ deviceUidHash: deviceHashHex, agentPublicKey: agentAddr, createdAt })
    }
    return devices
  },
}
