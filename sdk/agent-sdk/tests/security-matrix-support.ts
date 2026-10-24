import { StrKey } from '@stellar/stellar-sdk'
import type { NoirContracts } from '../src/networks.js'

// Immutable pre-fix deployment: deploy-evidence/deploy-testnet-20261007T050558Z.md.
const PRE_FIX_TESTNET_IDS = new Set([
  'CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA',
  'CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ',
  'CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX',
])

export function securityMatrixContracts(env: NodeJS.ProcessEnv): NoirContracts | null {
  if (env.NOIR_TESTNET !== '1' && env.npm_lifecycle_event !== 'test:security-matrix') return null

  const targets = {
    NOIR_DEVICE_REGISTRY: env.NOIR_DEVICE_REGISTRY ?? '',
    NOIR_AGENT_REGISTRY: env.NOIR_AGENT_REGISTRY ?? '',
    NOIR_PAYMENT_ESCROW: env.NOIR_PAYMENT_ESCROW ?? '',
  }
  for (const [name, id] of Object.entries(targets)) {
    if (!StrKey.isValidContract(id)) throw new Error(`Set ${name} to a valid explicit contract ID.`)
    if (PRE_FIX_TESTNET_IDS.has(id)) {
      throw new Error(`${name} targets the vulnerable pre-fix Testnet deployment; use a reviewed fixed deployment.`)
    }
  }
  if (new Set(Object.values(targets)).size !== 3) throw new Error('Security matrix contract IDs must be distinct.')

  return {
    deviceRegistry: targets.NOIR_DEVICE_REGISTRY,
    agentRegistry: targets.NOIR_AGENT_REGISTRY,
    paymentEscrow: targets.NOIR_PAYMENT_ESCROW,
  }
}
