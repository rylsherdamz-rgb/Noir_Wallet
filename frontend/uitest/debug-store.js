// Debug: what does the store actually contain after hydration?
const { chromium } = require('playwright')
const { spawn } = require('child_process')
const path = require('path')
const { buildSeed } = require('./seed')

const PORT = 8093
const BASE = `http://localhost:${PORT}`

function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try { const r = await fetch(url); if (r.ok) return resolve(true) } catch {}
      if (Date.now() - start > timeoutMs) return reject(new Error('timeout'))
      setTimeout(tick, 1500)
    }
    tick()
  })
}

;(async () => {
  const server = spawn('npx', ['expo', 'start', '--web', '--port', String(PORT)], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, CI: '1', BROWSER: 'none' },
    stdio: 'ignore',
  })
  const cleanup = () => { try { server.kill('SIGTERM') } catch {} }
  process.on('exit', cleanup)

  try {
    await waitForServer(BASE)
    const seed = await buildSeed()
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 414, height: 896 } })
    page.on('console', (m) => {
      const t = m.text()
      if (t.includes('NOIR_ROUTE_DEBUG')) console.log('   [route]', t)
      else if (m.type() === 'error') console.log('   [browser error]', t.slice(0, 160))
    })

    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000)

    const before = await page.evaluate(() => localStorage.getItem('noir-wallet'))
    console.log('› localStorage BEFORE seed:', before ? before.slice(0, 240) : null)

    const storeVersion = await page.evaluate(() => {
      try { const r = localStorage.getItem('noir-wallet'); return r ? (JSON.parse(r).state?.storeVersion ?? null) : null } catch { return null }
    })
    console.log('› runtime storeVersion:', storeVersion)

    await page.evaluate(({ seed, storeVersion }) => {
      localStorage.setItem('wallet_keys', JSON.stringify(seed.walletKeys))
      const s = seed.persistedStore
      s.state.storeVersion = storeVersion || s.state.storeVersion
      localStorage.setItem('noir-wallet', JSON.stringify(s))
    }, { seed, storeVersion })

    const seeded = await page.evaluate(() => localStorage.getItem('noir-wallet'))
    console.log('› localStorage AFTER seed:', seeded ? seeded.slice(0, 300) : null)

    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(9000)

    const after = await page.evaluate(() => {
      const raw = localStorage.getItem('noir-wallet')
      const parsed = raw ? JSON.parse(raw) : null
      return {
        url: location.pathname,
        isOnboarded: parsed?.state?.isOnboarded,
        isWalletCreated: parsed?.state?.isWalletCreated,
        deviceCount: parsed?.state?.devices?.length ?? 0,
        storeVersion: parsed?.state?.storeVersion,
        walletKeysPresent: !!localStorage.getItem('wallet_keys'),
        agentsIndex: localStorage.getItem('x402.agents.index'),
      }
    })
    console.log('› store AFTER hydration:', JSON.stringify(after, null, 1))

    await browser.close()
  } finally { cleanup() }
})().catch((e) => { console.error(e); process.exit(1) })
