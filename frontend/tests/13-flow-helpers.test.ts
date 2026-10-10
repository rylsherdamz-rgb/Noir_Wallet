import { describe, it, expect } from 'vitest'
import { applyKeypadKey, keypadValueToNumber } from '@/lib/keypadInput'
import { toReceiptParams, fromReceiptParams, receiptFromTransaction, type ReceiptData } from '@/lib/receipt'

describe('keypad amount input', () => {
  const type = (keys: string[]) => keys.reduce((v, k) => applyKeypadKey(v, k as any), '')

  it('builds decimal amounts', () => {
    expect(type(['1', '2', '.', '5'])).toBe('12.5')
  })
  it('starts a bare decimal with 0', () => {
    expect(type(['.', '5'])).toBe('0.5')
  })
  it('allows only one decimal point', () => {
    expect(type(['1', '.', '.', '2'])).toBe('1.2')
  })
  it('replaces a lone leading zero', () => {
    expect(type(['0', '5'])).toBe('5')
  })
  it('caps decimals at 7 (Stellar precision)', () => {
    expect(type(['0', '.', '1', '2', '3', '4', '5', '6', '7', '8'])).toBe('0.1234567')
  })
  it('caps whole digits', () => {
    expect(applyKeypadKey('1234567', '8', { maxDigits: 7 })).toBe('1234567')
  })
  it('backspace and clear', () => {
    expect(applyKeypadKey('12.5', 'backspace')).toBe('12.')
    expect(applyKeypadKey('12.5', 'clear')).toBe('')
  })
  it('converts to a number', () => {
    expect(keypadValueToNumber('')).toBe(0)
    expect(keypadValueToNumber('0.')).toBe(0)
    expect(keypadValueToNumber('12.5')).toBe(12.5)
  })
})

describe('receipt route params', () => {
  const r: ReceiptData = {
    title: 'Agent wallet top-up',
    amountCents: 2500,
    assetCode: 'XLM',
    direction: 'out',
    status: 'confirmed',
    createdAt: '2026-10-07T03:00:00.000Z',
    counterpartyLabel: 'To',
    counterparty: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    hash: 'abc123',
    note: 'Agent wallet balance for Card 1',
  }

  it('round-trips through string params', () => {
    expect(fromReceiptParams(toReceiptParams(r) as any)).toEqual(r)
  })
  it('rejects params without a title or amount', () => {
    expect(fromReceiptParams({})).toBeNull()
    expect(fromReceiptParams({ title: 'x', amountCents: 'nope' })).toBeNull()
  })
  it('builds a receipt from a Friendbot funding as incoming', () => {
    const rec = receiptFromTransaction({
      id: '1', stellarTxHash: 'h', merchantId: r.counterparty!, merchantName: 'Account funded · GAIH…ZNSR',
      userId: 'GME', deviceId: '', amountCents: 1_000_000, assetCode: 'XLM', status: 'confirmed',
      errorMessage: null, createdAt: r.createdAt, direction: 'in',
    } as any)
    expect(rec).toMatchObject({ title: 'Account funded', direction: 'in', counterpartyLabel: 'From', amountCents: 1_000_000 })
  })
})
