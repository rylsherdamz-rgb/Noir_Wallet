import { Keypair } from '@stellar/stellar-sdk'
import { mnemonicToSeed } from '@scure/bip39'

/**
 * SEP-5 key derivation (SLIP-10 ed25519, path m/44'/148'/index'), the same
 * scheme the Noir app uses, so a phrase imported here opens the same wallet.
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md
 */
const HARDENED = 0x80000000
const enc = new TextEncoder()

async function hmacSha512(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', key as BufferSource, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, data as BufferSource))
}

export async function deriveKeypair(mnemonic: string, index = 0): Promise<Keypair> {
  const seed = await mnemonicToSeed(mnemonic.trim().toLowerCase().split(/\s+/).join(' '))
  let I = await hmacSha512(enc.encode('ed25519 seed'), seed)
  let key = I.slice(0, 32)
  let chain = I.slice(32)
  for (const segment of [44, 148, index]) {
    const data = new Uint8Array(37)
    data.set(key, 1)
    new DataView(data.buffer).setUint32(33, (segment + HARDENED) >>> 0)
    I = await hmacSha512(chain, data)
    key = I.slice(0, 32)
    chain = I.slice(32)
  }
  return Keypair.fromRawEd25519Seed(Buffer.from(key))
}
