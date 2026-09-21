import { Keypair, xdr, Address } from '@stellar/stellar-sdk'
import { secureGetItem, secureSetItem, secureDeleteItem } from '@/services/secureStorage'
import { stellarService } from '@/services/stellar-service'
import { AppConfig } from '@/constants/config'
import { logger } from '@/lib/logger'

const SecureStore = {
  getItemAsync: secureGetItem,
  setItemAsync: secureSetItem,
  deleteItemAsync: secureDeleteItem,
}

// ── Per-agent SecureStore keys ──────────────────────────────────────────────
// Each agent is namespaced by its HD index, so multiple agents coexist without
// clobbering one another (the previous single-agent cache was the source of the
// stale-key bugs). The set of live agent indexes lives in AGENTS_INDEX_KEY.
const AGENTS_INDEX_KEY = 'x402.agents.index'
const legacySecretKey = (i: number) => `x402.agent.${i}.secret`
const legacyPublicKey = (i: number) => `x402.agent.${i}.public`
const legacyBudgetKey = (i: number) => `x402.agent.${i}.budget`
const legacyCreatedKey = (i: number) => `x402.agent.${i}.created`
const legacyLabelKey = (i: number) => `x402.agent.${i}.label`
const legacyDeviceKey = (i: number) => `x402.agent.${i}.device`

// Legacy single-agent keys (pre-multi-agent). Migrated into index 1 on first use.
const OLD_SECRET_KEY = 'x402.agent.secret'
const OLD_PUBLIC_KEY = 'x402.agent.public'
const OLD_BUDGET_KEY = 'x402.agent.budget'
const OLD_CREATED_KEY = 'x402.agent.created'

const LEGACY_AGENT_INDEX = 1
const DEFAULT_BUDGET_XLM = 500
const DEFAULT_BUDGET_STROOPS = DEFAULT_BUDGET_XLM * 10_000_000

export interface AgentWallet {
  index: number
  publicKey: string
  label: string
  deviceHash?: string
  balanceStroops: number
  spendingBudgetStroops: number
  totalSpentStroops: number
  isActive: boolean
  createdAt: string
}

function addressScVal(addr: string): xdr.ScVal {
  return Address.fromString(addr).toScVal()
}

async function readIndexes(): Promise<number[]> {
  const raw = await SecureStore.getItemAsync(AGENTS_INDEX_KEY)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((n) => Number.isInteger(n)) : []
  } catch {
    return []
  }
}

async function writeIndexes(indexes: number[]): Promise<void> {
  const unique = Array.from(new Set(indexes)).sort((a, b) => a - b)
  await SecureStore.setItemAsync(AGENTS_INDEX_KEY, JSON.stringify(unique))
}

async function addIndex(index: number): Promise<void> {
  const idx = await readIndexes()
  if (!idx.includes(index)) await writeIndexes([...idx, index])
}

async function removeIndex(index: number): Promise<void> {
  const idx = await readIndexes()
  await writeIndexes(idx.filter((i) => i !== index))
}

/**
 * Migrate the pre-multi-agent single agent (flat SecureStore keys, or the
 * HD-derived agent from WalletKeys) into agent index 1. Idempotent.
 */
async function ensureLegacyAgentMigrated(): Promise<void> {
  const already = await SecureStore.getItemAsync(legacySecretKey(LEGACY_AGENT_INDEX))
  if (already) return

  // Prefer the HD-derived agent from the wallet (source of truth), fall back to
  // the old flat cache.
  const { walletService } = await import('@/services/wallet')
  const keys = await walletService.loadKeys()

  let secret = keys?.agentSecret ?? (await SecureStore.getItemAsync(OLD_SECRET_KEY)) ?? null
  let publicKey = keys?.agentPublic ?? (await SecureStore.getItemAsync(OLD_PUBLIC_KEY)) ?? null
  if (!secret || !publicKey) return

  // If a retired marker exists for index 1, do not resurrect it.
  if (await walletService.isAgentIndexRetired(LEGACY_AGENT_INDEX)) return

  const budget = (await SecureStore.getItemAsync(OLD_BUDGET_KEY)) ?? String(DEFAULT_BUDGET_STROOPS)
  const created = (await SecureStore.getItemAsync(OLD_CREATED_KEY)) ?? new Date().toISOString()

  await SecureStore.setItemAsync(legacySecretKey(LEGACY_AGENT_INDEX), secret)
  await SecureStore.setItemAsync(legacyPublicKey(LEGACY_AGENT_INDEX), publicKey)
  await SecureStore.setItemAsync(legacyBudgetKey(LEGACY_AGENT_INDEX), budget)
  await SecureStore.setItemAsync(legacyCreatedKey(LEGACY_AGENT_INDEX), created)
  await SecureStore.setItemAsync(legacyLabelKey(LEGACY_AGENT_INDEX), 'Agent 1')
  await addIndex(LEGACY_AGENT_INDEX)
}

async function loadAgentMeta(index: number): Promise<AgentWallet | null> {
  const secret = await SecureStore.getItemAsync(legacySecretKey(index))
  if (!secret) return null
  const publicKey = (await SecureStore.getItemAsync(legacyPublicKey(index))) || Keypair.fromSecret(secret).publicKey()
  const budgetRaw = await SecureStore.getItemAsync(legacyBudgetKey(index))
  const created = (await SecureStore.getItemAsync(legacyCreatedKey(index))) || new Date().toISOString()
  const label = (await SecureStore.getItemAsync(legacyLabelKey(index))) || `Agent ${index}`
  const deviceHash = (await SecureStore.getItemAsync(legacyDeviceKey(index))) || undefined

  const remainingBudget = budgetRaw ? parseInt(budgetRaw, 10) : DEFAULT_BUDGET_STROOPS
  const totalSpent = Math.max(0, DEFAULT_BUDGET_STROOPS - remainingBudget)

  let balanceStroops = 0
  try {
    const onChain = await stellarService.getBalance(publicKey)
    balanceStroops = Math.floor(onChain.xlm * 10_000_000)
  } catch { /* non-critical */ }

  return {
    index,
    publicKey,
    label,
    deviceHash,
    balanceStroops,
    spendingBudgetStroops: DEFAULT_BUDGET_STROOPS,
    totalSpentStroops: totalSpent,
    isActive: true,
    createdAt: created,
  }
}

export const x402 = {
  /**
   * Create a NEW agent by allocating the next HD index from the wallet,
   * deriving its keypair, and persisting per-agent metadata. Each agent starts
   * with a zero balance — the owner tops it up from their own wallet.
   * Returns the created agent. Pass a label and (optionally) the device hash it
   * is being linked to.
   */
  async createAgent(opts?: { label?: string; deviceHash?: string }): Promise<AgentWallet> {
    const { walletService } = await import('@/services/wallet')
    const derived = await walletService.allocateAgentIndex()

    await SecureStore.setItemAsync(legacySecretKey(derived.index), derived.secret)
    await SecureStore.setItemAsync(legacyPublicKey(derived.index), derived.public)
    await SecureStore.setItemAsync(legacyBudgetKey(derived.index), String(DEFAULT_BUDGET_STROOPS))
    const created = new Date().toISOString()
    await SecureStore.setItemAsync(legacyCreatedKey(derived.index), created)
    await SecureStore.setItemAsync(legacyLabelKey(derived.index), opts?.label ?? `Agent ${derived.index}`)
    if (opts?.deviceHash) await SecureStore.setItemAsync(legacyDeviceKey(derived.index), opts.deviceHash)
    await addIndex(derived.index)

    return {
      index: derived.index,
      publicKey: derived.public,
      label: opts?.label ?? `Agent ${derived.index}`,
      deviceHash: opts?.deviceHash,
      balanceStroops: 0,
      spendingBudgetStroops: DEFAULT_BUDGET_STROOPS,
      totalSpentStroops: 0,
      isActive: true,
      createdAt: created,
    }
  },

  /** List all live agents (excludes permanently retired ones). */
  async listAgents(): Promise<AgentWallet[]> {
    await ensureLegacyAgentMigrated()
    const indexes = await readIndexes()
    const agents: AgentWallet[] = []
    for (const i of indexes) {
      const a = await loadAgentMeta(i)
      if (a) agents.push(a)
    }
    return agents.sort((a, b) => a.index - b.index)
  },

  /** Resolve the agent index linked to a device hash, if any. */
  async getAgentIndexForDevice(deviceHash: string): Promise<number | null> {
    const indexes = await readIndexes()
    for (const i of indexes) {
      const dev = await SecureStore.getItemAsync(legacyDeviceKey(i))
      if (dev === deviceHash) return i
    }
    return null
  },

  /** Link an existing agent index to a device hash. */
  async linkAgentToDevice(index: number, deviceHash: string): Promise<void> {
    await SecureStore.setItemAsync(legacyDeviceKey(index), deviceHash)
  },

  /** Get a single agent's metadata + on-chain balance. Defaults to legacy agent 1. */
  async getAgent(index: number = LEGACY_AGENT_INDEX): Promise<AgentWallet | null> {
    await ensureLegacyAgentMigrated()
    return loadAgentMeta(index)
  },

  /** Secret for a given agent index (defaults to legacy agent 1). */
  async getAgentSecret(index: number = LEGACY_AGENT_INDEX): Promise<string | null> {
    await ensureLegacyAgentMigrated()
    return SecureStore.getItemAsync(legacySecretKey(index))
  },

  /** True if at least one agent exists. */
  async hasAgent(): Promise<boolean> {
    await ensureLegacyAgentMigrated()
    return (await readIndexes()).length > 0
  },

  /**
   * Wipe ALL local agent keys/metadata (used on account deletion / wallet
   * reset). Does NOT retire HD indexes — a fresh wallet restore re-derives
   * from the mnemonic. Retirement is reserved for explicit per-agent revoke.
   */
  async clearAllAgents(): Promise<void> {
    const indexes = await readIndexes()
    for (const i of indexes) {
      await SecureStore.deleteItemAsync(legacySecretKey(i))
      await SecureStore.deleteItemAsync(legacyPublicKey(i))
      await SecureStore.deleteItemAsync(legacyBudgetKey(i))
      await SecureStore.deleteItemAsync(legacyCreatedKey(i))
      await SecureStore.deleteItemAsync(legacyLabelKey(i))
      await SecureStore.deleteItemAsync(legacyDeviceKey(i))
    }
    await SecureStore.deleteItemAsync(AGENTS_INDEX_KEY)
    // Also clear any lingering pre-migration flat keys.
    await SecureStore.deleteItemAsync(OLD_SECRET_KEY)
    await SecureStore.deleteItemAsync(OLD_PUBLIC_KEY)
    await SecureStore.deleteItemAsync(OLD_BUDGET_KEY)
    await SecureStore.deleteItemAsync(OLD_CREATED_KEY)
  },

  async getAgentBalanceXlm(index: number = LEGACY_AGENT_INDEX): Promise<number> {
    const secret = await SecureStore.getItemAsync(legacySecretKey(index))
    if (!secret) return 0
    const kp = Keypair.fromSecret(secret)
    const bal = await stellarService.getBalance(kp.publicKey())
    return bal.xlm
  },

  /**
   * Pay from a specific agent, enforcing that agent's own spending budget
   * BEFORE submitting. Budgets are per-agent, so cards are isolated.
   */
  async payWithAgent(params: {
    agentIndex?: number
    destination: string
    amount: string
    assetCode?: string
    assetIssuer?: string
  }): Promise<{ hash: string } | { error: string }> {
    const index = params.agentIndex ?? LEGACY_AGENT_INDEX
    const secret = await SecureStore.getItemAsync(legacySecretKey(index))
    if (!secret) return { error: 'No agent wallet' }

    const agentPub = Keypair.fromSecret(secret).publicKey()
    const exists = await stellarService.accountExists(agentPub)
    if (!exists) {
      return { error: 'Agent wallet has no funds — top it up from the agent screen' }
    }

    const cost = Math.ceil(parseFloat(params.amount) * 10_000_000)
    const budgetRaw = await SecureStore.getItemAsync(legacyBudgetKey(index))
    const budget = budgetRaw ? parseInt(budgetRaw, 10) : DEFAULT_BUDGET_STROOPS
    if (cost > budget) {
      return { error: `Agent spending budget exhausted — ${(budget / 10_000_000).toFixed(2)} XLM remaining` }
    }

    const { agentIndex, ...paymentParams } = params
    const result = await stellarService.submitPayment({
      sourceSecret: secret,
      ...paymentParams,
    })

    if ('hash' in result) {
      await SecureStore.setItemAsync(legacyBudgetKey(index), String(budget - cost))
    }
    return result
  },

  /**
   * Top up a specific agent from the owner's wallet. Creates the agent's
   * on-chain account if it does not exist yet.
   */
  async topUpAgent(amountXlm: number, fromSecret: string, index: number = LEGACY_AGENT_INDEX): Promise<string> {
    const secret = await SecureStore.getItemAsync(legacySecretKey(index))
    if (!secret) throw new Error('No agent wallet configured')
    const agentPub = Keypair.fromSecret(secret).publicKey()

    const exists = await stellarService.accountExists(agentPub)
    if (!exists) {
      const created = await stellarService.submitCreateAccount({
        sourceSecret: fromSecret,
        destination: agentPub,
        amount: amountXlm.toFixed(7),
      })
      if ('error' in created) throw new Error(created.error)
      return created.hash
    }

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
   * Sweep a specific agent's ENTIRE on-chain XLM balance (minus a fee cushion)
   * back to the destination (the owner). Used during revocation.
   */
  async sweepAgentFunds(destination: string, index: number = LEGACY_AGENT_INDEX): Promise<{ hash: string } | { error: string }> {
    const secret = await SecureStore.getItemAsync(legacySecretKey(index))
    if (!secret) return { error: 'No agent wallet' }

    const agentPub = Keypair.fromSecret(secret).publicKey()
    const exists = await stellarService.accountExists(agentPub)
    if (!exists) return { error: 'Agent wallet is empty — nothing to recover' }

    const bal = await stellarService.getBalance(agentPub)
    const sweepable = bal.xlm - 0.001
    if (sweepable <= 0.001) return { error: 'Agent wallet has no recoverable funds' }

    return stellarService.submitPayment({
      sourceSecret: secret,
      destination,
      amount: sweepable.toFixed(7),
      assetCode: 'XLM',
    })
  },

  /**
   * PERMANENTLY revoke an agent. Sweeps all XLM back to the owner, then wipes
   * the agent's local keys and retires its HD index so it can NEVER be
   * re-derived or recovered. On-chain agent/device revocation is handled by the
   * caller (revokeAgentOnChain / revokeDeviceOnChain) since it needs the
   * device hash and wallet secret.
   *
   * Returns the sweep result so the caller can surface the recovery tx hash.
   */
  async retireAgent(index: number, ownerAddress: string): Promise<{ hash: string } | { error: string } | { skipped: true }> {
    const secret = await SecureStore.getItemAsync(legacySecretKey(index))
    if (!secret) {
      // Nothing to sweep, but still ensure the index is retired.
      const { walletService } = await import('@/services/wallet')
      await walletService.retireAgentIndex(index)
      return { skipped: true }
    }

    let sweep: { hash: string } | { error: string } | { skipped: true } = { skipped: true }
    try {
      const result = await this.sweepAgentFunds(ownerAddress, index)
      sweep = result
    } catch (e: any) {
      logger.warn(`[x402] sweep during retire failed: ${e?.message ?? e}`)
      sweep = { error: e?.message ?? 'sweep failed' }
    }

    // Wipe local keys/metadata.
    await SecureStore.deleteItemAsync(legacySecretKey(index))
    await SecureStore.deleteItemAsync(legacyPublicKey(index))
    await SecureStore.deleteItemAsync(legacyBudgetKey(index))
    await SecureStore.deleteItemAsync(legacyCreatedKey(index))
    await SecureStore.deleteItemAsync(legacyLabelKey(index))
    await SecureStore.deleteItemAsync(legacyDeviceKey(index))
    await removeIndex(index)

    // Permanently retire the HD index — never reused, never recoverable.
    const { walletService } = await import('@/services/wallet')
    await walletService.retireAgentIndex(index)

    return sweep
  },

  // ── device_registry contract ──

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

    const walletScVal = stellarService.walletAddressScVal(pub)
    const deviceHashScVal = stellarService.deviceHashScVal(params.deviceHashHex)
    const agentScVal = stellarService.walletAddressScVal(params.agentPublicKey)

    let deviceRegistered = false
    try {
      await stellarService.readContract({
        contractId: contractIdDevice,
        method: 'get_device',
        args: [deviceHashScVal],
        source: pub,
      })
      deviceRegistered = true
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (!msg.includes('Error(Contract, #2)') && !msg.includes('DeviceNotFound')) {
        logger.debug(`[x402] device pre-check failed (falling back to write): ${msg}`)
      }
    }

    let agentRegistered = false
    try {
      const auth = await stellarService.readContract({
        contractId: contractIdAgent,
        method: 'is_auth',
        args: [deviceHashScVal, agentScVal],
        source: pub,
      })
      agentRegistered = auth.b() === true
    } catch (e: any) {
      logger.debug(`[x402] agent pre-check failed (falling back to write): ${e?.message ?? e}`)
    }

    let registerSubmitted = false
    if (!deviceRegistered) {
      try {
        await stellarService.invokeContract({
          contractId: contractIdDevice,
          method: 'register',
          args: [walletScVal, deviceHashScVal, agentScVal],
          signerSecret: params.walletSecret,
          sourceAccount: account,
        })
        registerSubmitted = true
      } catch (e: any) {
        if (!isAlreadyRegistered(e)) throw e
      }
    }

    if (registerSubmitted) account.incrementSequenceNumber()

    if (!agentRegistered) {
      try {
        await stellarService.invokeContract({
          contractId: contractIdAgent,
          method: 'register_agent',
          args: [walletScVal, deviceHashScVal, agentScVal],
          signerSecret: params.walletSecret,
          sourceAccount: account,
        })
      } catch (e: any) {
        if (!isAlreadyRegistered(e)) throw e
      }
    }
  },

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

  // ── payment_escrow (views) ──

  async getEscrowBalance(deviceHashHex: string, index: number = LEGACY_AGENT_INDEX): Promise<number> {
    const contractId = AppConfig.stellar.paymentEscrowContract
    if (!contractId) return 0

    const source = await SecureStore.getItemAsync(legacyPublicKey(index))
    if (!source) return 0

    const result = await stellarService.readContract({
      contractId,
      method: 'balance_of',
      args: [stellarService.deviceHashScVal(deviceHashHex)],
      source,
    })
    return Number(result)
  },

  async getPendingBalance(merchantAddress: string, index: number = LEGACY_AGENT_INDEX): Promise<number> {
    const contractId = AppConfig.stellar.paymentEscrowContract
    if (!contractId) return 0

    const source = await SecureStore.getItemAsync(legacyPublicKey(index))
    if (!source) return 0

    const result = await stellarService.readContract({
      contractId,
      method: 'pending_balance',
      args: [addressScVal(merchantAddress)],
      source,
    })
    return Number(result)
  },

  /**
   * Query device_registry for all devices owned by a wallet.
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
