import { describe, it, expect } from 'vitest'
import { Keypair } from '@stellar/stellar-sdk'
import {
  isValidStellarAddress,
  minimumBalance,
  spendableBalance,
  memoByteLength,
  isValidMemoText,
  toStellarAmount,
  BASE_RESERVE_XLM,
  BASE_FEE_XLM,
  MEMO_TEXT_MAX_BYTES,
} from '@/lib/stellarAccount'
import { humanizeStellarError } from '@/lib/stellarErrors'

describe('address validation', () => {
  it('accepts a real ed25519 public key', () => {
    const pk = Keypair.random().publicKey()
    expect(isValidStellarAddress(pk)).toBe(true)
  })

  it('tolerates surrounding whitespace from a paste', () => {
    const pk = Keypair.random().publicKey()
    expect(isValidStellarAddress(`  ${pk}\n`)).toBe(true)
  })

  it('rejects the malformed input that previously reached submit', () => {
    const pk = Keypair.random().publicKey()
    const cases = [
      '',
      '   ',
      'GABC',
      'not-an-address',
      pk.slice(0, -1), // truncated
      pk + 'A', // too long
      pk.slice(0, -1) + (pk.endsWith('A') ? 'B' : 'A'), // bad checksum
      Keypair.random().secret(), // a secret key, not a public one
    ]
    cases.forEach((value) => expect(isValidStellarAddress(value)).toBe(false))
  })
})

describe('reserve and spendable balance', () => {
  it('holds two base reserves for a bare account', () => {
    expect(minimumBalance(0)).toBe(2 * BASE_RESERVE_XLM)
    expect(minimumBalance(0)).toBe(1)
  })

  it('holds one more base reserve per subentry', () => {
    expect(minimumBalance(1)).toBe(1.5)
    expect(minimumBalance(4)).toBe(3)
  })

  it('subtracts both the reserve and the fee — the bug that broke send-max', () => {
    // 10 XLM, no subentries: 1 XLM reserve + 0.00001 fee held back.
    expect(spendableBalance(10, 0)).toBeCloseTo(10 - 1 - BASE_FEE_XLM, 7)
  })

  it('accounts for subentries so a trustline does not strand the send', () => {
    expect(spendableBalance(10, 2)).toBeCloseTo(10 - 2 - BASE_FEE_XLM, 7)
  })

  it('never reports a negative spendable balance', () => {
    expect(spendableBalance(0.5, 0)).toBe(0)
    expect(spendableBalance(0, 0)).toBe(0)
  })

  it('a send of exactly the spendable amount stays within the balance', () => {
    const xlm = 10
    const max = spendableBalance(xlm, 0)
    expect(max + minimumBalance(0) + BASE_FEE_XLM).toBeCloseTo(xlm, 7)
  })
})

describe('memo limits', () => {
  it('measures bytes, not characters', () => {
    expect(memoByteLength('hello')).toBe(5)
    // Each emoji is 4 bytes in UTF-8 — 8 of them exceed the 28-byte cap.
    expect(memoByteLength('🚀')).toBe(4)
    expect(isValidMemoText('🚀'.repeat(7))).toBe(true)
    expect(isValidMemoText('🚀'.repeat(8))).toBe(false)
  })

  it('accepts a memo at the limit and rejects one byte past it', () => {
    expect(isValidMemoText('a'.repeat(MEMO_TEXT_MAX_BYTES))).toBe(true)
    expect(isValidMemoText('a'.repeat(MEMO_TEXT_MAX_BYTES + 1))).toBe(false)
  })

  it('accepts an empty memo', () => {
    expect(isValidMemoText('')).toBe(true)
  })
})

describe('amount formatting', () => {
  it('trims to the 7 decimals Stellar stores', () => {
    expect(toStellarAmount(1.23456789)).toBe('1.2345679')
  })

  it('does not emit trailing zeros or a bare decimal point', () => {
    expect(toStellarAmount(5)).toBe('5')
    expect(toStellarAmount(5.5)).toBe('5.5')
    expect(toStellarAmount(0)).toBe('0')
  })

  it('renders the base fee readably', () => {
    expect(toStellarAmount(BASE_FEE_XLM)).toBe('0.00001')
  })
})

describe('error humanising', () => {
  it('translates the codes that were reaching the UI raw', () => {
    expect(humanizeStellarError('tx_insufficient_balance')).toMatch(/not enough xlm/i)
    expect(humanizeStellarError('op_no_destination')).toMatch(/does not exist yet/i)
    expect(humanizeStellarError('op_underfunded')).toMatch(/not enough xlm/i)
  })

  it('finds a code embedded in a longer Horizon message', () => {
    const raw =
      'Transaction failed: {"result_codes":{"transaction":"tx_failed","operations":["op_no_destination"]}}'
    expect(humanizeStellarError(raw)).toMatch(/does not exist yet/i)
  })

  it('does not mistake tx_bad_auth_extra for tx_bad_auth', () => {
    expect(humanizeStellarError('tx_bad_auth_extra')).toMatch(/did not need/i)
    expect(humanizeStellarError('tx_bad_auth')).toMatch(/not signed correctly/i)
  })

  it('recognises transport failures that carry no result code', () => {
    expect(humanizeStellarError('Network request failed')).toMatch(/no connection/i)
    expect(humanizeStellarError('Request timed out')).toMatch(/did not respond/i)
  })

  it('unwraps an Error object', () => {
    expect(humanizeStellarError(new Error('op_underfunded'))).toMatch(/not enough xlm/i)
  })

  it('falls back to the original text rather than hiding it', () => {
    expect(humanizeStellarError('something oddly specific')).toBe('something oddly specific')
  })

  it('handles an empty error without producing an empty message', () => {
    expect(humanizeStellarError('')).toMatch(/unknown reason/i)
    expect(humanizeStellarError(undefined)).toMatch(/unknown reason/i)
  })
})
