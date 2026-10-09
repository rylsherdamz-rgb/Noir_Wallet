# @noir-wallet/agent-sdk

Use Noir agent policies from any app. Noir links an NFC card to a constrained
payment **agent** on Stellar: the wallet owner sets which key may spend, which
asset, how much per payment, and until when. This SDK lets other apps read
those policies, check a payment before trying it, run the tap-to-pay
`authorize` → `claim` flow, and react to every change through events or
signed webhooks.

Everything lives in Noir's three Soroban contracts, so there is no Noir server
or API key involved. Works in Node 20+ and the browser.

```bash
npm install @noir-wallet/agent-sdk @stellar/stellar-sdk
```

## Read a policy and check a payment

```ts
import { NoirAgentClient } from '@noir-wallet/agent-sdk'

const noir = new NoirAgentClient() // Testnet by default

const policy = await noir.getPolicy(deviceHash)
// { agent: 'G…', maxAmount: 50000000n, asset: 'C…', expiresAt: Date | null } or null

const check = await noir.checkPayment({ deviceHash, agent, asset, amount: 10_000_000n })
// { ok: true } or { ok: false, reason: 'no_agent' | 'wrong_agent' | 'wrong_asset'
//   | 'invalid_amount' | 'over_limit' | 'expired' | 'insufficient_escrow' }
```

`checkPayment` asks the contract's own `check_payment`, so it can never
disagree with what `authorize` will enforce.

| Method | Returns |
|---|---|
| `getPolicy(deviceHash)` | the agent policy, or `null` |
| `getDeviceOwner(deviceHash)` | owner wallet address, or `null` |
| `getEscrowBalance(deviceHash)` | escrowed amount (`bigint`, smallest unit) |
| `getPendingBalance(merchant)` | what the merchant can claim |
| `checkPayment({...})` | `{ ok }` or `{ ok: false, reason }` |

`deviceHash` is the 64-character hex SHA-256 that Noir registers for a tag.

## Pay and claim

Writes take a **signer**: anything with `publicKey` and
`signTransaction(xdr, { networkPassphrase })`. That is the Freighter /
Stellar Wallets Kit shape, so a connected browser wallet works as-is and the
secret key never reaches this SDK. On a server, use `keypairSigner(secret)`.

```ts
import { keypairSigner } from '@noir-wallet/agent-sdk'

// The agent key spends from the device's escrow, within its policy.
const { hash } = await noir.authorizePayment({
  agent: keypairSigner(process.env.AGENT_SECRET!),
  deviceHash, merchant, asset, amount: 10_000_000n,
})

// The merchant collects everything pending.
await noir.claim({ merchant: walletKitSigner, token: asset })
```

Refusals throw `NoirContractError` with the contract's own error name
(`AgentNotAuthorized`, `InsufficientBalance`, `DuplicateAuth`, `NothingToClaim`, …).

## Events

| Type | Fields |
|---|---|
| `device.registered` / `agent.registered` | `deviceHash`, `agent` |
| `device.revoked` / `agent.revoked` | `deviceHash` |
| `escrow.funded` / `escrow.defunded` / `escrow.swept` | `deviceHash`, `amount` |
| `payment.authorized` | `deviceHash`, `merchant`, `amount` |
| `payment.claimed` | `merchant`, `amount` |

Each also carries `id` (unique), `contractId`, `ledger`, `ledgerClosedAt`, `txHash`.

```ts
const stop = noir.watch({
  types: ['payment.authorized'],
  merchant: myMerchantAddress,
  onEvent: (e) => markOrderPaid(e),
})

const lastDay = await noir.pastEvents(latestLedger - 17_000) // RPC keeps ~7 days
```

## Webhooks

Run a relay that POSTs each event to your endpoint, signed with HMAC-SHA256:

```ts
import { startWebhookRelay } from '@noir-wallet/agent-sdk'

startWebhookRelay(noir, { url: 'https://your.app/noir-hook', secret, deviceHash })
```

Your endpoint receives `{ "event": { ... } }` (amounts as decimal strings) with
an `X-Noir-Signature: t=<unix>,v1=<hex>` header. Verify it against the **raw**
body before trusting anything:

```ts
import { verifyWebhookSignature } from '@noir-wallet/agent-sdk'

if (!(await verifyWebhookSignature(secret, rawBody, req.headers['x-noir-signature']))) return 401
```

Deliveries older than 5 minutes are rejected (replay protection). Delivery is
at-least-once with retries on network errors, 429 and 5xx, so dedupe on
`event.id`. Ready-to-run examples: `examples/webhook-relay.ts`,
`examples/webhook-receiver.ts`, `examples/check-and-pay.ts`.

## Networks

Testnet contract IDs are built in (`TESTNET`). For your own deployment:

```ts
new NoirAgentClient({ network: { rpcUrl, networkPassphrase, contracts: { deviceRegistry, agentRegistry, paymentEscrow } } })
```

## Develop

```bash
npm test               # unit tests
npm run test:testnet   # live reads, a refused claim, and event paging on Testnet
npm run build
```
