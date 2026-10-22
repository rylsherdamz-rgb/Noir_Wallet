import { AUTO_LOCK_CHOICES } from '../shared/protocol'
import { busy, h, send } from '../shared/ui'
import { back, btn, chips, confirmStep, copyBtn, ctx, field, nav, page, refresh, screen } from './kit'

/** The app's Browse tab (frontend/src/constants/stellarApps.ts), opened in a new tab. */
const APPS: { name: string; url: string; testnetUrl?: string; desc: string; scf?: boolean }[] = [
  { name: 'StellarExpert', url: 'https://stellar.expert/explorer/public', testnetUrl: 'https://stellar.expert/explorer/testnet', desc: 'Explorer' },
  { name: 'Stellar Lab', url: 'https://lab.stellar.org', desc: 'Developer tools' },
  { name: 'Soroswap', url: 'https://app.soroswap.finance', desc: 'Swap tokens', scf: true },
  { name: 'Aquarius', url: 'https://aqua.network', desc: 'Liquidity & rewards', scf: true },
  { name: 'Blend', url: 'https://mainnet.blend.capital', testnetUrl: 'https://testnet.blend.capital', desc: 'Lend & borrow' },
  { name: 'StellarTerm', url: 'https://stellarterm.com', desc: 'Trade' },
  { name: 'Phoenix', url: 'https://app.phoenix-hub.io', desc: 'Swap, pools & staking', scf: true },
  { name: 'DeFindex', url: 'https://app.defindex.io', desc: 'Yield vaults', scf: true },
]

const row = (title: string, sub: string, open: () => void) =>
  h('li', { class: 'tap', tabindex: '0', role: 'button', onclick: open, onkeydown: (e: Event) => { if ((e as KeyboardEvent).key === 'Enter') open() } },
    h('div', { class: 'grow' }, h('div', {}, title), h('div', { class: 'small muted' }, sub)), h('span', { class: 'muted', 'aria-hidden': 'true' }, '›'))

export function settings() {
  const s = ctx.s
  const lock = chips(AUTO_LOCK_CHOICES.map((m) => ({ label: m < 60 ? `${m} min` : '1 hour', value: m })), s.autoLockMin,
    async (m) => { await send({ type: 'setAutoLock', minutes: m }); await refresh() })
  screen({
    tab: 'settings',
    body: [
      h('h1', {}, 'Settings'),
      h('section', {}, h('h3', {}, 'Security'),
        field('Lock Noir after', lock.el, 'Noir also locks when the browser closes.'),
        h('ul', { class: 'list', style: 'margin-top:8px' },
          row('Change password', 'Re-encrypts your phrase on this browser', changePassword),
          row('Show recovery phrase', 'The words that restore this wallet and its cards', () => reveal('phrase')),
          row('Export secret key', 'The S… key of your main account', () => reveal('secret')))),
      h('section', {}, h('h3', { style: 'margin-bottom:6px' }, 'Connected sites'),
        h('ul', { class: 'list' }, ...(s.origins.length
          ? s.origins.map((o) => h('li', {}, h('span', { class: 'grow mono' }, o),
            btn('Disconnect', 'sm', async () => { await send({ type: 'revokeOrigin', origin: o }); await refresh(); settings() })))
          : [h('li', {}, h('span', { class: 'muted small' }, 'No sites connected.'))]))),
      h('section', {}, h('h3', { style: 'margin-bottom:6px' }, 'Explore Stellar apps'),
        h('ul', { class: 'list' }, ...APPS.map((a) => h('li', {},
          h('div', { class: 'grow' }, h('div', {}, a.name, a.scf ? h('span', { class: 'pill', style: 'margin-left:6px' }, 'SCF') : null), h('div', { class: 'small muted' }, a.desc)),
          h('a', { class: 'btn sm', href: s.network === 'TESTNET' && a.testnetUrl ? a.testnetUrl : a.url, target: '_blank', rel: 'noopener' }, 'Open'))))),
      h('section', {}, h('h3', { style: 'margin-bottom:6px' }, 'About'),
        h('p', { class: 'small muted' }, `Noir ${chrome.runtime.getManifest().version} · Open source (MIT) · Cards run on Stellar Testnet.`)),
      btn('Remove wallet from this browser', 'danger block', () => confirmStep({
        title: 'Remove Noir from this browser?',
        body: [
          'The encrypted phrase, connected sites and card names are deleted here. Your funds and cards stay on Stellar.',
          h('p', { class: 'warning' }, 'You need your recovery phrase to restore this wallet.'),
        ],
        confirm: 'Remove', danger: true, onCancel: settings,
        onConfirm: async () => { await send({ type: 'reset' }); await refresh(); nav.tab('wallet') },
      })),
    ],
  })
}

function changePassword() {
  const cur = h('input', { type: 'password', autocomplete: 'current-password', 'aria-label': 'Current password' }) as HTMLInputElement
  const next = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'At least 8 characters', 'aria-label': 'New password' }) as HTMLInputElement
  const next2 = h('input', { type: 'password', autocomplete: 'new-password', 'aria-label': 'Repeat new password' }) as HTMLInputElement
  const err = h('p', { class: 'err', role: 'alert' })
  const save = btn('Change password', 'gold', () => busy(save, err, async () => {
    if (next.value.length < 8) throw new Error('Use at least 8 characters.')
    if (next.value !== next2.value) throw new Error('The new passwords don’t match.')
    await send({ type: 'changePassword', password: cur.value, next: next.value })
    page({ left: back(settings), body: [h('h1', {}, 'Password changed'), h('p', { class: 'muted' }, 'Use the new password next time you unlock Noir.')], foot: [btn('Done', 'gold', settings)] })
  }))
  page({
    left: back(settings),
    body: [h('h1', {}, 'Change password'), field('Current password', cur), field('New password', next), field('Repeat new password', next2), err],
    foot: [btn('Cancel', '', settings), save],
  })
  cur.focus()
}

function reveal(what: 'phrase' | 'secret') {
  const pw = h('input', { type: 'password', autocomplete: 'current-password', 'aria-label': 'Wallet password' }) as HTMLInputElement
  const err = h('p', { class: 'err', role: 'alert' })
  const out = h('div', { class: 'stack' })
  const go = btn(what === 'phrase' ? 'Show phrase' : 'Show secret key', 'gold', () => busy(go, err, async () => {
    if (what === 'phrase') {
      const { mnemonic } = await send<{ mnemonic: string }>({ type: 'revealMnemonic', password: pw.value })
      out.replaceChildren(h('div', { class: 'words' }, ...mnemonic.split(' ').map((w, i) => h('span', {}, h('i', {}, `${i + 1}`), w))))
    } else {
      const { secret } = await send<{ secret: string }>({ type: 'exportSecret', password: pw.value })
      out.replaceChildren(h('p', { class: 'mono card' }, secret), copyBtn(secret, 'Copy secret key'))
    }
    pw.value = ''
  }))
  pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') go.click() })
  page({
    left: back(settings),
    body: [
      h('h1', {}, what === 'phrase' ? 'Recovery phrase' : 'Secret key'),
      h('p', { class: 'warning' }, what === 'phrase'
        ? 'Anyone with these words controls your wallet and every card agent. Never type them into a website.'
        : 'Anyone with this key controls your main account. It does not cover your card agents; the recovery phrase does.'),
      field('Wallet password', pw), err, out,
    ],
    foot: [btn('Done', '', settings), go],
  })
  pw.focus()
}
