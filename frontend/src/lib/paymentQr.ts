import { isValidStellarAddress, isValidMemoText } from '@/lib/stellarAccount'

/**
 * Payment-request QR codes.
 *
 * Noir writes SEP-0007 `pay` URIs (`web+stellar:pay?destination=G…&amount=10`)
 * so any Stellar wallet can scan them, and reads those plus the two simpler
 * forms people actually point a camera at: a bare G… address, and the
 * `G…?asset=XLM` form older Noir builds put in the Receive QR.
 */

export interface PaymentRequest {
  destination: string
  /** XLM, as entered (decimal string). Absent = payer chooses. */
  amount?: string
  memo?: string
}

const SEP7_PREFIX = 'web+stellar:pay?'

/** Build a SEP-0007 pay URI. Native XLM, so no asset_code. */
export function buildPaymentRequestUri(req: PaymentRequest): string {
  const parts: [string, string][] = [['destination', req.destination]]
  if (req.amount && parseFloat(req.amount) > 0) parts.push(['amount', normaliseAmount(req.amount)])
  if (req.memo?.trim()) parts.push(['memo', req.memo.trim()], ['memo_type', 'MEMO_TEXT'])
  return SEP7_PREFIX + parts.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
}

/**
 * Query-string parsing by hand: React Native's URLSearchParams is a partial
 * polyfill (get/set throw "not implemented" on some versions).
 */
function parseQuery(query: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const pair of query.split('&')) {
    if (!pair) continue
    const i = pair.indexOf('=')
    const key = decodeURIComponent((i < 0 ? pair : pair.slice(0, i)).replace(/\+/g, ' '))
    const value = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '))
    if (!out.has(key)) out.set(key, value)
  }
  return out
}

/** Parse anything the scanner reads. Returns null when it isn't a payable Stellar address. */
export function parsePaymentQr(raw: string): PaymentRequest | null {
  const text = raw.trim()
  if (!text) return null

  if (text.toLowerCase().startsWith(SEP7_PREFIX)) {
    let params: Map<string, string>
    try { params = parseQuery(text.slice(SEP7_PREFIX.length)) } catch { return null }
    const destination = params.get('destination')?.trim() ?? ''
    if (!isValidStellarAddress(destination)) return null
    // Only native XLM — this wallet can't pay other assets yet.
    const asset = params.get('asset_code')
    if (asset && asset.toUpperCase() !== 'XLM') return null
    const out: PaymentRequest = { destination }
    const amount = params.get('amount')
    if (amount && /^\d+(\.\d{1,7})?$/.test(amount) && parseFloat(amount) > 0) out.amount = amount
    const memo = params.get('memo')
    const memoType = (params.get('memo_type') ?? 'MEMO_TEXT').toUpperCase()
    if (memo && memoType === 'MEMO_TEXT' && isValidMemoText(memo)) out.memo = memo
    return out
  }

  // `G…` or legacy `G…?asset=XLM`
  const destination = text.split('?')[0]
  return isValidStellarAddress(destination) ? { destination } : null
}

/** "10" / "10.50" → "10" / "10.5" (SEP-7 wants a plain decimal, max 7 places). */
function normaliseAmount(amount: string): string {
  const n = parseFloat(amount)
  return n.toFixed(7).replace(/\.?0+$/, '')
}
