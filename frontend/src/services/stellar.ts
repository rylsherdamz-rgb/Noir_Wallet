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
    this.server = new Horizon.Server(Config.horizonUrl)
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
    const urls = [
      `https://friendbot.stellar.org?addr=${publicKey}`,
      `https://horizon-testnet.stellar.org/friendbot?addr=${publicKey}`,
    ]
    for (const url of urls) {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 10000)
        const response = await fetch(url, { signal: controller.signal })
        clearTimeout(timer)
        const text = await response.text()
        if (response.ok) {
          const json = JSON.parse(text)
          return !!json.hash
        }
        const json = JSON.parse(text)
        if (json.detail?.includes('already funded')) return true
      } catch {
        continue
      }
    }
    return false
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
      const usdcBalance = balances.find(
        (b) => b.asset_code === 'USDC',
      )

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

  async loadAccount(publicKey: string): Promise<Horizon.AccountResponse | null> {
    try {
      return await this.server.loadAccount(publicKey)
    } catch {
      return null
    }
  }
}

export const stellarService = new StellarService()
