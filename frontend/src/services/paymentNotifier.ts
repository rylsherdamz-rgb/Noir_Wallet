import { AppState, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'
import { stellarService } from '@/services/stellar-service'
import { useAppStore } from '@/store/useAppStore'
import { x402 } from '@/domain/x402'
import { logger } from '@/lib/logger'
import { incomingNotification, newIncomingPayments, type HorizonPaymentRecord } from '@/lib/incomingPayments'

/**
 * "You received a payment" notifications while the app is not on screen.
 *
 * - App backgrounded but alive: polls Horizon every BACKGROUND_POLL_MS.
 * - App closed: PAYMENT_TASK runs via expo-background-task (Android
 *   WorkManager), no more often than every 15 minutes — the OS decides.
 * Both paths call checkIncomingPayments(), which remembers the last payment
 * seen per account so each payment notifies once.
 */

export const PAYMENT_TASK = 'noir-incoming-payments'
export const PAYMENTS_CHANNEL = 'payments'
const BACKGROUND_POLL_MS = 30_000
const TASK_INTERVAL_MIN = 15
const PAGE_SIZE = 20

const cursorKey = (account: string) => `noir.notify.cursor.${stellarService.networkName}.${account}`
const horizonBase = () =>
  stellarService.networkName === 'mainnet' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org'

/** Shows notifications even while the app is open, and creates the Android channel. */
export async function initNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  })
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(PAYMENTS_CHANNEL, {
      name: 'Payments',
      description: 'Money received by your wallet and cards',
      importance: Notifications.AndroidImportance.HIGH,
    })
  }
}

/** The accounts to watch: main wallet + every card agent, with a label for each. */
async function watchedAccounts(): Promise<Map<string, string>> {
  const { user, devices } = useAppStore.getState()
  const accounts = new Map<string, string>()
  if (user?.stellarPublicKey) accounts.set(user.stellarPublicKey, 'your wallet')
  const agents = await x402.listAgents().catch(() => [])
  for (const a of agents) {
    const device = devices.find((d) => d.agentPublicKey === a.publicKey || d.deviceUidHash === a.deviceHash)
    accounts.set(a.publicKey, device?.label ?? a.label ?? 'your card')
  }
  return accounts
}

async function fetchPayments(account: string): Promise<HorizonPaymentRecord[]> {
  const res = await fetch(`${horizonBase()}/accounts/${account}/payments?order=desc&limit=${PAGE_SIZE}`)
  if (res.status === 404) return [] // account not funded yet
  if (!res.ok) throw new Error(`Horizon ${res.status}`)
  const body = await res.json()
  return body?._embedded?.records ?? []
}

let checking: Promise<number> | null = null

/**
 * Notifies every payment received since the last check. The first check for
 * an account only records where it is, so installing or switching network
 * never floods old payments. Returns how many notifications were shown.
 */
export function checkIncomingPayments(): Promise<number> {
  checking ??= (async () => {
    try {
      if (!useAppStore.persist.hasHydrated()) await useAppStore.persist.rehydrate()
      const accounts = await watchedAccounts()
      const own = new Set(accounts.keys())
      let shown = 0
      for (const [account, label] of accounts) {
        try {
          const records = await fetchPayments(account)
          if (records.length === 0) continue
          const key = cursorKey(account)
          const last = await AsyncStorage.getItem(key)
          if (last) {
            for (const p of newIncomingPayments(records, account, last, own)) {
              await Notifications.scheduleNotificationAsync({
                content: { ...incomingNotification(p, label), sound: true, data: { txId: p.id, account } },
                trigger: Platform.OS === 'android' ? { channelId: PAYMENTS_CHANNEL } : null,
              })
              shown++
            }
          }
          await AsyncStorage.setItem(key, records[0].paging_token)
        } catch (e: any) {
          logger.debug('[payment notifier] check failed for account', e?.message)
        }
      }
      return shown
    } finally {
      checking = null
    }
  })()
  return checking
}

/** Registers the closed-app background task. Safe to call on every launch. */
export async function registerPaymentBackgroundTask(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync()
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
      logger.warn('[payment notifier] background tasks restricted on this device')
      return
    }
    if (!(await TaskManager.isTaskRegisteredAsync(PAYMENT_TASK))) {
      await BackgroundTask.registerTaskAsync(PAYMENT_TASK, { minimumInterval: TASK_INTERVAL_MIN })
    }
  } catch (e: any) {
    logger.warn('[payment notifier] background task registration failed:', e?.message)
  }
}

/**
 * Polls while the app is in the background (but still running) and stops
 * when it returns to the foreground. Returns an unsubscribe function.
 */
export function startBackgroundPolling(): () => void {
  let timer: ReturnType<typeof setInterval> | null = null
  const stop = () => { if (timer) { clearInterval(timer); timer = null } }
  const sub = AppState.addEventListener('change', (state) => {
    if (state === 'background' && !timer) {
      void checkIncomingPayments()
      timer = setInterval(() => { void checkIncomingPayments() }, BACKGROUND_POLL_MS)
    } else if (state === 'active') {
      stop()
      void checkIncomingPayments() // advance cursors so payments seen in-app are not re-notified later
    }
  })
  return () => { sub.remove(); stop() }
}
