/**
 * Noir service worker. Owns the vault, the unlocked key, site
 * permissions and the approval queue. Pages never see a key: they get
 * addresses and signatures, and only after the user approves in a Noir
 * window.
 */
import { Keypair } from '@stellar/stellar-sdk'
import { validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { deriveKeypair } from './shared/hd'
import { open, seal, type SealedVault } from './shared/vault'
import { NETWORKS, type NetworkId } from './shared/networks'
import { signAuthEntry, signMessage, signTransaction, SigningError } from './shared/signing'
import {
  ERR, type ApprovalKind, type DappRequest, type DappResponse, type PendingApproval, type UiMessage, type WalletError,
} from './shared/protocol'

const AUTO_LOCK_MIN = 15

interface Stored {
  vault?: SealedVault
  address?: string
  network?: NetworkId
  origins?: Record<string, { connectedAt: number }>
}

const local = {
  get: async (): Promise<Stored> => (await chrome.storage.local.get(['vault', 'address', 'network', 'origins'])) as Stored,
  set: (v: Partial<Stored>) => chrome.storage.local.set(v),
}

// The unlocked secret lives only in session storage: memory-backed, cleared
// when the browser closes, and not readable from content scripts.
chrome.storage.session.setAccessLevel?.({ accessLevel: 'TRUSTED_CONTEXTS' })

async function secretKey(): Promise<Keypair | null> {
  const { secret } = (await chrome.storage.session.get('secret')) as { secret?: string }
  if (!secret) return null
  await chrome.storage.session.set({ lastActive: Date.now() })
  return Keypair.fromSecret(secret)
}

async function unlock(password: string): Promise<boolean> {
  const { vault } = await local.get()
  if (!vault) return false
  const mnemonic = await open(vault, password)
  if (!mnemonic) return false
  const kp = await deriveKeypair(mnemonic)
  await chrome.storage.session.set({ secret: kp.secret(), lastActive: Date.now() })
  return true
}

const lock = () => chrome.storage.session.remove(['secret', 'lastActive'])

chrome.alarms.create('autolock', { periodInMinutes: 1 })
chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name !== 'autolock') return
  const { lastActive } = (await chrome.storage.session.get('lastActive')) as { lastActive?: number }
  if (lastActive && Date.now() - lastActive > AUTO_LOCK_MIN * 60_000) await lock()
})

async function networkInfo() {
  return NETWORKS[(await local.get()).network ?? 'TESTNET']
}

// ── Approvals ───────────────────────────────────────────────────────

const pending = new Map<string, { approval: PendingApproval; resolve: (ok: boolean) => void; windowId?: number }>()

async function askUser(kind: ApprovalKind, origin: string, payload?: string): Promise<boolean> {
  const approval: PendingApproval = {
    id: crypto.randomUUID(), kind, origin, payload,
    networkPassphrase: (await networkInfo()).passphrase, createdAt: Date.now(),
  }
  return new Promise<boolean>((resolve) => {
    pending.set(approval.id, { approval, resolve })
    chrome.windows.create(
      { url: chrome.runtime.getURL(`approve.html?id=${approval.id}`), type: 'popup', width: 380, height: 640, focused: true },
      (w) => { const p = pending.get(approval.id); if (p && w?.id !== undefined) p.windowId = w.id },
    )
  })
}

function settle(id: string, ok: boolean) {
  const p = pending.get(id)
  if (!p) return
  pending.delete(id)
  p.resolve(ok)
}

// Closing the approval window is a rejection.
chrome.windows.onRemoved.addListener((windowId) => {
  for (const [id, p] of pending) if (p.windowId === windowId) settle(id, false)
})

// ── dApp requests ───────────────────────────────────────────────────

class Fail extends Error { constructor(readonly error: WalletError) { super(error.message) } }

async function connected(origin: string): Promise<boolean> {
  return !!(await local.get()).origins?.[origin]
}

async function requireConnected(origin: string) {
  if (!(await connected(origin))) throw new Fail(ERR.internal('This site is not connected to Noir. Call requestAccess() first.'))
}

async function requireNetworkAndSigner(opts: { networkPassphrase?: string; address?: string } | undefined) {
  const net = await networkInfo()
  const { address } = await local.get()
  if (opts?.networkPassphrase && opts.networkPassphrase !== net.passphrase) {
    throw new Fail(ERR.unsupported(`Noir is on ${net.name}. Switch networks in the wallet, or request ${net.name}.`))
  }
  if (opts?.address && opts.address !== address) {
    throw new Fail(ERR.invalid(`Noir does not hold ${opts.address}.`))
  }
  return net
}

/** After approval: the key, which the approval window made sure is unlocked. */
async function keyAfterApproval(): Promise<Keypair> {
  const kp = await secretKey()
  if (!kp) throw new Fail(ERR.internal('Noir is locked.'))
  return kp
}

async function handleDapp(origin: string, req: DappRequest): Promise<unknown> {
  const s = await local.get()
  const net = await networkInfo()
  switch (req.method) {
    case 'isConnected':
      return { isConnected: true }
    case 'isAllowed':
      return { isAllowed: await connected(origin) }
    case 'getNetwork':
      return { network: net.name, networkPassphrase: net.passphrase }
    case 'getAddress':
    case 'requestAccess': {
      if (!s.vault || !s.address) {
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html#onboarding') })
        throw new Fail(ERR.internal('Set up Noir first, then try again.'))
      }
      if (!(await connected(origin))) {
        if (!(await askUser('connect', origin))) throw new Fail(ERR.rejected())
        await local.set({ origins: { ...(await local.get()).origins, [origin]: { connectedAt: Date.now() } } })
      }
      return { address: s.address }
    }
    case 'signTransaction': {
      await requireConnected(origin)
      const xdr = req.params?.xdr
      if (typeof xdr !== 'string') throw new Fail(ERR.invalid('xdr is required'))
      const n = await requireNetworkAndSigner(req.params?.opts)
      if (!(await askUser('signTransaction', origin, xdr))) throw new Fail(ERR.rejected())
      return { signedTxXdr: signTransaction(await keyAfterApproval(), xdr, n.passphrase), signerAddress: s.address }
    }
    case 'signAuthEntry': {
      await requireConnected(origin)
      const entry = req.params?.authEntry
      if (typeof entry !== 'string') throw new Fail(ERR.invalid('authEntry is required'))
      const n = await requireNetworkAndSigner(req.params?.opts)
      if (!(await askUser('signAuthEntry', origin, entry))) throw new Fail(ERR.rejected())
      return { signedAuthEntry: signAuthEntry(await keyAfterApproval(), entry, n.passphrase), signerAddress: s.address }
    }
    case 'signMessage': {
      await requireConnected(origin)
      const message = req.params?.message
      if (typeof message !== 'string') throw new Fail(ERR.invalid('message is required'))
      await requireNetworkAndSigner(req.params?.opts)
      if (!(await askUser('signMessage', origin, message))) throw new Fail(ERR.rejected())
      return { signedMessage: signMessage(await keyAfterApproval(), message), signerAddress: s.address }
    }
    default:
      throw new Fail(ERR.unsupported(`Unknown method ${(req as { method: string }).method}`))
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'noir-dapp') return
  // The origin comes from Chrome, never from the page.
  const origin = port.sender?.origin ?? (port.sender?.url ? new URL(port.sender.url).origin : '')
  port.onMessage.addListener(async (msg: { id: string; request?: DappRequest; ping?: true }) => {
    if (msg.ping || !msg.request) return
    let res: DappResponse
    try {
      if (!origin) throw new Fail(ERR.internal('Unknown origin'))
      res = { ok: true, result: await handleDapp(origin, msg.request) }
    } catch (e) {
      res = {
        ok: false,
        error: e instanceof Fail ? e.error : e instanceof SigningError ? ERR.invalid(e.message) : ERR.internal(String((e as Error)?.message ?? e)),
      }
    }
    try { port.postMessage({ id: msg.id, response: res }) } catch { /* tab went away */ }
  })
})

// ── Popup and approval window ───────────────────────────────────────

async function handleUi(msg: UiMessage): Promise<unknown> {
  switch (msg.type) {
    case 'state': {
      const s = await local.get()
      const net = await networkInfo()
      return {
        hasWallet: !!s.vault, unlocked: !!(await secretKey()), address: s.address ?? null,
        network: net.id, origins: Object.keys(s.origins ?? {}),
      }
    }
    case 'create': {
      const mnemonic = msg.mnemonic.trim().toLowerCase().split(/\s+/).join(' ')
      if (!validateMnemonic(mnemonic, wordlist)) throw new Error('That recovery phrase is not valid.')
      if (msg.password.length < 8) throw new Error('Use at least 8 characters.')
      const kp = await deriveKeypair(mnemonic)
      await local.set({ vault: await seal(mnemonic, msg.password), address: kp.publicKey(), origins: {} })
      await chrome.storage.session.set({ secret: kp.secret(), lastActive: Date.now() })
      return { address: kp.publicKey() }
    }
    case 'unlock':
      if (!(await unlock(msg.password))) throw new Error('Wrong password.')
      return { ok: true }
    case 'lock':
      await lock()
      return { ok: true }
    case 'setNetwork':
      await local.set({ network: msg.network })
      return { ok: true }
    case 'revokeOrigin': {
      const origins = { ...(await local.get()).origins }
      delete origins[msg.origin]
      await local.set({ origins })
      return { ok: true }
    }
    case 'revealMnemonic': {
      const { vault } = await local.get()
      const mnemonic = vault && (await open(vault, msg.password))
      if (!mnemonic) throw new Error('Wrong password.')
      return { mnemonic }
    }
    case 'reset':
      await lock()
      await chrome.storage.local.clear()
      return { ok: true }
    case 'pending': {
      const p = pending.get(msg.id)
      if (!p) throw new Error('This request is no longer waiting.')
      const s = await local.get()
      return { ...p.approval, address: s.address }
    }
    case 'resolve':
      if (msg.approve && !(await secretKey())) throw new Error('Unlock first.')
      settle(msg.id, msg.approve)
      return { ok: true }
  }
}

chrome.runtime.onMessage.addListener((msg: UiMessage, sender, reply) => {
  // Only the extension's own pages may drive the wallet.
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(''))) return false
  handleUi(msg).then((result) => reply({ ok: true, result }), (e) => reply({ ok: false, error: String((e as Error)?.message ?? e) }))
  return true
})
