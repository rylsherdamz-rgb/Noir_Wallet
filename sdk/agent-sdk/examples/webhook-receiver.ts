/**
 * Minimal endpoint that accepts the relay's POSTs and checks the signature.
 *
 *   NOIR_WEBHOOK_SECRET=<same secret> npx tsx examples/webhook-receiver.ts   # listens on :8787
 */
import { createServer } from 'node:http'
import { verifyWebhookSignature, SIGNATURE_HEADER } from '../src/index.js'

const secret = process.env.NOIR_WEBHOOK_SECRET
if (!secret) { console.error('Set NOIR_WEBHOOK_SECRET'); process.exit(1) }
const seen = new Set<string>() // delivery is at-least-once: dedupe on event.id (use a real store in production)

createServer(async (req, res) => {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  const body = Buffer.concat(chunks).toString('utf8') // verify the RAW body, before any JSON parsing

  if (!(await verifyWebhookSignature(secret, body, req.headers[SIGNATURE_HEADER.toLowerCase()] as string | undefined))) {
    res.writeHead(401).end('bad signature')
    return
  }
  const { event } = JSON.parse(body)
  if (!seen.has(event.id)) {
    seen.add(event.id)
    console.log(event.type, event) // e.g. payment.authorized → mark an order paid
  }
  res.writeHead(204).end()
}).listen(8787, () => console.log('Listening on http://localhost:8787'))
