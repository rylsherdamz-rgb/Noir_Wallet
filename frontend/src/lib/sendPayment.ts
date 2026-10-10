import { stellarService } from '@/services/stellar-service'
import { toStellarAmount } from '@/lib/stellarAccount'
import { startLocalTx, settleLocalTx } from '@/lib/localTx'

/**
 * Send XLM from the main wallet. Records the payment in Activity as Pending
 * before submitting and settles it either way. Throws the raw error on
 * failure (callers humanize it).
 */
export async function sendXlm(params: {
  destination: string
  amountXlm: number
  memo?: string
  /** Activity label, e.g. "Sent · GABC…WXYZ". */
  label: string
}): Promise<string> {
  const localId = startLocalTx({
    merchantName: params.label,
    merchantId: params.destination,
    amountCents: Math.round(params.amountXlm * 100),
    direction: 'out',
  })
  try {
    const { walletService } = await import('@/services/wallet')
    const keys = await walletService.loadKeys()
    if (!keys?.stellarSecret) throw new Error('Wallet not initialized')
    const result = await stellarService.submitPayment({
      sourceSecret: keys.stellarSecret,
      destination: params.destination,
      amount: toStellarAmount(params.amountXlm),
      memo: params.memo?.trim() || undefined,
    })
    if ('error' in result) throw new Error(result.error)
    settleLocalTx(localId, { stellarTxHash: result.hash, status: 'confirmed' })
    stellarService.invalidateBalance(keys.stellarPublic)
    return result.hash
  } catch (e: any) {
    settleLocalTx(localId, { status: 'failed', errorMessage: e?.message ?? 'Transaction failed' })
    throw e
  }
}
