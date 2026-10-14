/**
 * Isolated-world relay: page ⇄ service worker. It forwards requests from
 * `window.noir.stellar` and hands back responses; the service worker reads
 * the page origin from Chrome, not from anything the page sends.
 */
import { ERR, PAGE_SOURCE, RELAY_SOURCE, type DappResponse } from './shared/protocol'

let port: chrome.runtime.Port | null = null
const open = new Set<string>()
let keepAlive: ReturnType<typeof setInterval> | undefined

function reply(id: string, response: DappResponse) {
  open.delete(id)
  if (open.size === 0 && keepAlive) { clearInterval(keepAlive); keepAlive = undefined }
  window.postMessage({ source: RELAY_SOURCE, id, response }, window.location.origin)
}

function connect(): chrome.runtime.Port {
  if (port) return port
  const p = chrome.runtime.connect({ name: 'noir-dapp' })
  p.onMessage.addListener((m: { id: string; response: DappResponse }) => reply(m.id, m.response))
  p.onDisconnect.addListener(() => {
    port = null
    // The worker restarted or the extension was updated: fail what was in flight.
    for (const id of [...open]) reply(id, { ok: false, error: ERR.internal('Noir Wallet was restarted. Please try again.') })
  })
  port = p
  return p
}

window.addEventListener('message', (e: MessageEvent) => {
  if (e.source !== window || e.data?.source !== PAGE_SOURCE || typeof e.data.id !== 'string') return
  open.add(e.data.id)
  try {
    connect().postMessage({ id: e.data.id, request: e.data.request })
  } catch {
    reply(e.data.id, { ok: false, error: ERR.internal('Noir Wallet is unavailable. Reload the page.') })
    return
  }
  // Waiting on the user can take a while; pinging keeps the service worker awake.
  keepAlive ??= setInterval(() => { try { port?.postMessage({ id: 'ping', ping: true }) } catch {} }, 20_000)
})
