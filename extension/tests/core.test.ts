import { describe, it, expect } from 'vitest'
import {
  Account, Address, Asset, Contract, hash, Keypair, Networks, nativeToScVal, Operation, TransactionBuilder, xdr,
} from '@stellar/stellar-sdk'
import { deriveAgent, deriveKeypair, seedOf } from '../src/shared/hd'
import {
  buildPolicy, deviceHashOf, normalizeUid, parsePaymentRequest, parseXlm, paymentUri, spendable, toActivity, toAmount,
} from '../src/shared/noir'
import { open, seal } from '../src/shared/vault'
import { messageHash, signAuthEntry, signMessage, signTransaction, SigningError } from '../src/shared/signing'
import { describeAuthEntry, describeTransaction } from '../src/shared/describe'

// SEP-5 test 1 (12 words): https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md
const MNEMONIC = 'illness spike retreat truth genius clock brain pass fit cave bargain toe'

describe('SEP-5 derivation', () => {
  it('matches the spec vectors', async () => {
    const k0 = await deriveKeypair(MNEMONIC, 0)
    expect(k0.publicKey()).toBe('GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6')
    expect(k0.secret()).toBe('SBGWSG6BTNCKCOB3DIFBGCVMUPQFYPA2G4O34RMTB343OYPXU5DJDVMN')
    const k1 = await deriveKeypair(MNEMONIC, 1)
    expect(k1.publicKey()).not.toBe(k0.publicKey())
  })
  it('ignores case and extra spaces', async () => {
    const a = await deriveKeypair(MNEMONIC)
    const b = await deriveKeypair(`  ${MNEMONIC.toUpperCase().replace(/ /g, '   ')} `)
    expect(b.publicKey()).toBe(a.publicKey())
  })
})

describe('vault', () => {
  it('round-trips and rejects a wrong password', async () => {
    const v = await seal(MNEMONIC, 'correct horse', 1000)
    expect(v.data).not.toContain('illness')
    expect(await open(v, 'correct horse')).toBe(MNEMONIC)
    expect(await open(v, 'wrong')).toBeNull()
  })
  it('uses a fresh salt and IV each time', async () => {
    const [a, b] = [await seal('x', 'p', 1000), await seal('x', 'p', 1000)]
    expect(a.kdf.salt).not.toBe(b.kdf.salt)
    expect(a.iv).not.toBe(b.iv)
  })
})

describe('signing', () => {
  const kp = Keypair.random()
  const contract = 'CC7EAW5FNJEDBS7THM5IT6XIOHO4AOYMLXT3KSZ3HWUIKEACTW7E5BFS'

  const tx = () => new TransactionBuilder(new Account(kp.publicKey(), '1'), { fee: '100', networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.payment({ destination: Keypair.random().publicKey(), asset: Asset.native(), amount: '12.5' }))
    .setTimeout(60).build()

  it('signs a transaction for the wallet network', () => {
    const signed = TransactionBuilder.fromXDR(signTransaction(kp, tx().toXDR(), Networks.TESTNET), Networks.TESTNET)
    expect(signed.signatures).toHaveLength(1)
    expect(kp.verify(signed.hash(), signed.signatures[0].signature())).toBe(true)
  })

  const preimage = (passphrase: string) => xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
    new xdr.HashIdPreimageSorobanAuthorization({
      networkId: hash(Buffer.from(passphrase)),
      nonce: xdr.Int64.fromString('7'),
      signatureExpirationLedger: 1000,
      invocation: new xdr.SorobanAuthorizedInvocation({
        function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(new xdr.InvokeContractArgs({
          contractAddress: new Address(contract).toScAddress(),
          functionName: 'authorize',
          args: [nativeToScVal(5n, { type: 'i128' })],
        })),
        subInvocations: [],
      }),
    }),
  ).toXDR('base64')

  it('signs a SEP-43 auth entry over sha256(preimage)', () => {
    const entry = preimage(Networks.TESTNET)
    const sig = Buffer.from(signAuthEntry(kp, entry, Networks.TESTNET), 'base64')
    expect(kp.verify(hash(Buffer.from(entry, 'base64')), sig)).toBe(true)
  })

  it('refuses an auth entry for another network', () => {
    expect(() => signAuthEntry(kp, preimage(Networks.PUBLIC), Networks.TESTNET)).toThrow(SigningError)
  })

  it('signs SEP-53 messages', () => {
    const sig = Buffer.from(signMessage(kp, 'Hello, World!'), 'base64')
    expect(kp.verify(messageHash('Hello, World!'), sig)).toBe(true)
    expect(messageHash('Hello, World!').length).toBe(32)
  })

  it('describes what is being signed', () => {
    const d = describeTransaction(tx().toXDR(), Networks.TESTNET, kp.publicKey())
    expect(d.rows.some((r) => r.label === 'Payment' && r.value.startsWith('12.5 XLM'))).toBe(true)
    expect(d.warnings).toHaveLength(0)
    const other = describeTransaction(tx().toXDR(), Networks.TESTNET, Keypair.random().publicKey())
    expect(other.warnings[0]).toMatch(/not your wallet/)
    const a = describeAuthEntry(preimage(Networks.TESTNET))
    expect(a.rows.find((r) => r.label === 'Function')?.value).toBe('authorize')
    expect(a.rows.find((r) => r.label === 'Contract')?.value).toBe(contract)
    void Contract
  })
})

// Reference values from the app's own libraries (bip39 + ed25519-hd-key,
// frontend/src/services/wallet.ts deriveAgentAt) for the SEP-5 test phrase.
describe('card agents', () => {
  it('derive at m/44\'/148\'/0\'/n\' like the app', async () => {
    const seed = await seedOf(MNEMONIC)
    expect((await deriveAgent(seed, 1)).publicKey()).toBe('GDVCNE2RHCXVXIY4L5HAGY722QDGLSXLNMP4CHV3GFLX7TSS6AVYP5Y2')
    expect((await deriveAgent(seed, 2)).publicKey()).toBe('GDDP5SLXR4HZKG6DXQK46SNDLOU3SKQXPSDXX57FLTHORZDLJHTGJMJC')
  })
})

describe('card UIDs', () => {
  it('normalize to the app’s uppercase hex and hash the same way', async () => {
    expect(normalizeUid('04:a2:b3:c4:d5:e6:80')).toBe('04A2B3C4D5E680')
    expect(normalizeUid(' 04 A2-B3c4d5e680 ')).toBe('04A2B3C4D5E680')
    // sha256("04A2B3C4D5E680"), as frontend/src/lib/cardTap.ts hashTagUid
    expect(await deviceHashOf('04:A2:B3:C4:D5:E6:80')).toBe('e752045567ed2166783518b2b79986743900974e91af7a9fa3fd16fae6c4771e')
  })
  it('reject things that are not a UID', () => {
    for (const bad of ['', 'xyz', '04A', '04A2B3', '00'.repeat(11)]) expect(() => normalizeUid(bad)).toThrow()
  })
})

describe('policies', () => {
  it('turn UI choices into contract values', () => {
    expect(buildPolicy(10, 0)).toEqual({ maxAmount: 100_000_000n, expiresAt: null })
    expect(buildPolicy(0, 7, 0).expiresAt?.getTime()).toBe(7 * 86_400_000)
    expect(() => buildPolicy(-1, 0)).toThrow()
  })
})

describe('amounts', () => {
  it('parse, format and respect the reserve', () => {
    expect(parseXlm('12.5')).toBe(12.5)
    for (const bad of ['0', '-1', '1.12345678', 'abc', '']) expect(() => parseXlm(bad)).toThrow()
    expect(toAmount(12.5)).toBe('12.5')
    expect(toAmount(3)).toBe('3')
    expect(spendable(10, 0)).toBeCloseTo(8.99999)
    expect(spendable(1, 2)).toBe(0)
  })
})

describe('payment requests', () => {
  const G = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6'
  it('round-trip SEP-7 like the app’s Receive QR', () => {
    const uri = paymentUri({ destination: G, amount: '10.50', memo: 'coffee' })
    expect(uri).toBe(`web+stellar:pay?destination=${G}&amount=10.5&memo=coffee&memo_type=MEMO_TEXT`)
    expect(parsePaymentRequest(uri)).toEqual({ destination: G, amount: '10.5', memo: 'coffee' })
  })
  it('accept a bare or legacy address, refuse other assets', () => {
    expect(parsePaymentRequest(G)).toEqual({ destination: G })
    expect(parsePaymentRequest(`${G}?asset=XLM`)).toEqual({ destination: G })
    expect(parsePaymentRequest(`web+stellar:pay?destination=${G}&asset_code=USDC`)).toBeNull()
    expect(parsePaymentRequest('hello')).toBeNull()
  })
})

describe('activity', () => {
  const me = 'GME'
  const tx = { memo: 'hi', memo_type: 'text', fee_charged: '100', successful: true }
  const base = { id: '1', created_at: '2026-10-22T00:00:00Z', transaction_hash: 'abc', transaction: tx }
  it('reads payments from either side', () => {
    expect(toActivity({ ...base, type: 'payment', from: me, to: 'GYOU', amount: '5.0000000', asset_type: 'native' }, me))
      .toMatchObject({ direction: 'out', title: 'Sent', amount: 5, asset: 'XLM', counterparty: 'GYOU', memo: 'hi', feeXlm: 0.00001 })
    expect(toActivity({ ...base, type: 'payment', from: 'GYOU', to: me, amount: '2', asset_type: 'native' }, me))
      .toMatchObject({ direction: 'in', title: 'Received', counterparty: 'GYOU' })
  })
  it('reads account creation and escrow deposits', () => {
    expect(toActivity({ ...base, type: 'create_account', funder: me, account: 'GAGENT', starting_balance: '1' }, me))
      .toMatchObject({ direction: 'out', title: 'Opened an account', amount: 1, counterparty: 'GAGENT' })
    expect(toActivity({ ...base, type: 'invoke_host_function', asset_balance_changes: [{ from: me, to: 'CESCROW', amount: '3', asset_type: 'native' }] }, me))
      .toMatchObject({ direction: 'out', title: 'Contract deposit', amount: 3, counterparty: 'CESCROW' })
    expect(toActivity({ ...base, type: 'invoke_host_function' }, me)).toMatchObject({ title: 'Contract call', amount: null })
  })
})
