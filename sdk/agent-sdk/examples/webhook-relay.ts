/**
 * Forwards every Noir event on Testnet to your HTTPS endpoint, signed.
 *
 *   NOIR_WEBHOOK_URL=https://your.app/noir-hook NOIR_WEBHOOK_SECRET=$(openssl rand -hex 32) \
 *     npx tsx examples/webhook-relay.ts
 *
 * Optional: NOIR_DEVICE_HASH=<64 hex> to forward one device's events only.
 */
import { NoirAgentClient, startWebhookRelay } from '../src/index.js'

const url = process.env.NOIR_WEBHOOK_URL
const secret = process.env.NOIR_WEBHOOK_SECRET
if (!url || !secret) {
  console.error('Set NOIR_WEBHOOK_URL and NOIR_WEBHOOK_SECRET')
  process.exit(1)
}

const noir = new NoirAgentClient()
const stop = startWebhookRelay(noir, {
  url,
  secret,
  deviceHash: process.env.NOIR_DEVICE_HASH,
  onDelivery: (e, r) => console.log(`${r.ok ? 'sent' : 'FAILED'} ${e.type} ${e.id} (status ${r.status ?? '-'}, ${r.attempts} attempt(s))`),
  onError: (e) => console.error('relay error:', e instanceof Error ? e.message : e),
})
console.log(`Relaying Noir Testnet events to ${url}. Ctrl+C to stop.`)
process.on('SIGINT', () => { stop(); process.exit(0) })
