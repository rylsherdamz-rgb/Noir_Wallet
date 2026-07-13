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
          `[getBalance] non-404 error for ${publicKey.slice(0, 8)}... on ${this.network}:`,
          e?.message ?? e,
        )
      }
      return { xlm: 0, usdc: 0, assets: [] }
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

    // Obtain the sequence from Horizon. `rpc.getAccount` is an optional RPC
    // convenience lookup and some providers do not index classic accounts
    // reliably. The RPC simulation below is the authoritative preflight for
    // the contract transaction.
    let account
    try {
      account = await this.horizon.loadAccount(sourcePub)
    } catch (e: any) {
      throw new Error(`Could not load source account from Horizon: ${e?.message || 'unknown error'}`)
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
    if (__DEV__) {
      console.log(`[invokeContract] tx XDR: ${txXdr.substring(0, 80)}...`)
    }

    let prepared: any
    try {
      prepared = await this.soroban.prepareTransaction(tx)
      if (__DEV__) {
        console.log(`[invokeContract] prepareTransaction OK for ${params.method}`)
      }
    } catch (e: any) {
      const errMsg = typeof e === 'object' ? (e?.message ?? e?.data ?? JSON.stringify(e)) : String(e)
      console.error(`[invokeContract] prepareTransaction failed for ${params.method}`, {
        error: errMsg,
        xdrPrefix: txXdr.substring(0, 80),
        source: params.signerSecret.slice(0, 8) + '...',
      })
      throw new Error(`Transaction simulation failed: ${errMsg}`)
    }

    try {
      // Sign the auth entries on the prepared transaction.
      // The RPC simulation returns unsigned placeholder auth entries that need
      // the wallet's signature before submission, or the contract's
      // `require_auth()` call will reject the transaction.
      const env = xdr.TransactionEnvelope.fromXDR(prepared.toXDR(), 'base64')
      const ops = env.v1().tx().operations()
      const invokeBody = ops[0].body().value() as xdr.InvokeHostFunctionOp
      const authEntries = Array.from(invokeBody.auth())
      if (__DEV__) console.log(`[invokeContract] auth entries:`, authEntries.length)
      if (authEntries.length > 0) {
        const { sequence } = await this.soroban.getLatestLedger()
        const validUntil = sequence + 10
        if (__DEV__) console.log(`[invokeContract] signing ${authEntries.length} auth entries, validUntil=${validUntil}`)
        const signed = await Promise.all(
          authEntries.map((entry: any) =>
            authorizeEntry(entry, sourceKp, validUntil, this.networkPassphrase)
          )
        )
        // Extract sorobanData (resource fees, footprint) from the prepared
        // transaction's envelope to preserve it through the rebuild.
        const sorobanData = env.v1().tx().ext().sorobanData()

        // Build a new operation with signed auth, then rebuild the transaction
        // preserving fee, sorobanData, and other fields from the prepared tx.
        const newOp = Operation.invokeHostFunction({
          func: invokeBody.hostFunction(),
          auth: signed,
        })
        const builder = TransactionBuilder.cloneFrom(prepared, {
          networkPassphrase: this.networkPassphrase,
          sorobanData,
        })
        builder.clearOperations()
        builder.addOperation(newOp)
        builder.setTimeout(30)
        prepared = builder.build()
        if (__DEV__) {
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
      console.error(`[invokeContract] sendTransaction ERROR for ${params.method}`, {
        hash,
        errorResultXdr: errXdr,
        sendResult: JSON.stringify(sendResult),
      })
      try {
        if (errXdr) {
          const txResult: any = xdr.TransactionResult.fromXDR(errXdr, 'base64')
          const result: any = txResult.result()
          console.error(`[invokeContract] decoded result:`, {
            outerCode: result.switch().name,
            innerCode: result.value()?.switch?.()?.name,
          })
        }
      } catch (parseErr: any) {
        console.error(`[invokeContract] could not decode errorResultXdr:`, parseErr.message)
      }
      // Some RPCs return ERROR from sendTransaction but still include the tx;
      // poll getTransaction briefly as a fallback to confirm failure.
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000))
        const check: any = await this.soroban.getTransaction(hash)
        if (check.status === 'SUCCESS') return hash
        if (check.status === 'FAILED') {
          console.error(`[invokeContract] tx FAILED via poll for ${params.method}`, {
            resultString: check.resultString,
            resultXdr: check.resultXdr,
            hash,
          })
          throw new Error(check.resultString || 'Transaction failed')
        }
      }
      throw new Error(`Transaction rejected by network (hash: ${hash})`)
    }

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
        console.error(`[invokeContract] transaction FAILED for ${params.method}`, { hash, msg })
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
    if (__DEV__) {
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
