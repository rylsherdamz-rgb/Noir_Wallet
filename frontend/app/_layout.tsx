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
import { StyleSheet, AppState, Linking, Alert } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import { nfcService } from '@/services/nfc'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { getItem } from '@/services/storage'
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

      // Push notification registration
      try {
        const { status } = await Notifications.requestPermissionsAsync()
        if (status === 'granted') {
          const token = await Notifications.getExpoPushTokenAsync()
          await apiService.registerPushToken(token.data)
        }
      } catch {}

      setReady(true)
      await SplashScreen.hideAsync()
    }
    init()
  }, [])

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
    const handleAppState = (nextState: string) => {
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
    <GestureHandlerRootView style={styles.root}>
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
      </Stack>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
})
