import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk/axios'
// Loads the RN toXDR() base64 fix (see AGENTS.md → Known stellar-sdk v16 issues).
import '@/services/stellar-service'

/**
 * Sign a website's transaction with the active wallet. Called only after the
 * user approved it in the Browse sign sheet. Returns the signed envelope; the
 * site submits it.
 */
export async function signForDapp(envelopeXdr: string, networkPassphrase: string, expectedAddress: string): Promise<string> {
  const { walletService } = await import('@/services/wallet')
  const keys = await walletService.loadKeys()
  if (!keys?.stellarSecret) throw new Error('No wallet keys found on this phone')
  const kp = Keypair.fromSecret(keys.stellarSecret)
  // The sheet showed this address; refuse if the active wallet changed underneath it.
  if (kp.publicKey() !== expectedAddress) throw new Error('The active wallet changed. Try again.')
  const tx = TransactionBuilder.fromXDR(envelopeXdr, networkPassphrase)
  tx.sign(kp)
  return tx.toXDR()
}
