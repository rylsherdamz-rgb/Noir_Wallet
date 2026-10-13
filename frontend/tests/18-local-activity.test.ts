import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/store/useAppStore'
import { startLocalTx, settleLocalTx, dropLocalTx, mergeHistory } from '@/lib/localTx'
import type { Transaction } from '@/types'

const chainTx = (over: Partial<Transaction>): Transaction => ({
  id: 'op-1',
  stellarTxHash: 'h1',
  merchantId: 'GDEST',
  merchantName: 'Sent · GDES…DEST',
  userId: 'GME',
  deviceId: '',
  amountCents: 1000,
  assetCode: 'XLM',
  status: 'confirmed',
  errorMessage: null,
  createdAt: '2026-10-09T10:00:00Z',
  direction: 'out',
  ...over,
})

describe('local pending activity', () => {
  beforeEach(() => useAppStore.setState({ transactions: [] }))

  it('shows a payment as pending the moment it starts', () => {
    const id = startLocalTx({ merchantName: 'Top up · Black card', amountCents: 2500, direction: 'out', deviceId: 'card1' })
    const [tx] = useAppStore.getState().transactions
    expect(tx).toMatchObject({ id, status: 'pending', stellarTxHash: null, deviceId: 'card1', amountCents: 2500 })
  })

  it('settles with the hash and final status', () => {
    const id = startLocalTx({ merchantName: 'Sent', amountCents: 100, direction: 'out' })
    settleLocalTx(id, { stellarTxHash: 'abc', status: 'confirmed' })
    expect(useAppStore.getState().transactions[0]).toMatchObject({ stellarTxHash: 'abc', status: 'confirmed' })
  })

  it('drops an entry when nothing reached the network', () => {
    const id = startLocalTx({ merchantName: 'Sent', amountCents: 100, direction: 'out' })
    dropLocalTx(id)
    expect(useAppStore.getState().transactions).toHaveLength(0)
  })
})

describe('mergeHistory', () => {
  const pending = chainTx({ id: 'local-a', stellarTxHash: null, status: 'pending', createdAt: '2026-10-09T11:00:00Z', merchantName: 'Tap · Black card', deviceId: 'card1' })

  it('keeps pending local entries Horizon has not indexed yet, newest first', () => {
    const merged = mergeHistory([chainTx({})], [pending])
    expect(merged.map((t) => t.id)).toEqual(['local-a', 'op-1'])
  })

  it('replaces a local entry with the on-chain row once the hash lands, keeping its card link', () => {
    const local = { ...pending, stellarTxHash: 'h1' }
    const merged = mergeHistory([chainTx({})], [local])
    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({ id: 'op-1', status: 'confirmed', deviceId: 'card1', merchantName: 'Tap · Black card' })
  })
})

describe('popup.sign', () => {
  it('resolves false (nothing signed) when no popup host is mounted', async () => {
    const { popup } = await import('@/components/popup/Popup')
    await expect(popup.sign({ title: 'Send 1 XLM?' })).resolves.toBe(false)
  })
})
