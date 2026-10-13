import { describe, it, expect } from 'vitest'
import { Account, Asset, Keypair, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk/axios'
import {
  parseBridgeMessage, httpsOrigin, networkDetails, summarizeTransaction,
  buildProviderScript, buildResponseScript,
} from '@/lib/dappBridge'

const NONCE = 'session-nonce'
const msg = (o: object) => JSON.stringify({ noir: NONCE, id: 'n1', ...o })

function buildTx(signer: string, ops: any[], passphrase = Networks.TESTNET) {
  const b = new TransactionBuilder(new Account(signer, '1'), { fee: '100', networkPassphrase: passphrase })
  ops.forEach((op) => b.addOperation(op))
  return b.setTimeout(60).build().toEnvelope().toXDR('base64')
}

describe('dApp bridge: request parsing', () => {
  it('accepts a well-formed request from this session', () => {
    const r = parseBridgeMessage(msg({ method: 'signTransaction', params: { xdr: 'AAAA', networkPassphrase: Networks.TESTNET } }), NONCE)
    expect(r).toEqual({ id: 'n1', method: 'signTransaction', params: { xdr: 'AAAA', networkPassphrase: Networks.TESTNET, address: undefined } })
  })
  it('rejects a wrong nonce (iframes and other sessions)', () => {
    expect(parseBridgeMessage(msg({ method: 'getAddress' }), 'other')).toBeNull()
  })
  it('rejects unknown methods, bad JSON and bad ids', () => {
    expect(parseBridgeMessage(msg({ method: 'exportSecret' }), NONCE)).toBeNull()
    expect(parseBridgeMessage('not json', NONCE)).toBeNull()
    expect(parseBridgeMessage(JSON.stringify({ noir: NONCE, id: 5, method: 'getAddress' }), NONCE)).toBeNull()
  })
  it('drops non-string params', () => {
    const r = parseBridgeMessage(msg({ method: 'signTransaction', params: { xdr: 42 } }), NONCE)
    expect(r?.params.xdr).toBeUndefined()
  })
})

describe('dApp bridge: origins and network', () => {
  it('only treats https pages as connectable', () => {
    expect(httpsOrigin('https://app.soroswap.finance/swap?x=1')).toBe('https://app.soroswap.finance')
    expect(httpsOrigin('http://example.com')).toBeNull()
    expect(httpsOrigin('about:blank')).toBeNull()
  })
  it('reports Freighter-style network details', () => {
    expect(networkDetails('testnet')).toEqual({ network: 'TESTNET', networkPassphrase: Networks.TESTNET })
    expect(networkDetails('mainnet')).toEqual({ network: 'PUBLIC', networkPassphrase: Networks.PUBLIC })
  })
})

describe('dApp bridge: transaction summary', () => {
  const me = Keypair.random().publicKey()
  const other = Keypair.random().publicKey()

  it('describes a payment from the signer', () => {
    const s = summarizeTransaction(buildTx(me, [Operation.payment({ destination: other, asset: Asset.native(), amount: '12.5' })]), Networks.TESTNET, me)
    expect(s.operations).toHaveLength(1)
    expect(s.operations[0]).toMatchObject({ label: 'Send', risky: false, foreignSource: false })
    expect(s.operations[0].detail).toContain('12.5 XLM')
    expect(s.feeXlm).toBe('0.00001')
    expect(s.foreignSource).toBe(false)
  })
  it('flags account merges and signer changes as risky', () => {
    const s = summarizeTransaction(buildTx(me, [
      Operation.accountMerge({ destination: other }),
      Operation.setOptions({ signer: { ed25519PublicKey: other, weight: 1 } }),
      Operation.setOptions({ homeDomain: 'example.com' }),
    ]), Networks.TESTNET, me)
    expect(s.operations.map((o) => o.risky)).toEqual([true, true, false])
  })
  it('flags transactions sourced from another account', () => {
    const s = summarizeTransaction(buildTx(other, [Operation.payment({ destination: me, asset: Asset.native(), amount: '1' })]), Networks.TESTNET, me)
    expect(s.foreignSource).toBe(true)
    expect(s.operations[0].foreignSource).toBe(true)
  })
  it('throws on input that is not a transaction envelope', () => {
    expect(() => summarizeTransaction('not-xdr', Networks.TESTNET, me)).toThrow()
  })
})

describe('dApp bridge: injected scripts', () => {
  it('embeds the session nonce and never exposes keys', () => {
    const js = buildProviderScript(NONCE)
    expect(js).toContain(JSON.stringify(NONCE))
    expect(js).toContain('signTransaction')
    expect(js).not.toMatch(/secret|seed|mnemonic/i)
  })
  it('escapes line separators in responses', () => {
    const js = buildResponseScript('n1', { message: 'a b' })
    expect(js).not.toContain(' ')
    expect(js).toContain('\\u2028')
  })
})
