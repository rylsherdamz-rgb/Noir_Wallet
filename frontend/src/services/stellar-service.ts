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
  authorizeEntry,
} from '@stellar/stellar-sdk/axios'
import { Buffer } from 'buffer'
import { TransactionBase } from '@stellar/stellar-sdk/axios'
import type { Transaction, AssetCode } from '@/types'

declare const __DEV__: boolean | undefined

const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : false

TransactionBase.prototype.toXDR = function () {
  const raw = this.toEnvelope().toXDR()
  return Buffer.from(raw).toString('base64')
}

const CACHE_TTL_MS = 30000

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

function makeCache<T>(): (key: string, ttl: number, fetcher: () => Promise<T>) => Promise<T> {
  const store = new Map<string, CacheEntry<T>>()
  return async (key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> => {
    const existing = store.get(key)
    if (existing && Date.now() < existing.expiresAt) {
      return existing.value
    }
    const value = await fetcher()
    store.set(key, { value, expiresAt: Date.now() + ttl })
    return value
  }
}

export interface StellarServiceOptions {
  network?: 'testnet' | 'mainnet'
  sorobanRpcUrl?: string
  networkPassphrase?: string
}

export interface BalanceResult {
  xlm: number
}

export interface InvokeParams {
  contractId: string
  method: string
  args: xdr.ScVal[]
  signerSecret: string
  /** Pre-loaded Horizon account — skips the Horizon loadAccount call. */
  sourceAccount?: any
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
  private existsCache: (key: string, ttl: number, fetcher: () => Promise<boolean>) => Promise<boolean>

  constructor(opts?: StellarServiceOptions) {
    const isTestnet = opts?.network !== 'mainnet'
    this.network = isTestnet ? 'testnet' : 'mainnet'
    this.horizon = new Horizon.Server(
      isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org',
    )
    this.soroban = new rpc.Server(
      opts?.sorobanRpcUrl ?? (isTestnet ? 'https://soroban-testnet.stellar.org' : 'https://soroban.stellar.org'),
    ) as rpc.Server
    this.networkPassphrase = opts?.networkPassphrase ?? (isTestnet ? Networks.TESTNET : Networks.PUBLIC)
    this.existsCache = makeCache<boolean>()
  }

  get networkName() { return this.network }

  setNetwork(network: 'testnet' | 'mainnet'): void {
    if (network === this.network) return
    const isTestnet = network !== 'mainnet'
    this.network = isTestnet ? 'testnet' : 'mainnet'
    this.horizon = new Horizon.Server(
      isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org',
    )
    this.soroban = new rpc.Server(
      isTestnet ? 'https://soroban-testnet.stellar.org' : 'https://soroban.stellar.org',
    ) as rpc.Server
    this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC
    console.log(`[StellarService] network switched to ${this.network}`)
  }

  private get friendbotUrl(): string | null {
    return this.network === 'testnet' ? 'https://friendbot-testnet.stellar.org' : null
  }

  // ── Account Management (Horizon) ──────────────────────────────

  createKeypair(): { publicKey: string; secretKey: string } {
    const kp = Keypair.random()
    return { publicKey: kp.publicKey(), secretKey: kp.secret() }
  }

  async accountExists(publicKey: string, retries = 2): Promise<boolean> {
    return this.existsCache(publicKey, CACHE_TTL_MS, async () => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          await this.horizon.loadAccount(publicKey)
          return true
        } catch (e: any) {
          const status = e?.response?.status ?? e?.response?.statusCode
          const isNotFound = status === 404 || e?.name === 'NotFoundError'
          if (!isNotFound && attempt < retries) {
            await new Promise(r => setTimeout(r, 1500))
            continue
          }
          if (isNotFound) return false
        }
      }
      return false
    })
  }

  async getBalance(publicKey: string): Promise<BalanceResult> {
    try {
      const account = await this.horizon.loadAccount(publicKey)
      const balances = account.balances as any[]
      const xlmBalance = balances.find((b: any) => b.asset_type === 'native')

      return {
        xlm: parseFloat(xlmBalance?.balance ?? '0'),
      }
    } catch (e: any) {
      const status = e?.response?.status ?? e?.response?.statusCode
      const isNotFound = status === 404 || e?.name === 'NotFoundError'
      if (!isNotFound) {
        console.warn(
          `[getBalance] non-404 error for ${publicKey.slice(0, 8)}... on ${this.network}:`,
          e?.message ?? e,
        )
      }
      return { xlm: 0 }
    }
  }

  async submitPayment(params: {
    sourceSecret: string
    destination: string
    amount: string
    assetCode?: string
    assetIssuer?: string
  }): Promise<{ hash: string } | { error: string }> {
    try {
      const sourceKp = Keypair.fromSecret(params.sourceSecret)
      const sourcePub = sourceKp.publicKey()

      // Verify source exists on Horizon
      let sourceAccount
      try {
        sourceAccount = await this.horizon.loadAccount(sourcePub)
      } catch {
        return { error: 'Source account not found — fund it first' }
      }

      // Verify destination exists (Stellar Payment requires it)
      const destExists = await this.accountExists(params.destination)
      if (!destExists) {
        return { error: `Destination account ${params.destination.slice(0, 8)}... does not exist — send at least 1 XLM via create account first` }
      }

      const asset =
        params.assetCode && params.assetCode !== 'XLM' && params.assetIssuer
          ? new Asset(params.assetCode, params.assetIssuer)
          : Asset.native()

      const tx = new TransactionBuilder(sourceAccount, {
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
      const msg = err?.response?.data?.detail || err?.response?.data?.title || err?.message || 'Transaction failed'
      return { error: msg }
    }
  }

  async waitForAccount(publicKey: string, timeoutMs = 15000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.accountExists(publicKey)) return true
      await new Promise(r => setTimeout(r, 1000))
    }
    return false
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

  // ── Soroban Contract Operations (RPC) ─────────────────────────

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
      return this.waitForAccount(publicKey, 30000)
    }
    return this.waitForAccount(publicKey)
  }

  async invokeContract(params: InvokeParams): Promise<string> {
    const sourceKp = Keypair.fromSecret(params.signerSecret)
    const sourcePub = sourceKp.publicKey()
    console.log(`[invokeContract] source=${sourcePub.slice(0, 8)}... method=${params.method} network=${this.network}`)

    const funded = await this.ensureAccountFunded(sourcePub)
    if (!funded) {
      console.warn(
        `Account ${sourcePub.slice(0, 8)}... not confirmed on ${this.network} — ` +
        `attempting transaction anyway.`
      )
    }

    // Obtain the sequence from Horizon, or use a pre-loaded account.
    let account
    if (params.sourceAccount) {
      account = params.sourceAccount
    } else {
      try {
        account = await this.horizon.loadAccount(sourcePub)
      } catch (e: any) {
        throw new Error(`Could not load source account from Horizon: ${e?.message || 'unknown error'}`)
      }
    }

    const contract = new Contract(params.contractId)
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(params.method, ...params.args))
      .setTimeout(30)
      .build()

    const txXdr = tx.toXDR()
    if (IS_DEV) {
      console.log(`[invokeContract] tx XDR: ${txXdr.substring(0, 80)}...`)
    }

    // ── Simulate + Assemble (dApp skill pattern) ───────────────────
    // Use simulateTransaction + assembleTransaction instead of the legacy
    // prepareTransaction flow.  This avoids the TimeBounds conflict that
    // occurs when cloneFrom + setTimeout try to overwrite bounds already
    // present on the prepared transaction.
    let simulation: any
    try {
      simulation = await this.soroban.simulateTransaction(tx)
      if (IS_DEV) {
        console.log(`[invokeContract] simulateTransaction OK for ${params.method}`)
      }
    } catch (e: any) {
      const errMsg = typeof e === 'object' ? (e?.message ?? e?.data ?? JSON.stringify(e)) : String(e)
      console.error(`[invokeContract] simulateTransaction failed for ${params.method}`, {
        error: errMsg,
        xdrPrefix: txXdr.substring(0, 80),
        source: params.signerSecret.slice(0, 8) + '...',
      })
      throw new Error(`Transaction simulation failed: ${errMsg}`)
    }

    if (rpc.Api.isSimulationError(simulation)) {
      console.error(`[invokeContract] simulation error for ${params.method}`, simulation.error)
      throw new Error(`Simulation error: ${simulation.error}`)
    }

    let prepared: any
    try {
      const assembled = rpc.assembleTransaction(tx, simulation)
      prepared = assembled.build()
      if (IS_DEV) {
        console.log(`[invokeContract] assembleTransaction OK for ${params.method}`)
      }
    } catch (e: any) {
      const errMsg = typeof e === 'object' ? (e?.message ?? e?.data ?? JSON.stringify(e)) : String(e)
      console.error(`[invokeContract] assembleTransaction failed for ${params.method}`, {
        error: errMsg,
      })
      throw new Error(`Transaction assembly failed: ${errMsg}`)
    }

    // ── Sign auth entries (if any) ─────────────────────────────────
    // The simulation may return unsigned auth entries for contracts that
    // call require_auth().  We sign them with the source keypair, then
    // rebuild the operation with the signed auth entries — WITHOUT calling
    // setTimeout or cloneFrom (which caused the TimeBounds conflict).
    try {
      const env = xdr.TransactionEnvelope.fromXDR(prepared.toXDR(), 'base64')
      const ops = env.v1().tx().operations()
      const invokeBody = ops[0].body().value() as xdr.InvokeHostFunctionOp
      const authEntries = Array.from(invokeBody.auth())
      if (IS_DEV) console.log(`[invokeContract] auth entries:`, authEntries.length)
      if (authEntries.length > 0) {
        const { sequence } = await this.soroban.getLatestLedger()
        const validUntil = sequence + 10
        if (IS_DEV) console.log(`[invokeContract] signing ${authEntries.length} auth entries, validUntil=${validUntil}`)
        const signed = await Promise.all(
          authEntries.map((entry: any) =>
            authorizeEntry(entry, sourceKp, validUntil, this.networkPassphrase)
          )
        )

        // Rebuild with signed auth — use the *original* TransactionBuilder
        // (not cloneFrom) and attach the sorobanData from the assembled tx.
        const sorobanData = env.v1().tx().ext().sorobanData()
        const newOp = Operation.invokeHostFunction({
          func: invokeBody.hostFunction(),
          auth: signed,
        })
        const freshAccount = params.sourceAccount ?? await this.horizon.loadAccount(sourcePub)
        prepared = new TransactionBuilder(freshAccount, {
          fee: BASE_FEE,
          networkPassphrase: this.networkPassphrase,
          sorobanData,
        })
          .addOperation(newOp)
          .setTimeout(30)
          .build()
        if (IS_DEV) {
          console.log(`[invokeContract] signed ${signed.length} auth entr${signed.length === 1 ? 'y' : 'ies'} for ${params.method}`)
        }
      }
    } catch (e: any) {
      const errMsg = typeof e === 'object' ? (e?.message ?? e?.data ?? JSON.stringify(e)) : String(e)
      console.error(`[invokeContract] auth signing failed for ${params.method}`, {
        error: errMsg,
        xdrPrefix: txXdr.substring(0, 80),
        source: params.signerSecret.slice(0, 8) + '...',
      })
      throw new Error(`Transaction auth signing failed: ${errMsg}`)
    }

    prepared.sign(sourceKp)

    let sendResult: any
    try {
      sendResult = await this.soroban.sendTransaction(prepared)
    } catch (e: any) {
      const errMsg = typeof e === 'object' ? (e?.message ?? e?.data ?? JSON.stringify(e)) : String(e)
      console.error(`[invokeContract] sendTransaction failed for ${params.method}`, {
        error: errMsg,
        source: params.signerSecret.slice(0, 8) + '...',
      })
      throw new Error(`Failed to submit transaction: ${errMsg}`)
    }

    const hash = sendResult.hash

    if (sendResult.status === 'ERROR') {
      const errXdr = sendResult.errorResultXdr
      console.warn(`[invokeContract] sendTransaction ERROR for ${params.method}`, {
        hash,
        errorResultXdr: errXdr,
      })
      // Network rejected at submission stage — still return hash so the caller
      // (invokeContractAndWait or txMonitor) can poll getTransaction for the
      // final result or retry if needed.
      return hash
    }

    // Fire-and-forget: returns hash immediately, no polling.
    // Callers that need finality should use invokeContractAndWait or txMonitor.
    return hash
  }

  async invokeContractAndWait(params: InvokeParams): Promise<string> {
    const hash = await this.invokeContract(params)

    for (let i = 0; i < 60; i++) {
      const result: any = await this.soroban.getTransaction(hash)
      if (result.status === 'SUCCESS') {
        return hash
      }
      if (result.status === 'FAILED') {
        let msg = 'Transaction failed'
        try {
          const txRes: any = result.resultXdr
          const r = txRes.result()
          const opResults = r.value()
          const opRes = opResults[0]
          const opCode = opRes.switch().name
          if (opCode === 'opINNER') {
            const inner = opRes.value()
            msg = `Contract error: ${inner.value()?.switch()?.name ?? inner.switch().name}`
          } else {
            msg = `Operation error: ${opCode}`
          }
        } catch (_) {}
        console.error(`[invokeContractAndWait] transaction FAILED for ${params.method}`, { hash, msg })
        throw new Error(msg)
      }
      await new Promise(r => setTimeout(r, 1000))
    }

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

  async loadSourceAccount(publicKey: string): Promise<any> {
    return this.horizon.loadAccount(publicKey)
  }

  async getPaymentStatus(hash: string): Promise<'confirmed' | 'failed' | 'not_found'> {
    try {
      const tx: any = await this.horizon.transactions().transaction(hash)
      if (!tx) return 'not_found'
      return tx.successful ? 'confirmed' : 'failed'
    } catch (e: any) {
      if (e?.response?.status === 404) return 'not_found'
      return 'not_found'
    }
  }

  async readContract(params: ReadParams): Promise<xdr.ScVal> {
    const exists = await this.accountExists(params.source)
    if (!exists) {
      throw new Error(`Account ${params.source.slice(0, 8)}... does not exist on-chain`)
    }

    // Horizon is the source of the account sequence. Do not block contract
    // reads on `rpc.getAccount`, which is inconsistently supported by RPC
    // providers for classic accounts.
    const account = await this.horizon.loadAccount(params.source)
    const contract = new Contract(params.contractId)

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(params.method, ...params.args))
      .setTimeout(30)
      .build()

    const txXdr = tx.toXDR()
    if (IS_DEV) {
      console.log(`[readContract] tx XDR: ${txXdr.substring(0, 80)}...`)
    }

    const sim = await this.soroban.simulateTransaction(tx)

    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(sim.error)
    }

    if (!sim.result) {
      throw new Error('Simulation returned no result')
    }

    return sim.result.retval
  }

  async getAccountTransactions(publicKey: string, limit = 20): Promise<Transaction[]> {
    try {
      const records: any[] = []
      let cursor: string | undefined
      for (let i = 0; i < 3 && records.length < limit; i++) {
        const builder = this.horizon.transactions().forAccount(publicKey).order('desc').limit(limit)
        if (cursor) builder.cursor(cursor)
        const page: any = await builder.call()
        records.push(...page.records)
        cursor = page.records[page.records.length - 1]?.paging_token
      }
      return records.slice(0, limit).map((tx: any) => ({
        id: tx.hash,
        stellarTxHash: tx.hash,
        merchantId: tx.source_account,
        merchantName: tx.memo_type === 'text' ? (tx.memo || 'Stellar TX') : 'Stellar TX',
        userId: publicKey,
        deviceId: tx.source_account,
        amountCents: 0,
        assetCode: 'XLM' as AssetCode,
        status: tx.successful ? 'confirmed' : 'failed',
        errorMessage: tx.successful ? null : 'Transaction failed',
        createdAt: tx.created_at,
      }))
    } catch {
      return []
    }
  }

  async registerDevice(params: RegisterDeviceParams): Promise<string> {
    const sourceKp = Keypair.fromSecret(params.walletSecret)
    const sourcePub = sourceKp.publicKey()
    const walletScVal = Address.fromString(sourcePub).toScVal()
    const hashScVal = xdr.ScVal.scvBytes(Buffer.from(params.deviceHashHex, 'hex'))

    return this.invokeContractAndWait({
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
    console.log(`[StellarService] Creating service for ${network}`)
    return new StellarService({
      network,
      sorobanRpcUrl: config.sorobanRpcUrl,
      networkPassphrase: config.networkPassphrase,
    })
  } catch (e) {
    console.warn('[StellarService] Failed to load config, defaulting to testnet:', e)
    return new StellarService({ network: 'testnet' })
  }
}

export const stellarService = createService()
