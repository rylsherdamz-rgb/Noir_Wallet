import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { nfcService } from '@/services/nfc'
import { Device } from '@/types'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Cards
        </Text>
        <View style={styles.spacer24} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Turn a blank NFC card into a tap-to-pay wallet. Tap the card to pay anywhere a Noir
          reader accepts it.
        </Text>

        <View style={styles.addCard}>
          <Text style={styles.label}>Optional PIN (for larger taps)</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={(t) => setPin(t.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="4–6 digits"
            placeholderTextColor={Colors.mutedWhite}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
          <PressableScale
            style={[styles.primaryBtn, busy && styles.btnDisabled]}
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
                <Text style={styles.primaryBtnText}>Add a Card</Text>
              </>
            )}
          </PressableScale>
        </View>

        {status && (
          <Text
            style={[
              styles.status,
              status.kind === 'error' && { color: Colors.danger },
              status.kind === 'success' && { color: Colors.success },
            ]}
          >
            {status.text}
          </Text>
        )}

        <Text style={styles.sectionTitle}>Your Cards</Text>
        {cards.length === 0 ? (
          <Text style={styles.empty}>No cards yet. Add one above.</Text>
        ) : (
          cards.map((card) => {
            const revoked = card.status === 'deactivated' || card.status === 'lost'
            return (
              <View key={card.id} style={styles.cardRow}>
                <View style={styles.cardIcon}>
                  <Ionicons name="card-outline" size={22} color={revoked ? Colors.mutedWhite : Colors.gold} />
                </View>
                <View style={styles.flexOne}>
                  <Text style={[styles.cardLabel, revoked && styles.cardLabelRevoked]}>{card.label}</Text>
                  <Text style={styles.cardWallet} numberOfLines={1}>
                    {card.agentPublicKey?.slice(0, 8)}…{card.agentPublicKey?.slice(-4)}
                  </Text>
                </View>
                {revoked ? (
                  <Text style={styles.revokedTag}>Revoked</Text>
                ) : (
                  <PressableScale
                    style={styles.revokeBtn}
                    onPress={() => revokeCard(card)}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityLabel={`Revoke ${card.label}`}
                  >
                    <Text style={styles.revokeBtnText}>Revoke</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  intro: { fontSize: FontSize.sm, color: Colors.mutedWhite, lineHeight: 20, marginBottom: Spacing.lg },
  addCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  label: { fontSize: FontSize.xs, color: Colors.mutedWhite, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  pinInput: {
    backgroundColor: Colors.lightGrey,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    color: Colors.white,
    fontSize: FontSize.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    minHeight: 52,
  },
  primaryBtnText: { color: Colors.black, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  btnDisabled: { opacity: 0.6 },
  status: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: Spacing.md, textAlign: 'center' },
  sectionTitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  empty: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', paddingVertical: Spacing.lg },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: { fontSize: FontSize.md, color: Colors.white, fontWeight: FontWeight.semibold },
  cardLabelRevoked: { color: Colors.mutedWhite, textDecorationLine: 'line-through' },
  cardWallet: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontFamily: 'monospace', marginTop: 2 },
  revokeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  revokeBtnText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.semibold },
  revokedTag: { fontSize: FontSize.xs, color: Colors.mutedWhite, fontStyle: 'italic' },
  spacer24: { width: 24 },
  flexOne: { flex: 1 },
})
