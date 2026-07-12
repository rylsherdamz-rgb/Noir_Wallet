import {
  Keypair,
  TransactionBuilder,
  Contract,
  Operation,
  Asset,
  BASE_FEE,
  Networks,
  rpc,
  xdr,
  Address,
  Horizon,
} from '@stellar/stellar-sdk'
import { Buffer } from 'buffer'

export interface StellarServiceOptions {
  network?: 'testnet' | 'mainnet'
  horizonUrl?: string
  sorobanRpcUrl?: string
  networkPassphrase?: string
}

export interface BalanceResult {
  xlm: number
  usdc: number
  assets: Array<{ code: string; issuer: string; balance: string }>
}

export interface InvokeParams {
  contractId: string
  method: string
  args: xdr.ScVal[]
  signerSecret: string
}

export interface ReadParams {
  contractId: string
  method: string
  args: xdr.ScVal[]
  source: string
}

export interface RegisterDeviceParams {
  contractId: string
  deviceHashHex: string
  walletSecret: string
}

export class StellarService {
  private horizon: Horizon.Server
  private soroban: rpc.Server
  private networkPassphrase: string
  private network: 'testnet' | 'mainnet'

  constructor(opts?: StellarServiceOptions) {
    const isTestnet = opts?.network !== 'mainnet'
    this.network = isTestnet ? 'testnet' : 'mainnet'
    this.horizon = new Horizon.Server(
      opts?.horizonUrl ?? (isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org'),
    )
    this.soroban = new rpc.Server(
      opts?.sorobanRpcUrl ?? (isTestnet ? 'https://soroban-testnet.stellar.org' : 'https://soroban.stellar.org'),
    )
    this.networkPassphrase = opts?.networkPassphrase ?? (isTestnet ? Networks.TESTNET : Networks.PUBLIC)
  }

  get networkName() { return this.network }

  /**
   * Re-point the service at a different Stellar network at runtime.
   *
   * The service is a singleton, so without this the network chosen at startup
   * (from EXPO_PUBLIC_STELLAR_NETWORK) is frozen forever — even if the UI
   * network toggle changes. That mismatch is what makes an account that is
   * clearly visible on one network's explorer read back as "not found".
   */
  setNetwork(network: 'testnet' | 'mainnet'): void {
    if (network === this.network) return
    const isTestnet = network !== 'mainnet'
    this.network = isTestnet ? 'testnet' : 'mainnet'
    this.horizon = new Horizon.Server(
      isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org',
    )
    this.soroban = new rpc.Server(
      isTestnet ? 'https://soroban-testnet.stellar.org' : 'https://soroban.stellar.org',
    )
    this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC
    console.log(`[StellarService] network switched to ${this.network}`)
  }

  private get friendbotUrl(): string | null {
    return this.network === 'testnet' ? 'https://friendbot-testnet.stellar.org' : null
  }

  // ── Account Management ────────────────────────────────────────

  createKeypair(): { publicKey: string; secretKey: string } {
    const kp = Keypair.random()
    return { publicKey: kp.publicKey(), secretKey: kp.secret() }
  }

  async accountExists(publicKey: string, retries = 2): Promise<boolean> {
    let sawTransientError = false
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.horizon.loadAccount(publicKey)
        return true
      } catch (e: any) {
        const status = e?.response?.status ?? e?.response?.statusCode
        const isNotFound = status === 404 || e?.name === 'NotFoundError'
        // Whether Horizon says "missing" or errors for another reason, confirm
        // against Soroban RPC before trusting a negative result.
        try {
          await this.soroban.getAccount(publicKey)
          return true
        } catch {}
        if (!isNotFound) {
          // Non-404 (network blip, 429 rate-limit, 5xx, TLS/DNS) — NOT proof the
          // account is missing. Retry rather than reporting a false negative.
          sawTransientError = true
        }
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1500))
        }
      }
    }
    if (sawTransientError) {
      console.warn(
        `[accountExists] ${publicKey.slice(0, 8)}... reported missing on ${this.network}, ` +
        `but network/RPC errors occurred — this may be a connectivity issue, not a missing account.`,
      )
    }
    return false
  }

  async waitForAccount(publicKey: string, timeoutMs = 15000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.accountExists(publicKey)) return true
      await new Promise(r => setTimeout(r, 1000))
    }
    return false
  }

  /**
   * Wait until the *Soroban RPC* can see the account, returning it.
   *
   * Horizon (what the explorer shows) and the Soroban RPC are different
   * services that ingest the ledger independently. Right after Friendbot
   * funding, Horizon often sees the account seconds before the RPC does —
   * a single `soroban.getAccount()` then throws "account not found" even
   * though the account is clearly visible on stellar.expert. Polling here
   * closes that race instead of failing on the first attempt.
   */
  async waitForAccountOnRpc(publicKey: string, timeoutMs = 20000): Promise<any | null> {
    const deadline = Date.now() + timeoutMs
    let lastError: any = null
    while (Date.now() < deadline) {
      try {
        return await this.soroban.getAccount(publicKey)
      } catch (e: any) {
        lastError = e
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    console.warn(
      `[waitForAccountOnRpc] ${publicKey.slice(0, 8)}... still not visible on the Soroban RPC ` +
      `(${this.soroban.serverURL}) after ${timeoutMs}ms. Last error:`,
      lastError?.message ?? lastError,
    )
    return null
  }

  async fundAccount(publicKey: string, retries = 2): Promise<boolean> {
    const exists = await this.accountExists(publicKey)
    if (exists) return true

    if (!this.friendbotUrl) {
      console.warn('Friendbot only available on testnet')
      return false
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) {
        console.warn(`Friendbot retry ${attempt}/${retries}...`)
        await new Promise(r => setTimeout(r, 2000))
      }

      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 15000)
        const response = await fetch(`${this.friendbotUrl}?addr=${publicKey}`, {
          signal: controller.signal,
        })
        clearTimeout(timer)

        if (!response.ok) {
          const text = await response.text()
          console.warn('Friendbot error:', text)
          if (text.includes('already') || text.includes('exist')) return true
          continue
        }

        const data = await response.json()
        if (!data.hash) continue

        for (let i = 0; i < 10; i++) {
          try {
            await this.horizon.loadAccount(publicKey)
            return true
          } catch { await new Promise(r => setTimeout(r, 1000)) }
        }
        return true
      } catch (e: any) {
        if (e.name === 'AbortError') {
          console.warn('Friendbot timed out — account may still be funding')
          continue
        }
        console.warn('Friendbot failed:', e.message)
      }
    }
    return false
  }

  async getBalance(publicKey: string): Promise<BalanceResult> {
    try {
      const account = await this.horizon.loadAccount(publicKey)
      const balances = account.balances as any[]
      const xlmBalance = balances.find((b: any) => b.asset_type === 'native')
      const usdcBalance = balances.find((b: any) => b.asset_code === 'USDC')

      return {
        xlm: parseFloat(xlmBalance?.balance ?? '0'),
        usdc: parseFloat(usdcBalance?.balance ?? '0'),
        assets: balances
          .filter((b: any) => b.asset_type !== 'native')
          .map((b: any) => ({ code: b.asset_code, issuer: b.asset_issuer, balance: b.balance })),
      }
    } catch (e: any) {
      const status = e?.response?.status ?? e?.response?.statusCode
      const isNotFound = status === 404 || e?.name === 'NotFoundError'
      if (!isNotFound) {
        console.warn(
          `[getBalance] non-404 error for ${publicKey.slice(0, 8)}... on ${this.network} ` +
          `(reporting zero balance may be misleading):`,
          e?.message ?? e,
        )
      }
      return { xlm: 0, usdc: 0, assets: [] }
    }
  }

  /**
   * Simple Horizon payment (XLM or issued asset), signed by the source.
   * Lives here (network-aware singleton) so callers like the x402 agent
   * always pay on the *currently selected* network — the old `stellar.ts`
   * service froze its network at startup, which could fund an agent on one
   * network and pay on another ("account not found" symptoms).
   */
  async submitPayment(params: {
    sourceSecret: string
    destination: string
    amount: string
    assetCode?: string
    assetIssuer?: string
  }): Promise<{ hash: string } | { error: string }> {
    try {
      const sourceKp = Keypair.fromSecret(params.sourceSecret)
      const account = await this.horizon.loadAccount(sourceKp.publicKey())

      const asset =
        params.assetCode && params.assetCode !== 'XLM' && params.assetIssuer
          ? new Asset(params.assetCode, params.assetIssuer)
          : Asset.native()

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: params.destination,
            asset,
            amount: params.amount,
          }),
        )
        .setTimeout(30)
        .build()

      tx.sign(sourceKp)
      const result = await this.horizon.submitTransaction(tx)
      return { hash: result.hash }
    } catch (err: any) {
      return { error: err?.message ?? 'Transaction failed' }
    }
  }

  // ── Soroban Contract Operations ───────────────────────────────

  deviceHashScVal(sha256Hex: string): xdr.ScVal {
    return xdr.ScVal.scvBytes(Buffer.from(sha256Hex, 'hex'))
  }

  walletAddressScVal(stellarPublicKey: string): xdr.ScVal {
    return Address.fromString(stellarPublicKey).toScVal()
  }

  async ensureAccountFunded(publicKey: string): Promise<boolean> {
    const exists = await this.accountExists(publicKey)
    if (exists) return true
    const funded = await this.fundAccount(publicKey)
    if (!funded) {
      // One last attempt — poll for up to 30s in case Friendbot is still processing
      return this.waitForAccount(publicKey, 30000)
    }
    return this.waitForAccount(publicKey)
  }

  async invokeContract(params: InvokeParams): Promise<string> {
    const sourceKp = Keypair.fromSecret(params.signerSecret)
    const sourcePub = sourceKp.publicKey()
    console.log(`[invokeContract] source=${sourcePub.slice(0, 8)}... method=${params.method} network=${this.network}`)

    const funded = await this.ensureAccountFunded(sourcePub)
    console.log(`[invokeContract] ensureAccountFunded returned=${funded} soroban=${this.soroban.serverURL}`)
    if (!funded) {
      console.warn(
        `Account ${sourcePub.slice(0, 8)}... not confirmed on ${this.network} — ` +
        `attempting transaction anyway. If it fails, fund with Friendbot first.`
      )
    }

    // Horizon (and the explorer) can see a freshly funded account seconds
    // before the Soroban RPC does — poll the RPC instead of failing on the
    // first "account not found".
    const account: any = await this.waitForAccountOnRpc(sourcePub)
    if (!account) {
      throw new Error(
        `Account ${sourcePub.slice(0, 8)}... is not visible on the Soroban RPC (${this.soroban.serverURL}) yet, ` +
        `even after waiting. It may exist on Horizon/stellar.expert while the RPC is still catching up — ` +
        `wait a few seconds and try again. Network: ${this.network}.`
      )
    }
    console.log(`[invokeContract] soroban.getAccount OK seq=${account.sequenceNumber}`)

    const contract = new Contract(params.contractId)
    console.log(`[invokeContract] building tx for contract=${params.contractId.slice(0, 8)}...`)

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(params.method, ...params.args))
      .setTimeout(30)
      .build()

    let prepared: any
    try {
      prepared = await this.soroban.prepareTransaction(tx)
      console.log(`[invokeContract] prepareTransaction OK`)
    } catch (e: any) {
      console.log(`[invokeContract] prepareTransaction FAILED:`, e?.message || e)
      throw new Error(`Transaction simulation failed: ${e?.message || 'unknown'}`)
    }

    prepared.sign(sourceKp)
    console.log(`[invokeContract] transaction signed`)

    let sendResult: any
    try {
      sendResult = await this.soroban.sendTransaction(prepared)
      console.log(`[invokeContract] sendTransaction status=${sendResult.status} hash=${sendResult.hash?.slice(0, 16)}...`)
    } catch (e: any) {
      console.log(`[invokeContract] sendTransaction FAILED:`, e?.message || e)
      throw new Error(`Failed to submit transaction: ${e?.message || 'unknown'}`)
    }

    if (sendResult.status === 'ERROR') {
      const errMsg = sendResult.errorResult?.resultString || 'Transaction rejected by network'
      console.log(`[invokeContract] ERROR: ${errMsg}`)
      throw new Error(errMsg)
    }

    const hash = sendResult.hash
    for (let i = 0; i < 60; i++) {
      const result: any = await this.soroban.getTransaction(hash)
      if (result.status === 'SUCCESS') {
        console.log(`[invokeContract] SUCCESS hash=${hash.slice(0, 16)}...`)
        return hash
      }
      if (result.status === 'FAILED') {
        console.log(`[invokeContract] FAILED: ${result.resultString || 'no details'}`)
        let msg = 'Transaction failed'
        if (result.resultString) msg += `: ${result.resultString}`
        throw new Error(msg)
      }
      await new Promise(r => setTimeout(r, 1000))
    }

    console.log(`[invokeContract] TIMEOUT after 60s`)
    throw new Error('Transaction timed out after 60s')
  }

  async getTransactionStatus(hash: string): Promise<{
    status: 'SUCCESS' | 'FAILED' | 'NOT_FOUND'
    returnValue?: xdr.ScVal
    error?: string
  }> {
    const r: any = await this.soroban.getTransaction(hash)
    return {
      status: r.status,
      returnValue: r.returnValue,
      error: r.status === 'FAILED' ? (r.resultString || 'Transaction failed') : undefined,
    }
  }

  async readContract(params: ReadParams): Promise<xdr.ScVal> {
    const exists = await this.accountExists(params.source)
    if (!exists) {
      throw new Error(`Account ${params.source.slice(0, 8)}... does not exist on-chain`)
    }

    const account = await this.waitForAccountOnRpc(params.source, 10000)
    if (!account) {
      throw new Error(
        `Account ${params.source.slice(0, 8)}... exists on Horizon but is not visible on the ` +
        `Soroban RPC yet — try again shortly.`
      )
    }
    const contract = new Contract(params.contractId)

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(params.method, ...params.args))
      .setTimeout(30)
      .build()

    const sim = await this.soroban.simulateTransaction(tx)

    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(sim.error)
    }

    if (!sim.result) {
      throw new Error('Simulation returned no result')
    }

    return sim.result.retval
  }

  // ── High-Level App Operations ─────────────────────────────────

  async registerDevice(params: RegisterDeviceParams): Promise<string> {
    const sourceKp = Keypair.fromSecret(params.walletSecret)
    const sourcePub = sourceKp.publicKey()
    const walletScVal = Address.fromString(sourcePub).toScVal()
    const hashScVal = xdr.ScVal.scvBytes(Buffer.from(params.deviceHashHex, 'hex'))

    return this.invokeContract({
      contractId: params.contractId,
      method: 'register',
      args: [hashScVal, walletScVal],
      signerSecret: params.walletSecret,
    })
  }
}

export function createService(): StellarService {
  try {
    const config = require('@/constants/config').Config
    const stellarNetworkConfig = require('@/constants/config').stellarNetwork
    const network: 'testnet' | 'mainnet' = stellarNetworkConfig === 'mainnet' ? 'mainnet' : 'testnet'
    console.log(`[StellarService] Creating service for ${network} (horizon: ${config.horizonUrl})`)
    return new StellarService({
      network,
      horizonUrl: config.horizonUrl,
      sorobanRpcUrl: config.sorobanRpcUrl,
      networkPassphrase: config.networkPassphrase,
    })
  } catch (e) {
    console.warn('[StellarService] Failed to load config, defaulting to testnet:', e)
    return new StellarService({ network: 'testnet' })
  }
}

export const stellarService = createService()
