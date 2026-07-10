import {
  Keypair,
  TransactionBuilder,
  Contract,
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

  private get friendbotUrl(): string | null {
    return this.network === 'testnet' ? 'https://friendbot-testnet.stellar.org' : null
  }

  // ── Account Management ────────────────────────────────────────

  createKeypair(): { publicKey: string; secretKey: string } {
    const kp = Keypair.random()
    return { publicKey: kp.publicKey(), secretKey: kp.secret() }
  }

  async accountExists(publicKey: string): Promise<boolean> {
    try {
      await this.horizon.loadAccount(publicKey)
      return true
    } catch {
      try {
        await this.soroban.getAccount(publicKey)
        return true
      } catch {
        return false
      }
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

  async fundAccount(publicKey: string): Promise<boolean> {
    const exists = await this.accountExists(publicKey)
    if (exists) return true

    if (!this.friendbotUrl) {
      console.warn('Friendbot only available on testnet')
      return false
    }

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(`${this.friendbotUrl}?addr=${publicKey}`, {
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!response.ok) {
        const text = await response.text()
        console.warn('Friendbot error:', text)
        // If account already exists, that's fine
        if (text.includes('already') || text.includes('exist')) return true
        return false
      }

      const data = await response.json()
      if (!data.hash) return false

      // Wait for account to appear on-chain
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
        return true
      }
      console.warn('Friendbot failed:', e.message)
      return false
    }
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
    } catch {
      return { xlm: 0, usdc: 0, assets: [] }
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
    if (!funded) return false
    return this.waitForAccount(publicKey)
  }

  async invokeContract(params: InvokeParams): Promise<string> {
    const sourceKp = Keypair.fromSecret(params.signerSecret)
    const sourcePub = sourceKp.publicKey()

    const funded = await this.ensureAccountFunded(sourcePub)
    if (!funded) {
      throw new Error(`Account ${sourcePub.slice(0, 8)}... does not exist on-chain and funding failed`)
    }

    const account = await this.soroban.getAccount(sourcePub)
    const contract = new Contract(params.contractId)

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(params.method, ...params.args))
      .setTimeout(30)
      .build()

    const prepared = await this.soroban.prepareTransaction(tx)
    prepared.sign(sourceKp)

    const sendResult = await this.soroban.sendTransaction(prepared)
    if (sendResult.status === 'ERROR') {
      throw new Error('Transaction rejected by network')
    }

    const hash = sendResult.hash
    for (let i = 0; i < 60; i++) {
      const result = await this.soroban.getTransaction(hash)
      if (result.status === 'SUCCESS') return hash
      if (result.status === 'FAILED') {
        const r: any = result
        let msg = 'Transaction failed'
        if (r.resultString) msg += `: ${r.resultString}`
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

    const account = await this.soroban.getAccount(params.source)
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
    const isTestnet = (config.sorobanRpcUrl || '').includes('testnet')
    return new StellarService({
      network: isTestnet ? 'testnet' : 'mainnet',
      horizonUrl: config.horizonUrl,
      sorobanRpcUrl: config.sorobanRpcUrl,
      networkPassphrase: config.networkPassphrase,
    })
  } catch {
    return new StellarService({ network: 'testnet' })
  }
}

export const stellarService = createService()
