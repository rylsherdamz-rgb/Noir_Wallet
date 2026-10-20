import { describe, it, expect } from 'vitest'
import {
  Account, Address, Asset, Contract, hash, Keypair, Networks, nativeToScVal, Operation, TransactionBuilder, xdr,
} from '@stellar/stellar-sdk'
import { deriveKeypair } from '../src/shared/hd'
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
  const contract = 'CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX'

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
