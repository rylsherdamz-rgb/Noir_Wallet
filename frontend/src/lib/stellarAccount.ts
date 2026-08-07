/**
 * Account-level rules the network enforces, mirrored client-side.
 *
 * The point is to fail *before* the user signs. Everything here is pure so the
 * UI can predict what Horizon will accept, and so the arithmetic can be tested
 * without a network.
 */
import { StrKey } from '@stellar/stellar-sdk'

/** Network base reserve, in XLM. Two of these are held for the account itself. */
export const BASE_RESERVE_XLM = 0.5

/** 100 stroops, the network minimum, expressed in XLM. */
export const BASE_FEE_XLM = 0.00001

/** Stellar caps MEMO_TEXT at 28 bytes — not 28 characters. */
export const MEMO_TEXT_MAX_BYTES = 28

export function isValidStellarAddress(address: string): boolean {
  return StrKey.isValidEd25519PublicKey(address.trim())
}

/**
 * XLM that can never be spent: two base reserves for the account, plus one for
 * every subentry (trustlines, offers, signers, data entries).
 */
export function minimumBalance(subentryCount = 0): number {
  return (2 + Math.max(0, subentryCount)) * BASE_RESERVE_XLM
}

/**
 * What the account can actually send, once the reserve and the fee for this
 * transaction are held back. Clamped at 0 — a negative "spendable" is just 0.
 */
export function spendableBalance(
  xlm: number,
  subentryCount = 0,
  fee: number = BASE_FEE_XLM
): number {
  return Math.max(0, xlm - minimumBalance(subentryCount) - fee)
}

/** UTF-8 byte length, which is what the memo limit is actually measured in. */
export function memoByteLength(text: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length
  return unescape(encodeURIComponent(text)).length
}

export function isValidMemoText(text: string): boolean {
  return memoByteLength(text) <= MEMO_TEXT_MAX_BYTES
}

/**
 * Trim an amount to the 7 decimal places Stellar stores, so the string handed
 * to the SDK never carries precision the network will reject.
 */
export function toStellarAmount(value: number): string {
  const fixed = value.toFixed(7)
  return fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed
}
