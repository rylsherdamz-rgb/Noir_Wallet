import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StrKey } from '@stellar/stellar-sdk'
import { securityMatrixContracts } from './security-matrix-support.js'

const deviceRegistry = StrKey.encodeContract(Buffer.alloc(32, 1))
const agentRegistry = StrKey.encodeContract(Buffer.alloc(32, 2))
const paymentEscrow = StrKey.encodeContract(Buffer.alloc(32, 3))
const targetEnv = {
  NOIR_DEVICE_REGISTRY: deviceRegistry,
  NOIR_AGENT_REGISTRY: agentRegistry,
  NOIR_PAYMENT_ESCROW: paymentEscrow,
}
const variables = ['NOIR_DEVICE_REGISTRY', 'NOIR_AGENT_REGISTRY', 'NOIR_PAYMENT_ESCROW'] as const
const historicalIds = [
  'CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA',
  'CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ',
  'CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX',
]

beforeEach(() => {
  vi.stubGlobal('fetch', () => { throw new Error('Offline matrix configuration attempted network access') })
})
afterEach(() => vi.unstubAllGlobals())

describe('security matrix targets', () => {
  it.each([
    {},
    { NOIR_TESTNET: '0' },
    { npm_lifecycle_event: 'test' },
    { NOIR_TESTNET: '0', npm_lifecycle_event: 'test', NOIR_DEVICE_REGISTRY: 'unused-invalid-id' },
  ])('keeps ordinary test runs offline: %j', (env) => {
    expect(securityMatrixContracts(env)).toBeNull()
  })

  describe.each([
    { NOIR_TESTNET: '1' },
    { npm_lifecycle_event: 'test:security-matrix' },
  ])('explicit opt-in %j', (optIn) => {
    it('requires targets instead of falling back to the public deployment', () => {
      expect(() => securityMatrixContracts(optIn)).toThrow(/NOIR_DEVICE_REGISTRY/)
    })

    it('returns three distinct valid explicit targets unchanged', () => {
      expect(securityMatrixContracts({ ...optIn, ...targetEnv })).toEqual({
        deviceRegistry, agentRegistry, paymentEscrow,
      })
    })
  })

  it.each(variables.flatMap((key) => [undefined, '', '   '].map((value) => ({ key, value }))))(
    'requires explicit $key when its value is $value', ({ key, value }) => {
      expect(() => securityMatrixContracts({ NOIR_TESTNET: '1', ...targetEnv, [key]: value })).toThrow(key)
    },
  )

  it.each(variables)('rejects an invalid checksum in %s', (key) => {
    const invalid = deviceRegistry.slice(0, -1) + (deviceRegistry.endsWith('A') ? 'B' : 'A')
    expect(() => securityMatrixContracts({ NOIR_TESTNET: '1', ...targetEnv, [key]: invalid })).toThrow(key)
  })

  it('rejects a malformed contract address', () => {
    expect(() => securityMatrixContracts({ NOIR_TESTNET: '1', ...targetEnv, NOIR_AGENT_REGISTRY: 'not-a-contract' }))
      .toThrow(/NOIR_AGENT_REGISTRY/)
  })

  it.each([
    { NOIR_AGENT_REGISTRY: deviceRegistry },
    { NOIR_PAYMENT_ESCROW: deviceRegistry },
    { NOIR_PAYMENT_ESCROW: agentRegistry },
  ])('rejects the same target assigned to multiple roles: %j', (duplicate) => {
    expect(() => securityMatrixContracts({ NOIR_TESTNET: '1', ...targetEnv, ...duplicate })).toThrow(/distinct|duplicate/i)
  })

  it.each(historicalIds.flatMap((id) => variables.map((key) => ({ id, key }))))(
    'refuses the pre-fix deployment ID $id in $key', ({ id, key }) => {
      expect(() => securityMatrixContracts({ NOIR_TESTNET: '1', ...targetEnv, [key]: id }))
        .toThrow(/pre-fix|vulnerable/i)
    },
  )
})
