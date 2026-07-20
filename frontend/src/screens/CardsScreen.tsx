import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { nfcService } from '@/services/nfc'
import { Device } from '@/types'
import { Colors } from '@/constants/theme'

/**
 * Cards: provision a blank NFC card into a spendable (custodied) wallet, view
 * linked cards, set an optional PIN, and revoke a lost card. Neutral wallet
 * framing — any user can register a card, not just a business.
 */
export function CardsScreen() {
  const router = useRouter()
  const { devices, user, addDevice, updateDevice } = useAppStore()
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ kind: 'info' | 'error' | 'success'; text: string } | null>(null)

  // Cards are devices provisioned with a custodied wallet (stored in agentPublicKey).
  const cards = devices.filter((d) => !!d.agentPublicKey)

  const addCard = useCallback(async () => {
    setBusy(true)
    setStatus({ kind: 'info', text: 'Hold the card to the back of your phone…' })
    try {
      const tag = await nfcService.readTag(10000)
      if (!tag?.uid) {
        setStatus({ kind: 'error', text: 'No card detected. Try again.' })
        return
      }
      const res = await apiService.provisionCard(tag.uid, {
        pin: pin.trim() ? pin.trim() : undefined,
      })
      const card: Device = {
        id: tag.uid, // raw UID needed to revoke later
        userId: user?.id || 'local',
        deviceUidHash: res.device_hash,
        label: `Card ••${tag.uid.slice(-4)}`,
        agentPublicKey: res.wallet_address,
        status: 'active',
        dailySpendLimitCents: 500000,
        accumulatedTodayCents: 0,
        lastTapAt: null,
        createdAt: new Date().toISOString(),
      }
      addDevice(card)
      setPin('')
      setStatus({ kind: 'success', text: `Card ready • wallet ${res.wallet_address.slice(0, 6)}…${res.wallet_address.slice(-4)}` })
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Could not add card' })
    } finally {
      setBusy(false)
    }
  }, [pin, user, addDevice])

  const revokeCard = useCallback(
    async (card: Device) => {
      setBusy(true)
      setStatus({ kind: 'info', text: `Revoking ${card.label}…` })
      try {
        await apiService.revokeCard(card.id)
        updateDevice(card.id, { status: 'deactivated' })
        setStatus({ kind: 'success', text: `${card.label} revoked` })
      } catch (e: any) {
        setStatus({ kind: 'error', text: e?.message || 'Could not revoke card' })
      } finally {
        setBusy(false)
      }
    },
    [updateDevice],
  )

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-4">
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text className="text-xl font-bold text-white" accessibilityRole="header">
          Cards
        </Text>
        <View className="w-[24]" />
      </View>

      <ScrollView contentContainerClassName="px-6 pb-8">
        <Text className="text-sm text-mutedWhite leading-5 mb-6">
          Turn a blank NFC card into a tap-to-pay wallet. Tap the card to pay anywhere a Noir
          reader accepts it.
        </Text>

        <View className="bg-cardBg rounded-2xl p-6 border border-borderGrey">
          <Text className="text-xs text-mutedWhite mb-2 uppercase tracking-[0.5]">Optional PIN (for larger taps)</Text>
          <TextInput
            className="bg-[#2C2C2C] rounded-xl border border-borderGrey text-white text-base px-4 h-[48] mb-4"
            value={pin}
            onChangeText={(t) => setPin(t.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="4–6 digits"
            placeholderTextColor={Colors.mutedWhite}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
          <PressableScale
            className={`flex-row items-center justify-center bg-gold py-4 rounded-xl gap-2 min-h-[52] ${busy ? 'opacity-60' : ''}`}
            onPress={addCard}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Add a card"
          >
            {busy ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color={Colors.black} />
                <Text className="text-xl font-bold text-black">Add a Card</Text>
              </>
            )}
          </PressableScale>
        </View>

        {status && (
          <Text
            className={`text-sm text-mutedWhite mt-4 text-center ${status.kind === 'error' ? 'text-[#FF5A5F]' : status.kind === 'success' ? 'text-[#3ED598]' : ''}`}
          >
            {status.text}
          </Text>
        )}

        <Text className="text-sm text-mutedWhite font-semibold uppercase tracking-[0.5] mt-8 mb-4">Your Cards</Text>
        {cards.length === 0 ? (
          <Text className="text-sm text-mutedWhite text-center py-6">No cards yet. Add one above.</Text>
        ) : (
          cards.map((card) => {
            const revoked = card.status === 'deactivated' || card.status === 'lost'
            return (
              <View key={card.id} className="flex-row items-center bg-cardBg rounded-xl border border-borderGrey p-4 mb-2 gap-4">
                <View className="w-10 h-10 rounded-full bg-gold/15 items-center justify-center">
                  <Ionicons name="card-outline" size={22} color={revoked ? Colors.mutedWhite : Colors.gold} />
                </View>
                <View className="flex-1">
                  <Text className={`text-base text-white font-semibold ${revoked ? 'text-mutedWhite line-through' : ''}`}>{card.label}</Text>
                  <Text className="text-xs text-mutedWhite font-mono mt-0.5" numberOfLines={1}>
                    {card.agentPublicKey?.slice(0, 8)}…{card.agentPublicKey?.slice(-4)}
                  </Text>
                </View>
                {revoked ? (
                  <Text className="text-xs text-mutedWhite italic">Revoked</Text>
                ) : (
                  <PressableScale
                    className="px-4 py-2 rounded-full border border-[#FF5A5F]"
                    onPress={() => revokeCard(card)}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityLabel={`Revoke ${card.label}`}
                  >
                    <Text className="text-sm text-[#FF5A5F] font-semibold">Revoke</Text>
                  </PressableScale>
                )}
              </View>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
