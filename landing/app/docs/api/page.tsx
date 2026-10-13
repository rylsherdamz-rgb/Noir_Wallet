import Link from 'next/link'
import { DocPage } from '@/components/DocPage'
import { CodeBlock } from '@/components/CodeBlock'
import { docMetadata } from '@/lib/docs'

export const metadata = docMetadata('api')

const ENDPOINTS = [
  ['GET', '/v1/health', '—', '{ ok: true }'],
  ['GET', '/v1/network', 'read', 'RPC URL, passphrase, contract IDs'],
  ['GET', '/v1/devices/:hash', 'read', '{ deviceHash, owner, policy, escrowBalance }'],
  ['GET', '/v1/devices/:hash/policy', 'read', '{ agent, maxAmount, asset, expiresAt }'],
  ['GET', '/v1/wallets/:address/devices', 'read', '{ devices: [hash…] }'],
  ['GET', '/v1/merchants/:address/pending', 'read', '{ pending }'],
  ['POST', '/v1/payments/check', 'read', '{ ok } or { ok: false, reason }'],
  ['GET', '/v1/events?fromLedger=&cursor=&limit=', 'read', '{ events, cursor, latestLedger }'],
  ['POST', '/v1/transactions/prepare', 'write', '{ xdr, networkPassphrase, operation }'],
  ['POST', '/v1/transactions/submit', 'write', '{ hash }'],
  ['POST', '/v1/webhooks', 'webhooks', 'subscription + secret (shown once)'],
  ['GET', '/v1/webhooks', 'webhooks', 'this key’s subscriptions'],
  ['DELETE', '/v1/webhooks/:id', 'webhooks', '{ deleted: true }'],
]

const ERRORS = [
  ['400', 'invalid_request', 'Bad hash, address, amount or body'],
  ['401', 'unauthorized', 'Missing, malformed, unknown or disabled key'],
  ['403', 'insufficient_scope', 'Key lacks the endpoint’s scope'],
  ['404', 'not_found · device_not_found · agent_not_found', ''],
  ['422', 'contract_refused', 'Includes contractError, e.g. DuplicateAuth'],
  ['429', 'rate_limited', 'See Retry-After'],
  ['502', 'upstream_error', 'Soroban RPC failed'],
]

export default function Api() {
  return (
    <DocPage slug="api">
      <p>
        The Noir API is a small, self-hostable gateway in front of the contracts, for apps that aren’t written in
        JavaScript or that want API keys, rate limits and managed webhooks. It is <b>non-custodial</b>: it never holds a
        secret key. Writes are prepared by the API, signed by your user’s wallet or your agent key, then submitted.
      </p>

      <h2 id="run">Run it</h2>
      <CodeBlock lang="bash" code={`
cd sdk/noir-api
npm run setup && npm run build
npm start          # PORT=8787, Noir Testnet by default
`} />
      <p>Configuration is environment variables (<code>.env.example</code> lists them): CORS origins, default rate limit, webhook storage, and your own RPC or contract IDs.</p>

      <h2 id="keys">API keys</h2>
      <CodeBlock lang="bash" code={`
npm run keygen -- my-shop --scopes read,write,webhooks --rate 300
# Created key "my-shop" (id k3j9x0ab, scopes read,write,webhooks) in ./keys.json.
#   noir_sk_k3j9x0ab_4yQ…   ← shown once; only its SHA-256 hash is stored
`} />
      <p>Send it as <code>Authorization: Bearer noir_sk_…</code> (or <code>X-API-Key</code>). Keys carry scopes:</p>
      <div className="table-wrap"><table className="doc-table">
        <thead><tr><th>Scope</th><th>Allows</th></tr></thead>
        <tbody>
          <tr><td><code>read</code></td><td>Network, devices, policies, balances, payment checks, events</td></tr>
          <tr><td><code>write</code></td><td><code>transactions/prepare</code> and <code>transactions/submit</code></td></tr>
          <tr><td><code>webhooks</code></td><td>Create, list and delete webhook subscriptions</td></tr>
        </tbody>
      </table></div>
      <p>Each key has a token-bucket rate limit (default 120/min). Responses carry <code>X-RateLimit-Limit</code> and <code>X-RateLimit-Remaining</code>; over the limit you get <code>429</code> with <code>Retry-After</code>. Revoke a key by setting <code>&quot;disabled&quot;: true</code> on its record.</p>

      <h2 id="endpoints">Endpoints</h2>
      <p>Amounts are decimal strings in the asset’s smallest unit (1 XLM = <code>&quot;10000000&quot;</code>). Floats are rejected.</p>
      <div className="table-wrap"><table className="doc-table">
        <thead><tr><th>Method</th><th>Path</th><th>Scope</th><th>Returns</th></tr></thead>
        <tbody>{ENDPOINTS.map(([m, p, s, r]) => <tr key={m + p}><td><span className={`verb verb-${m.toLowerCase()}`}>{m}</span></td><td><code>{p}</code></td><td>{s}</td><td>{r}</td></tr>)}</tbody>
      </table></div>

      <h3 id="device">Look up a card</h3>
      <CodeBlock lang="bash" code={`curl $NOIR_API/v1/devices/$DEVICE_HASH -H "Authorization: Bearer $NOIR_KEY"`} />
      <CodeBlock lang="json" title="200 OK" code={`
{
  "deviceHash": "ab12…",
  "owner": "GBX7…Q4MZ",
  "policy": { "agent": "GDK2…", "maxAmount": "50000000", "asset": "CDLZ…", "expiresAt": null },
  "escrowBalance": "250000000"
}
`} />

      <h2 id="transactions">Transactions: prepare → sign → submit</h2>
      <p><code>source</code> is the acting account: the agent for <code>authorize</code>, the merchant for <code>claim</code>, the card owner for <code>registerAgent</code>, <code>revokeAgent</code>, <code>fundEscrow</code> and <code>defundEscrow</code>.</p>
      <CodeBlock lang="bash" code={`
curl -X POST $NOIR_API/v1/transactions/prepare -H "Authorization: Bearer $NOIR_KEY" \\
  -H "Content-Type: application/json" -d '{
  "source": "GDK2…agent",
  "operation": {
    "kind": "authorize", "deviceHash": "ab12…", "merchant": "GMER…",
    "asset": "CDLZ…", "amount": "10000000"
  }
}'
# → { "xdr": "AAAAAgAAAAC…", "networkPassphrase": "Test SDF Network ; September 2015" }
`} />
      <p>Sign the XDR with the source account (Freighter, Wallets Kit, any Stellar SDK), then:</p>
      <CodeBlock lang="bash" code={`
curl -X POST $NOIR_API/v1/transactions/submit -H "Authorization: Bearer $NOIR_KEY" \\
  -H "Content-Type: application/json" -d '{ "xdr": "<signed envelope>" }'
# → { "hash": "9f1c…" }   (returned once the network confirms)
`} />
      <CodeBlock lang="python" title="Python — sign the prepared XDR" code={`
from stellar_sdk import Keypair, TransactionEnvelope
import requests

H = {"Authorization": f"Bearer {NOIR_KEY}"}
prep = requests.post(f"{API}/v1/transactions/prepare", headers=H, json={"source": agent.public_key, "operation": op}).json()
env = TransactionEnvelope.from_xdr(prep["xdr"], prep["networkPassphrase"])
env.sign(agent)
print(requests.post(f"{API}/v1/transactions/submit", headers=H, json={"xdr": env.to_xdr()}).json())
`} />

      <h2 id="errors">Errors</h2>
      <CodeBlock lang="json" code={`{ "error": { "code": "contract_refused", "contractError": "DuplicateAuth", "message": "paymentEscrow.authorize failed: DuplicateAuth (#6)" } }`} />
      <div className="table-wrap"><table className="doc-table">
        <thead><tr><th>Status</th><th>code</th><th>When</th></tr></thead>
        <tbody>{ERRORS.map(([s, c, w]) => <tr key={s}><td>{s}</td><td><code>{c}</code></td><td>{w}</td></tr>)}</tbody>
      </table></div>

      <h2 id="production">Production notes</h2>
      <ul className="doc-list">
        <li>Run behind TLS; set <code>NOIR_API_CORS_ORIGINS</code> only if browsers call it directly (prefer calling from your server so the key stays secret).</li>
        <li>Keys, rate-limit buckets and subscriptions are single-process. For several replicas, move them to a shared store.</li>
        <li>Webhook targets must be public <code>https://</code> URLs — loopback and private networks are refused. See <Link href="/docs/webhooks/">Webhooks</Link>.</li>
      </ul>
    </DocPage>
  )
}
