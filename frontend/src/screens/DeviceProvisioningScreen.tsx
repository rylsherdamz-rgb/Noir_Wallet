import { useState, useEffect, useRef, Fragment } from 'react'
import {
  View,
  Text,
  TextInput,
  Animated,
  Easing,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { sha256 } from '@noble/hashes/sha2.js'
import { Buffer } from 'buffer'
import { useNfc } from '@/hooks/useNfc'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { x402 } from '@/domain/x402'
import { walletService } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'
import { AppConfig } from '@/constants/config'
import { Device } from '@/types'
import { useRouter } from 'expo-router'

type Step = 'intro' | 'scanning' | 'confirm' | 'registering' | 'success' | 'error'

const LABELS = ['My Wallet Card', 'Daily Carry', 'Home Key']
const OTHER = 'Other'

export function DeviceProvisioningScreen() {
  const router = useRouter()
  const { isSupported, isEnabled, lastTag, error, scanTag, writeToTag, goToNfcSettings, clearTag } = useNfc()
  const { user, addDevice } = useAppStore()
  const [step, setStep] = useState<Step>('intro')
  const [label, setLabel] = useState('')
  const [customName, setCustomName] = useState('')
  const [agentCreated, setAgentCreated] = useState(false)

  const [nfcWritten, setNfcWritten] = useState<boolean | null>(null)
  const [displayLabel, setDisplayLabel] = useState('')
  const [agentPubKey, setAgentPubKey] = useState('')
  const [tagUid, setTagUid] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [balanceXlm, setBalanceXlm] = useState<string | null>(null)
  const [funding, setFunding] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const pulse = useState(new Animated.Value(1))[0]
  const spin = useState(new Animated.Value(0))[0]
  const spinner = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const FRIENDBOT_URL = stellarService.networkName === 'testnet'
    ? `https://friendbot-testnet.stellar.org`
    : null

  useEffect(() => {
    if (step === 'scanning' || step === 'registering') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.6, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      )
      const spinAnim = Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true }),
      )
      anim.start()
      if (step === 'registering') spinAnim.start()
      return () => { anim.stop(); spinAnim.stop() }
    }
  }, [step])

  useEffect(() => {
    if (step !== 'confirm' || !user?.stellarPublicKey) return
    ;(async () => {
      const funded = await stellarService.accountExists(user.stellarPublicKey)
      if (!funded) {
        setFunding(true)
        setBalanceXlm('Funding...')
        const ok = await stellarService.fundAccount(user.stellarPublicKey, 3)
        if (ok) {
          await stellarService.waitForAccount(user.stellarPublicKey)
        }
        setFunding(false)
      }
      try {
        const bal = await stellarService.getBalance(user.stellarPublicKey)
        setBalanceXlm(bal.xlm.toFixed(2))
      } catch {
        setBalanceXlm('—')
      }
    })()
  }, [step, user?.stellarPublicKey])

  const handleScan = async () => {
    setStep('scanning')
    try {
      const tag = await scanTag()
      if (!tag || !tag.uid) {
        setStep('error')
        return
      }

      const _displayLabel = label === OTHER && customName.trim()
        ? customName.trim()
        : label || `${user?.displayName || 'My'} Card`

      setDisplayLabel(_displayLabel)
      setTagUid(tag.uid)
      setStep('confirm')
    } catch {
      setStep('error')
    }
  }

  const handleRegister = async () => {
    setStep('registering')
    setRegisterError('')

    try {
      setStatusMessage('Loading wallet keys...')
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret) {
        setStep('error')
        setRegisterError('No wallet loaded.')
        return
      }

      // HD-derived agent is the source of truth — never trust the x402 cache
      // for which pubkey to register, since it may be stale from a prior wallet.
      const derivedAgentPub = keys.agentPublic
      let _agentPubKey = derivedAgentPub
      setAgentPubKey(_agentPubKey)
      setAgentCreated(true)
      try {
        // Sync the x402 SecureStore cache to the HD-derived agent keys.
        await x402.createAgent()
      } catch {
        // x402 failure shouldn't block device linking
      }

      setStatusMessage('Hashing device UID...')
      const hash = sha256(new TextEncoder().encode(tagUid))
      const hashHex = Buffer.from(hash.buffer, hash.byteOffset, hash.byteLength).toString('hex')

      if (!_agentPubKey) {
        setStep('error')
        setRegisterError('No agent public key — wallet may be uninitialized.')
        return
      }

      // ── Register device + agent sharing one Horizon account load ──
      setStatusMessage('Registering device and agent on Stellar...')
      try {
        await x402.registerDeviceAndAgentOnChain({
          walletSecret: keys.stellarSecret,
          deviceHashHex: hashHex,
          agentPublicKey: _agentPubKey,
        })
      } catch (e: any) {
        const msg = (e as any)?.message ?? ''
        if (!msg.includes('Error(Contract, #4)') && !msg.includes('Error(Contract, #3)') && !msg.includes('AlreadyRegistered')) {
          throw e
        }
      }

      setStatusMessage('Writing to NFC tag...')
      try {
        await writeToTag({
          walletAddress: keys.stellarPublic,
          deviceLabel: displayLabel,
          activationUrl: `noirwallet://device/${hashHex}`,
        })
        setNfcWritten(true)
      } catch (e: any) {
        setNfcWritten(false)
        console.warn('NFC write failure (non-blocking):', e?.message)
      }

      setStatusMessage('Confirmed on-chain!')

      const newDevice: Device = {
        id: hashHex,
        userId: user?.id || 'local',
        deviceUidHash: hashHex,
        label: displayLabel,
        agentPublicKey: _agentPubKey,
        status: 'active',
        dailySpendLimitCents: 500000,
        accumulatedTodayCents: 0,
        lastTapAt: null,
        createdAt: new Date().toISOString(),
      }
      addDevice(newDevice)
      try {
        const { apiService } = await import('@/services/api')
        await apiService.registerDevice(hashHex, displayLabel)
      } catch { /* non-critical */ }
      setStep('success')
    } catch (err: any) {
      setRegisterError(err?.message ?? 'Registration failed')
      setStep('error')
    }
  }

  const fundWallet = async () => {
    const pk = user?.stellarPublicKey
    if (!pk) return
    setStatusMessage('Funding wallet via Friendbot...')
    const ok = await stellarService.fundAccount(pk, 5)
    if (ok) {
      await stellarService.waitForAccount(pk)
      try {
        const bal = await stellarService.getBalance(pk)
        setBalanceXlm(bal.xlm.toFixed(2))
      } catch {
        setBalanceXlm('—')
      }
      setStatusMessage('Wallet funded!')
    } else {
      setStatusMessage('Funding failed — check network connection')
    }
  }

  const reset = () => {
    setStep('intro')
    setDisplayLabel('')
    setAgentPubKey('')
    setTagUid('')
    setStatusMessage('')
    setRegisterError('')
    clearTag()
  }

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg">
      <View className="flex-1 px-6 justify-between pt-6 pb-8">
        <View className="items-center">
          <NoirLogo variant="mark" size={48} />
          <Text className="text-2xl text-white font-bold mt-4">Link Your Device</Text>
          <Text className="text-sm text-mutedWhite text-center mt-2 leading-5">
            Tap your {user?.displayName ? `${user.displayName}'s ` : ''}NFC tag against the back of your phone to link it
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          {step === 'intro' && !isEnabled && (
            <View className="items-center gap-4">
              <Ionicons name="radio-outline" size={64} color={Colors.warning} />
              <Text className="text-xl text-[#F0B429] font-bold">NFC is Off</Text>
              <Text className="text-sm text-mutedWhite text-center leading-5 px-8">
                Enable NFC in your phone's settings to link a device
              </Text>
            </View>
          )}
          {step === 'intro' && isEnabled && (
            <View className="flex-row items-center gap-4 flex-shrink">
              <View className="w-14 h-[84] rounded-[14px] border-2 border-mutedWhite bg-surfaceBg relative items-center justify-center overflow-visible">
                <View className="w-11 h-[62] rounded-[6px] bg-[#121212] items-center pt-2 relative">
                  <View className="w-4 h-1 rounded-[2px] bg-midGrey" />
                </View>
                <View className="absolute w-[38] h-[38] rounded-full bg-[#C6A15B20] items-center justify-center border-[1.5px] border-[#C6A15B30]" style={{ top: '50%', left: '50%', transform: [{ translateX: -19 }, { translateY: -19 }] }}>
                  <Ionicons name="radio" size={20} color={Colors.gold} />
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color={Colors.mutedWhite} />
              <View className="w-14 h-[84] rounded-lg bg-[#2C2C2C] items-center justify-center border border-borderGrey">
                <Ionicons name="card-outline" size={24} color={Colors.white} />
              </View>
            </View>
          )}

          {step === 'scanning' && (
            <View className="items-center justify-center w-[180] h-[180]">
              <Animated.View className="absolute w-[140] h-[140] rounded-full border-2 border-gold" style={{ left: '50%', top: '50%', marginLeft: -70, marginTop: -70, transform: [{ scale: pulse }] }} />
              <View className="w-20 h-20 rounded-full bg-[#C6A15B15] items-center justify-center">
                <Ionicons name="radio" size={40} color={Colors.gold} />
              </View>
              <Text className="text-sm text-gold mt-4 font-medium">Tap your NFC tag against the phone</Text>
            </View>
          )}

          {step === 'confirm' && (
            <View className="items-center">
              <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
              <Text className="text-2xl text-[#3ED598] font-bold mt-4">Tag Read</Text>
              <Text className="text-sm text-mutedWhite text-center mt-1">Ready to register {displayLabel} on Stellar</Text>
            </View>
          )}

          {step === 'registering' && (
            <View className="items-center">
              <Animated.View style={{ transform: [{ rotate: spinner }] }}>
                <Ionicons name="sync" size={48} color={Colors.gold} />
              </Animated.View>
              <Text className="text-base text-gold mt-4 font-medium">{statusMessage || 'Registering on-chain...'}</Text>
              <View className="mt-6 self-stretch px-8">
                <StepRow done={true} active={false} label="NFC tag read" />
                <StepRow done={false} active={true} label={statusMessage || 'Working...'} />
              </View>
            </View>
          )}

          {step === 'success' && (
            <View className="items-center">
              <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
              <Text className="text-2xl text-[#3ED598] font-bold mt-4">Linked!</Text>
              <Text className="text-sm text-mutedWhite text-center mt-1">{displayLabel} is now paired and registered on-chain</Text>
              <View className="flex-row items-center gap-1 mt-2">
                {nfcWritten === true
                  ? <Ionicons name="checkmark" size={14} color={Colors.success} />
                  : nfcWritten === false
                    ? <Ionicons name="close-circle" size={14} color={Colors.danger} />
                    : <Ionicons name="remove-circle-outline" size={14} color={Colors.mutedWhite} />}
                <Text className={`text-xs ${nfcWritten === false ? 'text-[#FF5A5F]' : 'text-mutedWhite'}`}>
                  {nfcWritten === true
                    ? 'NFC tag written'
                    : nfcWritten === false
                      ? 'NFC tag write FAILED — retry from settings'
                      : 'NFC tag write skipped'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mt-2">
                <Ionicons name="checkmark" size={14} color={Colors.success} />
                <Text className="text-xs text-mutedWhite">Device registered on Stellar</Text>
              </View>
              {agentCreated && (
                <View className="flex-row items-center gap-1 mt-2">
                  <Ionicons name="checkmark" size={14} color={Colors.success} />
                  <Text className="text-xs text-mutedWhite">Payment agent enrolled</Text>
                </View>
              )}

              {agentCreated && (
                <View className="flex-row items-center gap-1 mt-4 px-4 py-2 rounded-full bg-[#C6A15B15] border border-[#C6A15B25]">
                  <Ionicons name="flash-outline" size={14} color={Colors.gold} />
                  <Text className="text-xs text-gold font-medium">x402 agent ready — tap to pay without signing</Text>
                </View>
              )}
            </View>
          )}

          {step === 'error' && (
            <View className="items-center">
              <Ionicons name="close-circle" size={72} color={Colors.danger} />
              <Text style={{ color: Colors.danger }} className="text-2xl text-[#FF5A5F] font-bold mt-4">{registerError || error || 'Failed'}</Text>
              <Text className="text-sm text-mutedWhite text-center mt-1">{registerError ? 'Tap Try Again to retry registration' : 'Hold the tag steady against the back of your phone'}</Text>
            </View>
          )}
        </View>

        {step === 'intro' && isEnabled && (
          <View className="mb-6">
            <Text className="text-sm text-mutedWhite mb-2 text-center">Name this device</Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {LABELS.map((l) => (
                <PressableScale
                  key={l}
                  className={`flex-row items-center px-4 py-2 rounded-full bg-[#2C2C2C] border border-borderGrey ${label === l ? 'bg-[#C6A15B20] border-gold' : ''}`}
                  onPress={() => { setLabel(l); setCustomName('') }}
                >
                  <Text className={`text-sm text-mutedWhite ${label === l ? 'text-gold font-semibold' : ''}`}>{l}</Text>
                </PressableScale>
              ))}
              <PressableScale
                className={`flex-row items-center px-4 py-2 rounded-full bg-[#2C2C2C] border border-borderGrey ${label === OTHER ? 'bg-[#C6A15B20] border-gold' : ''}`}
                onPress={() => { setLabel(OTHER); setCustomName(''); inputRef.current?.focus() }}
              >
                <Ionicons name="pencil-outline" size={13} color={label === OTHER ? Colors.gold : Colors.mutedWhite} />
                <Text className={`text-sm text-mutedWhite ml-1 ${label === OTHER ? 'text-gold font-semibold' : ''}`}>Other</Text>
              </PressableScale>
            </View>
            {label === OTHER && (
              <TextInput
                ref={inputRef}
                className="mt-2 px-4 py-4 rounded-xl bg-[#2C2C2C] border border-[#C6A15B50] text-white text-base text-center"
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
          <Text className="text-xs text-[#F0B429] text-center mt-2">NFC unavailable on this device</Text>
        )}

        <View className="gap-4">
          {step === 'intro' && !isEnabled && (
            <PressableScale
              className={`flex-row items-center justify-center bg-gold py-4 rounded-xl gap-2 min-h-[52] ${!isSupported ? 'bg-[#2C2C2C]' : ''}`}
              onPress={goToNfcSettings}
              disabled={!isSupported}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.black} />
              <Text className="text-xl font-bold text-black">Open NFC Settings</Text>
            </PressableScale>
          )}
          {step === 'intro' && isEnabled && (
            <PressableScale
              className="flex-row items-center justify-center bg-gold py-4 rounded-xl gap-2 min-h-[52]"
              onPress={handleScan}
            >
              <Ionicons name="radio" size={20} color={Colors.black} />
              <Text className="text-xl font-bold text-black">Scan My Tag</Text>
            </PressableScale>
          )}
          {step === 'registering' && (
            <PressableScale
              className="flex-row items-center justify-center bg-[#2C2C2C] py-4 rounded-xl gap-2 min-h-[52]"
              disabled
            >
              <Ionicons name="sync" size={20} color={Colors.gold} />
              <Text className="text-xl font-bold text-gold">Registering...</Text>
            </PressableScale>
          )}
          {step === 'success' && (
            <>
              <PressableScale className="flex-row items-center justify-center bg-transparent border border-gold py-4 rounded-xl gap-2 min-h-[52]" onPress={() => router.push('/fiat')}>
                <Ionicons name="cash-outline" size={20} color={Colors.white} />
                <Text className="text-xl font-bold text-gold">Cash In via PDAX</Text>
              </PressableScale>
              <PressableScale className="flex-row items-center justify-center bg-gold py-4 rounded-xl gap-2 min-h-[52]" onPress={reset}>
                <Text className="text-xl font-bold text-black">Done</Text>
              </PressableScale>
            </>
          )}
          {step === 'error' && registerError?.includes('does not exist on-chain') && (
            <>
              <PressableScale className="flex-row items-center justify-center bg-transparent border border-gold py-4 rounded-xl gap-2 min-h-[52]" onPress={fundWallet}>
                <Ionicons name="water-outline" size={20} color={Colors.white} />
                <Text className="text-xl font-bold text-gold">Fund Wallet (Friendbot)</Text>
              </PressableScale>
              <PressableScale className="flex-row items-center justify-center bg-gold py-4 rounded-xl gap-2 min-h-[52]" onPress={reset}>
                <Text className="text-xl font-bold text-black">Try Again</Text>
              </PressableScale>
            </>
          )}
          {step === 'error' && !registerError?.includes('does not exist on-chain') && (
            <PressableScale className="flex-row items-center justify-center bg-gold py-4 rounded-xl gap-2 min-h-[52]" onPress={reset}>
              <Text className="text-xl font-bold text-black">Try Again</Text>
            </PressableScale>
          )}
        </View>
      </View>

      <Modal
        visible={step === 'confirm'}
        transparent
        animationType="fade"
        onRequestClose={() => setStep('error')}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-surfaceBg rounded-t-3xl px-6 pt-4 pb-20 items-center">
            <View className="w-9 h-1 rounded-[2px] bg-midGrey mb-6" />
            <View className="w-[72] h-[72] rounded-full bg-[#C6A15B15] border-[1.5px] border-[#C6A15B30] items-center justify-center mb-4">
              <Ionicons name="shield-checkmark-outline" size={48} color={Colors.gold} />
            </View>
            <Text className="text-2xl text-white font-bold mb-1">Signature Request</Text>
            <Text className="text-sm text-mutedWhite text-center mb-6">
              Register <Text className="font-bold text-white">{displayLabel}</Text> on Stellar
            </Text>

            <View className="w-full bg-[#2C2C2C] rounded-xl p-4 gap-2 mb-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-mutedWhite">Contract</Text>
                <Text className="text-sm text-white font-medium max-w-[60%]" numberOfLines={1}>
                  DeviceRegistry
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-mutedWhite">Action</Text>
                <Text className="text-sm text-white font-medium max-w-[60%]">register_device</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-mutedWhite">Device</Text>
                <Text className="text-sm text-white font-medium max-w-[60%]">{displayLabel}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-mutedWhite">Network</Text>
                <Text className="text-sm text-white font-medium max-w-[60%]">Stellar {stellarService.networkName === 'testnet' ? 'Testnet' : 'Mainnet'}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-mutedWhite">Wallet</Text>
                <Text className="text-sm text-white font-medium max-w-[60%]" numberOfLines={1}>
                  {user?.stellarPublicKey?.slice(0, 12)}…
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-mutedWhite">Balance</Text>
                <Text className={`text-sm text-white font-medium max-w-[60%] ${balanceXlm === '0' ? 'text-[#FF5A5F]' : ''}`}>
                  {balanceXlm ? `${balanceXlm} XLM` : 'Checking...'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-1 mb-6">
              <Ionicons name="information-circle-outline" size={14} color={Colors.mutedWhite} />
              <Text className="text-xs text-mutedWhite">
                {balanceXlm === '0' || balanceXlm === 'Funding...'
                  ? 'Funding wallet via Friendbot...'
                  : balanceXlm
                    ? 'Network fee: ~0.001 XLM'
                    : 'Checking balance...'
                }
              </Text>
            </View>

            <View className="flex-row gap-4 w-full">
              <PressableScale
                className="flex-1 py-4 rounded-xl border border-borderGrey items-center justify-center"
                onPress={() => setStep('error')}
              >
                <Text className="text-base text-mutedWhite font-semibold">Reject</Text>
              </PressableScale>
              <PressableScale
                className={`flex-2 flex-row py-4 rounded-xl bg-gold items-center justify-center gap-2 ${(balanceXlm === '0' || funding) ? 'bg-[#2C2C2C]' : ''}`}
                onPress={handleRegister}
                disabled={balanceXlm === '0' || funding}
              >
                <Ionicons name="pencil-outline" size={18} color={balanceXlm === '0' || funding ? Colors.mutedWhite : Colors.black} />
                <Text className={`text-base font-bold ${(balanceXlm === '0' || funding) ? 'text-mutedWhite' : 'text-black'}`}>
                  {funding ? 'Funding...' : balanceXlm === '0' ? 'No XLM' : 'Sign'}
                </Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function StepRow({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-[10px] py-1.5">
      <View
        className={`w-[18] h-[18] rounded-full border-2 items-center justify-center ${done ? 'bg-[#3ED598] border-[#3ED598]' : ''} ${active ? 'border-gold' : ''} ${!done && !active ? 'border-midGrey' : ''}`}
      >
        {done ? (
          <Ionicons name="checkmark" size={10} color={Colors.black} />
        ) : active ? (
          <View className="w-1.5 h-1.5 rounded-full bg-gold" />
        ) : null}
      </View>
      <Text className={`text-sm ${active ? 'text-gold font-medium' : 'text-mutedWhite'}`}>{label}</Text>
    </View>
  )
}
