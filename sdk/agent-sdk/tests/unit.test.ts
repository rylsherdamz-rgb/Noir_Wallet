import { describe, it, expect } from 'vitest'
import { Address, Contract, Keypair, nativeToScVal, scValToNative, xdr, type rpc } from '@stellar/stellar-sdk'
import {
  TESTNET, cursorLedger, decodeEvent, eventToJSON, refusalReason, normalizeDeviceHash, parseContractError,
  signWebhookBody, verifyWebhookSignature, startWebhookRelay, SIGNATURE_HEADER, keypairSigner,
  toCall, toHex, fromHex,
  type NoirAgentPolicy, type NoirEvent, type NoirAgentClient,
} from '../src/index.js'

const C = TESTNET.contracts
const HASH = 'ab'.repeat(32)
const agent = Keypair.random().publicKey()
const merchant = Keypair.random().publicKey()
const asset = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'

const sym = (s: string) => xdr.ScVal.scvSymbol(s)
const bytes = (h: string) => xdr.ScVal.scvBytes(Buffer.from(h, 'hex'))
const addr = (a: string) => new Address(a).toScVal()
const i128 = (n: bigint) => nativeToScVal(n, { type: 'i128' })

function raw(contractId: string, topic: xdr.ScVal[], value: xdr.ScVal, ok = true): rpc.Api.EventResponse {
  return {
    id: '0001-1', type: 'contract', ledger: 100, ledgerClosedAt: '2026-10-09T00:00:00Z',
    transactionIndex: 0, operationIndex: 0, inSuccessfulContractCall: ok, txHash: 'f'.repeat(64),
    contractId: new Contract(contractId), topic, value,
  } as rpc.Api.EventResponse
}

describe('decodeEvent', () => {
  it('decodes every Noir event the contracts publish', () => {
    const cases: [string, xdr.ScVal[], xdr.ScVal, Partial<NoirEvent>][] = [
      [C.deviceRegistry, [sym('register'), bytes(HASH)], addr(agent), { type: 'device.registered', deviceHash: HASH, agent }],
      [C.deviceRegistry, [sym('revoke'), bytes(HASH)], xdr.ScVal.scvMap([]), { type: 'device.revoked', deviceHash: HASH }],
      [C.agentRegistry, [sym('agent_reg'), bytes(HASH)], addr(agent), { type: 'agent.registered', deviceHash: HASH, agent }],
      [C.agentRegistry, [sym('agent_rev'), bytes(HASH)], xdr.ScVal.scvMap([]), { type: 'agent.revoked', deviceHash: HASH }],
      [C.paymentEscrow, [sym('fund'), bytes(HASH)], i128(50n), { type: 'escrow.funded', deviceHash: HASH, amount: 50n }],
      [C.paymentEscrow, [sym('defund'), bytes(HASH)], i128(7n), { type: 'escrow.defunded', deviceHash: HASH, amount: 7n }],
      [C.paymentEscrow, [sym('sweep'), bytes(HASH)], i128(9n), { type: 'escrow.swept', deviceHash: HASH, amount: 9n }],
      [C.paymentEscrow, [sym('authorize'), bytes(HASH), addr(merchant)], i128(3n), { type: 'payment.authorized', deviceHash: HASH, merchant, amount: 3n }],
      [C.paymentEscrow, [sym('claim'), addr(merchant)], i128(3n), { type: 'payment.claimed', merchant, amount: 3n }],
    ]
    for (const [cid, topic, value, want] of cases) {
      expect(decodeEvent(raw(cid, topic, value), C)).toMatchObject({ ...want, contractId: cid, ledger: 100 })
    }
  })

  it('ignores other contracts, unknown topics, failed calls and malformed payloads', () => {
    const other = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
    expect(decodeEvent(raw(other, [sym('fund'), bytes(HASH)], i128(1n)), C)).toBeNull()
    expect(decodeEvent(raw(C.paymentEscrow, [sym('mystery'), bytes(HASH)], i128(1n)), C)).toBeNull()
    expect(decodeEvent(raw(C.paymentEscrow, [sym('fund'), bytes(HASH)], i128(1n), false), C)).toBeNull()
    expect(decodeEvent(raw(C.paymentEscrow, [sym('fund'), bytes(HASH)], xdr.ScVal.scvSymbol('x')), C)).toBeNull()
  })

  it('serialises amounts as strings for JSON', () => {
    const e = decodeEvent(raw(C.paymentEscrow, [sym('fund'), bytes(HASH)], i128(12345678901234567890n)), C)!
    expect(JSON.parse(JSON.stringify(eventToJSON(e))).amount).toBe('12345678901234567890')
  })
})

describe('refusalReason mirrors check_payment', () => {
  const policy: NoirAgentPolicy = { agent, asset, maxAmount: 100n, expiresAt: new Date('2030-01-01') }
  const ok = { agent, asset, amount: 10n }
  const now = new Date('2026-10-09')
  it('names each rule', () => {
    expect(refusalReason(null, ok, now)).toBe('no_agent')
    expect(refusalReason(policy, { ...ok, agent: merchant }, now)).toBe('wrong_agent')
    expect(refusalReason(policy, { ...ok, asset: C.paymentEscrow }, now)).toBe('wrong_asset')
    expect(refusalReason(policy, { ...ok, amount: 0n }, now)).toBe('invalid_amount')
    expect(refusalReason(policy, { ...ok, amount: 101n }, now)).toBe('over_limit')
    expect(refusalReason(policy, ok, new Date('2031-01-01'))).toBe('expired')
  })
  it('treats maxAmount 0 as no cap', () => {
    expect(refusalReason({ ...policy, maxAmount: 0n }, { ...ok, amount: 10n ** 18n }, new Date('2031-01-01'))).toBe('expired')
  })
})

describe('helpers', () => {
  it('normalizes device hashes and rejects anything that is not 32 bytes', () => {
    expect(normalizeDeviceHash('0x' + 'AB'.repeat(32))).toBe(HASH)
    expect(() => normalizeDeviceHash('abc')).toThrow()
  })
  it('reads the ledger out of an RPC event cursor', () => {
    expect(cursorLedger('0021902353229717504-0000000000')).toBe(5099539)
    expect(cursorLedger('')).toBe(0)
  })
  it('names contract errors', () => {
    const e = parseContractError('paymentEscrow', 'authorize', 'HostError: Error(Contract, #3)')
    expect(e?.errorName).toBe('AgentNotAuthorized')
    expect(parseContractError('paymentEscrow', 'claim', 'network down')).toBeNull()
  })
  it('keypairSigner signs without exposing the secret', async () => {
    const kp = Keypair.random()
    const s = keypairSigner(kp.secret())
    expect(s.publicKey).toBe(kp.publicKey())
    expect(Object.values(s)).not.toContain(kp.secret())
  })
})

describe('webhooks', () => {
  const secret = 'test-secret-0123456789abcdef'
  const body = JSON.stringify({ event: { id: '1' } })

  it('verifies a genuine signature and rejects tampering, wrong secret and stale deliveries', async () => {
    const header = await signWebhookBody(secret, body, 1_000_000)
    expect(await verifyWebhookSignature(secret, body, header, { nowSec: 1_000_010 })).toBe(true)
    expect(await verifyWebhookSignature(secret, body + ' ', header, { nowSec: 1_000_010 })).toBe(false)
    expect(await verifyWebhookSignature('other', body, header, { nowSec: 1_000_010 })).toBe(false)
    expect(await verifyWebhookSignature(secret, body, header, { nowSec: 1_000_000 + 301 })).toBe(false)
    expect(await verifyWebhookSignature(secret, body, null)).toBe(false)
  })

  it('relay POSTs each event signed, retries server errors, and stops on 4xx', async () => {
    let onEvent!: (e: NoirEvent) => Promise<void>
    const fakeClient = { watch: (o: { onEvent: typeof onEvent }) => { onEvent = o.onEvent; return () => {} } } as unknown as NoirAgentClient
    const statuses = [500, 200, 400]
    const calls: { headers: Record<string, string>; body: string }[] = []
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      calls.push({ headers: init.headers as Record<string, string>, body: init.body as string })
      const status = statuses.shift()!
      return { ok: status < 300, status } as Response
    }) as typeof fetch
    const results: { ok: boolean; attempts: number }[] = []
    startWebhookRelay(fakeClient, { url: 'https://example.test/hook', secret, fetchImpl, backoffMs: 0, onDelivery: (_e, r) => results.push(r) })

    const event = decodeEvent(raw(C.paymentEscrow, [sym('fund'), bytes(HASH)], i128(5n)), C)!
    await onEvent(event)
    expect(results[0]).toEqual({ ok: true, status: 200, attempts: 2 })
    expect(await verifyWebhookSignature(secret, calls[1].body, calls[1].headers[SIGNATURE_HEADER])).toBe(true)

    await onEvent(event)
    expect(results[1]).toMatchObject({ ok: false, status: 400, attempts: 1 })
    expect(calls).toHaveLength(3) // no retry after the 400
  })
})

describe('toCall', () => {
  const owner = Keypair.random().publicKey()
  const native = (v: xdr.ScVal) => scValToNative(v)

  it('puts the acting account where each contract expects it', () => {
    const auth = toCall(agent, { kind: 'authorize', deviceHash: HASH, merchant, asset, amount: 5n, nonce: 7n })
    expect(auth.contract).toBe('paymentEscrow')
    expect(auth.method).toBe('authorize')
    const [who, device, ...rest] = auth.args.map(native)
    expect(who).toBe(agent)
    expect(toHex(device as Uint8Array)).toBe(HASH)
    expect(rest).toEqual([merchant, asset, 5n, 7n])

    const claim = toCall(merchant, { kind: 'claim', token: asset })
    expect(claim.args.map(native)).toEqual([asset, merchant])

    const fund = toCall(owner, { kind: 'fundEscrow', deviceHash: HASH, token: asset, amount: 9n })
    expect(fund.method).toBe('fund_escrow')
    expect(fund.args.map(native)[1]).toBe(owner)
  })

  it('encodes a policy expiry as unix seconds, or 0 for none', () => {
    const at = new Date('2030-01-01T00:00:00Z')
    const reg = toCall(owner, { kind: 'registerAgent', deviceHash: HASH, agent, asset, maxAmount: 10n, expiresAt: at })
    expect(reg.contract).toBe('agentRegistry')
    expect(native(reg.args[5])).toBe(BigInt(at.getTime() / 1000))
    const forever = toCall(owner, { kind: 'registerAgent', deviceHash: HASH, agent, asset, maxAmount: 0n })
    expect(native(forever.args[5])).toBe(0n)
  })
})

describe('hex helpers', () => {
  it('round-trips bytes without Buffer', () => {
    const bytes = Uint8Array.from([0, 1, 15, 16, 255])
    expect(toHex(bytes)).toBe('00010f10ff')
    expect(fromHex('00010f10ff')).toEqual(bytes)
  })
})
