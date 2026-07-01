import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNfc } from '@/hooks/useNfc'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { Device } from '@/types'

type ProvisioningStep = 'intro' | 'scanning' | 'writing' | 'success' | 'error'

export function DeviceProvisioningScreen() {
  const { isSupported, isScanning, lastTag, error, scanTag, writeToTag, clearTag } = useNfc()
  const { addDevice } = useAppStore()
  const [step, setStep] = useState<ProvisioningStep>('intro')
  const [deviceLabel, setDeviceLabel] = useState('')
  const pulseAnim = useState(new Animated.Value(1))[0]

  useEffect(() => {
    if (step === 'scanning') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      )
      pulse.start()
      return () => pulse.stop()
    }
  }, [step])

  const handleScan = async () => {
    setStep('scanning')
    const tag = await scanTag()
    if (tag) {
      setStep('writing')
      const written = await writeToTag({
        walletAddress: 'wallet-address-placeholder',
        deviceLabel: deviceLabel || 'My RFID Card',
        activationUrl: 'noirwallet://activate',
      })
      if (written) {
        const newDevice: Device = {
          id: Math.random().toString(36).slice(2),
          userId: 'u1',
          deviceUidHash: tag.uid,
          label: deviceLabel || 'My RFID Card',
          status: 'active',
          dailySpendLimitCents: 500000,
          accumulatedTodayCents: 0,
          lastTapAt: null,
          createdAt: new Date().toISOString(),
        }
        addDevice(newDevice)
        setStep('success')
      } else {
        setStep('error')
      }
    } else {
      setStep('error')
    }
  }

  const handleReset = () => {
    setStep('intro')
    clearTag()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Link Your Device</Text>
        <Text style={styles.subtitle}>
          Tap your RFID sticker or NFC card against the back of your phone to link it to your wallet.
        </Text>

        {/* Animation Area */}
        <View style={styles.animationArea}>
          {step === 'intro' && (
            <View style={styles.phoneIllustration}>
              <View style={styles.phone}>
                <Ionicons name="phone-portrait-outline" size={80} color={Colors.mutedWhite} />
                <View style={styles.nfcAntenna}>
                  <Ionicons name="radio" size={32} color={Colors.accentGreen} />
                </View>
              </View>
              <View style={styles.waveLines}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.wave,
                      { width: 40 + i * 30, opacity: 0.5 - i * 0.15 },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.card}>
                <Ionicons name="card-outline" size={40} color={Colors.white} />
              </View>
            </View>
          )}

          {step === 'scanning' && (
            <View style={styles.scanningContainer}>
              <Animated.View
                style={[
                  styles.scanningRing,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.scanningCenter}>
                <Ionicons name="radio" size={48} color={Colors.accentGreen} />
              </View>
              <Text style={styles.scanningText}>Waiting for tag...</Text>
            </View>
          )}

          {step === 'writing' && (
            <View style={styles.writingContainer}>
              <Ionicons name="cloud-upload-outline" size={48} color={Colors.accentBlue} />
              <Text style={styles.writingText}>Linking device to your wallet...</Text>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.resultContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color={Colors.accentGreen} />
              </View>
              <Text style={styles.successTitle}>Device Linked!</Text>
              <Text style={styles.successSub}>
                Your {deviceLabel || 'RFID card'} is now connected to your Noir Wallet.
              </Text>
            </View>
          )}

          {step === 'error' && (
            <View style={styles.resultContainer}>
              <Ionicons name="close-circle" size={64} color={Colors.accentRed} />
              <Text style={[styles.successTitle, { color: Colors.accentRed }]}>
                {error || 'Link Failed'}
              </Text>
              <Text style={styles.successSub}>
                Make sure your tag is placed correctly against the back of your phone.
              </Text>
            </View>
          )}
        </View>

        {/* Label Input (Intro only) */}
        {step === 'intro' && (
          <View style={styles.labelSection}>
            <Text style={styles.labelPrompt}>Give your device a name:</Text>
            <View style={styles.labelInputRow}>
              {['My Wallet Card', 'Campus ID', 'Transport Pass', 'Other'].map(
                (label) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.labelChip,
                      deviceLabel === label && styles.labelChipActive,
                    ]}
                    onPress={() => setDeviceLabel(label)}
                  >
                    <Text
                      style={[
                        styles.labelChipText,
                        deviceLabel === label && styles.labelChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        )}

        {/* Status message for unsupported */}
        {!isSupported && step === 'intro' && (
          <Text style={styles.unsupported}>
            NFC is not available on this device. You can still use the app without hardware pairing.
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {step === 'intro' && (
            <TouchableOpacity
              style={[styles.primaryBtn, !isSupported && styles.btnDisabled]}
              onPress={handleScan}
              disabled={!isSupported}
              activeOpacity={0.8}
            >
              <Ionicons name="radio" size={22} color={Colors.black} />
              <Text style={styles.primaryBtnText}>Scan My Tag</Text>
            </TouchableOpacity>
          )}
          {(step === 'success' || step === 'error') && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleReset} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>
                {step === 'success' ? 'Done' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  animationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  phoneIllustration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  phone: {
    alignItems: 'center',
    position: 'relative',
  },
  nfcAntenna: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentGreen + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveLines: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  wave: {
    height: 2,
    backgroundColor: Colors.accentGreen,
    borderRadius: 1,
  },
  card: {
    width: 60,
    height: 90,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  scanningContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  scanningRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.accentGreen,
  },
  scanningCenter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningText: {
    fontSize: FontSize.sm,
    color: Colors.accentGreen,
    marginTop: Spacing.md,
    fontWeight: FontWeight.medium,
  },
  writingContainer: {
    alignItems: 'center',
  },
  writingText: {
    fontSize: FontSize.md,
    color: Colors.accentBlue,
    marginTop: Spacing.md,
    fontWeight: FontWeight.medium,
  },
  resultContainer: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: FontSize.xl,
    color: Colors.accentGreen,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  successSub: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    lineHeight: 20,
  },
  labelSection: {
    marginBottom: Spacing.lg,
  },
  labelPrompt: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginBottom: Spacing.sm,
  },
  labelInputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  labelChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  labelChipActive: {
    backgroundColor: Colors.accentGreen + '20',
    borderColor: Colors.accentGreen,
  },
  labelChipText: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
  },
  labelChipTextActive: {
    color: Colors.accentGreen,
    fontWeight: FontWeight.semibold,
  },
  unsupported: {
    fontSize: FontSize.sm,
    color: Colors.accentOrange,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  actions: {
    gap: Spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentGreen,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  primaryBtnText: {
    color: Colors.black,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  btnDisabled: {
    backgroundColor: Colors.lightGrey,
  },
})
