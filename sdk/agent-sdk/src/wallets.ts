import type { NoirSigner } from './signer.js'

/** Any SEP-43 style wallet: the Stellar Wallets Kit, Freighter's API, or `window.noir.stellar`. */
export interface Sep43Wallet {
  signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string; error?: unknown } | string>
}

/**
 * Wraps a SEP-43 wallet as a NoirSigner. With the Stellar Wallets Kit:
 *
 *   const { address } = await StellarWalletsKit.getAddress()
 *   const signer = walletSigner(StellarWalletsKit, address)
 */
export function walletSigner(wallet: Sep43Wallet, address: string): NoirSigner {
  return {
    publicKey: address,
    async signTransaction(xdr, { networkPassphrase }) {
      const out = await wallet.signTransaction(xdr, { networkPassphrase, address })
      if (typeof out === 'string') return out
      if (out?.error) throw walletError(out.error)
      return out.signedTxXdr
    },
  }
}

interface NoirProvider extends Sep43Wallet {
  isNoir: true
  requestAccess(): Promise<{ address: string; error?: unknown }>
}

/** The Noir extension's provider, if the extension is installed in this browser. */
export function noirExtension(): NoirProvider | null {
  const w = (globalThis as { window?: { noir?: { stellar?: NoirProvider } } }).window
  return w?.noir?.stellar?.isNoir ? w.noir.stellar : null
}

/**
 * Connects to the Noir extension (the user approves the site once)
 * and returns a signer for its account.
 */
export async function noirExtensionSigner(): Promise<NoirSigner> {
  const provider = noirExtension()
  if (!provider) throw new Error('Noir extension is not installed')
  const res = await provider.requestAccess()
  if (res.error) throw walletError(res.error)
  return walletSigner(provider, res.address)
}

function walletError(e: unknown): Error {
  const m = (e as { message?: string })?.message ?? String(e)
  const err = new Error(m) as Error & { code?: number }
  err.code = (e as { code?: number })?.code
  return err
}
