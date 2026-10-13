import { describe, it, expect } from 'vitest'
import { incomingNotification, newIncomingPayments, type HorizonPaymentRecord } from '../src/lib/incomingPayments'

const ME = 'GMEMAINWALLETXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX1'
const CARD = 'GCARDAGENTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX2'
const STRANGER = 'GSTRANGERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3'
const own = new Set([ME, CARD])

const pay = (token: string, from: string, to: string, amount = '25.0000000', extra: Partial<HorizonPaymentRecord> = {}): HorizonPaymentRecord => ({
  id: `op-${token}`, paging_token: token, type: 'payment', from, to, amount, asset_type: 'native', transaction_successful: true, ...extra,
})

describe('newIncomingPayments', () => {
  it('returns payments newer than the cursor, oldest first', () => {
    const page = [pay('3', STRANGER, ME, '3'), pay('2', STRANGER, ME, '2'), pay('1', STRANGER, ME, '1')]
    expect(newIncomingPayments(page, ME, '1', own).map((p) => p.cursor)).toEqual(['2', '3'])
  })

  it('returns nothing when the newest record is the cursor', () => {
    expect(newIncomingPayments([pay('5', STRANGER, ME)], ME, '5', own)).toEqual([])
  })

  it('skips outgoing payments and moves between own accounts', () => {
    const page = [pay('4', ME, STRANGER), pay('3', ME, CARD), pay('2', STRANGER, ME)]
    expect(newIncomingPayments(page, ME, '1', own).map((p) => p.cursor)).toEqual(['2'])
    expect(newIncomingPayments(page, CARD, '1', own)).toEqual([]) // top-up from main wallet
  })

  it('skips failed transactions', () => {
    expect(newIncomingPayments([pay('2', STRANGER, ME, '1', { transaction_successful: false })], ME, '1', own)).toEqual([])
  })

  it('treats create_account funding as received XLM', () => {
    const rec: HorizonPaymentRecord = { id: 'op-9', paging_token: '9', type: 'create_account', funder: STRANGER, account: ME, starting_balance: '10.0000000' }
    expect(newIncomingPayments([rec], ME, '1', own)).toEqual([{ id: 'op-9', cursor: '9', from: STRANGER, to: ME, amount: '10.0000000', assetCode: 'XLM' }])
  })

  it('uses the asset code for non-native assets', () => {
    const [p] = newIncomingPayments([pay('2', STRANGER, ME, '5', { asset_type: 'credit_alphanum4', asset_code: 'USDC' })], ME, '1', own)
    expect(p.assetCode).toBe('USDC')
  })
})

describe('incomingNotification', () => {
  it('formats amount, asset, sender and receiving account', () => {
    const [p] = newIncomingPayments([pay('2', STRANGER, CARD, '50.0000000')], CARD, '1', new Set([ME]))
    expect(incomingNotification(p, 'Black card')).toEqual({ title: 'Received 50.00 XLM', body: `From GSTR…XXX3 to Black card` })
  })
})
