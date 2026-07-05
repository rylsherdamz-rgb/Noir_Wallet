import * as bip39 from 'bip39'
import { derivePath } from 'ed25519-hd-key'
import { Keypair } from '@stellar/stellar-sdk'
import { Buffer } from 'buffer'
import { StorageKeys, getItem, setItem, removeItem } from './storage'

const STELLAR_PATH = "m/44'/148'/0'"

export interface WalletKeys {
  mnemonic: string
  stellarSecret: string
  stellarPublic: string
  agentSecret: string
  agentPublic: string
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

  async deriveKeys(mnemonic: string): Promise<WalletKeys> {
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
    }
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
}

export const walletService = new WalletService()
