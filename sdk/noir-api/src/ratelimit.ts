/**
 * Token bucket per key: `perMinute` requests, refilled continuously, so a
 * client can burst up to the limit and then settles at the steady rate.
 */
export class RateLimiter {
  private buckets = new Map<string, { tokens: number; at: number }>()

  constructor(private now: () => number = Date.now) {}

  /** Takes one token. `retryAfterSec` is set when there are none left. */
  take(key: string, perMinute: number): { ok: boolean; remaining: number; retryAfterSec?: number } {
    const t = this.now()
    const ratePerMs = perMinute / 60_000
    const b = this.buckets.get(key) ?? { tokens: perMinute, at: t }
    b.tokens = Math.min(perMinute, b.tokens + (t - b.at) * ratePerMs)
    b.at = t
    this.buckets.set(key, b)
    if (b.tokens < 1) return { ok: false, remaining: 0, retryAfterSec: Math.ceil((1 - b.tokens) / ratePerMs / 1000) }
    b.tokens -= 1
    return { ok: true, remaining: Math.floor(b.tokens) }
  }
}
