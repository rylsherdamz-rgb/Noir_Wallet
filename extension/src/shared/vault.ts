/**
 * The recovery phrase at rest: AES-256-GCM under a key stretched from the
 * user's password with PBKDF2-SHA256 (600k iterations, OWASP 2023). Nothing
 * else about the wallet is secret.
 */

export interface SealedVault {
  v: 1
  kdf: { name: 'PBKDF2'; hash: 'SHA-256'; iterations: number; salt: string }
  iv: string
  data: string
}

const ITERATIONS = 600_000
const enc = new TextEncoder()
const dec = new TextDecoder()
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  )
}

export async function seal(secret: string, password: string, iterations = ITERATIONS): Promise<SealedVault> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, iterations)
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(secret)))
  return { v: 1, kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations, salt: b64(salt) }, iv: b64(iv), data: b64(data) }
}

/** The secret, or null when the password is wrong (GCM authentication fails). */
export async function open(vault: SealedVault, password: string): Promise<string | null> {
  try {
    const key = await deriveKey(password, unb64(vault.kdf.salt), vault.kdf.iterations)
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(vault.iv) }, key, unb64(vault.data))
    return dec.decode(plain)
  } catch {
    return null
  }
}
