import type { UiMessage } from './protocol'

/** Ask the service worker; throws its error message on failure. */
export async function send<T = unknown>(msg: UiMessage): Promise<T> {
  const res = (await chrome.runtime.sendMessage(msg)) as { ok: boolean; result?: T; error?: string }
  if (!res?.ok) throw new Error(res?.error ?? 'Noir Wallet did not answer.')
  return res.result as T
}

type Child = Node | string | null | undefined | false
type Attrs = Record<string, string | boolean | ((e: Event) => void) | undefined>

/** Tiny DOM builder; text is always set as text, never parsed as HTML. */
export function h(tag: string, attrs: Attrs = {}, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue
    if (typeof v === 'function') el.addEventListener(k.replace(/^on/, '').toLowerCase(), v)
    else if (v === true) el.setAttribute(k, '')
    else el.setAttribute(k, v)
  }
  for (const c of children) if (c) el.append(c)
  return el
}

export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-6)}`

export function topBar(...right: Child[]): HTMLElement {
  return h('header', { class: 'top' },
    h('img', { src: 'logo.png', alt: '' }), h('span', { class: 'word' }, 'NOIR'), h('span', { class: 'spacer' }), ...right)
}

/** Disables a button while `fn` runs and shows errors in `errEl`. */
export async function busy(btn: HTMLButtonElement, errEl: HTMLElement, fn: () => Promise<void>) {
  btn.disabled = true
  errEl.textContent = ''
  try { await fn() } catch (e) { errEl.textContent = (e as Error).message } finally { btn.disabled = false }
}
