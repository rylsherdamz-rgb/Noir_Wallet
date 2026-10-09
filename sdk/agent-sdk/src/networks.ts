import { Networks } from '@stellar/stellar-sdk'

export interface NoirContracts {
  deviceRegistry: string
  agentRegistry: string
  paymentEscrow: string
}

export interface NoirNetworkConfig {
  rpcUrl: string
  networkPassphrase: string
  contracts: NoirContracts
}

/**
 * Noir's public Testnet deployment. Each redeploy mints new IDs; keep these in
 * step with deploy-evidence/ and frontend/.env (see Noir/_Redeploy Contracts.md).
 */
export const TESTNET: NoirNetworkConfig = {
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: Networks.TESTNET,
  contracts: {
    deviceRegistry: 'CB4DPMGOA374JIB2ZVD4AHW5GJKQUYNOFGRYNOJ75EFH2KCJSMHOWIRA',
    agentRegistry: 'CBTDMJVCFQDIVWZBKAKZ2FQ3UEJNAAUFYCTJ3E4ON2MYXPLPSIXQ25JZ',
    paymentEscrow: 'CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX',
  },
}
