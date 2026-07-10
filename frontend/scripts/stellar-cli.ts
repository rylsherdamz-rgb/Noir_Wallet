#!/usr/bin/env npx tsx
import {
  Keypair,
  TransactionBuilder,
  Contract,
  BASE_FEE,
  Networks,
  rpc,
  xdr,
  Address,
  Horizon,
} from '@stellar/stellar-sdk'
import { Buffer } from 'buffer'

const NETWORK = process.env.STELLAR_NETWORK || 'testnet'
const HORIZON_URL = NETWORK === 'testnet'
  ? 'https://horizon-testnet.stellar.org'
  : 'https://horizon.stellar.org'
const SOROBAN_RPC_URL = NETWORK === 'testnet'
  ? 'https://soroban-testnet.stellar.org'
  : 'https://soroban.stellar.org'
const NETWORK_PASSPHRASE = NETWORK === 'testnet'
  ? Networks.TESTNET
  : Networks.PUBLIC
const FRIENDBOT_URL = NETWORK === 'testnet'
  ? 'https://friendbot-testnet.stellar.org'
  : null

const horizon = new Horizon.Server(HORIZON_URL)
const soroban = new rpc.Server(SOROBAN_RPC_URL)

async function cmdFund(args: string[]) {
  const [address] = args
  if (!address) { console.error('Usage: stellar fund <address>'); process.exit(1) }
  if (NETWORK !== 'testnet') { console.error('Friendbot only available on testnet'); process.exit(1) }

  console.log(`Funding ${address} via Friendbot...`)
  const res = await fetch(`${FRIENDBOT_URL}?addr=${address}`)
  if (!res.ok) {
    const text = await res.text()
    console.error('Friendbot error:', text)
    process.exit(1)
  }
  const data = await res.json()
  console.log('Funded! Transaction hash:', data.hash)

  console.log('Waiting for account to appear on-chain...')
  for (let i = 0; i < 15; i++) {
    try {
      await soroban.getAccount(address)
      console.log('Account verified on-chain')
      break
    } catch {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
}

async function cmdBalance(args: string[]) {
  const [address] = args
  if (!address) { console.error('Usage: stellar balance <address>'); process.exit(1) }

  console.log(`Checking balance for ${address}...`)
  try {
    const account = await horizon.loadAccount(address)
    const xlmBalance = (account.balances as any[]).find((b: any) => b.asset_type === 'native')
    console.log(`XLM: ${parseFloat(xlmBalance?.balance || '0').toFixed(7)}`)
    for (const b of account.balances as any[]) {
      if (b.asset_type !== 'native') {
        console.log(`${b.asset_code}: ${b.balance} (issuer: ${b.asset_issuer})`)
      }
    }
  } catch {
    // also try soroban
    try {
      await soroban.getAccount(address)
      console.log('Account exists on Soroban but may have zero balance')
    } catch {
      console.error('Account does not exist on-chain')
      process.exit(1)
    }
  }
}

async function cmdCreateWallet() {
  const kp = Keypair.random()
  console.log('Public key:', kp.publicKey())
  console.log('Secret key:', kp.secret())
  console.log()
  console.log('To fund this wallet:')
  if (NETWORK === 'testnet') {
    console.log(`  npm run stellar fund ${kp.publicKey()}`)
  }
}

async function cmdInvoke(args: string[]) {
  const [contractId, method, signerSecret, ...rest] = args
  if (!contractId || !method || !signerSecret) {
    console.error('Usage: stellar invoke <contract-id> <method> <signer-secret> [arg1 arg2 ...]')
    console.error('  Arguments are hex strings (for bytes) or plain strings (for addresses/symbols)')
    process.exit(1)
  }
  const sourceKp = Keypair.fromSecret(signerSecret)
  const sourcePub = sourceKp.publicKey()

  const scVals: xdr.ScVal[] = []
  for (const arg of rest) {
    const colonIdx = arg.indexOf(':')
    if (colonIdx === -1) {
      console.error(`Invalid argument "${arg}" — expected type:value (e.g., bytes:aabbcc address:GA...)`)
      process.exit(1)
    }
    const type = arg.slice(0, colonIdx)
    const val = arg.slice(colonIdx + 1)
    switch (type) {
      case 'bytes':
        scVals.push(xdr.ScVal.scvBytes(Buffer.from(val, 'hex')))
        break
      case 'address':
        scVals.push(Address.fromString(val).toScVal())
        break
      case 'u32':
        scVals.push(xdr.ScVal.scvU32(parseInt(val, 10)))
        break
      case 'i32':
        scVals.push(xdr.ScVal.scvI32(parseInt(val, 10)))
        break
      case 'u64':
        scVals.push(xdr.ScVal.scvU64(new xdr.Uint64(val)))
        break
      case 'i64':
        scVals.push(xdr.ScVal.scvI64(new xdr.Int64(val)))
        break
      case 'bool':
        scVals.push(xdr.ScVal.scvBool(val === 'true'))
        break
      case 'string':
        scVals.push(xdr.ScVal.scvString(val))
        break
      default:
        console.error(`Unknown argument type: ${type}`)
        process.exit(1)
    }
  }

  console.log(`Checking account ${sourcePub.slice(0, 8)}...`)

  // Check account exists and fund if needed
  try {
    await soroban.getAccount(sourcePub)
    console.log('Account exists on-chain')
  } catch {
    if (NETWORK === 'testnet') {
      console.log('Account not found. Funding via Friendbot...')
      const res = await fetch(`${FRIENDBOT_URL}?addr=${sourcePub}`)
      if (!res.ok) console.error('Friendbot warning:', await res.text())
      console.log('Waiting for account...')
      for (let i = 0; i < 15; i++) {
        try { await soroban.getAccount(sourcePub); break }
        catch { await new Promise(r => setTimeout(r, 1000)) }
      }
    } else {
      console.error('Account does not exist on-chain')
      process.exit(1)
    }
  }

  const account = await soroban.getAccount(sourcePub)
  const contract = new Contract(contractId)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...scVals))
    .setTimeout(30)
    .build()

  console.log('Simulating transaction...')
  const prepared = await soroban.prepareTransaction(tx)
  prepared.sign(sourceKp)

  console.log('Sending transaction...')
  const sendResult = await soroban.sendTransaction(prepared)

  if (sendResult.status === 'ERROR') {
    console.error('Send error:', sendResult)
    process.exit(1)
  }

  const hash = sendResult.hash
  console.log('Transaction hash:', hash)
  console.log('Waiting for confirmation...')

  for (let i = 0; i < 60; i++) {
    const result = await soroban.getTransaction(hash)
    if (result.status === 'SUCCESS') {
      console.log('Transaction confirmed!')
      if (result.returnValue) {
        console.log('Return value:', result.returnValue)
      }
      return
    }
    if (result.status === 'FAILED') {
      console.error('Transaction failed')
      const r: any = result
      console.error('Result code:', r.resultCode)
      console.error('Result string:', r.resultString)
      if (r.error) console.error('Error:', r.error)
      if (r.resultXdr) {
        try { console.error('Result XDR (base64):', r.resultXdr.toXDR('base64')) } catch {}
      }
      if (r.events && Array.isArray(r.events)) {
        for (const evt of r.events) {
          const e: any = evt
          if (e.type === 'diagnostic' && e.event?.body?._value?.topics) {
            for (const t of e.event.body._value.topics) {
              if (t?._arm === 'sym' && t._value?.data) {
                console.error('  Event:', Buffer.from(t._value.data).toString())
              }
            }
          }
        }
      }
      process.exit(1)
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  console.error('Transaction timed out after 60s')
  process.exit(1)
}

async function cmdRegisterDevice(args: string[]) {
  const [contractId, deviceHashHex, walletSecret] = args
  if (!contractId || !deviceHashHex || !walletSecret) {
    console.error('Usage: stellar register-device <contract-id> <device-hash-hex> <wallet-secret>')
    console.error()
    console.error('Example:')
    console.error(`  npm run stellar register-device ${process.env.EXPO_PUBLIC_DEVICE_REGISTRY_CONTRACT || '<contract>'} abc123def... S...`)
    process.exit(1)
  }

  const walletKp = Keypair.fromSecret(walletSecret)
  const walletPub = walletKp.publicKey()

  // Build args: device_hash (BytesN<32>), wallet (Address)
  const hashBytes = Buffer.from(deviceHashHex, 'hex')
  if (hashBytes.length !== 32) {
    console.error(`Device hash must be 32 bytes (got ${hashBytes.length}). Make sure to use SHA-256 output.`)
    process.exit(1)
  }

  // Convert to BytesN<32> ScVal
  const deviceHashScVal = xdr.ScVal.scvBytes(hashBytes)
  const walletScVal = Address.fromString(walletPub).toScVal()

  // Reuse cmdInvoke logic
  const sourceKp = walletKp
  const sourcePub = walletPub

  console.log(`Registering device ${deviceHashHex.slice(0, 16)}... with wallet ${walletPub.slice(0, 8)}...`)
  console.log(`Contract: ${contractId}`)

  // Check account exists
  try {
    await soroban.getAccount(sourcePub)
    console.log('Wallet account exists on-chain')
  } catch {
    if (NETWORK === 'testnet') {
      console.log('Wallet not found. Funding via Friendbot...')
      const res = await fetch(`${FRIENDBOT_URL}?addr=${sourcePub}`)
      if (!res.ok) console.error('Friendbot warning:', await res.text())
      for (let i = 0; i < 15; i++) {
        try { await soroban.getAccount(sourcePub); break }
        catch { await new Promise(r => setTimeout(r, 1000)) }
      }
    } else {
      console.error('Wallet account does not exist on-chain')
      process.exit(1)
    }
  }

  const account = await soroban.getAccount(sourcePub)
  const contract = new Contract(contractId)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('register', deviceHashScVal, walletScVal))
    .setTimeout(30)
    .build()

  console.log('Simulating...')
  let prepared: any
  try {
    prepared = await soroban.prepareTransaction(tx)
    console.log('Simulation OK')
  } catch (e: any) {
    console.error('Simulation failed:', e.message)
    if (e?.response?.data) {
      console.error('Sim error data:', typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data, null, 2))
    }
    process.exit(1)
  }
  prepared.sign(sourceKp)

  console.log('Sending transaction...')
  const sendResult = await soroban.sendTransaction(prepared)
  if (sendResult.status === 'ERROR') {
    console.error('Send error:', sendResult)
    process.exit(1)
  }

  const hash = sendResult.hash
  console.log('Tx hash:', hash)

  for (let i = 0; i < 60; i++) {
    const result = await soroban.getTransaction(hash)
    if (result.status === 'SUCCESS') {
      console.log('Device registered!')
      return
    }
    if (result.status === 'FAILED') {
      console.error('Transaction failed')
      const r: any = result
      console.error('Result code:', r.resultCode)
      console.error('Result string:', r.resultString)
      if (r.error) console.error('Error:', r.error)
      if (r.resultXdr) {
        try { console.error('Result XDR (base64):', r.resultXdr.toXDR('base64')) } catch {}
      }
      if (r.events && Array.isArray(r.events)) {
        for (const evt of r.events) {
          const e: any = evt
          if (e.type === 'diagnostic' && e.event?.body?._value?.topics) {
            for (const t of e.event.body._value.topics) {
              if (t?._arm === 'sym' && t._value?.data) {
                console.error('  Event:', Buffer.from(t._value.data).toString())
              }
            }
          }
        }
      }
      process.exit(1)
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  console.error('Timed out')
  process.exit(1)
}

async function cmdTxStatus(args: string[]) {
  const [hash] = args
  if (!hash) { console.error('Usage: stellar tx-status <hash>'); process.exit(1) }

  const r: any = await soroban.getTransaction(hash)
  console.log('Status:', r.status)
  console.log('Result code:', r.resultCode)
  console.log('Result string:', r.resultString)
  if (r.error) console.error('Error:', r.error)
  if (r.status === 'SUCCESS') {
    console.log('Return value:', r.returnValue)
  }
  if (r.status === 'FAILED') {
    if (r.resultXdr) {
      try { console.error('Result XDR (base64):', r.resultXdr.toXDR('base64')) } catch {}
    }
  }
  // Extract human-readable events
      if (r.events && Array.isArray(r.events)) {
        for (const evt of r.events) {
      const e: any = evt
      if (e.type === 'diagnostic' && e.event?.body?._value?.topics) {
        const symbols: string[] = []
        for (const t of e.event.body._value.topics) {
          if (t?._arm === 'sym' && t._value?.data) {
            symbols.push(Buffer.from(t._value.data).toString())
          }
        }
        if (symbols.length > 0) console.error('  [' + symbols.join(', ') + ']')
      }
    }
  }
}

async function cmdReadContract(args: string[]) {
  const [contractId, method, sourcePub, ...rest] = args
  if (!contractId || !method || !sourcePub) {
    console.error('Usage: stellar read <contract-id> <method> <source-public-key> [arg1 arg2 ...]')
    process.exit(1)
  }

  try {
    await soroban.getAccount(sourcePub)
  } catch {
    console.error('Source account does not exist on-chain')
    process.exit(1)
  }

  const account = await soroban.getAccount(sourcePub)
  const contract = new Contract(contractId)

  const scVals: xdr.ScVal[] = []
  for (const arg of rest) {
    const colonIdx = arg.indexOf(':')
    if (colonIdx === -1) {
      console.error(`Invalid argument "${arg}" — expected type:value (e.g., bytes:aabbcc address:GA...)`)
      process.exit(1)
    }
    const type = arg.slice(0, colonIdx)
    const val = arg.slice(colonIdx + 1)
    switch (type) {
      case 'bytes':
        scVals.push(xdr.ScVal.scvBytes(Buffer.from(val, 'hex')))
        break
      case 'address':
        scVals.push(Address.fromString(val).toScVal())
        break
      default:
        console.error(`Unknown type: ${type}`)
        process.exit(1)
    }
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...scVals))
    .setTimeout(30)
    .build()

  const sim = await soroban.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) {
    console.error('Simulation error:', sim.error)
    process.exit(1)
  }
  if (!sim.result) {
    console.error('No result from simulation')
    process.exit(1)
  }
  console.log('Result:', sim.result.retval)
}

const HELP = `
Stellar CLI — account management for Noir Wallet

USAGE
  npm run stellar <command> [args]

NETWORK
  Set STELLAR_NETWORK=mainnet for mainnet (default: testnet)

COMMANDS

  fund <address>
    Fund a testnet account via Friendbot

  balance <address>
    Check XLM and token balances for an address

  create-wallet
    Generate a new random Stellar keypair

  invoke <contract-id> <method> <signer-secret> [type:value ...]
    Invoke a Soroban contract method with typed arguments
    Types: bytes, address, u32, i32, u64, i64, bool, string
    Example: npm run stellar invoke <contract> register S... bytes:aabbcc address:GA...

  register-device <contract-id> <device-hash-hex> <wallet-secret>
    Register a device hash on the DeviceRegistry contract
    The wallet secret must match the wallet being registered

  tx-status <hash>
    Check the status of a submitted transaction (SUCCESS/FAILED/NOT_FOUND)

  read <contract-id> <method> <source-public-key> [type:value ...]
    Read-only contract call (simulation, no transaction submitted)

  help
    Show this help
`

async function main() {
  const cmd = process.argv[2]
  const args = process.argv.slice(3)

  switch (cmd) {
    case 'fund':
      await cmdFund(args)
      break
    case 'balance':
      await cmdBalance(args)
      break
    case 'create-wallet':
      await cmdCreateWallet()
      break
    case 'invoke':
      await cmdInvoke(args)
      break
    case 'register-device':
      await cmdRegisterDevice(args)
      break
    case 'tx-status':
      await cmdTxStatus(args)
      break
    case 'read':
      await cmdReadContract(args)
      break
    case 'help':
    case '--help':
    case '-h':
      console.log(HELP)
      break
    default:
      console.error(`Unknown command: ${cmd}`)
      console.log(HELP)
      process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
