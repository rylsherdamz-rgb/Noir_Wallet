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

import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { nfcService } from '@/services/nfc'
import { useAppStore } from '@/store/useAppStore'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [ready, setReady] = useState(false)
  const setNfcSupported = useAppStore((s) => s.setNfcSupported)

  useEffect(() => {
    async function init() {
      const nfcOk = await nfcService.isSupported()
      setNfcSupported(nfcOk)
      setReady(true)
      await SplashScreen.hideAsync()
    }
    init()
  }, [])

  if (!ready) return null

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="send" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="receive" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
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
