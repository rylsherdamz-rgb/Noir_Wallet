import { generateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { NoirAgentClient } from '@noir-wallet/agent-sdk'
import { NETWORKS, type NetworkId } from '../shared/networks'
import { busy, h, send, short, topBar } from '../shared/ui'

interface State { hasWallet: boolean; unlocked: boolean; address: string | null; network: NetworkId; origins: string[] }

const root = document.getElementById('app')!
const mount = (...nodes: HTMLElement[]) => root.replaceChildren(...nodes)
const btn = (label: string, cls: string, onclick: (e: Event) => void, extra: Record<string, string> = {}) =>
  h('button', { class: `btn ${cls}`, type: 'button', onclick, ...extra }, label) as HTMLButtonElement

async function render() {
  const s = await send<State>({ type: 'state' })
  if (!s.hasWallet) return onboarding()
  if (!s.unlocked) return unlockScreen()
  return home(s)
}

// ── Onboarding ──────────────────────────────────────────────────────

function onboarding() {
  mount(h('div', { class: 'app' }, topBar(),
    h('main', { class: 'main' },
      h('p', { class: 'kicker' }, 'Tap into trust'),
      h('h1', {}, 'Your Stellar wallet, in the browser.'),
      h('p', { class: 'muted' }, 'Connect to Stellar apps and sign with Noir. Use the same recovery phrase as the Noir app to open the same wallet.'),
      h('div', { style: 'flex:1' }),
      btn('Create a new wallet', 'gold block', () => createFlow()),
      btn('I already have a recovery phrase', 'block', () => importFlow()),
    )))
}

function passwordStep(mnemonic: string, back: () => void) {
  const pw = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'At least 8 characters' }) as HTMLInputElement
  const pw2 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'Repeat it' }) as HTMLInputElement
  const err = h('p', { class: 'err' })
  const go = btn('Create wallet', 'gold block', async () => busy(go, err, async () => {
    if (pw.value.length < 8) throw new Error('Use at least 8 characters.')
    if (pw.value !== pw2.value) throw new Error('The passwords don’t match.')
    await send({ type: 'create', password: pw.value, mnemonic })
    await render()
  }))
  mount(h('div', { class: 'app' }, topBar(btn('Back', 'sm', back)),
    h('main', { class: 'main' },
      h('h1', {}, 'Set a password'),
      h('p', { class: 'muted' }, 'It unlocks Noir on this browser. Your phrase is encrypted with it and never leaves this device.'),
      h('div', { class: 'field' }, h('label', {}, 'Password'), pw),
      h('div', { class: 'field' }, h('label', {}, 'Confirm password'), pw2),
      err, h('div', { style: 'flex:1' }), go,
    )))
  pw.focus()
}

function createFlow() {
  const mnemonic = generateMnemonic(wordlist, 128)
  const saved = h('input', { type: 'checkbox', id: 'saved' }) as HTMLInputElement
  const next = btn('Continue', 'gold block', () => passwordStep(mnemonic, createFlow), { disabled: '' })
  saved.addEventListener('change', () => { next.disabled = !saved.checked })
  mount(h('div', { class: 'app' }, topBar(btn('Back', 'sm', onboarding)),
    h('main', { class: 'main' },
      h('h1', {}, 'Your recovery phrase'),
      h('p', { class: 'muted' }, 'Write these 12 words down in order. Anyone with them controls your funds; Noir can’t recover them for you.'),
      h('div', { class: 'words' }, ...mnemonic.split(' ').map((w, i) => h('span', {}, h('i', {}, `${i + 1}`), w))),
      h('label', { class: 'check', for: 'saved' }, saved, 'I wrote my recovery phrase down somewhere safe.'),
      h('div', { style: 'flex:1' }), next,
    )))
}

function importFlow() {
  const phrase = h('textarea', { placeholder: '12 or 24 words, separated by spaces', spellcheck: 'false', autocomplete: 'off' }) as HTMLTextAreaElement
  const err = h('p', { class: 'err' })
  const next = btn('Continue', 'gold block', () => {
    const words = phrase.value.trim().split(/\s+/)
    if (![12, 15, 18, 21, 24].includes(words.length)) { err.textContent = 'A recovery phrase has 12 or 24 words.'; return }
    passwordStep(words.join(' ').toLowerCase(), importFlow)
  })
  mount(h('div', { class: 'app' }, topBar(btn('Back', 'sm', onboarding)),
    h('main', { class: 'main' },
      h('h1', {}, 'Import a wallet'),
      h('p', { class: 'muted' }, 'Enter the recovery phrase from the Noir app (or any SEP-5 Stellar wallet). Account #1 is used.'),
      h('div', { class: 'field' }, h('label', {}, 'Recovery phrase'), phrase),
      err, h('div', { style: 'flex:1' }), next,
    )))
  phrase.focus()
}

// ── Locked ──────────────────────────────────────────────────────────

function unlockScreen() {
  const pw = h('input', { type: 'password', autocomplete: 'current-password', placeholder: 'Wallet password' }) as HTMLInputElement
  const err = h('p', { class: 'err' })
  const go = btn('Unlock', 'gold block', () => busy(go, err, async () => { await send({ type: 'unlock', password: pw.value }); await render() }))
  pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') go.click() })
  mount(h('div', { class: 'app' }, topBar(),
    h('main', { class: 'main center' },
      h('div', { style: 'height:24px' }),
      h('img', { src: 'logo.png', alt: '', width: '72', height: '72', style: 'margin:0 auto' }),
      h('h1', {}, 'Welcome back'),
      h('p', { class: 'muted' }, 'Enter your wallet password to unlock.'),
      pw, err, h('div', { style: 'flex:1' }), go,
    )))
  pw.focus()
}

// ── Home ────────────────────────────────────────────────────────────

async function loadBalance(address: string, network: NetworkId, el: HTMLElement, fundRow: HTMLElement) {
  try {
    const res = await fetch(`${NETWORKS[network].horizonUrl}/accounts/${address}`)
    if (res.status === 404) {
      el.replaceChildren('0', h('small', {}, 'XLM'))
      if (network === 'TESTNET') fundRow.hidden = false
      return
    }
    const acct = (await res.json()) as { balances: { asset_type: string; balance: string }[] }
    const xlm = acct.balances.find((b) => b.asset_type === 'native')?.balance ?? '0'
    el.replaceChildren(Number(xlm).toLocaleString(undefined, { maximumFractionDigits: 2 }), h('small', {}, 'XLM'))
  } catch {
    el.replaceChildren(h('span', { class: 'muted small' }, 'Balance unavailable offline'))
  }
}

async function loadCards(address: string, list: HTMLElement) {
  try {
    const noir = new NoirAgentClient()
    const devices = await noir.listDevices(address)
    if (devices.length === 0) {
      list.replaceChildren(h('li', {}, h('span', { class: 'muted small' }, 'No cards linked yet. Link one in the Noir app.')))
      return
    }
    const rows = await Promise.all(devices.map(async (d) => {
      const [policy, escrow] = await Promise.all([noir.getPolicy(d), noir.getEscrowBalance(d)])
      const expired = policy?.expiresAt && policy.expiresAt < new Date()
      const status = !policy ? h('span', { class: 'pill' }, 'No agent') : expired ? h('span', { class: 'pill warn' }, 'Expired') : h('span', { class: 'pill ok' }, 'Active')
      const cap = policy && policy.maxAmount > 0n ? ` · up to ${Number(policy.maxAmount) / 1e7} XLM per tap` : ''
      return h('li', {}, h('div', { class: 'grow' },
        h('div', { class: 'mono' }, short(d)),
        h('div', { class: 'small muted' }, `${Number(escrow) / 1e7} XLM in escrow${cap}`)), status)
    }))
    list.replaceChildren(...rows)
  } catch {
    list.replaceChildren(h('li', {}, h('span', { class: 'muted small' }, 'Couldn’t reach Stellar to load your cards.')))
  }
}

function home(s: State) {
  const address = s.address!
  const net = h('select', { 'aria-label': 'Network' },
    ...(['TESTNET', 'PUBLIC'] as NetworkId[]).map((n) => h('option', { value: n, selected: n === s.network }, n === 'TESTNET' ? 'Testnet' : 'Mainnet'))) as HTMLSelectElement
  net.addEventListener('change', async () => { await send({ type: 'setNetwork', network: net.value as NetworkId }); await render() })

  const balance = h('div', { class: 'balance' }, '…')
  const fundErr = h('p', { class: 'err' })
  const fundBtn = btn('Fund with Friendbot', 'sm', () => busy(fundBtn, fundErr, async () => {
    const r = await fetch(`https://friendbot.stellar.org/?addr=${address}`)
    if (!r.ok) throw new Error('Friendbot didn’t fund it. Try again in a minute.')
    fundRow.hidden = true
    await loadBalance(address, s.network, balance, fundRow)
  }))
  const fundRow = h('div', { hidden: true }, h('p', { class: 'small muted' }, 'This account isn’t on Testnet yet.'), fundBtn, fundErr)

  const copyBtn = btn('Copy', 'sm', async () => { await navigator.clipboard.writeText(address); copyBtn.textContent = 'Copied'; setTimeout(() => (copyBtn.textContent = 'Copy'), 1400) })

  const cards = h('ul', { class: 'list' }, h('li', {}, h('span', { class: 'muted small' }, 'Loading cards…')))
  const sites = h('ul', { class: 'list' },
    ...(s.origins.length ? s.origins.map((o) => h('li', {}, h('span', { class: 'grow mono' }, o),
      btn('Disconnect', 'sm', async () => { await send({ type: 'revokeOrigin', origin: o }); await render() }))) : [h('li', {}, h('span', { class: 'muted small' }, 'No sites connected.'))]))

  mount(h('div', { class: 'app' }, topBar(net),
    h('main', { class: 'main' },
      h('div', { class: 'card' },
        h('p', { class: 'kicker' }, s.network === 'TESTNET' ? 'Stellar Testnet' : 'Stellar Mainnet'),
        balance,
        h('div', { class: 'row', style: 'margin-top:12px;align-items:center' },
          h('span', { class: 'mono', title: address, style: 'flex:1;white-space:nowrap;word-break:normal' }, short(address)), copyBtn,
          h('a', { class: 'btn sm', href: `${NETWORKS[s.network].explorer}/account/${address}`, target: '_blank', rel: 'noopener' }, 'Explorer')),
        fundRow),
      h('section', {}, h('h3', {}, 'Noir cards'), h('p', { class: 'small muted', style: 'margin:2px 0 6px' }, 'NFC cards linked to this wallet, read from Soroban.'),
        s.network === 'TESTNET' ? cards : h('p', { class: 'small muted' }, 'Noir’s contracts run on Testnet. Switch to Testnet to see your cards.')),
      h('section', {}, h('h3', { style: 'margin-bottom:6px' }, 'Connected sites'), sites),
    ),
    h('footer', { class: 'foot' },
      btn('Lock', '', async () => { await send({ type: 'lock' }); await render() }),
      btn('Settings', '', () => settings(s)))))

  void loadBalance(address, s.network, balance, fundRow)
  if (s.network === 'TESTNET') void loadCards(address, cards)
}

function settings(s: State) {
  const pw = h('input', { type: 'password', placeholder: 'Wallet password' }) as HTMLInputElement
  const err = h('p', { class: 'err' })
  const out = h('div', {})
  const reveal = btn('Show recovery phrase', 'block', () => busy(reveal, err, async () => {
    const { mnemonic } = await send<{ mnemonic: string }>({ type: 'revealMnemonic', password: pw.value })
    out.replaceChildren(h('div', { class: 'words' }, ...mnemonic.split(' ').map((w, i) => h('span', {}, h('i', {}, `${i + 1}`), w))))
  }))
  const reset = btn('Remove wallet from this browser', 'danger block', async () => {
    if (!confirm('Remove Noir from this browser? You will need your recovery phrase to restore it.')) return
    await send({ type: 'reset' })
    await render()
  })
  mount(h('div', { class: 'app' }, topBar(btn('Back', 'sm', () => home(s))),
    h('main', { class: 'main' },
      h('h1', {}, 'Settings'),
      h('div', { class: 'field' }, h('label', {}, 'Recovery phrase'), pw), reveal, err, out,
      h('div', { style: 'flex:1' }),
      h('p', { class: 'small muted' }, 'Noir locks itself after 15 minutes without use.'),
      reset,
    )))
}

if (location.hash === '#onboarding') document.body.classList.add('window')
void render()
