import { useAppStore } from '@/store/useAppStore'
import { MerchantPosScreen } from '@/screens/MerchantPosScreen'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

export default function PosScreen() {
  const activeRole = useAppStore((s) => s.activeRole)
  const setActiveRole = useAppStore((s) => s.setActiveRole)

  if (activeRole !== 'merchant') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Merchant POS</Text>
          <Text style={styles.desc}>
            Switch to Merchant mode to access the point-of-sale terminal and accept tap payments.
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => setActiveRole('merchant')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Switch to Merchant Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return <MerchantPosScreen />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, justifyContent: 'center', padding: Spacing.lg },
  card: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.borderGrey },
  title: { fontSize: FontSize.xl, color: Colors.white, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  desc: { fontSize: FontSize.md, color: Colors.mutedWhite, lineHeight: 22, marginBottom: Spacing.lg },
  btn: { backgroundColor: Colors.accentGreen, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  btnText: { color: Colors.black, fontSize: FontSize.md, fontWeight: FontWeight.bold },
})
