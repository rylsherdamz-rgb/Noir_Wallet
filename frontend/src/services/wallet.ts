import * as bip39 from 'bip39'
import { derivePath } from 'ed25519-hd-key'
import { Keypair } from '@stellar/stellar-sdk'
import { Buffer } from 'buffer'
import { StorageKeys, WalletListItem, getItem, setItem, removeItem } from './storage'

export type { WalletListItem }

const STELLAR_PATH = "m/44'/148'/0'"

export interface WalletKeys {
  mnemonic: string
  stellarSecret: string
  stellarPublic: string
  agentSecret: string
  agentPublic: string
  label?: string
  /**
   * Next HD index to allocate for a new agent. Agents are derived at
   * `m/44'/148'/0'/<index>'`. Index 1 is the legacy single agent
   * (`agentSecret`/`agentPublic`), so allocation starts at 2.
   */
  agentIndexNext?: number
  /**
   * HD indexes that have been permanently revoked. A retired index is NEVER
   * re-derived or reused, so a revoked agent can never be recovered.
   */
  retiredAgentIndexes?: number[]
}

export interface DerivedAgent {
  index: number
  secret: string
  public: string
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export class WalletService {
  async generateMnemonic(): Promise<string> {
    return bip39.generateMnemonic(128)
  }

  validateMnemonic(phrase: string): boolean {
    return bip39.validateMnemonic(phrase.trim().toLowerCase())
  }

  async deriveKeys(mnemonic: string, label?: string): Promise<WalletKeys> {
    const cleaned = mnemonic.trim().toLowerCase()
    const seed = await bip39.mnemonicToSeed(cleaned)
    const seedHex = toHex(new Uint8Array(seed.buffer, seed.byteOffset, seed.byteLength))

    const { key: mainSeed } = derivePath(STELLAR_PATH, seedHex)
    const mainKp = Keypair.fromRawEd25519Seed(Buffer.from(mainSeed.slice(0, 32)) as any)

    const agentPath = `${STELLAR_PATH}/1'`
    const { key: agentSeed } = derivePath(agentPath, seedHex)
    const agentKp = Keypair.fromRawEd25519Seed(Buffer.from(agentSeed.slice(0, 32)) as any)

    return {
      mnemonic: cleaned,
      stellarSecret: mainKp.secret(),
      stellarPublic: mainKp.publicKey(),
      agentSecret: agentKp.secret(),
      agentPublic: agentKp.publicKey(),
      label,
      // Legacy agent occupies index 1; new agents allocate from 2 onward.
      agentIndexNext: 2,
      retiredAgentIndexes: [],
    }
  }

  /**
   * Deterministically derive the agent keypair at a given HD index from the
   * mnemonic. Path: `m/44'/148'/0'/<index>'`. Index 1 is the legacy agent.
   * Because derivation is deterministic, the same mnemonic + index always
   * yields the same keypair — which is why retired indexes must never be reused.
   */
  deriveAgentAt(mnemonic: string, index: number): DerivedAgent {
    if (!Number.isInteger(index) || index < 1) {
      throw new Error(`Invalid agent index: ${index}`)
    }
    const cleaned = mnemonic.trim().toLowerCase()
    // bip39.mnemonicToSeedSync is synchronous; safe here since it is pure CPU.
    const seed = bip39.mnemonicToSeedSync(cleaned)
    const seedHex = toHex(new Uint8Array(seed.buffer, seed.byteOffset, seed.byteLength))
    const { key } = derivePath(`${STELLAR_PATH}/${index}'`, seedHex)
    const kp = Keypair.fromRawEd25519Seed(Buffer.from(key.slice(0, 32)) as any)
    return { index, secret: kp.secret(), public: kp.publicKey() }
  }

  /**
   * Allocate the next available agent index, persisting the bumped counter.
   * Skips any retired index defensively (retired indexes are never reused).
   * Returns the derived agent for the freshly allocated index.
   */
  async allocateAgentIndex(): Promise<DerivedAgent> {
    const keys = await this.loadKeys()
    if (!keys?.mnemonic) throw new Error('Wallet must be initialized before allocating an agent')

    const retired = new Set(keys.retiredAgentIndexes ?? [])
    let index = keys.agentIndexNext ?? 2
    while (retired.has(index)) index++

    const agent = this.deriveAgentAt(keys.mnemonic, index)
    await this.saveKeys({ ...keys, agentIndexNext: index + 1 })
    return agent
  }

  /**
   * Permanently retire an agent index. A retired index is recorded so it can
   * never be re-derived or reallocated — the revoked agent is unrecoverable.
   */
  async retireAgentIndex(index: number): Promise<void> {
    const keys = await this.loadKeys()
    if (!keys) return
    const retired = new Set(keys.retiredAgentIndexes ?? [])
    retired.add(index)
    await this.saveKeys({ ...keys, retiredAgentIndexes: Array.from(retired).sort((a, b) => a - b) })
  }

  /** True if an agent index has been permanently retired. */
  async isAgentIndexRetired(index: number): Promise<boolean> {
    const keys = await this.loadKeys()
    return !!keys?.retiredAgentIndexes?.includes(index)
  }

  async saveKeys(keys: WalletKeys): Promise<void> {
    await setItem(StorageKeys.WALLET_KEYS, keys)
  }

  async loadKeys(): Promise<WalletKeys | null> {
    return getItem<WalletKeys>(StorageKeys.WALLET_KEYS)
  }

  async clearKeys(): Promise<void> {
    await removeItem(StorageKeys.WALLET_KEYS)
  }

  // ── Multi-wallet management ─────────────────────────────────────

  async getWalletList(): Promise<WalletListItem[]> {
    return (await getItem<WalletListItem[]>(StorageKeys.WALLET_LIST)) ?? []
  }

  async getActiveWalletIndex(): Promise<number> {
    return (await getItem<number>(StorageKeys.ACTIVE_WALLET_INDEX)) ?? 0
  }

  async addWalletToList(wallet: WalletListItem): Promise<void> {
    const list = await this.getWalletList()
    const exists = list.find((w) => w.stellarPublic === wallet.stellarPublic)
    if (!exists) list.push(wallet)
    await setItem(StorageKeys.WALLET_LIST, list)
  }

  async removeWalletFromList(publicKey: string): Promise<void> {
    let list = await this.getWalletList()
    list = list.filter((w) => w.stellarPublic !== publicKey)
    await setItem(StorageKeys.WALLET_LIST, list)
    const activeIndex = await this.getActiveWalletIndex()
    if (activeIndex >= list.length) {
      await setItem(StorageKeys.ACTIVE_WALLET_INDEX, Math.max(0, list.length - 1))
    }
  }

  async switchToWallet(index: number): Promise<void> {
    await setItem(StorageKeys.ACTIVE_WALLET_INDEX, index)
  }
}

export const walletService = new WalletService()
