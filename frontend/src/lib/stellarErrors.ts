/**
 * Stellar result codes → sentences a person can act on.
 *
 * Horizon returns things like `tx_insufficient_balance` and `op_no_destination`
 * nested inside an error body. Those strings were reaching the UI verbatim,
 * which tells the user nothing about what to do next.
 */

const CODE_MESSAGES: Record<string, string> = {
  // Transaction-level
  tx_insufficient_balance: 'Not enough XLM to cover the amount plus the network fee and reserve.',
  tx_insufficient_fee: 'The network fee offered was too low. Try again.',
  tx_bad_auth_extra: 'This transaction carried a signature it did not need.',
  tx_bad_auth: 'This transaction was not signed correctly.',
  tx_bad_seq: 'Your account state is out of date. Refresh and try again.',
  tx_no_source_account: 'Your account does not exist on this network yet. Fund it first.',
  tx_too_early: 'This transaction is not valid yet. Check your device clock.',
  tx_too_late: 'This transaction expired before it reached the network. Try again.',
  tx_malformed: 'This transaction was malformed and could not be submitted.',
  tx_failed: 'The network rejected this transaction.',

  // Operation-level
  op_no_destination: 'That account does not exist yet. Send at least 1 XLM to create it first.',
  op_underfunded: 'Not enough XLM in your account for this amount.',
  op_low_reserve: 'This would drop the account below the 1 XLM minimum reserve.',
  op_line_full: "The recipient's balance limit for this asset is already full.",
  op_src_not_authorized: 'Your account is not authorized to send this asset.',
  op_not_authorized: 'The recipient is not authorized to hold this asset.',
  op_src_no_trust: 'Your account does not hold this asset.',
  op_no_trust: 'The recipient has not opted in to this asset.',
  op_malformed: 'The recipient address or amount is not valid.',
}

/** Longest codes first, so `tx_bad_auth_extra` is never matched as `tx_bad_auth`. */
const CODES_BY_LENGTH = Object.keys(CODE_MESSAGES).sort((a, b) => b.length - a.length)

const NETWORK_HINTS: Array<[RegExp, string]> = [
  [
    /network request failed|fetch failed|econnrefused|enotfound/i,
    'No connection to the Stellar network. Check your internet and try again.',
  ],
  [/timeout|timed out|aborted/i, 'The network did not respond in time. Try again.'],
  [/429|rate limit/i, 'Too many requests. Wait a moment and try again.'],
  [
    /5\d\d\b|internal server error|bad gateway/i,
    'The Stellar network is having trouble right now. Try again shortly.',
  ],
]

/**
 * Map a raw error to a sentence. Falls back to the original text rather than a
 * generic "something went wrong" — an unmapped code is still more useful to the
 * user (and to a bug report) than no information at all.
 */
export function humanizeStellarError(raw: unknown): string {
  const text = typeof raw === 'string' ? raw : ((raw as any)?.message ?? '')
  if (!text) return 'The transaction failed for an unknown reason.'

  const lower = String(text).toLowerCase()

  for (const code of CODES_BY_LENGTH) {
    if (lower.includes(code)) return CODE_MESSAGES[code]
  }

  for (const [pattern, message] of NETWORK_HINTS) {
    if (pattern.test(text)) return message
  }

  return text
}
