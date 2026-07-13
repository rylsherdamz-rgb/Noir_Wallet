import {
  xdr,
  Account,
  Address,
  Contract,
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  rpc,
} from '@stellar/stellar-sdk/axios'
import { Buffer } from 'buffer'
import { TransactionBase } from '@stellar/stellar-sdk/axios'
import { Config } from '@/constants/config'

TransactionBase.prototype.toXDR = function () {
  const raw = this.toEnvelope().toXDR()
  return Buffer.from(raw).toString('base64')
}

let _server: rpc.Server | null = null

function getServer(): rpc.Server {
  if (!_server) {
    _server = new rpc.Server(Config.sorobanRpcUrl) as rpc.Server
  }
  return _server
}

export interface ReadContractParams {
  contractId: string
  method: string
  args?: xdr.ScVal[]
  source: string
}

export async function readContract(
  params: ReadContractParams,
): Promise<xdr.ScVal> {
  const server = getServer()
  
  // Check if account exists on-chain before attempting to use it
  const accountExists = await sourceAccountExists(params.source)
  if (!accountExists) {
    throw new Error(`Account ${params.source.slice(0, 8)}... does not exist on-chain. Please fund this account first via Friendbot or by receiving XLM from another account.`)
  }
  
  const account = await server.getAccount(params.source)

  const contract = new Contract(params.contractId)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Config.networkPassphrase,
  })
    .addOperation(contract.call(params.method, ...(params.args ?? [])))
    .setTimeout(30)
    .build()

  if (__DEV__) {
    console.log(`[soroban/readContract] tx XDR: ${tx.toXDR().substring(0, 80)}...`)
  }

  const sim = await server.simulateTransaction(tx)

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error)
  }

  if (!sim.result) {
    throw new Error('Simulation returned no result')
  }

  return sim.result.retval
}

export async function sourceAccountExists(
  publicKey: string,
): Promise<boolean> {
  try {
    const server = getServer()
    await server.getAccount(publicKey)
    return true
  } catch {
    return false
  }
}

export interface InvokeContractParams {
  contractId: string
  method: string
  args?: xdr.ScVal[]
  source: string
  signer: Keypair
}

export async function invokeContract(
  params: InvokeContractParams,
): Promise<string> {
  const server = getServer()
  
  // Check if account exists on-chain before attempting to use it
  const accountExists = await sourceAccountExists(params.source)
  if (!accountExists) {
    throw new Error(`Account ${params.source.slice(0, 8)}... does not exist on-chain. Please fund this account first via Friendbot or by receiving XLM from another account.`)
  }
  
  const account = await server.getAccount(params.source)

  const contract = new Contract(params.contractId)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Config.networkPassphrase,
  })
    .addOperation(contract.call(params.method, ...(params.args ?? [])))
    .setTimeout(30)
    .build()

  if (__DEV__) {
    console.log(`[soroban/invokeContract] tx XDR: ${tx.toXDR().substring(0, 80)}...`)
  }

  const prepared = await server.prepareTransaction(tx)
  prepared.sign(params.signer)

  const sendResult = await server.sendTransaction(prepared)
  if (sendResult.status === 'ERROR') {
    throw new Error(`Send error: network rejected transaction`)
  }

  const hash = sendResult.hash
  let attempts = 0
  while (attempts < 60) {
    const result = await server.getTransaction(hash)
    if (result.status === 'SUCCESS') {
      return hash
    }
    if (result.status === 'FAILED') {
      throw new Error('Transaction failed')
    }
    await new Promise((r) => setTimeout(r, 1000))
    attempts++
  }

  throw new Error('Transaction timeout after 60s')
}

export function deviceHashScVal(sha256Hex: string): xdr.ScVal {
  return xdr.ScVal.scvBytes(Buffer.from(sha256Hex, 'hex'))
}

export function walletAddressScVal(stellarPublicKey: string): xdr.ScVal {
  return Address.fromString(stellarPublicKey).toScVal()
}
