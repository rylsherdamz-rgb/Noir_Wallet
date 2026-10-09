import { NoirAgentClient, type WatchOptions } from './client.js'
import { eventToJSON, type NoirEvent } from './events.js'

/** Header carrying `t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<body>">`. */
export const SIGNATURE_HEADER = 'X-Noir-Signature'
/** Reject deliveries older than this, so a captured request can't be replayed later. */
export const DEFAULT_TOLERANCE_SEC = 300

const enc = new TextEncoder()

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Buffer.from(sig).toString('hex')
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function signWebhookBody(secret: string, body: string, timestampSec = Math.floor(Date.now() / 1000)): Promise<string> {
  return `t=${timestampSec},v1=${await hmacHex(secret, `${timestampSec}.${body}`)}`
}

/**
 * For the receiving app: true only when `header` was produced by a relay that
 * knows `secret`, for exactly this raw `body`, within `toleranceSec`.
 */
export async function verifyWebhookSignature(
  secret: string, body: string, header: string | null | undefined,
  opts: { toleranceSec?: number; nowSec?: number } = {},
): Promise<boolean> {
  if (!header) return false
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.trim().split('=', 2) as [string, string]))
  const t = Number(parts.t)
  if (!Number.isFinite(t) || !parts.v1) return false
  const now = opts.nowSec ?? Math.floor(Date.now() / 1000)
  if (Math.abs(now - t) > (opts.toleranceSec ?? DEFAULT_TOLERANCE_SEC)) return false
  return timingSafeEqualHex(parts.v1, await hmacHex(secret, `${t}.${body}`))
}

export interface WebhookRelayOptions extends Omit<WatchOptions, 'onEvent'> {
  /** Your endpoint. Receives POST application/json `{ event: {...} }`. */
  url: string
  /** Shared secret for the signature header. Use 32+ random bytes. */
  secret: string
  /** Retries per event after the first attempt. Default 4. */
  retries?: number
  /** First retry delay, doubling each time. Default 1000 ms. */
  backoffMs?: number
  /** Called once an event was delivered (2xx) or gave up. */
  onDelivery?: (event: NoirEvent, result: { ok: boolean; status?: number; attempts: number }) => void
  fetchImpl?: typeof fetch
}

/**
 * Watches Noir events and POSTs each one to `url`, signed. Delivery is
 * at-least-once: dedupe on `event.id`. Returns a stop function.
 */
export function startWebhookRelay(client: NoirAgentClient, opts: WebhookRelayOptions): () => void {
  const doFetch = opts.fetchImpl ?? fetch
  const retries = opts.retries ?? 4
  const backoffMs = opts.backoffMs ?? 1000

  const deliver = async (event: NoirEvent) => {
    const body = JSON.stringify({ event: eventToJSON(event) })
    let status: number | undefined
    let attempt = 0
    while (attempt < retries + 1) {
      attempt++
      try {
        const res = await doFetch(opts.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', [SIGNATURE_HEADER]: await signWebhookBody(opts.secret, body) },
          body,
        })
        status = res.status
        if (res.ok) return opts.onDelivery?.(event, { ok: true, status, attempts: attempt })
        if (status >= 400 && status < 500 && status !== 429) break // the receiver rejected it; retrying won't help
      } catch (e) {
        opts.onError?.(e)
      }
      if (attempt <= retries) await new Promise((r) => setTimeout(r, backoffMs * 2 ** (attempt - 1)))
    }
    opts.onDelivery?.(event, { ok: false, status, attempts: attempt })
  }

  return client.watch({ ...opts, onEvent: deliver })
}
