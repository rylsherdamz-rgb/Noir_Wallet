import '../global.css'
import 'react-native-get-random-values'
import 'expo-crypto'
import { Buffer } from 'buffer'

if (typeof global.Buffer === 'undefined') {
  ;(global as any).Buffer = Buffer
}

if (typeof global.Event === 'undefined') {
  class EventPolyfill {
    constructor(public type: string, public opts: any = {}) {
      this.bubbles = opts.bubbles ?? false
      this.cancelable = opts.cancelable ?? false
    }
    bubbles = false
    cancelable = false
    preventDefault() {}
    stopPropagation() {}
  }
  ;(global as any).Event = EventPolyfill as any
}
if (typeof (global as any).EventTarget === 'undefined') {
  class EventTargetPolyfill {
    private listeners: Record<string, Function[]> = {}
    addEventListener(type: string, cb: Function) {
      if (!this.listeners[type]) this.listeners[type] = []
      this.listeners[type].push(cb)
    }
    removeEventListener(type: string, cb: Function) {
      this.listeners[type] = (this.listeners[type] || []).filter((l) => l !== cb)
    }
    dispatchEvent(event: any) {
      (this.listeners[event.type] || []).forEach((cb) => cb(event))
    }
  }
  ;(global as any).EventTarget = EventTargetPolyfill as any
}

import { useEffect, useState, useRef, useCallback } from 'react'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppState, Linking, Alert, AppStateStatus } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { nfcService } from '@/services/nfc'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { x402 } from '@/domain/x402'
import { getItem } from '@/services/storage'
import { Device } from '@/types'
import NetInfo from '@react-native-community/netinfo'

SplashScreen.preventAutoHideAsync()

const PIN_KEY = 'app_pin_hash'

export default function RootLayout() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const setNfcSupported = useAppStore((s) => s.setNfcSupported)
  const pendingPayments = useAppStore((s) => s.pendingPayments)
  const removePendingPayment = useAppStore((s) => s.removePendingPayment)
  const addTransaction = useAppStore((s) => s.addTransaction)
  const security = useAppStore((s) => s.security)
  const appStateRef = useRef(AppState.currentState)

  const flushPendingPayments = useCallback(async () => {
    if (pendingPayments.length === 0) return
    try {
      const result = await apiService.batchPayments(pendingPayments)
      if (result.processed > 0) {
        for (const p of pendingPayments) {
          addTransaction({
            id: p.id,
            stellarTxHash: null,
            merchantId: 'offline',
            merchantName: 'Offline Payment',
            userId: 'local',
            deviceId: p.rawDeviceUid,
            amountCents: p.amountCents,
            assetCode: p.assetCode,
            status: 'confirmed',
            errorMessage: null,
            createdAt: p.createdAt,
          })
          removePendingPayment(p.id)
        }
      }
    } catch {}
  }, [pendingPayments, removePendingPayment, addTransaction])

  useEffect(() => {
    async function init() {
      await useAppStore.persist.rehydrate()
      const nfcOk = await nfcService.isSupported()
      setNfcSupported(nfcOk)

      // Sync devices against the on-chain device_registry contract.
      // Remove stale local devices that no longer exist on-chain, and add
      // any on-chain devices that aren't yet in local storage.
      try {
        const { devices, setDevices, user } = useAppStore.getState()
        if (user?.stellarPublicKey) {
          const onChain = await x402.getOnChainDevices(user.stellarPublicKey)
          const chainHashes = new Set(onChain.map((d) => d.deviceUidHash))
          console.log(`[on-chain sync] ${onChain.length} devices on chain, ${devices.length} local`)

          // Drop local devices whose hash is gone from the chain
          const validLocal = devices.filter((d) => chainHashes.has(d.deviceUidHash))

          // Add on-chain devices missing locally
          const localHashes = new Set(validLocal.map((d) => d.deviceUidHash))
          const missing = onChain.filter((d) => !localHashes.has(d.deviceUidHash))
          const added = missing.map((d) => ({
            id: d.deviceUidHash.slice(0, 16),
            userId: user.id ?? 'restored',
            deviceUidHash: d.deviceUidHash,
            label: `Device ${d.deviceUidHash.slice(0, 6)}`,
            status: 'active' as const,
            agentPublicKey: d.agentPublicKey,
            dailySpendLimitCents: 500_000,
            accumulatedTodayCents: 0,
            lastTapAt: null,
            createdAt: d.createdAt || new Date().toISOString(),
          }))

          const merged = [...validLocal, ...added]
          if (merged.length !== devices.length) {
            console.log(`[on-chain sync] updating devices: ${devices.length} → ${merged.length}`)
            setDevices(merged)
          } else {
            console.log(`[on-chain sync] devices unchanged (${devices.length})`)
          }
        }
      } catch (e: any) {
        console.warn('[on-chain sync] failed:', e?.message)
      }

      // Push notification registration
      try {
        const { status } = await Notifications.requestPermissionsAsync()
        if (status === 'granted') {
          const token = await Notifications.getExpoPushTokenAsync()
          await apiService.registerPushToken(token.data)
        }
      } catch {}

      setReady(true)
    }
    init()
  }, [])

  // Hide the native splash as soon as the store is ready — fonts load in the
  // background behind the custom animated splash (index.tsx).
  useEffect(() => {
    if (ready) SplashScreen.hideAsync()
  }, [ready])

  // Connectivity listener: flush pending payments on reconnect
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        flushPendingPayments()
      }
    })
    return () => unsubscribe()
  }, [flushPendingPayments])

  // Deep linking
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url
      if (url.includes('noirwallet://activate')) {
        router.replace('/(tabs)/devices')
      }
    }
    const subscription = Linking.addEventListener('url', handleDeepLink)
    return () => subscription.remove()
  }, [])

  // App state listener for auto-lock
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (appStateRef.current === 'active' && nextState.match(/inactive|background/)) {
        const lockedAt = Date.now()
        appStateRef.current = nextState
        setTimeout(async () => {
          const hasPin = await getItem<string>(PIN_KEY)
          if (hasPin) {
            router.replace('/lock')
          }
        }, security.backgroundLockTimeoutSec * 1000)
      } else if (nextState === 'active') {
        appStateRef.current = nextState
      } else {
        appStateRef.current = nextState
      }
    }
    const subscription = AppState.addEventListener('change', handleAppState)
    return () => subscription.remove()
  }, [security.backgroundLockTimeoutSec])

  if (!ready) return null

  return (
    <GestureHandlerRootView className="flex-1 bg-black">
      <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="lock" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="send" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="receive" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="scan-qr" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="fiat" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="transactions" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="transaction/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="seed-phrase" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="seed-verify" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="import-wallet" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings/security" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings/notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="agent/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
