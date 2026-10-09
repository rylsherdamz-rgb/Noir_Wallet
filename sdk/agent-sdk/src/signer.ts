import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk'

/**
 * Anything that can sign a transaction envelope for one account. The shape
 * matches Freighter and Stellar Wallets Kit (`signTransaction(xdr, opts)`), so
 * a connected browser wallet can be passed straight in and the secret key
 * never reaches this SDK.
 */
export interface NoirSigner {
  publicKey: string
  signTransaction(xdr: string, opts: { networkPassphrase: string }): Promise<string | { signedTxXdr: string }>
}

/**
 * A signer backed by a secret key, for servers and agents that hold their own
 * key (for example a merchant claiming payments from a backend).
 */
export function keypairSigner(secret: string): NoirSigner {
  const kp = Keypair.fromSecret(secret)
  return {
    publicKey: kp.publicKey(),
    async signTransaction(xdr, { networkPassphrase }) {
      const tx = TransactionBuilder.fromXDR(xdr, networkPassphrase)
      tx.sign(kp)
      return tx.toXDR()
    },
  }
}

export async function signWith(signer: NoirSigner, xdr: string, networkPassphrase: string): Promise<string> {
  const out = await signer.signTransaction(xdr, { networkPassphrase })
  return typeof out === 'string' ? out : out.signedTxXdr
}
