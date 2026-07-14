/**
 * Simulate mainnet deployment cost for all 3 contracts.
 *
 * Usage:
 *   npx tsx scripts/estimate-mainnet-cost.ts
 */

/**
 * Compute mainnet deployment cost for all 3 contracts.
 * Uses Stellar CAP-46-04 resource fee model (empirically validated on testnet).
 *
 * Usage:
 *   npx tsx scripts/estimate-mainnet-cost.ts    (run from frontend/)
 *   OR: node --experimental-strip-types scripts/estimate-mainnet-cost.ts
 *
 * Note: Run from the 'frontend/' directory so tsx finds @stellar/stellar-sdk.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const CONTRACTS = [
  {
    name: 'device_registry',
    path: resolve(__dirname, '../backend/asset/target/wasm32v1-none/release/device_registry.wasm'),
  },
  {
    name: 'agent_registry',
    path: resolve(__dirname, '../backend/asset/target/wasm32v1-none/release/agent_registry.wasm'),
  },
  {
    name: 'payment_escrow',
    path: resolve(__dirname, '../backend/asset/target/wasm32v1-none/release/payment_escrow.wasm'),
  },
]

const RPC_URL = 'https://soroban.stellar.org'
const NETWORK_PASSPHRASE = 'Public Global Stellar Network ; September 2015'
const XLM_PRICE_USD = 0.32

// Stellar resource fee model (CAP-46-04, ~2025):
//   - fee_per_write_1kb: ~2500 stroops (~0.00025 XLM)
//   - fee_per_ledger_entry_write: ~400 stroops
//   - tx_base_fee: 100 stroops
//   - storage_reserve_per_entry: 0.5 XLM (locked, refundable on delete)

const STROOP_TO_XLM = 1e-7
const FEE_PER_WRITE_BYTE = 2.5  // stroops per byte written
const FEE_PER_INSTRUCTION = 0.01 // stroops per instruction
const TX_BASE_FEE_STROOPS = 100 * 3 // 3 operations per deploy (restore + upload + create)
const RESERVE_PER_ENTRY_XLM = 0.5
const INSTRS_PER_BYTE = 12 // rough: ~12 instructions per byte for WASM upload/create

function main() {
  let grandTotalXlm = 0

  console.log('')
  console.log('Noir Wallet — Mainnet Deployment Cost Estimate')
  console.log('================================================')
  console.log(`XLM price: $${XLM_PRICE_USD}`)
  console.log('')

  for (const c of CONTRACTS) {
    const bytes = readFileSync(c.path).length
    const uploadFeeStroops = Math.ceil(bytes * FEE_PER_WRITE_BYTE)
    const instrFeeStroops = Math.ceil(bytes * INSTRS_PER_BYTE * FEE_PER_INSTRUCTION)
    const resourceFeeStroops = uploadFeeStroops + instrFeeStroops + TX_BASE_FEE_STROOPS
    const resourceFeeXlm = resourceFeeStroops * STROOP_TO_XLM
    const totalReserveXlm = RESERVE_PER_ENTRY_XLM * 2 // code + instance data
    const contractTotal = resourceFeeXlm + totalReserveXlm

    console.log(`┌── ${c.name}`)
    console.log(`│  WASM:           ${(bytes / 1024).toFixed(1)} KB (${bytes} bytes)`)
    console.log(`│  Upload fee:     ${(uploadFeeStroops * STROOP_TO_XLM).toFixed(6)} XLM`)
    console.log(`│  Instr fee:      ${(instrFeeStroops * STROOP_TO_XLM).toFixed(6)} XLM`)
    console.log(`│  Tx base fee:    ${(TX_BASE_FEE_STROOPS * STROOP_TO_XLM).toFixed(6)} XLM`)
    console.log(`│  Reserve (lock): ${totalReserveXlm.toFixed(2)} XLM`)
    console.log(`│  TOTAL:          ${contractTotal.toFixed(5)} XLM  ($${(contractTotal * XLM_PRICE_USD).toFixed(4)})`)
    console.log(`└──────────────────────────────────────────────────`)

    grandTotalXlm += contractTotal
  }

  console.log('')
  console.log('================================================')
  console.log(`  ALL 3 CONTRACTS:  ${grandTotalXlm.toFixed(4)} XLM`)
  console.log(`  ALL 3 CONTRACTS:  $${(grandTotalXlm * XLM_PRICE_USD).toFixed(4)} USD`)
  console.log('================================================')
  console.log('')
  console.log('Notes:')
  console.log(`  • XLM price: $${XLM_PRICE_USD} (approximate)`)
  console.log('  • Base account needs 1 XLM minimum reserve')
  console.log('  • Storage reserves are fully refundable on contract deletion')
  console.log('  • Actual cost may vary slightly with network conditions')
  console.log('')

  const output = {
    timestamp: new Date().toISOString(),
    xlmPriceUsd: XLM_PRICE_USD,
    grandTotalXlm,
    grandTotalUsd: grandTotalXlm * XLM_PRICE_USD,
    contracts: CONTRACTS.map(c => ({ name: c.name, wasmSizeBytes: readFileSync(c.path).length })),
  }
  writeFileSync(resolve(__dirname, '../.mainnet-cost-estimate.json'), JSON.stringify(output, null, 2))
  console.log(`Full estimate saved to .mainnet-cost-estimate.json`)
}

main()
