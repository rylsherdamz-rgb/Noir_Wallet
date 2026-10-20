import { hash, Keypair, TransactionBuilder, xdr } from '@stellar/stellar-sdk'

/**
 * The three things a SEP-43 wallet signs. Each checks that the payload is for
 * the network the wallet is on before signing anything.
 */

export class SigningError extends Error {}

export function signTransaction(kp: Keypair, txXdr: string, networkPassphrase: string): string {
  let tx
  try {
    tx = TransactionBuilder.fromXDR(txXdr, networkPassphrase)
  } catch {
    throw new SigningError('Not a valid transaction envelope.')
  }
  tx.sign(kp)
  return tx.toXDR()
}

/**
 * SEP-43 signAuthEntry: `authEntry` is a base64 HashIdPreimage
 * (ENVELOPE_TYPE_SOROBAN_AUTHORIZATION); the wallet returns the base64
 * ed25519 signature over its SHA-256.
 */
export function signAuthEntry(kp: Keypair, authEntry: string, networkPassphrase: string): string {
  const preimage = parseAuthPreimage(authEntry)
  const expected = hash(Buffer.from(networkPassphrase))
  if (!Buffer.from(preimage.sorobanAuthorization().networkId()).equals(expected)) {
    throw new SigningError('This authorization is for a different network.')
  }
  return kp.sign(hash(preimage.toXDR())).toString('base64')
}

export function parseAuthPreimage(authEntry: string): xdr.HashIdPreimage {
  let preimage: xdr.HashIdPreimage
  try {
    preimage = xdr.HashIdPreimage.fromXDR(authEntry, 'base64')
  } catch {
    throw new SigningError('Not a valid authorization entry.')
  }
  if (preimage.switch().name !== 'envelopeTypeSorobanAuthorization') {
    throw new SigningError('Only Soroban authorization entries can be signed.')
  }
  return preimage
}

/** SEP-53: ed25519 over SHA-256("Stellar Signed Message:\n" + message), base64. */
export function signMessage(kp: Keypair, message: string): string {
  return kp.sign(messageHash(message)).toString('base64')
}

export function messageHash(message: string): Buffer {
  return hash(Buffer.concat([Buffer.from('Stellar Signed Message:\n'), Buffer.from(message, 'utf8')]))
}
