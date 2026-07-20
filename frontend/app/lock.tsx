import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
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
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center px-8 gap-4">
        <Ionicons name="lock-closed-outline" size={48} color={Colors.gold} />
        <Text className="text-xl font-bold text-white">
          {mode === 'setup' ? 'Set App PIN' : mode === 'confirm' ? 'Confirm PIN' : 'Enter PIN'}
        </Text>
        {error ? <Text className="text-sm text-[#FF5A5F]">{error}</Text> : null}

        <View className="flex-row gap-4 my-6">
          {Array.from({ length: MAX_LENGTH }).map((_, i) => (
            <View key={i} className={`w-[14px] h-[14px] rounded-full bg-[#2C2C2C] border border-borderGrey ${i < displayPin.length ? 'bg-gold border-gold' : ''}`} />
          ))}
        </View>

        <View className="flex-row flex-wrap justify-center w-60 gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map((d, i) => {
            if (d === '') {
              return (
                <View key={i} className="w-16 h-16 rounded-full items-center justify-center">
                  {i === 9 && mode !== 'setup' ? null : null}
                </View>
              )
            }
            return (
              <TouchableOpacity key={i} className="w-16 h-16 rounded-full items-center justify-center" onPress={() => handleDigit(d)} activeOpacity={0.6}>
                <Text className="text-[32px] font-medium text-white">{d}</Text>
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
          <TouchableOpacity onPress={skipSetup} className="py-4">
            <Text className="text-base text-mutedWhite">Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}
