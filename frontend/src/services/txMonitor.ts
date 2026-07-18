import { stellarService } from './stellar-service'
import { useAppStore } from '@/store/useAppStore'

const POLL_INTERVAL_MS = 6000

let intervalId: ReturnType<typeof setInterval> | null = null

function notify(title: string, body: string) {
  try {
    const Notifications = require('expo-notifications')
    Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    })
  } catch {}
}

async function poll() {
  const { pendingTxHashes, transactions, removePendingTxHash, setTransactions } =
    useAppStore.getState()

  if (pendingTxHashes.length === 0) return

  for (const hash of pendingTxHashes) {
    try {
      let status: string | null = null

      const sorobanStatus = await stellarService.getTransactionStatus(hash)
      if (sorobanStatus.status === 'SUCCESS' || sorobanStatus.status === 'FAILED') {
        status = sorobanStatus.status
      }

      if (!status) {
        const horizonStatus = await stellarService.getPaymentStatus(hash)
        if (horizonStatus === 'confirmed') status = 'SUCCESS'
        else if (horizonStatus === 'failed') status = 'FAILED'
      }

      if (!status) continue

      removePendingTxHash(hash)

      const tx = transactions.find((t) => t.stellarTxHash === hash)
      const newStatus = status === 'SUCCESS' ? ('confirmed' as const) : ('failed' as const)

      const updated = transactions.map((t) =>
        t.stellarTxHash === hash ? { ...t, status: newStatus } : t,
      )
      setTransactions(updated)

      if (newStatus === 'confirmed') {
        notify(
          'Payment Confirmed',
          `${tx?.merchantName || 'Transaction'} — ${((tx?.amountCents ?? 0) / 100).toFixed(2)} XLM confirmed`,
        )
      } else {
        notify(
          'Payment Failed',
          `${tx?.merchantName || 'Transaction'} — check history for details`,
        )
      }
    } catch {}
  }
}

export function startTxMonitor() {
  if (intervalId) return
  poll()
  intervalId = setInterval(poll, POLL_INTERVAL_MS)
}

export function stopTxMonitor() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
