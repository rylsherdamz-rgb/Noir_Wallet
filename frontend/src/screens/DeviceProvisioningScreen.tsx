import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNfc } from '@/hooks/useNfc'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { x402 } from '@/domain/x402'
import { Device } from '@/types'

type Step = 'intro' | 'scanning' | 'writing' | 'success' | 'error'

const LABELS = ['My Wallet Card', 'Daily Carry', 'Home Key']
const OTHER = 'Other'

export function DeviceProvisioningScreen() {
  const { isSupported, isEnabled, lastTag, error, scanTag, writeToTag, goToNfcSettings, clearTag } = useNfc()
  const { user, addDevice } = useAppStore()
  const [step, setStep] = useState<Step>('intro')
  const [label, setLabel] = useState('')
  const [customName, setCustomName] = useState('')
  const [agentCreated, setAgentCreated] = useState(false)
  const inputRef = useRef<TextInput>(null)
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
    try {
      const tag = await scanTag()
      if (!tag) {
        setStep('error')
        return
      }

      setStep('writing')
      const displayLabel = label === OTHER && customName.trim()
        ? customName.trim()
        : label || `${user?.displayName || 'My'} Card`

      let agentPubKey = ''
      try {
        const hasAgent = await x402.hasAgent()
        if (!hasAgent) {
          const agent = await x402.createAgent()
          agentPubKey = agent.publicKey
          setAgentCreated(true)
        } else {
          const agent = await x402.getAgent()
          agentPubKey = agent?.publicKey || ''
        }
      } catch {
        // x402 failure shouldn't block device linking
      }

      const written = await writeToTag({
        walletAddress: user?.stellarPublicKey || 'pending',
        deviceLabel: displayLabel,
        agentPublicKey: agentPubKey,
        activationUrl: 'noirwallet://activate',
      })
      if (written) {
        const newDevice: Device = {
          id: Math.random().toString(36).slice(2),
          userId: user?.id || 'local',
          deviceUidHash: tag.uid,
          label: displayLabel,
          agentPublicKey: agentPubKey,
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
    } catch {
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
          {step === 'intro' && !isEnabled && (
            <View style={styles.nfcOffWrap}>
              <Ionicons name="radio-outline" size={64} color={Colors.warning} />
              <Text style={styles.nfcOffTitle}>NFC is Off</Text>
              <Text style={styles.nfcOffSub}>
                Enable NFC in your phone's settings to link a device
              </Text>
            </View>
          )}
          {step === 'intro' && isEnabled && (
            <View style={styles.illustration}>
              <View style={styles.phoneBody}>
                <View style={styles.phoneScreen}>
                  <View style={styles.phoneNotch} />
                </View>
                <View style={styles.antenna}>
                  <Ionicons name="radio" size={20} color={Colors.gold} />
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
              {agentCreated && (
                <View style={styles.agentBadge}>
                  <Ionicons name="flash-outline" size={14} color={Colors.gold} />
                  <Text style={styles.agentBadgeText}>x402 agent ready — tap to pay without signing</Text>
                </View>
              )}
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

        {step === 'intro' && isEnabled && (
          <View style={styles.labelSection}>
            <Text style={styles.labelTitle}>Name this device</Text>
            <View style={styles.labelRow}>
              {LABELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.chip, label === l && styles.chipActive]}
                  onPress={() => { setLabel(l); setCustomName('') }}
                >
                  <Text style={[styles.chipText, label === l && styles.chipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, label === OTHER && styles.chipActive]}
                onPress={() => { setLabel(OTHER); setCustomName(''); inputRef.current?.focus() }}
              >
                <Ionicons name="pencil-outline" size={13} color={label === OTHER ? Colors.gold : Colors.mutedWhite} />
                <Text style={[styles.chipText, label === OTHER && styles.chipTextActive, { marginLeft: 4 }]}>Other</Text>
              </TouchableOpacity>
            </View>
            {label === OTHER && (
              <TextInput
                ref={inputRef}
                style={styles.customInput}
                placeholder="Enter custom name..."
                placeholderTextColor={Colors.mutedWhite}
                value={customName}
                onChangeText={setCustomName}
                maxLength={32}
              />
            )}
          </View>
        )}
        {!isSupported && (
          <Text style={styles.unsupported}>NFC unavailable on this device</Text>
        )}

        <View style={styles.actions}>
          {step === 'intro' && !isEnabled && (
            <TouchableOpacity
              style={[styles.primaryBtn, !isSupported && styles.btnDisabled]}
              onPress={goToNfcSettings}
              disabled={!isSupported}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.black} />
              <Text style={styles.primaryBtnText}>Open NFC Settings</Text>
            </TouchableOpacity>
          )}
          {step === 'intro' && isEnabled && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleScan}
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
  phoneBody: {
    width: 56,
    height: 84,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.mutedWhite,
    backgroundColor: Colors.black,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  phoneScreen: {
    width: 44,
    height: 62,
    borderRadius: 6,
    backgroundColor: Colors.darkGrey,
    alignItems: 'center',
    paddingTop: 8,
  },
  phoneNotch: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.midGrey,
  },
  antenna: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.gold + '20',
    borderWidth: 1.5,
    borderColor: Colors.gold + '30',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -19 }, { translateY: -19 }],
  },
  cardImg: {
    width: 56,
    height: 84,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold + '15',
    borderWidth: 1,
    borderColor: Colors.gold + '25',
  },
  agentBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.medium,
  },
  customInput: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.gold + '50',
    color: Colors.white,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  nfcOffWrap: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  nfcOffTitle: {
    fontSize: FontSize.lg,
    color: Colors.warning,
    fontWeight: FontWeight.bold,
  },
  nfcOffSub: {
    fontSize: FontSize.sm,
    color: Colors.mutedWhite,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.xl,
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
