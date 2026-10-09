import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Linking, Animated, Easing, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import * as MediaLibrary from 'expo-media-library'
import * as Sharing from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'
import { PressableScale } from '@/components/brand/PressableScale'
import { Toast } from '@/components/Toast'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'
import { fromReceiptParams } from '@/lib/receipt'
import { formatAmount, shortAddress } from '@/lib/txFormat'
import { logger } from '@/lib/logger'
import { KeyValueRow, TextAction } from '@/components/ui/List'
import { Button } from '@/components/Button'

const NOIR_MARK = require('../../assets/noir-mark.png')

/**
 * GCash-style receipt shown when a transaction finishes, and from Transaction
 * Detail. The card is captured as a PNG for Save (gallery) and Share.
 */
export function ReceiptScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const network = useAppStore((s) => s.network)
  const receipt = fromReceiptParams(params)
  const shotRef = useRef<View>(null)
  const [busy, setBusy] = useState<'save' | 'share' | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message?: string }>({
    visible: false, type: 'success', title: '',
  })

  const pop = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    Animated.timing(pop, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }).start()
  }, [pop])

  const done = () => {
    if (router.canDismiss()) router.dismissAll()
    router.replace('/(tabs)')
  }

  if (!receipt) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.muted}>Receipt not available.</Text>
          <Button label="Done" onPress={done} />
        </View>
      </SafeAreaView>
    )
  }

  const incoming = receipt.direction === 'in'
  const failed = receipt.status === 'failed'
  const pending = receipt.status === 'pending'
  const accent = failed ? Colors.danger : pending ? Colors.warning : Colors.success
  const sign = failed ? '' : incoming ? '+' : '−'
  const date = new Date(receipt.createdAt)
  const dateLabel = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  const explorerUrl = receipt.hash
    ? `https://stellar.expert/explorer/${network === 'testnet' ? 'testnet' : 'public'}/tx/${receipt.hash}`
    : null
  const headline = failed ? 'Transaction failed' : pending ? 'Submitted' : incoming ? 'Received' : 'Sent successfully'

  const capture = async (): Promise<string> => {
    if (!shotRef.current) throw new Error('Could not create the receipt image')
    return captureRef(shotRef, { format: 'png', quality: 1, result: 'tmpfile' })
  }

  const save = async () => {
    setBusy('save')
    try {
      const uri = await capture()
      // Write-only access: saving a receipt never needs to read the gallery.
      const perm = await MediaLibrary.requestPermissionsAsync(true, ['photo'])
      if (!perm.granted) {
        // Fall back to the share sheet, which offers "Save to device" anyway.
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Save receipt' })
        return
      }
      await MediaLibrary.saveToLibraryAsync(uri)
      setToast({ visible: true, type: 'success', title: 'Saved', message: 'Receipt saved to your photos' })
    } catch (e: any) {
      logger.warn('receipt save failed:', e?.message)
      setToast({ visible: true, type: 'error', title: 'Could not save', message: e?.message ?? 'Try Share instead' })
    } finally {
      setBusy(null)
    }
  }

  const share = async () => {
    setBusy('share')
    try {
      const uri = await capture()
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share receipt' })
    } catch (e: any) {
      logger.warn('receipt share failed:', e?.message)
      setToast({ visible: true, type: 'error', title: 'Could not share', message: e?.message })
    } finally {
      setBusy(null)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* collapsable={false} keeps this a real native view so it can be captured. */}
        <View ref={shotRef} collapsable={false} style={styles.shot}>
          <Animated.View style={[styles.hero, { transform: [{ scale: pop }] }]}>
            <Ionicons name={failed ? 'close-circle' : pending ? 'time' : 'checkmark-circle'} size={56} color={accent} />
          </Animated.View>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={[styles.amount, failed && styles.amountFailed]} numberOfLines={1} adjustsFontSizeToFit>
            {sign}{formatAmount(receipt.amountCents)} <Text style={styles.asset}>{receipt.assetCode}</Text>
          </Text>
          {!!receipt.note && <Text style={styles.note}>{receipt.note}</Text>}

          <View style={styles.rows}>
            {receipt.counterparty && (
              <KeyValueRow label={receipt.counterpartyLabel ?? (incoming ? 'From' : 'To')} value={shortAddress(receipt.counterparty)} mono />
            )}
            <KeyValueRow label="Date" value={dateLabel} />
            <KeyValueRow label="Status" value={failed ? 'Failed' : pending ? 'Pending' : 'Confirmed'} valueStyle={{ color: accent }} />
            <KeyValueRow label="Network" value={network === 'testnet' ? 'Stellar Testnet' : 'Stellar'} last={!receipt.hash} />
            {receipt.hash && <KeyValueRow label="Reference" value={`${receipt.hash.slice(0, 8)}…${receipt.hash.slice(-6)}`} mono last />}
          </View>

          <View style={styles.brandRow}>
            <Image source={NOIR_MARK} style={styles.mark} resizeMode="contain" />
            <Text style={styles.brand}>Noir</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TextAction label={busy === 'save' ? 'Saving…' : 'Save'} icon="download-outline" onPress={save} disabled={!!busy} center={false} />
          <TextAction label={busy === 'share' ? 'Opening…' : 'Share'} icon="share-social-outline" onPress={share} disabled={!!busy} center={false} />
          {explorerUrl && <TextAction label="Explorer" icon="open-outline" onPress={() => Linking.openURL(explorerUrl)} center={false} />}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Button label="Done" onPress={done} fullWidth />
      </View>

      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onDismiss={() => setToast((p) => ({ ...p, visible: false }))}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  muted: { color: Colors.mutedWhite, fontSize: FontSize.md },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: Spacing.xl },
  shot: { backgroundColor: Colors.surfaceBg, alignItems: 'center', paddingBottom: Spacing.md },
  hero: { marginBottom: Spacing.sm },
  headline: { fontFamily: Fonts.display, fontSize: 22, color: Colors.cream },
  amount: { fontFamily: Fonts.display, fontSize: 40, color: Colors.white, marginTop: 6, fontVariant: ['tabular-nums'] },
  amountFailed: { color: Colors.mutedWhite, textDecorationLine: 'line-through' },
  asset: { fontFamily: Fonts.displayMd, fontSize: FontSize.lg - 2, color: Colors.mutedWhite },
  note: { color: Colors.mutedWhite, fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  rows: { alignSelf: 'stretch', marginTop: Spacing.xl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.lg, opacity: 0.8 },
  mark: { width: 16, height: 17 },
  brand: { fontFamily: Fonts.displayMd, fontSize: FontSize.xs, color: Colors.mutedWhite, letterSpacing: 1 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, paddingVertical: Spacing.md },
  bottom: { paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
})
