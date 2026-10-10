/**
 * Week 2 gate, live on Stellar Testnet, through the app's own code paths:
 *
 *   wallet create + import → NTAG213 UID hash → device_registry.register +
 *   agent_registry.register_agent (constrained policy) → payment_escrow
 *   fund_escrow → defund_escrow → unlink (revoke_agent → sweep_on_revoke →
 *   device revoke)
 *
 * plus the negative path "a tag owned by another wallet is refused".
 *
 * Run: `npm run test:testnet`. Writes an evidence file with every transaction
 * hash to ../deploy-evidence/.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import { walletService } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'
import { x402, buildAgentPolicy, DeviceOwnedByOtherWalletError } from '@/domain/x402'
import { AppConfig } from '@/constants/config'

const EXPLORER = 'https://stellar.expert/explorer/testnet'
const STROOPS = 10_000_000n

interface Step { step: string; hash?: string; detail?: string }
const steps: Step[] = []
const record = (s: Step) => { steps.push(s); console.log(`[week2] ${s.step}${s.hash ? ` → ${s.hash}` : ''}${s.detail ? ` (${s.detail})` : ''}`) }

// Every contract write goes through invokeContract (invokeContractAndWait
// wraps it); record each submitted hash once.
const realInvoke = stellarService.invokeContract.bind(stellarService)
vi.spyOn(stellarService, 'invokeContract').mockImplementation(async (params: any) => {
  const hash = await realInvoke(params)
  record({ step: `tx ${params.method}`, hash })
  return hash
})

/** Same hashing as DeviceProvisioningScreen: SHA-256 of the tag UID string. */
function uidHash(uid: string): string {
  return bytesToHex(sha256(new TextEncoder().encode(uid)))
}

describe('Week 2 flow on Testnet (app code → deployed contracts)', () => {
  let owner: { secret: string; pub: string }
  let intruder: { secret: string; pub: string }
  let agentPub: string
  // A simulated NTAG213 UID (7 bytes, as the chip reports it). The contracts
  // only ever see its SHA-256, so this is indistinguishable from a real tag.
  const tagUid = randomBytes(7).toString('hex').toUpperCase().match(/../g)!.join(':')
  const deviceHash = uidHash(tagUid)

  beforeAll(() => {
    expect(AppConfig.stellar.deviceRegistryContract).toMatch(/^C[A-Z0-9]{55}$/)
    expect(AppConfig.stellar.agentRegistryContract).toMatch(/^C[A-Z0-9]{55}$/)
    expect(AppConfig.stellar.paymentEscrowContract).toMatch(/^C[A-Z0-9]{55}$/)
  })

  it('creates a wallet and re-imports it from the recovery phrase', async () => {
    const mnemonic = await walletService.generateMnemonic()
    expect(walletService.validateMnemonic(mnemonic)).toBe(true)
    const created = await walletService.deriveKeys(mnemonic)
    const imported = await walletService.deriveKeys(`  ${mnemonic.toUpperCase()}  `)
    expect(imported.stellarPublic).toBe(created.stellarPublic)
    expect(imported.stellarSecret).toBe(created.stellarSecret)
    owner = { secret: created.stellarSecret, pub: created.stellarPublic }
    agentPub = walletService.deriveAgentAt(mnemonic, 2).public

    expect(await stellarService.fundAccount(owner.pub)).toBe(true)
    expect(await stellarService.accountExists(owner.pub)).toBe(true)
    record({ step: 'wallet created, imported from phrase (same keys), funded by Friendbot', detail: owner.pub })

    const other = await walletService.deriveKeys(await walletService.generateMnemonic())
    intruder = { secret: other.stellarSecret, pub: other.stellarPublic }
    expect(await stellarService.fundAccount(intruder.pub)).toBe(true)
  })

  it('registers the tag and a constrained agent', async () => {
    expect(await x402.getDeviceOwnership(deviceHash, owner.pub)).toEqual({ status: 'free' })

    const policy = buildAgentPolicy({ maxAmountXlm: 10, expiryDays: 30 })
    await x402.registerDeviceAndAgentOnChain({ walletSecret: owner.secret, deviceHashHex: deviceHash, agentPublicKey: agentPub, policy })

    expect(await x402.getDeviceOwnership(deviceHash, owner.pub)).toMatchObject({ status: 'mine', owner: owner.pub })
    expect(await x402.getAgentPolicy(deviceHash, owner.pub)).toMatchObject({
      agent: agentPub, maxAmountStroops: policy.maxAmountStroops, expiresAt: policy.expiresAt,
    })
    record({ step: 'device + agent registered; policy read back via get_policy', detail: `max 10 XLM/payment, expires ${new Date(Number(policy.expiresAt) * 1000).toISOString()}` })
  })

  it('refuses the same tag for a different wallet', async () => {
    await expect(
      x402.registerDeviceAndAgentOnChain({ walletSecret: intruder.secret, deviceHashHex: deviceHash, agentPublicKey: intruder.pub }),
    ).rejects.toBeInstanceOf(DeviceOwnedByOtherWalletError)
    record({ step: 'second wallet registering the same tag → DeviceOwnedByOtherWalletError (nothing signed)' })
  })

  it('funds and partially withdraws escrow', async () => {
    await x402.fundEscrow({ walletSecret: owner.secret, deviceHashHex: deviceHash, amountXlm: 5 })
    expect(await x402.getEscrowBalance(deviceHash, owner.pub)).toBe(5n * STROOPS)

    await x402.withdrawEscrow({ walletSecret: owner.secret, deviceHashHex: deviceHash, amountStroops: 2n * STROOPS })
    expect(await x402.getEscrowBalance(deviceHash, owner.pub)).toBe(3n * STROOPS)
    record({ step: 'escrow funded 5 XLM, withdrew 2 XLM → balance_of = 3 XLM' })
  })

  it('unlinks without stranding funds', async () => {
    const result = await x402.unlinkDevice({ walletSecret: owner.secret, deviceHashHex: deviceHash, agentPublicKey: agentPub })
    expect(result).toEqual({ agentRevoked: true, sweptStroops: 3n * STROOPS, deviceRevoked: true })
    expect(await x402.getEscrowBalance(deviceHash, owner.pub)).toBe(0n)
    expect(await x402.getDeviceOwnership(deviceHash, owner.pub)).toEqual({ status: 'free' })
    record({ step: 'unlinked: agent revoked, 3 XLM swept back to owner, device revoked; tag free again' })
  })

  afterAll(() => {
    if (steps.length === 0) return
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
    const rows = steps.map((s, i) => `| ${i + 1} | ${s.step}${s.detail ? ` — \`${s.detail}\`` : ''} | ${s.hash ? `[\`${s.hash.slice(0, 12)}…\`](${EXPLORER}/tx/${s.hash})` : ''} |`)
    const md = [
      `# Week 2 Testnet run — ${stamp}`,
      '',
      'Generated by `frontend/testnet/week2-flow.testnet.ts` (`npm run test:testnet`): the app\'s own',
      '`walletService` / `x402` code against the deployed Testnet contracts. The NTAG213 UID is simulated',
      '(random 7-byte UID, hashed exactly as `DeviceProvisioningScreen` does); everything on-chain is real.',
      '',
      `- Owner wallet: [\`${owner?.pub}\`](${EXPLORER}/account/${owner?.pub})`,
      `- Agent: \`${agentPub}\``,
      `- Simulated tag UID: \`${tagUid}\` → device hash \`${deviceHash}\``,
      `- device_registry \`${AppConfig.stellar.deviceRegistryContract}\``,
      `- agent_registry \`${AppConfig.stellar.agentRegistryContract}\``,
      `- payment_escrow \`${AppConfig.stellar.paymentEscrowContract}\``,
      '',
      '| # | Step | Transaction |',
      '|---|------|-------------|',
      ...rows,
      '',
    ].join('\n')
    const file = path.resolve(__dirname, `../../deploy-evidence/week2-testnet-flow-${stamp}.md`)
    writeFileSync(file, md)
    console.log(`[week2] evidence written to ${file}`)
  })
})
