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
      </Stack>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
})
