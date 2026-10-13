import { describe, it, expect } from 'vitest'
import { isIncomingTx, formatAmount, formatSignedAmount, txTitle, shortAddress } from '@/lib/txFormat'

const FRIENDBOT = 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR'

describe('transaction formatting', () => {
  // Regression: a Friendbot funding (create_account, direction "in") showed as −10000.
  const funding = {
    direction: 'in' as const,
    merchantName: `Account funded · ${FRIENDBOT.slice(0, 4)}…${FRIENDBOT.slice(-4)}`,
    amountCents: 1_000_000,
    assetCode: 'XLM' as const,
    status: 'confirmed' as const,
  }

  it('shows a Friendbot funding as incoming (+), not outgoing', () => {
    expect(isIncomingTx(funding)).toBe(true)
    expect(formatSignedAmount(funding)).toBe('+10,000.00 XLM')
  })

  it('signs outgoing transfers with a minus', () => {
    expect(formatSignedAmount({ ...funding, direction: 'out', amountCents: 2500 })).toBe('−25.00 XLM')
  })

  it('direction wins over the display name', () => {
    expect(isIncomingTx({ direction: 'out', merchantName: 'NFC Receive' })).toBe(false)
  })

  it('falls back to legacy names for records without a direction', () => {
    expect(isIncomingTx({ merchantName: 'NFC Receive' })).toBe(true)
    expect(isIncomingTx({ merchantName: 'Tap Pay' })).toBe(false)
  })

  it('gives failed transactions no sign', () => {
    expect(formatSignedAmount({ ...funding, status: 'failed' })).toBe('10,000.00 XLM')
  })

  it('groups thousands', () => {
    expect(formatAmount(0)).toBe('0.00')
    expect(formatAmount(99)).toBe('0.99')
    expect(formatAmount(123_456_789)).toBe('1,234,567.89')
  })

  it('splits the on-chain title from the counterparty', () => {
    expect(txTitle(funding)).toBe('Account funded')
    expect(txTitle({ merchantName: 'Tap Pay' })).toBe('Tap Pay')
  })

  it('shortens Stellar addresses only', () => {
    expect(shortAddress(FRIENDBOT)).toBe('GAIH3…JZNSR')
    expect(shortAddress('merchant-42')).toBe('merchant-42')
  })
})
