import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import EventSource from 'react-native-sse'
import { stellarService } from '@/services/stellar-service'
import { logger } from '@/lib/logger'

export type LiveStatus = 'connecting' | 'live' | 'offline'

/**
 * Live payment feed for one Stellar account, via Horizon's SSE stream
 * (`/accounts/{id}/payments?cursor=now`). Calls `onPayment` for every new
 * payment touching the account — top-ups, tap payments, escrow movements.
 *
 * The SDK's own `.stream()` relies on streaming `fetch`, which React Native
 * does not support; react-native-sse implements EventSource over XHR instead.
 * The stream is closed while the app is in the background and reopened on
 * return, so it never runs (or drains battery) unseen.
 */
export function useHorizonPayments(accountId: string | null | undefined, onPayment: (record: any) => void): LiveStatus {
  const [status, setStatus] = useState<LiveStatus>('connecting')
  const callback = useRef(onPayment)
  callback.current = onPayment

  useEffect(() => {
    if (!accountId) { setStatus('offline'); return }
    const base = stellarService.networkName === 'mainnet' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org'
    let es: EventSource | null = null

    const open = () => {
      close()
      setStatus('connecting')
      es = new EventSource(`${base}/accounts/${accountId}/payments?cursor=now`, { pollingInterval: 5000 })
      es.addEventListener('open', () => setStatus('live'))
      es.addEventListener('message', (event: any) => {
        // Horizon sends a literal "hello" on connect; only JSON is a payment.
        if (!event?.data || event.data === '"hello"') return
        try {
          callback.current(JSON.parse(event.data))
        } catch {
          /* keep-alive or malformed frame */
        }
      })
      es.addEventListener('error', (event: any) => {
        logger.debug('[horizon stream] error', event?.message ?? event?.type)
        setStatus('offline')
      })
    }
    const close = () => {
      es?.removeAllEventListeners()
      es?.close()
      es = null
    }

    open()
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') open()
      else if (s === 'background') { close(); setStatus('offline') }
    })
    return () => { sub.remove(); close() }
  }, [accountId])

  return status
}
