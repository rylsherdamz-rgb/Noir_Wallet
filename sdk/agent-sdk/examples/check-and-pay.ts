/**
 * An app checks a Noir agent's policy before asking it to pay, then pays.
 *
 *   AGENT_SECRET=S... DEVICE_HASH=<64 hex> MERCHANT=G... AMOUNT_STROOPS=10000000 npx tsx examples/check-and-pay.ts
 *
 * In a browser, pass a connected wallet (Freighter / Stellar Wallets Kit)
 * instead of keypairSigner: any object with { publicKey, signTransaction }.
 */
import { NoirAgentClient, keypairSigner } from '../src/index.js'

const XLM_SAC_TESTNET = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
const { AGENT_SECRET, DEVICE_HASH, MERCHANT, AMOUNT_STROOPS } = process.env
if (!AGENT_SECRET || !DEVICE_HASH || !MERCHANT || !AMOUNT_STROOPS) {
  console.error('Set AGENT_SECRET, DEVICE_HASH, MERCHANT and AMOUNT_STROOPS'); process.exit(1)
}

const noir = new NoirAgentClient()
const agent = keypairSigner(AGENT_SECRET)
const amount = BigInt(AMOUNT_STROOPS)

const policy = await noir.getPolicy(DEVICE_HASH)
console.log('policy:', policy)

const check = await noir.checkPayment({ deviceHash: DEVICE_HASH, agent: agent.publicKey, asset: XLM_SAC_TESTNET, amount })
if (!check.ok) { console.error('refused:', check.reason); process.exit(2) }

const { hash } = await noir.authorizePayment({ agent, deviceHash: DEVICE_HASH, merchant: MERCHANT, asset: XLM_SAC_TESTNET, amount })
console.log(`authorized: https://stellar.expert/explorer/testnet/tx/${hash}`)
