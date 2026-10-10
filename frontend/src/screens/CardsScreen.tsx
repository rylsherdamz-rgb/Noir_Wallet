import { colorWithOpacity } from '@/constants/designTokens'
import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { ScreenHeader } from '@/components/ScreenHeader'
import { SectionLabel, ListRow } from '@/components/ui/List'
import { Button } from '@/components/Button'
import { popup } from '@/components/popup/Popup'

/**
 * Cards: provision a blank NFC card into a spendable (custodied) wallet, view
 * linked cards, and revoke a lost card. Neutral wallet
 * framing — any user can register a card, not just a business.
 */
export function CardsScreen() {
  const router = useRouter()
  const { devices, user, addDevice, updateDevice } = useAppStore()
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
      const res = await apiService.provisionCard(tag.uid)
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
      setStatus({ kind: 'success', text: `Card ready • wallet ${res.wallet_address.slice(0, 6)}…${res.wallet_address.slice(-4)}` })
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Could not add card' })
    } finally {
      setBusy(false)
    }
  }, [user, addDevice])

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

  const askRevoke = (card: Device) =>
    popup.confirm({
      title: `Revoke ${card.label}?`,
      message: 'It can no longer pay. You can link a new card anytime.',
      icon: 'trash-outline',
      tone: 'danger',
      confirmLabel: 'Revoke card',
    }).then((ok) => { if (ok) revokeCard(card) })

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Cards" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Any NFC card or sticker can be a tap-to-pay wallet.</Text>
        {status && (
          <Text style={[styles.status, status.kind === 'error' && { color: Colors.danger }, status.kind === 'success' && { color: Colors.success }]} accessibilityLiveRegion="polite">
            {status.text}
          </Text>
        )}
        <SectionLabel title="Your cards" />
        {cards.length === 0 ? (
          <Text style={styles.empty}>No cards yet.</Text>
        ) : (
          cards.map((card, i) => {
            const revoked = card.status === 'deactivated' || card.status === 'lost'
            return (
              <ListRow
                key={card.id}
                icon="card-outline"
                iconColor={revoked ? Colors.mutedWhite : Colors.gold}
                title={card.label}
                titleColor={revoked ? Colors.mutedWhite : Colors.white}
                subtitle={`${card.agentPublicKey?.slice(0, 8)}…${card.agentPublicKey?.slice(-4)}`}
                subtitleMono
                value={revoked ? 'Revoked' : card.status === 'active' ? 'Active' : card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                valueColor={revoked ? Colors.mutedWhite : card.status === 'active' ? Colors.success : Colors.warning}
                last={i === cards.length - 1}
                onPress={revoked || busy ? undefined : () => askRevoke(card)}
                accessibilityLabel={revoked ? `${card.label}, revoked` : `${card.label}. Revoke`}
              />
            )
          })
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Add a card" icon="add" onPress={addCard} loading={busy} disabled={busy} fullWidth />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  content: { paddingHorizontal: 20, paddingBottom: Spacing.xl },
  intro: { fontSize: FontSize.md - 1, color: Colors.mutedWhite, lineHeight: 22, paddingTop: Spacing.xs },
  status: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: Spacing.md },
  empty: { fontSize: FontSize.sm, color: Colors.mutedWhite, paddingVertical: Spacing.md },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
})
