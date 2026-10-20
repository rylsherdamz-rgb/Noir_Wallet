import { describeAuthEntry, describeTransaction, type Described } from '../shared/describe'
import { networkByPassphrase } from '../shared/networks'
import type { PendingApproval } from '../shared/protocol'
import { busy, h, send, short, topBar } from '../shared/ui'

const root = document.getElementById('app')!
const id = new URLSearchParams(location.search).get('id') ?? ''

const TITLES: Record<PendingApproval['kind'], string> = {
  connect: 'Connect to this site?',
  signTransaction: 'Sign transaction',
  signAuthEntry: 'Authorize a contract call',
  signMessage: 'Sign a message',
}

function details(p: PendingApproval & { address: string }): Described {
  switch (p.kind) {
    case 'connect':
      return {
        title: TITLES.connect,
        rows: [{ label: 'It will see', value: `Your address ${short(p.address)} and network` }, { label: 'It can ask', value: 'For signatures, each one approved by you here' }],
        warnings: [],
      }
    case 'signTransaction':
      return describeTransaction(p.payload ?? '', p.networkPassphrase, p.address)
    case 'signAuthEntry':
      return describeAuthEntry(p.payload ?? '')
    case 'signMessage':
      return { title: TITLES.signMessage, rows: [{ label: 'Message', value: p.payload ?? '' }], warnings: [] }
  }
}

async function main() {
  let p: PendingApproval & { address: string }
  try {
    p = await send({ type: 'pending', id })
  } catch (e) {
    root.replaceChildren(h('div', { class: 'app' }, topBar(), h('main', { class: 'main' }, h('h1', {}, 'Nothing to approve'), h('p', { class: 'muted' }, (e as Error).message))))
    return
  }
  const state = await send<{ unlocked: boolean }>({ type: 'state' })
  const d = details(p)
  const net = networkByPassphrase(p.networkPassphrase)
  const err = h('p', { class: 'err' })
  const pw = h('input', { type: 'password', placeholder: 'Wallet password', autocomplete: 'current-password' }) as HTMLInputElement

  const respond = async (approve: boolean) => {
    if (approve && !state.unlocked) { await send({ type: 'unlock', password: pw.value }); state.unlocked = true }
    await send({ type: 'resolve', id, approve })
    window.close()
  }
  const approve = h('button', { class: 'btn gold', type: 'button' }, p.kind === 'connect' ? 'Connect' : 'Approve') as HTMLButtonElement
  approve.addEventListener('click', () => busy(approve, err, () => respond(true)))
  const reject = h('button', { class: 'btn', type: 'button', onclick: () => void respond(false) }, 'Reject')
  pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') approve.click() })

  let originHost = p.origin
  try { originHost = new URL(p.origin).host } catch {}

  root.replaceChildren(h('div', { class: 'app' },
    topBar(h('span', { class: `pill ${net?.id === 'PUBLIC' ? 'warn' : ''}` }, net?.id === 'PUBLIC' ? 'Mainnet' : 'Testnet')),
    h('main', { class: 'main' },
      h('div', { class: 'origin' }, h('div', {}, h('p', { class: 'kicker' }, 'Request from'), h('b', {}, originHost))),
      p.origin.startsWith('http://') && !/^http:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(p.origin) ? h('p', { class: 'warning' }, 'This site is not using HTTPS.') : null,
      h('h1', {}, d.title),
      ...d.warnings.map((w) => h('p', { class: 'warning' }, w)),
      d.rows.length ? h('dl', { class: 'kv card' }, ...d.rows.flatMap((r) => [h('dt', {}, r.label), h('dd', { class: r.mono ? 'mono' : '' }, r.value)])) : null,
      p.kind !== 'connect' ? h('p', { class: 'small muted' }, `Signing as ${short(p.address)}`) : null,
      state.unlocked ? null : h('div', { class: 'field' }, h('label', {}, 'Noir is locked'), pw),
      err,
    ),
    h('footer', { class: 'foot row' }, reject, approve)))
  if (!state.unlocked) pw.focus()
}

void main()
