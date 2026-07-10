import {
  rpc,
  xdr,
  Account,
  Contract,
  TransactionBuilder,
  BASE_FEE,
} from '@stellar/stellar-sdk'
import { Config } from '@/constants/config'

let _server: rpc.Server | null = null

function getServer(): rpc.Server {
  if (!_server) {
    _server = new rpc.Server(Config.sorobanRpcUrl)
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
  const account = await server.getAccount(params.source)

  const contract = new Contract(params.contractId)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Config.networkPassphrase,
  })
    .addOperation(contract.call(params.method, ...(params.args ?? [])))
    .setTimeout(30)
    .build()

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
