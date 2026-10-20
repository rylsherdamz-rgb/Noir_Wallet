// End-to-end: loads dist/ into Chromium, onboards with the SEP-5 test phrase,
// then drives connect + every signing method from a dApp page and verifies
// the signatures. Run: npm run test:e2e
import { chromium } from 'playwright'
import { build } from 'esbuild'
import { createServer } from 'node:http'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import {
  Account, Address, Asset, hash, Keypair, Networks, nativeToScVal, Operation, TransactionBuilder, xdr,
} from '@stellar/stellar-sdk'

const DIST = fileURLToPath(new URL('../dist', import.meta.url))
const MNEMONIC = 'illness spike retreat truth genius clock brain pass fit cave bargain toe'
const ADDRESS = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6'
const PASSWORD = 'correct horse battery'
const ok = (name) => console.log(`  ✓ ${name}`)
const SHOTS = process.env.SHOTS
const shot = (page, name) => (SHOTS ? page.screenshot({ path: join(SHOTS, `${name}.png`) }) : null)

const server = createServer((_req, res) => { res.setHeader('content-type', 'text/html'); res.end('<!doctype html><title>dApp</title><h1>Test dApp</h1>') })
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const DAPP = `http://localhost:${server.address().port}/`

const profile = await mkdtemp(join(tmpdir(), 'noir-ext-'))
const ctx = await chromium.launchPersistentContext(profile, {
  channel: 'chromium',
  headless: true,
  args: [`--disable-extensions-except=${DIST}`, `--load-extension=${DIST}`],
})

try {
  let [sw] = ctx.serviceWorkers()
  sw ??= await ctx.waitForEvent('serviceworker')
  const extId = new URL(sw.url()).host
  const popup = await ctx.newPage()
  await popup.goto(`chrome-extension://${extId}/popup.html`)

  // Import the SEP-5 test phrase.
  await popup.setViewportSize({ width: 360, height: 600 })
  await shot(popup, '01-welcome')
  await popup.getByRole('button', { name: 'I already have a recovery phrase' }).click()
  await popup.locator('textarea').fill(MNEMONIC)
  await popup.getByRole('button', { name: 'Continue' }).click()
  const pws = popup.locator('input[type=password]')
  await pws.nth(0).fill(PASSWORD)
  await pws.nth(1).fill(PASSWORD)
  await popup.getByRole('button', { name: 'Create wallet' }).click()
  await popup.getByText('Connected sites').waitFor()
  assert.equal(await popup.locator('.mono[title]').getAttribute('title'), ADDRESS)
  await popup.waitForTimeout(2500)
  await shot(popup, '02-home')
  ok('imports a recovery phrase into the SEP-5 address')

  const dapp = await ctx.newPage()
  await dapp.goto(DAPP)
  assert.equal(await dapp.evaluate(() => !!window.noir?.stellar?.isNoir), true)
  ok('injects window.noir.stellar')

  /** Runs `fn` in the dApp, answers the approval window, returns the result. */
  async function withApproval(fn, arg, button) {
    const approvalOpened = ctx.waitForEvent('page')
    const result = dapp.evaluate(fn, arg)
    const win = await approvalOpened
    await win.waitForLoadState()
    await win.getByRole('button', { name: button }).waitFor()
    await shot(win, `approve-${button}-${Date.now()}`)
    await win.getByRole('button', { name: button }).click()
    return result
  }

  assert.deepEqual(await dapp.evaluate(() => window.noir.stellar.getNetwork()), { network: 'TESTNET', networkPassphrase: Networks.TESTNET })
  const early = await dapp.evaluate(() => window.noir.stellar.signMessage('hi'))
  assert.match(early.error.message, /not connected/)
  ok('refuses to sign for a site that has not connected')

  const rejected = await withApproval(() => window.noir.stellar.requestAccess(), null, 'Reject')
  assert.equal(rejected.error.code, -4)
  ok('reports a rejected connection as code -4')

  const access = await withApproval(() => window.noir.stellar.requestAccess(), null, 'Connect')
  assert.deepEqual(access, { address: ADDRESS })
  assert.deepEqual(await dapp.evaluate(() => window.noir.stellar.getAddress()), { address: ADDRESS })
  ok('connects after approval; later getAddress needs no prompt')

  const kp = Keypair.fromPublicKey(ADDRESS)
  const msg = await withApproval((m) => window.noir.stellar.signMessage(m), 'Hello, World!', 'Approve')
  const msgHash = hash(Buffer.concat([Buffer.from('Stellar Signed Message:\n'), Buffer.from('Hello, World!')]))
  assert.equal(kp.verify(msgHash, Buffer.from(msg.signedMessage, 'base64')), true)
  assert.equal(msg.signerAddress, ADDRESS)
  ok('signMessage returns a valid SEP-53 signature')

  const tx = new TransactionBuilder(new Account(ADDRESS, '1'), { fee: '100', networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.payment({ destination: Keypair.random().publicKey(), asset: Asset.native(), amount: '1' }))
    .setTimeout(300).build()
  const signedTx = await withApproval(([x, p]) => window.noir.stellar.signTransaction(x, { networkPassphrase: p }), [tx.toXDR(), Networks.TESTNET], 'Approve')
  const parsed = TransactionBuilder.fromXDR(signedTx.signedTxXdr, Networks.TESTNET)
  assert.equal(kp.verify(parsed.hash(), parsed.signatures[0].signature()), true)
  ok('signTransaction signs the envelope')

  const wrongNet = await dapp.evaluate(([x, p]) => window.noir.stellar.signTransaction(x, { networkPassphrase: p }), [tx.toXDR(), Networks.PUBLIC])
  assert.equal(wrongNet.error.code, -3)
  ok('refuses a different network without prompting')

  const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(new xdr.HashIdPreimageSorobanAuthorization({
    networkId: hash(Buffer.from(Networks.TESTNET)), nonce: xdr.Int64.fromString('1'), signatureExpirationLedger: 100,
    invocation: new xdr.SorobanAuthorizedInvocation({
      function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(new xdr.InvokeContractArgs({
        contractAddress: new Address('CA5S4S7QGHJHJWVJBYL3CXZXZTNGKXMNZVDAEQNN7NUXFP4D7BYK7HIX').toScAddress(),
        functionName: 'authorize', args: [nativeToScVal(5n, { type: 'i128' })],
      })),
      subInvocations: [],
    }),
  })).toXDR('base64')
  const auth = await withApproval((e) => window.noir.stellar.signAuthEntry(e), preimage, 'Approve')
  assert.equal(kp.verify(hash(Buffer.from(preimage, 'base64')), Buffer.from(auth.signedAuthEntry, 'base64')), true)
  ok('signAuthEntry signs sha256(preimage)')

  // The Stellar Wallets Kit module (kit-module/noir.module.ts) against the real extension.
  const bundled = await build({
    entryPoints: [fileURLToPath(new URL('../kit-module/noir.module.ts', import.meta.url))],
    bundle: true, write: false, format: 'iife', globalName: 'NoirKit',
    plugins: [{ name: 'kit-types', setup(b) { b.onResolve({ filter: /types\/mod\.ts$/ }, () => ({ path: fileURLToPath(new URL('./fixtures/kit-types.ts', import.meta.url)) })) } }],
  })
  await dapp.addScriptTag({ content: bundled.outputFiles[0].text })
  const viaKit = await dapp.evaluate(async () => {
    const m = new window.NoirKit.NoirModule()
    return { available: await m.isAvailable(), address: (await m.getAddress()).address, network: await m.getNetwork() }
  })
  assert.deepEqual(viaKit, { available: true, address: ADDRESS, network: { network: 'TESTNET', networkPassphrase: Networks.TESTNET } })
  const kitReject = await withApproval(() => new window.NoirKit.NoirModule().signMessage('kit').catch((e) => e), null, 'Reject')
  assert.equal(kitReject.code, -4)
  ok('Stellar Wallets Kit NoirModule works against the extension')

  // Locked wallet: the approval window asks for the password first.
  await popup.reload()
  await popup.getByRole('button', { name: 'Lock' }).click()
  const opened = ctx.waitForEvent('page')
  const lockedSign = dapp.evaluate(() => window.noir.stellar.signMessage('after lock'))
  const win = await opened
  await win.waitForLoadState()
  await win.locator('input[type=password]').fill(PASSWORD)
  await win.getByRole('button', { name: 'Approve' }).click()
  assert.equal(typeof (await lockedSign).signedMessage, 'string')
  ok('unlocks from the approval window, then signs')

  console.log('\nAll e2e checks passed.')
} finally {
  await ctx.close()
  server.close()
  await rm(profile, { recursive: true, force: true })
}
