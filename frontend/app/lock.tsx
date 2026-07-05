import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { getItem, setItem, removeItem } from '@/services/storage'

const PIN_KEY = 'app_pin_hash'
const MAX_LENGTH = 6

function simpleHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'pin_' + Math.abs(hash).toString(36)
}

export default function LockScreen() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [mode, setMode] = useState<'setup' | 'unlock' | 'confirm'>('unlock')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [hasPin, setHasPin] = useState<boolean | null>(null)

  useEffect(() => {
    checkPin()
  }, [])

  const checkPin = async () => {
    const existing = await getItem<string>(PIN_KEY)
    setHasPin(!!existing)
    setMode(existing ? 'unlock' : 'setup')
  }

  const handleDigit = (d: string) => {
    setError('')
    if (mode === 'confirm') {
      if (confirmPin.length < MAX_LENGTH) setConfirmPin((prev) => prev + d)
    } else {
      if (pin.length < MAX_LENGTH) setPin((prev) => prev + d)
    }
  }

  const handleDelete = () => {
    setError('')
    if (mode === 'confirm') {
      setConfirmPin((prev) => prev.slice(0, -1))
    } else {
      setPin((prev) => prev.slice(0, -1))
    }
  }

  useEffect(() => {
    if (mode === 'unlock' && pin.length === MAX_LENGTH) {
      verifyPin()
    }
  }, [pin, mode])

  useEffect(() => {
    if (mode === 'setup' && pin.length === MAX_LENGTH) {
      setMode('confirm')
    }
  }, [pin, mode])

  useEffect(() => {
    if (mode === 'confirm' && confirmPin.length === MAX_LENGTH) {
      savePin()
    }
  }, [confirmPin, mode])

  const verifyPin = async () => {
    const stored = await getItem<string>(PIN_KEY)
    if (stored === simpleHash(pin)) {
      router.replace('/(tabs)')
    } else {
      setError('Incorrect PIN')
      setPin('')
    }
  }

  const savePin = async () => {
    if (pin !== confirmPin) {
      setError('PINs do not match')
      setPin('')
      setConfirmPin('')
      setMode('setup')
      return
    }
    await setItem(PIN_KEY, simpleHash(pin))
    router.replace('/(tabs)')
  }

  const skipSetup = () => {
    router.replace('/(tabs)')
  }

  const displayPin = mode === 'confirm' ? confirmPin : pin

  if (hasPin === null) return null

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.gold} />
        <Text style={styles.title}>
          {mode === 'setup' ? 'Set App PIN' : mode === 'confirm' ? 'Confirm PIN' : 'Enter PIN'}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.dots}>
          {Array.from({ length: MAX_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.dot, i < displayPin.length && styles.dotFilled]} />
          ))}
        </View>

        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map((d, i) => {
            if (d === '') {
              return (
                <View key={i} style={styles.keypadBtn}>
                  {i === 9 && mode !== 'setup' ? null : null}
                </View>
              )
            }
            return (
              <TouchableOpacity key={i} style={styles.keypadBtn} onPress={() => handleDigit(d)} activeOpacity={0.6}>
                <Text style={styles.keypadDigit}>{d}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {displayPin.length > 0 && (
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="backspace-outline" size={28} color={Colors.mutedWhite} />
          </TouchableOpacity>
        )}

        {mode === 'setup' && (
          <TouchableOpacity onPress={skipSetup} style={styles.skipBtn}>
            <Text style={styles.skipLabel}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white },
  error: { fontSize: FontSize.sm, color: Colors.danger },
  dots: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.lg },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.lightGrey, borderWidth: 1, borderColor: Colors.borderGrey },
  dotFilled: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 240, gap: Spacing.md },
  keypadBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  keypadDigit: { fontSize: FontSize.xxl, fontWeight: FontWeight.medium, color: Colors.white },
  skipBtn: { paddingVertical: Spacing.md },
  skipLabel: { fontSize: FontSize.md, color: Colors.mutedWhite },
})
