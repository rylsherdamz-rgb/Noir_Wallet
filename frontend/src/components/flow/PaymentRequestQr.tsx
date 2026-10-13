import { useRef } from 'react'
import { View, Text, StyleSheet, Share } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme'
import { buildPaymentRequestUri } from '@/lib/paymentQr'
import { formatAmount } from '@/lib/txFormat'
import { useHorizonPayments } from '@/hooks/useHorizonPayments'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'
import { TextAction } from '@/components/ui/List'

export interface IncomingPayment {
  hash: string
  from: string
  amountXlm: number
}

interface PaymentRequestQrProps {
  address: string
  /** Requested XLM; 0/undefined = payer chooses. */
  amountXlm?: number
  /** Fired once, for the first incoming XLM payment that covers the request. */
  onPaid?: (p: IncomingPayment) => void
}

/**
 * A SEP-0007 payment-request QR (any Stellar wallet can scan it) that watches
 * the account live and reports the payment when it lands.
 */
export function PaymentRequestQr({ address, amountXlm, onPaid }: PaymentRequestQrProps) {
  const uri = buildPaymentRequestUri({ destination: address, amount: amountXlm ? String(amountXlm) : undefined })
  const fired = useRef(false)

  const status = useHorizonPayments(address, (r) => {
    if (fired.current || !onPaid) return
    const incoming =
      (r?.type === 'payment' && r.to === address && r.asset_type === 'native')
        ? { amount: parseFloat(r.amount), from: r.from }
        : (r?.type === 'create_account' && r.account === address)
          ? { amount: parseFloat(r.starting_balance), from: r.funder }
          : null
    if (!incoming) return
    // Small tolerance for float formatting; a short payment doesn't settle the request.
    if (amountXlm && incoming.amount + 1e-7 < amountXlm) return
    fired.current = true
    onPaid({ hash: r.transaction_hash, from: incoming.from, amountXlm: incoming.amount })
  })

  const share = () => {
    Share.share({ message: amountXlm ? `Pay me ${formatAmount(Math.round(amountXlm * 100))} XLM on Stellar: ${uri}` : `My Stellar address: ${address}` }).catch(() => {})
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.qrCard}>
        <QRCode value={uri} size={208} backgroundColor={Colors.white} color={Colors.black} />
      </View>
      {amountXlm ? (
        <Text style={styles.amount}>{formatAmount(Math.round(amountXlm * 100))} <Text style={styles.asset}>XLM</Text></Text>
      ) : null}
      <View style={styles.statusRow} accessibilityLiveRegion="polite">
        {status === 'live' ? <VerifyingPulse size={16} /> : null}
        <Text style={styles.status}>
          {status === 'live' ? 'Waiting for payment…' : status === 'connecting' ? 'Connecting to Stellar…' : 'Offline — the payment will still arrive'}
        </Text>
      </View>
      <Text style={styles.hint}>Scan with Noir or any Stellar wallet</Text>
      <TextAction label="Share request" icon="share-outline" onPress={share} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 14 },
  qrCard: { padding: Spacing.md, backgroundColor: Colors.white, borderRadius: 20 },
  amount: { fontFamily: Fonts.display, fontSize: 32, color: Colors.white, fontVariant: ['tabular-nums'] },
  asset: { fontFamily: Fonts.displayMd, fontSize: FontSize.lg - 2, color: Colors.mutedWhite },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  status: { fontSize: FontSize.sm, color: Colors.mutedWhite },
  hint: { fontSize: FontSize.xs, color: Colors.mutedWhite },
})
