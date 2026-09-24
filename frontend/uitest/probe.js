// Probe the DOM to discover real selectors/text for the tab bar.
const { chromium } = require('playwright')
const { spawn } = require('child_process')
const path = require('path')
const { buildSeed } = require('./seed')

const PORT = 8092
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
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(4000)
    const storeVersion = await page.evaluate(() => {
      try { const r = localStorage.getItem('noir-wallet'); return r ? (JSON.parse(r).state?.storeVersion ?? null) : null } catch { return null }
    })
    await page.evaluate(({ seed, storeVersion }) => {
      localStorage.setItem('wallet_keys', JSON.stringify(seed.walletKeys))
      const s = seed.persistedStore
      s.state.storeVersion = storeVersion || s.state.storeVersion
      localStorage.setItem('noir-wallet', JSON.stringify(s))
    }, { seed, storeVersion })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(6000)

    // Dump all elements with role=tab / links / and short text nodes near bottom
    const info = await page.evaluate(() => {
      const out = { tabs: [], links: [], shortTexts: [] }
      document.querySelectorAll('[role="tab"], [role="button"], a').forEach((el) => {
        const t = (el.textContent || '').trim()
        if (t && t.length < 40) {
          out.tabs.push({
            tag: el.tagName, role: el.getAttribute('role'),
            href: el.getAttribute('href'), text: t,
            aria: el.getAttribute('aria-label'),
          })
        }
      })
      // all leaf text nodes
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const seen = new Set()
      while (walker.nextNode()) {
        const t = (walker.currentNode.textContent || '').trim()
        if (t && t.length < 25 && !seen.has(t)) { seen.add(t); out.shortTexts.push(t) }
      }
      return out
    })
    console.log('=== clickable (role/a) ===')
    console.log(JSON.stringify(info.tabs.slice(0, 40), null, 1))
    console.log('=== short texts ===')
    console.log(JSON.stringify(info.shortTexts.slice(0, 60)))
    console.log('=== url ===', page.url())

    await browser.close()
  } finally { cleanup() }
})().catch((e) => { console.error(e); process.exit(1) })
