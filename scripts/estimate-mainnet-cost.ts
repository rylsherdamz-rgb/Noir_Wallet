/**
 * Simulate mainnet deployment cost for the device_registry contract.
 *
 * Usage:
 *   npx tsx scripts/estimate-mainnet-cost.ts
 *
 * This script:
 *   1. Reads the compiled WASM binary
 *   2. Simulates the upload + deploy transaction against mainnet Soroban RPC
 *   3. Prints estimated fees in XLM and USD
 */

import { Keypair, TransactionBuilder, Operation, rpc, xdr, Networks, Account } from '@stellar/stellar-sdk/axios'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const WASM_PATH = resolve(
  __dirname,
  '../backend/contracts/device_registry/target/wasm32v1-none/release/device_registry.wasm',
)

const RPC_URL = 'https://soroban.stellar.org'
const HORIZON_URL = 'https://horizon.stellar.org'
const NETWORK_PASSPHRASE = Networks.PUBLIC

// Current XLM price in USD (approximate — update if needed)
const XLM_PRICE_USD = 0.32

async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║   Noir Wallet — Mainnet Deployment Cost Estimate    ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('')

  // 1. Read WASM
  const wasmBytes = readFileSync(WASM_PATH)
  console.log(`WASM file:   ${WASM_PATH}`)
  console.log(`WASM size:   ${(wasmBytes.length / 1024).toFixed(1)} KB (${wasmBytes.length} bytes)`)
  console.log(`RPC:         ${RPC_URL}`)
  console.log(`XLM price:   $${XLM_PRICE_USD}`)
  console.log('')

  // 2. Create a random sender (we just need an account for simulation)
  const kp = Keypair.random()
  const pub = kp.publicKey()
  const server = new rpc.Server(RPC_URL)

  // We need a real funded account for simulateTransaction to work.
  // Use a well-known mainnet account that has XLM.
  // Stellar Development Foundation: GABY7K3R5JZ7ZPJ3Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7
  // Actually, simulateTransaction works without a funded account.
  // Let's use the test account approach — simulateTransaction only needs
  // the source account to compute the fee, but doesn't check balance.

  console.log('Creating source account...')
  // simulateTransaction in the RPC takes the transaction XDR and returns
  // the resource estimates. It only needs valid XDR, not a funded account.
  // We use Stellar's zero-account (all zeros) as a placeholder source.
  const zeroAccount = new Account(
    'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    '0',
  )

  // 3. Build a deploy transaction (UploadContractWasm + CreateContract)
  const tx = new TransactionBuilder(zeroAccount, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.restoreFootprint({}))
    .addOperation(
      Operation.uploadContractWasm({
        wasm: wasmBytes,
      }),
    )
    .addOperation(
      Operation.createContract({
        wasm: wasmBytes,
        address: xdr.ScAddress.scAddressTypeAccount(kp.publicKey()),
      }),
    )
    .setTimeout(0)
    .build()

  console.log('Simulating transaction against mainnet RPC...')

  // 4. Simulate to get resource estimates
  let simulation: any
  try {
    simulation = await server.simulateTransaction(tx)
  } catch (e: any) {
    console.error('Simulation failed:', e.message)
    // Fall back to manual estimate using entry size formula
    console.log('Falling back to manual calculation...')
    const manualEstimate = manualFeeEstimate(wasmBytes.length)
    printEstimate(manualEstimate, XLM_PRICE_USD)
    return
  }

  if (simulation.error) {
    console.error('Simulation error:', simulation.error)
    const manualEstimate = manualFeeEstimate(wasmBytes.length)
    printEstimate(manualEstimate, XLM_PRICE_USD)
    return
  }

  // 5. Extract costs
  // The total fee for a Soroban transaction is:
  //   totalFee = minResourceFee + (inclusionFee * operations.length)
  // Where minResourceFee comes from the simulation

  const minResourceFee = parseInt(simulation.minResourceFee ?? '0', 10)
  const cost = simulation.cost ?? simulation.footprint?.resourceFee ?? '0'
  const instructions = simulation.cost?.instructions ?? 0
  const readBytes = simulation.cost?.readBytes ?? 0
  const writeBytes = simulation.cost?.writeBytes ?? 0

  // Classic base fee
  const baseFee = parseInt(tx.fee, 10) * tx.operations.length

  // Total fee in stroops (1 stroop = 0.0000001 XLM)
  const totalStroops = minResourceFee + baseFee

  // Convert to XLM
  const totalXlm = totalStroops * 1e-7
  const totalUsd = totalXlm * XLM_PRICE_USD

  // Account minimum reserve for the new contract
  // Each ledger entry requires a minimum reserve (currently 0.5 XLM)
  // ContractCode entry: 0.5 XLM
  // ContractData entry: 0.5 XLM
  const contractCodeReserveXlm = 0.5
  const contractDataReserveXlm = 0.5
  const totalReserveXlm = contractCodeReserveXlm + contractDataReserveXlm

  const grandTotalXlm = totalXlm + totalReserveXlm

  console.log('')
  console.log('┌────────────────────────────────────────────────────────┐')
  console.log('│                FEE BREAKDOWN                          │')
  console.log('├────────────────────────────────────────────────────────┤')
  console.log(`│  Transaction resource fee   │ ${String(minResourceFee).padStart(18)} stroops │`)
  console.log(`│  Classic base fee           │ ${String(baseFee).padStart(18)} stroops │`)
  console.log(`│  Total transaction fee      │ ${String(totalStroops).padStart(18)} stroops │`)
  console.log(`│  Transaction fee (XLM)      │ ${totalXlm.toFixed(7).padStart(14)} XLM     │`)
  console.log(`│  Transaction fee (USD)      │ $${totalUsd.toFixed(6).padStart(10)}        │`)
  console.log('├────────────────────────────────────────────────────────┤')
  console.log(`│  Instructions               │ ${String(instructions).padStart(18)}        │`)
  console.log(`│  Read bytes                 │ ${String(readBytes).padStart(18)} bytes     │`)
  console.log(`│  Write bytes                │ ${String(writeBytes).padStart(18)} bytes    │`)
  console.log('├────────────────────────────────────────────────────────┤')
  console.log(`│  ContractCode reserve (XLM) │ ${contractCodeReserveXlm.toFixed(4).padStart(14)} XLM     │`)
  console.log(`│  ContractData reserve (XLM) │ ${contractDataReserveXlm.toFixed(4).padStart(14)} XLM     │`)
  console.log(`│  Total reserve (XLM)        │ ${totalReserveXlm.toFixed(4).padStart(14)} XLM     │`)
  console.log('├━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┥')
  console.log(`│  GRAND TOTAL                │ ${grandTotalXlm.toFixed(4).padStart(14)} XLM     │`)
  console.log(`│  GRAND TOTAL (USD)          │ $${(grandTotalXlm * XLM_PRICE_USD).toFixed(4).padStart(10)}        │`)
  console.log('└────────────────────────────────────────────────────────┘')
  console.log('')
  console.log('Notes:')
  console.log(`  • XLM price: $${XLM_PRICE_USD} (approximate)`)
  console.log('  • Reserves are locked (not spent) — returned when contract is deleted')
  console.log('  • Actual cost may vary based on network congestion')
  console.log('  • Additional XLM needed for source account reserve (1 XLM minimum)')
  console.log('')

  printEstimate(
    { transactionFeeXlm: totalXlm, reserveXlm: totalReserveXlm, grandTotalXlm, totalStroops, instructions, readBytes, writeBytes },
    XLM_PRICE_USD,
  )
}

function manualFeeEstimate(wasmSize: number) {
  // Fallback calculation based on current mainnet parameters
  // Soroban resource fee per byte is roughly 0.001 XLM per KB
  const feePerByteXlm = 0.000_001 // ~1 stroop per byte for resources
  const baseFeeStroops = 100 * 3 // 3 operations

  // Resource fee estimate: instructions + write bytes
  const instructionFeeStroops = Math.ceil(wasmSize * 5) // ~5 stroops per byte of WASM
  const writeFeeStroops = Math.ceil(wasmSize * 0.1) // write fee
  const minResourceFee = instructionFeeStroops + writeFeeStroops

  const totalStroops = minResourceFee + baseFeeStroops
  const totalXlm = totalStroops * 1e-7

  return {
    transactionFeeXlm: totalXlm,
    reserveXlm: 1.0,
    grandTotalXlm: totalXlm + 1.0,
    totalStroops,
    instructions: wasmSize * 5,
    readBytes: 0,
    writeBytes: wasmSize,
  }
}

function printEstimate(e: any, xlmPrice: number) {
  console.log('')
  console.log('══════════════════════════════════════════')
  console.log('           COST ESTIMATE SUMMARY')
  console.log('══════════════════════════════════════════')
  console.log(`  Transaction fee: ${e.transactionFeeXlm.toFixed(7)} XLM ($${(e.transactionFeeXlm * xlmPrice).toFixed(5)})`)
  console.log(`  Reserve (locked): ${e.reserveXlm.toFixed(4)} XLM ($${(e.reserveXlm * xlmPrice).toFixed(4)})`)
  console.log(`  ─────────────────────────────────────`)
  console.log(`  TOTAL: ${e.grandTotalXlm.toFixed(4)} XLM`)
  console.log(`  TOTAL: $${(e.grandTotalXlm * xlmPrice).toFixed(4)} USD`)
  console.log('')
  console.log(`  Breakdown:`)
  console.log(`    Stroops:    ${e.totalStroops}`)
  console.log(`    Instr:      ${e.instructions?.toLocaleString() ?? 'N/A'}`)
  console.log(`    Read:       ${e.readBytes?.toLocaleString() ?? 'N/A'} bytes`)
  console.log(`    Write:      ${e.writeBytes?.toLocaleString() ?? 'N/A'} bytes`)
  console.log('══════════════════════════════════════════')
  console.log('')

  // Save to file
  const fs = require('fs')
  const output = {
    timestamp: new Date().toISOString(),
    wasmSizeBytes: readFileSync(WASM_PATH).length,
    xlmPriceUsd: xlmPrice,
    transactionFeeXlm: e.transactionFeeXlm,
    transactionFeeUsd: e.transactionFeeXlm * xlmPrice,
    reserveXlm: e.reserveXlm,
    reserveUsd: e.reserveXlm * xlmPrice,
    grandTotalXlm: e.grandTotalXlm,
    grandTotalUsd: e.grandTotalXlm * xlmPrice,
    stroops: e.totalStroops,
    instructions: e.instructions,
    readBytes: e.readBytes,
    writeBytes: e.writeBytes,
  }
  const outPath = resolve(__dirname, '../.mainnet-cost-estimate.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`Full estimate saved to ${outPath}`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
