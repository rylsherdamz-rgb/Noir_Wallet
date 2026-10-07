// Generate deterministic seed data (wallet + agents + devices) for the UI harness.
// Uses the SAME derivation as the app (m/44'/148'/0'/N') so agentPublicKey on
// each seeded device matches what syncAgentsFromDevices will re-derive.
const bip39 = require('bip39')
const { derivePath } = require('ed25519-hd-key')
const { Keypair } = require('@stellar/stellar-sdk')
const { Buffer } = require('buffer')
const { sha256 } = require('@noble/hashes/sha2.js')

const STELLAR_PATH = "m/44'/148'/0'"
const MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

function toHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}
function deriveAt(seedHex, index) {
  const { key } = derivePath(`${STELLAR_PATH}/${index}'`, seedHex)
  return Keypair.fromRawEd25519Seed(Buffer.from(key.slice(0, 32)))
}

async function buildSeed() {
  const seed = await bip39.mnemonicToSeed(MNEMONIC)
  const seedHex = toHex(new Uint8Array(seed.buffer, seed.byteOffset, seed.byteLength))

  const { key: mainSeed } = derivePath(STELLAR_PATH, seedHex)
  const mainKp = Keypair.fromRawEd25519Seed(Buffer.from(mainSeed.slice(0, 32)))
  const agent1 = deriveAt(seedHex, 1)
  const agent2 = deriveAt(seedHex, 2)

  const walletKeys = {
    mnemonic: MNEMONIC,
    stellarSecret: mainKp.secret(),
    stellarPublic: mainKp.publicKey(),
    agentSecret: agent1.secret(),
    agentPublic: agent1.publicKey(),
    agentIndexNext: 3,
    retiredAgentIndexes: [],
  }

  const hash = (s) => Buffer.from(sha256(new TextEncoder().encode(s))).toString('hex')
  const devices = [
    {
      id: hash('card-alpha'), userId: 'local', deviceUidHash: hash('card-alpha'),
      label: 'Blue Keychain', agentPublicKey: agent1.publicKey(), status: 'active',
      dailySpendLimitCents: 500000, accumulatedTodayCents: 0, lastTapAt: null,
      createdAt: new Date('2026-08-01').toISOString(),
    },
    {
      id: hash('card-beta'), userId: 'local', deviceUidHash: hash('card-beta'),
      label: 'Office Card', agentPublicKey: agent2.publicKey(), status: 'active',
      dailySpendLimitCents: 500000, accumulatedTodayCents: 0, lastTapAt: null,
      createdAt: new Date('2026-08-15').toISOString(),
    },
  ]

  const user = {
    id: 'local', email: 'demo@noir.wallet', phoneNumber: '+639171234567',
    stellarPublicKey: mainKp.publicKey(), kycLevel: 1, role: 'consumer', displayName: 'Demo User',
  }

  // NOTE: storeVersion is computed from contract IDs at runtime; we intentionally
  // omit it so onRehydrateStorage keeps our seeded devices (matching version) —
  // if it mismatches, devices get cleared. We set a wildcard the harness patches.
  const persistedStore = {
    state: {
      user, devices,
      pendingPayments: [], pendingTxHashes: [],
      isOnboarded: true, isWalletCreated: true,
      network: 'testnet',
      security: { biometricLockEnabled: false, backgroundLockTimeoutSec: 60 },
    },
    version: 0,
  }

  return {
    walletKeys,
    persistedStore,
    devices,
    agent1Public: agent1.publicKey(),
    agent2Public: agent2.publicKey(),
    mainPublic: mainKp.publicKey(),
  }
}

module.exports = { buildSeed }

if (require.main === module) {
  buildSeed().then((s) => console.log(JSON.stringify(s, null, 2)))
}
