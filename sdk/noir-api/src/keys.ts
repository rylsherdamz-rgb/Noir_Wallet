import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export type Scope = 'read' | 'write' | 'webhooks'
export const SCOPES: readonly Scope[] = ['read', 'write', 'webhooks']

/** What the server stores for a key. The key itself is shown once, at creation, and never kept. */
export interface ApiKeyRecord {
  /** Public, non-secret id (also the key's visible prefix), used in logs and webhook ownership. */
  id: string
  name: string
  /** SHA-256 hex of the full key. */
  hash: string
  scopes: Scope[]
  /** Requests per minute; falls back to the server default. */
  rateLimit?: number
  /** Revoked keys stay listed for audit but authenticate nothing. */
  disabled?: boolean
}

const PREFIX = 'noir_sk_'
const KEY_RE = /^noir_sk_([a-z0-9]{8})_([A-Za-z0-9_-]{43})$/

export const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')

/** A fresh key and the record to store for it. Format: `noir_sk_<id>_<secret>`. */
export function generateKey(name: string, scopes: Scope[], rateLimit?: number): { key: string; record: ApiKeyRecord } {
  const id = randomBytes(6).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, '0').slice(0, 8)
  const key = `${PREFIX}${id}_${randomBytes(32).toString('base64url')}`
  return { key, record: { id, name, hash: hashKey(key), scopes, ...(rateLimit ? { rateLimit } : {}) } }
}

export class KeyStore {
  private byId = new Map<string, ApiKeyRecord>()

  constructor(records: ApiKeyRecord[]) {
    for (const r of records) {
      if (!/^[a-f0-9]{64}$/.test(r.hash)) throw new Error(`API key "${r.id}" has an invalid hash`)
      if (r.scopes.some((s) => !SCOPES.includes(s))) throw new Error(`API key "${r.id}" has an unknown scope`)
      this.byId.set(r.id, r)
    }
  }

  get size() { return this.byId.size }

  /** The record for a presented key, or null. Constant-time on the hash comparison. */
  verify(presented: string | undefined): ApiKeyRecord | null {
    const m = presented ? KEY_RE.exec(presented) : null
    if (!m) return null
    const rec = this.byId.get(m[1])
    if (!rec || rec.disabled) return null
    const a = Buffer.from(hashKey(presented!), 'hex')
    const b = Buffer.from(rec.hash, 'hex')
    return a.length === b.length && timingSafeEqual(a, b) ? rec : null
  }
}

/** Reads the key from `Authorization: Bearer …` or `X-API-Key`. */
export function presentedKey(headers: Record<string, string | string[] | undefined>): string | undefined {
  const auth = headers['authorization']
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7).trim()
  const x = headers['x-api-key']
  return typeof x === 'string' ? x.trim() : undefined
}
