import { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'

export default function ScanQrRoute() {
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  if (!permission) return null
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Ionicons name="camera-outline" size={64} color={Colors.mutedWhite} />
          <Text className="text-2xl font-bold text-white">Camera Access Needed</Text>
          <Text className="text-sm text-mutedWhite text-center leading-5">
            Noir Wallet needs camera access to scan QR codes and NFC tags for recipient addresses.
          </Text>
          <TouchableOpacity className="bg-gold px-8 py-4 rounded-xl mt-4" onPress={requestPermission}>
            <Text className="text-base font-bold text-black">Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-4" onPress={() => router.back()}>
            <Text className="text-base text-mutedWhite">Cancel</Text>
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
    <View className="flex-1 bg-black">
      <CameraView
        className="absolute inset-0"
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View className="flex-1 justify-between pt-24">
        <View className="flex-row items-center justify-between px-4">
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={28} color={Colors.white} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Scan QR Code</Text>
          <View className="w-7" />
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="w-[250px] h-[250px] border-2 border-gold rounded-2xl" />
          <Text className="text-sm text-mutedWhite mt-6 text-center px-8">Point camera at a Stellar address QR code</Text>
        </View>
      </View>
    </View>
  )
}
