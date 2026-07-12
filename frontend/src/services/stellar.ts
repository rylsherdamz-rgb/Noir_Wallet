import {
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Horizon,
  BASE_FEE,
  Networks,
} from '@stellar/stellar-sdk'
import { Config } from '@/constants/config'

class StellarService {
  private server: Horizon.Server
  private networkPassphrase: string

  constructor() {
    this.server = new Horizon.Server(Config.horizonUrl!)
    this.networkPassphrase = Config.networkPassphrase
  }

  async createKeypair(): Promise<{ publicKey: string; secretKey: string }> {
    const kp = Keypair.random()
    return {
      publicKey: kp.publicKey(),
      secretKey: kp.secret(),
    }
  }

  async fundTestnetAccount(publicKey: string): Promise<boolean> {
    try {
      await this.server.loadAccount(publicKey)
      console.log('Account already exists on-chain')
      return true
    } catch {
      // doesn't exist yet, proceed to fund
    }

    const url = `https://friendbot-testnet.stellar.org?addr=${publicKey}`
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (!response.ok) {
        const text = await response.text()
        console.warn('Friendbot returned error:', text)
        return false
      }

      const text = await response.text()
      const json = JSON.parse(text)

      if (json.hash) {
        console.log('Account funded via Friendbot:', json.hash)
        for (let i = 0; i < 10; i++) {
          try {
            await this.server.loadAccount(publicKey)
            console.log('Account verified on-chain')
            return true
          } catch {
            await new Promise(r => setTimeout(r, 1000))
          }
        }
        console.warn('Account funded but still not visible after 10s')
        return true
      }

      return false
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.warn('Friendbot request timed out')
      } else {
        console.warn('Friendbot failed:', e.message)
      }
      return false
    }
  }

  async getBalance(publicKey: string): Promise<{
    xlm: number
    usdc: number
    assets: Array<{ code: string; issuer: string; balance: string }>
  }> {
    try {
      const account = await this.server.loadAccount(publicKey)
      const balances = account.balances as any[]
      const xlmBalance = balances.find((b) => b.asset_type === 'native')
      const usdcBalance = balances.find((b) => b.asset_code === 'USDC')

      return {
        xlm: parseFloat(xlmBalance?.balance ?? '0'),
        usdc: parseFloat(usdcBalance?.balance ?? '0'),
        assets: balances
          .filter((b) => b.asset_type !== 'native')
          .map((b: any) => ({
            code: b.asset_code,
            issuer: b.asset_issuer,
            balance: b.balance,
          })),
      }
    } catch {
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
      const account = await this.server.loadAccount(sourcePub)

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
      const result = await this.server.submitTransaction(tx)
      return { hash: result.hash }
    } catch (err: any) {
      return { error: err.message ?? 'Transaction failed' }
    }
  }

  async buildSignedPaymentXdr(params: {
    sourceSecret: string
    destination: string
    amount: string
    assetCode?: string
    assetIssuer?: string
    memo?: string
  }): Promise<{ xdr: string } | { error: string }> {
    try {
      const sourceKp = Keypair.fromSecret(params.sourceSecret)
      const account = await this.server.loadAccount(sourceKp.publicKey())

      const asset =
        params.assetCode && params.assetCode !== 'XLM' && params.assetIssuer
          ? new Asset(params.assetCode, params.assetIssuer)
          : Asset.native()

      let builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      }).addOperation(
        Operation.payment({
          destination: params.destination,
          asset,
          amount: params.amount,
        }),
      )

      if (params.memo && params.memo.trim()) {
        const { Memo } = require('@stellar/stellar-sdk')
        builder = builder.addMemo(Memo.text(params.memo.slice(0, 28)))
      }

      const tx = builder.setTimeout(120).build()
      tx.sign(sourceKp)
      return { xdr: tx.toXDR() }
    } catch (err: any) {
      return { error: err.message ?? 'Failed to build transaction' }
    }
  }

  async loadAccount(publicKey: string): Promise<Horizon.AccountResponse | null> {
    try {
      return await this.server.loadAccount(publicKey)
    } catch {
      return null
    }
  }
}

export const stellarService = new StellarService()
