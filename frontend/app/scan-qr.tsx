import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'

export default function ScanQrRoute() {
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  if (!permission) return null
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={64} color={Colors.mutedWhite} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDesc}>
            Noir Wallet needs camera access to scan QR codes and NFC tags for recipient addresses.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonLabel}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)
    const address = data.trim()
    router.back()
    setTimeout(() => {
      router.setParams({ scannedAddress: address })
    }, 100)
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={28} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.scanArea}>
          <View style={styles.scanFrame} />
          <Text style={styles.hint}>Point camera at a Stellar address QR code</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  permissionContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  permissionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white },
  permissionDesc: { fontSize: FontSize.sm, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 20 },
  button: { backgroundColor: Colors.gold, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.md },
  buttonLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.black },
  cancelBtn: { paddingVertical: Spacing.md },
  cancelLabel: { fontSize: FontSize.md, color: Colors.mutedWhite },
  overlay: { flex: 1, justifyContent: 'space-between', paddingTop: Spacing.xxl * 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  scanArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: Colors.gold, borderRadius: BorderRadius.lg },
  hint: { fontSize: FontSize.sm, color: Colors.mutedWhite, marginTop: Spacing.lg, textAlign: 'center', paddingHorizontal: Spacing.xl },
})
