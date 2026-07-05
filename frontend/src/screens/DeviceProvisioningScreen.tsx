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
import { useNfc } from '@/hooks/useNfc'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { Device } from '@/types'

type Step = 'intro' | 'scanning' | 'writing' | 'success' | 'error'

const LABELS = ['My Wallet Card', 'Daily Carry', 'Home Key', 'Other']

export function DeviceProvisioningScreen() {
  const { isSupported, lastTag, error, scanTag, writeToTag, clearTag } = useNfc()
  const { user, addDevice } = useAppStore()
  const [step, setStep] = useState<Step>('intro')
  const [label, setLabel] = useState('')
  const pulse = useState(new Animated.Value(1))[0]

  useEffect(() => {
    if (step === 'scanning') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.6, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      )
      anim.start()
      return () => anim.stop()
    }
  }, [step])

  const handleScan = async () => {
    setStep('scanning')
    const tag = await scanTag()
    if (tag) {
      setStep('writing')
      const displayLabel = label || `${user?.displayName || 'My'} Card`
      const written = await writeToTag({
        walletAddress: user?.stellarPublicKey || 'pending',
        deviceLabel: displayLabel,
        activationUrl: 'noirwallet://activate',
      })
      if (written) {
        const newDevice: Device = {
          id: Math.random().toString(36).slice(2),
          userId: user?.id || 'local',
          deviceUidHash: tag.uid,
          label: displayLabel,
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

  const reset = () => { setStep('intro'); clearTag() }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.top}>
          <NoirLogo variant="mark" size={48} />
          <Text style={styles.title}>Link Your Device</Text>
          <Text style={styles.subtitle}>
            Tap your {user?.displayName ? `${user.displayName}'s ` : ''}NFC tag against the back of your phone to link it
          </Text>
        </View>

        <View style={styles.center}>
          {step === 'intro' && (
            <View style={styles.illustration}>
              <View style={styles.phoneWrap}>
                <Ionicons name="phone-portrait-outline" size={48} color={Colors.mutedWhite} />
                <View style={styles.antenna}>
                  <Ionicons name="radio" size={22} color={Colors.gold} />
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color={Colors.mutedWhite} />
              <View style={styles.cardImg}>
                <Ionicons name="card-outline" size={24} color={Colors.white} />
              </View>
            </View>
          )}

          {step === 'scanning' && (
            <View style={styles.scanWrap}>
              <Animated.View style={[styles.scanRing, { transform: [{ scale: pulse }] }]} />
              <View style={styles.scanCenter}>
                <Ionicons name="radio" size={40} color={Colors.gold} />
              </View>
              <Text style={styles.scanText}>Scanning...</Text>
            </View>
          )}

          {step === 'writing' && (
            <View style={styles.resultWrap}>
              <Ionicons name="sync" size={48} color={Colors.gold} />
              <Text style={styles.resultText}>Linking to {user?.displayName || 'your wallet'}...</Text>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.resultWrap}>
              <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
              <Text style={styles.successTitle}>Linked!</Text>
              <Text style={styles.successSub}>{label || `${user?.displayName || 'Your'} Card`} is now paired</Text>
            </View>
          )}

          {step === 'error' && (
            <View style={styles.resultWrap}>
              <Ionicons name="close-circle" size={72} color={Colors.danger} />
              <Text style={[styles.successTitle, { color: Colors.danger }]}>{error || 'Scan Failed'}</Text>
              <Text style={styles.successSub}>Hold the tag steady against the back of your phone</Text>
            </View>
          )}
        </View>

        {step === 'intro' && (
          <View style={styles.labelSection}>
            <Text style={styles.labelTitle}>Name this device</Text>
            <View style={styles.labelRow}>
              {LABELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.chip, label === l && styles.chipActive]}
                  onPress={() => setLabel(l)}
                >
                  <Text style={[styles.chipText, label === l && styles.chipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {!isSupported && (
              <Text style={styles.unsupported}>NFC unavailable on this device</Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          {step === 'intro' && (
            <TouchableOpacity
              style={[styles.primaryBtn, !isSupported && styles.btnDisabled]}
              onPress={handleScan}
              disabled={!isSupported}
              activeOpacity={0.8}
            >
              <Ionicons name="radio" size={20} color={Colors.black} />
              <Text style={styles.primaryBtnText}>Scan My Tag</Text>
            </TouchableOpacity>
          )}
          {(step === 'success' || step === 'error') && (
            <TouchableOpacity style={styles.primaryBtn} onPress={reset} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>{step === 'success' ? 'Done' : 'Try Again'}</Text>
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
  top: {
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexShrink: 1,
  },
  phoneWrap: {
    width: 48,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  antenna: {
    position: 'absolute',
    top: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  cardImg: {
    width: 44,
    height: 68,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  scanWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
  },
  scanRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  scanCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    marginTop: Spacing.md,
    fontWeight: FontWeight.medium,
  },
  resultWrap: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: FontSize.md,
    color: Colors.gold,
    marginTop: Spacing.md,
    fontWeight: FontWeight.medium,
  },
  successTitle: {
    fontSize: FontSize.xl,
    color: Colors.success,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.md,
  },
  successSub: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  labelSection: {
    marginBottom: Spacing.lg,
  },
  labelTitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  chipActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
  },
  chipTextActive: {
    color: Colors.gold,
    fontWeight: FontWeight.semibold,
  },
  unsupported: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  actions: {
    gap: Spacing.md,
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
  primaryBtnText: {
    color: Colors.black,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  btnDisabled: {
    backgroundColor: Colors.lightGrey,
  },
})
