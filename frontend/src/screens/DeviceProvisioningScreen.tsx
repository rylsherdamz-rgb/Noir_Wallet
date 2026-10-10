import { colorWithOpacity } from '@/constants/designTokens'
import { useState, useEffect, useRef, Fragment } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
  Linking,
  ScrollView,
} from 'react-native'
import { PressableScale } from '@/components/brand/PressableScale'
import { NfcScanPulse } from '@/components/brand/NfcScanPulse'
import { VerifyingPulse } from '@/components/brand/VerifyingPulse'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { sha256 } from '@noble/hashes/sha2.js'
import { Buffer } from 'buffer'
import { useNfc } from '@/hooks/useNfc'
import { useAppStore } from '@/store/useAppStore'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts, Gradient } from '@/constants/theme'
import { Sheet } from '@/components/popup/Popup'
import { Button } from '@/components/Button'
import { NoirLogo } from '@/components/brand/NoirLogo'
import { x402, buildAgentPolicy, DEFAULT_AGENT_CAP_XLM, DeviceOwnedByOtherWalletError, type DeviceOwnership } from '@/domain/x402'
import { walletService } from '@/services/wallet'
import { stellarService } from '@/services/stellar-service'
import { AppConfig } from '@/constants/config'
import { Device } from '@/types'
import { useRouter } from 'expo-router'
import { logger } from '@/lib/logger'
import * as ClipboardX from 'expo-clipboard'
import { ErrorState, NetworkTag } from '@/components/ui/ErrorState'
import { KeyValueRow, TextAction } from '@/components/ui/List'
import { TapGlyph } from '@/components/brand/BrandGlyph'

type Step =
  | 'intro'
  | 'scanning'
  | 'checking'
  | 'confirm'
  | 'registering'
  | 'success'
  | 'owned_other'
  | 'already_linked'
  | 'error'

const LABELS = ['My Wallet Card', 'Daily Carry', 'Home Key']

// Agent policy presets passed to agent_registry.register_agent.
// Per-payment cap in XLM (0 = no cap) and authorization lifetime in days (0 = never expires).
const SPEND_LIMITS = [
  { label: 'No cap', value: 0 },
  { label: '10 XLM', value: 10 },
  { label: '25 XLM', value: 25 },
  { label: '50 XLM', value: 50 },
  { label: '100 XLM', value: 100 },
]
const EXPIRY_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]
const OTHER = 'Other'

// Ordered provisioning phases shown in the progress tracker.
type Phase = 'keys' | 'agent' | 'chain'
const PHASES: { key: Phase; label: string }[] = [
  { key: 'keys', label: 'Unlock wallet keys' },
  { key: 'agent', label: 'Create payment agent' },
  { key: 'chain', label: 'Register on Stellar' },
]

const hashTagUid = (uid: string) => {
  const hash = sha256(new TextEncoder().encode(uid))
  return Buffer.from(hash.buffer, hash.byteOffset, hash.byteLength).toString('hex')
}

/** Map raw scan / RPC / contract errors to something a person can act on. */
function describeError(registerError: string, scanError: string | null) {
  const msg = registerError || scanError || ''
  if (!registerError) {
    return {
      kind: 'tagRead' as const,
      icon: 'radio-outline' as const,
      title: 'Couldn’t read the card',
      body: 'Hold it flat on the back of the phone, near the camera, until it vibrates.',
      raw: scanError ?? '',
    }
  }
  if (msg.includes('does not exist on-chain') || msg.includes('Account not found')) {
    return { kind: 'unfunded' as const, icon: 'wallet-outline' as const, title: 'Wallet not funded yet', body: 'New Stellar wallets need a little XLM before they can sign.', raw: msg }
  }
  if (/insufficient|underfunded|INSUFFICIENT/i.test(msg)) {
    return { kind: 'lowBalance' as const, icon: 'wallet-outline' as const, title: 'Not enough XLM', body: 'Add a little XLM to cover the network fee and the card’s reserve, then try again.', raw: msg }
  }
  if (/timed out|network|fetch|unreachable/i.test(msg)) {
    return { kind: 'offline' as const, icon: 'cloud-offline-outline' as const, title: 'Stellar didn’t respond', body: 'Check your connection and try again. Nothing was sent and nothing was charged.', raw: msg }
  }
  // registerDeviceAndAgentOnChain already absorbs AlreadyRegistered, so a #4
  // reaching here is agent_registry InvalidPolicy (e.g. expiry in the past).
  if (msg.includes('Error(Contract, #4)') || msg.includes('InvalidPolicy')) {
    return { kind: 'generic' as const, icon: 'options-outline' as const, title: 'Stellar rejected the card’s settings', body: 'The agent’s spending settings weren’t accepted. Try linking again.', raw: msg }
  }
  if (msg.includes('not configured')) {
    return { kind: 'notConfigured' as const, icon: 'construct-outline' as const, title: 'Cards aren’t available on this network yet', body: 'The card contracts aren’t deployed here in this version. Sending and receiving still work.', raw: msg }
  }
  if (msg.includes('No wallet loaded') || msg.includes('No agent public key')) {
    return { kind: 'generic' as const, icon: 'key-outline' as const, title: 'Wallet locked', body: 'Unlock or set up your wallet, then try linking again.', raw: msg }
  }
  return { kind: 'generic' as const, icon: 'alert-circle-outline' as const, title: 'Couldn’t link the card', body: 'Something went wrong while registering. Nothing was charged — you can safely try again.', raw: msg }
}

export function DeviceProvisioningScreen() {
  const router = useRouter()
  const { isSupported, isEnabled, lastTag, error, scanTag, goToNfcSettings, clearTag } = useNfc()
  const { user, addDevice, network } = useAppStore()
  const [step, setStep] = useState<Step>('intro')
  const [label, setLabel] = useState('')
  const [customName, setCustomName] = useState('')
  const [agentCreated, setAgentCreated] = useState(false)

  const [displayLabel, setDisplayLabel] = useState('')
  const [agentPubKey, setAgentPubKey] = useState('')
  const [tagUid, setTagUid] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [balanceXlm, setBalanceXlm] = useState<string | null>(null)
  const [funding, setFunding] = useState(false)
  const [tagHash, setTagHash] = useState('')
  const [ownership, setOwnership] = useState<DeviceOwnership | null>(null)
  const [phase, setPhase] = useState<Phase>('keys')
  const [showErrorDetail, setShowErrorDetail] = useState(false)
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
    // 'checking' used to drive this too, but it no longer renders anything
    // tied to pulse/spin — both spots now use the reanimated VerifyingPulse.
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

      // Check on-chain ownership BEFORE asking for a signature, so the user
      // never signs a transaction that is guaranteed to fail.
      const hashHex = hashTagUid(tag.uid)
      setTagHash(hashHex)
      const walletPub = user?.stellarPublicKey
      if (walletPub) {
        setStep('checking')
        try {
          const owned = await x402.getDeviceOwnership(hashHex, walletPub)
          setOwnership(owned)
          if (owned.status === 'other') { setStep('owned_other'); return }
          if (owned.status === 'mine') { setStep('already_linked'); return }
        } catch (e: any) {
          // Lookup failure is non-fatal: registerDeviceAndAgentOnChain re-checks.
          logger.warn('[provision] ownership check failed, continuing:', e?.message)
        }
      }
      setStep('confirm')
    } catch {
      setStep('error')
    }
  }

  const handleRegister = async () => {
    setStep('registering')
    setRegisterError('')
    setShowErrorDetail(false)
    setPhase('keys')

    try {
      setStatusMessage('Loading wallet keys...')
      const keys = await walletService.loadKeys()
      if (!keys?.stellarSecret) {
        setStep('error')
        setRegisterError('No wallet loaded.')
        return
      }

      setStatusMessage('Hashing device UID...')
      const hashHex = tagHash || hashTagUid(tagUid)

      // Each NFC card gets its OWN agent (independent balance + budget).
      // If this device hash already has an agent (re-provisioning), reuse it;
      // otherwise allocate a fresh HD-derived agent index.
      setPhase('agent')
      setStatusMessage('Creating agent for this card...')
      let _agentPubKey: string
      try {
        const existingIdx = await x402.getAgentIndexForDevice(hashHex)
        if (existingIdx != null) {
          const existing = await x402.getAgent(existingIdx)
          _agentPubKey = existing?.publicKey ?? keys.agentPublic
        } else {
          const fresh = await x402.createAgent({ label: displayLabel, deviceHash: hashHex })
          _agentPubKey = fresh.publicKey
        }
      } catch (e: any) {
        logger.warn('agent creation failed, falling back to legacy agent:', e?.message)
        _agentPubKey = keys.agentPublic
      }
      setAgentPubKey(_agentPubKey)
      setAgentCreated(true)

      if (!_agentPubKey) {
        setStep('error')
        setRegisterError('No agent public key — wallet may be uninitialized.')
        return
      }

      // ── Register device + agent sharing one Horizon account load ──
      setPhase('chain')
      setStatusMessage('Registering device and agent on Stellar...')
      try {
        // Already-registered is handled inside; anything else (incl.
        // agent_registry InvalidPolicy) must surface as an error.
        await x402.registerDeviceAndAgentOnChain({
          walletSecret: keys.stellarSecret,
          deviceHashHex: hashHex,
          agentPublicKey: _agentPubKey,
          policy: buildAgentPolicy({ maxAmountXlm: DEFAULT_AGENT_CAP_XLM, expiryDays: 0 }),
        })
      } catch (e: any) {
        if (e instanceof DeviceOwnedByOtherWalletError) {
          setOwnership({ status: 'other', owner: e.owner, agent: '', createdAt: e.createdAt, active: true })
          setStep('owned_other')
          return
        }
        throw e
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
    setTagHash('')
    setOwnership(null)
    setPhase('keys')
    setShowErrorDetail(false)
    clearTag()
  }

  const errorInfo = describeError(registerError, error)
  const onMainnet = network === 'mainnet'
  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/pos'))
  const copyMyAddress = async () => {
    if (!user?.stellarPublicKey) return
    await ClipboardX.setStringAsync(user.stellarPublicKey)
    setStatusMessage('Address copied')
  }
  const formatSecs = (s: number | null) => (s ? new Date(s * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')
  const short = (k?: string) => (k ? `${k.slice(0, 4)}…${k.slice(-4)}` : '—')
  const PHASE_LABELS = ['Card read', ...PHASES.map((p) => p.label)]
  const phaseIndex = PHASES.findIndex((x) => x.key === phase) + 1

  let content: React.ReactNode = null
  if (step === 'intro' && !isSupported) {
    content = <ErrorState icon="phone-portrait-outline" tone="neutral" title="This phone can’t read cards" message="It has no NFC reader. You can still send and receive XLM — just not tap to pay." primary={{ label: 'Back to wallet', onPress: close }} />
  } else if (step === 'intro' && !isEnabled) {
    content = <ErrorState icon="radio-outline" tone="neutral" title="NFC is off" message="Turn on NFC in your phone’s settings to link a card." primary={{ label: 'Open NFC settings', icon: 'settings-outline', onPress: goToNfcSettings }} secondary={{ label: 'Not now', onPress: close }} />
  } else if (step === 'intro') {
    content = (
      <>
        <View style={styles.center}>
          <TapGlyph size={56} color={Colors.gold} />
          <Text style={styles.title}>Link a card</Text>
          <Text style={styles.body}>Any NFC card or sticker works. Give it a name, then tap it on your phone.</Text>
        </View>
        <Text style={styles.nameLabel}>Name</Text>
        <View style={styles.chips}>
          {[...LABELS, OTHER].map((l) => (
            <PressableScale key={l} style={[styles.chip, label === l && styles.chipOn]} onPress={() => { setLabel(l); setCustomName(''); if (l === OTHER) inputRef.current?.focus() }} accessibilityRole="button" accessibilityState={{ selected: label === l }}>
              <Text style={[styles.chipText, label === l && styles.chipTextOn]}>{l === OTHER ? 'Other' : l}</Text>
            </PressableScale>
          ))}
        </View>
        {label === OTHER && (
          <TextInput ref={inputRef} style={styles.customInput} placeholder="Card name" placeholderTextColor={Colors.mutedWhite} value={customName} onChangeText={setCustomName} maxLength={32} accessibilityLabel="Card name" />
        )}
        <View style={styles.footer}><Button label="Scan card" icon="radio" onPress={handleScan} fullWidth /></View>
      </>
    )
  } else if (step === 'scanning' || step === 'checking') {
    content = (
      <>
        <View style={styles.center}>
          {step === 'scanning' ? <NfcScanPulse size={200} /> : <VerifyingPulse size={160} />}
          <Text style={styles.title}>{step === 'scanning' ? 'Hold your card to the phone' : 'Checking the card'}</Text>
          <Text style={styles.body}>{step === 'scanning' ? 'Back of the phone, near the camera' : 'Making sure it isn’t linked to another wallet'}</Text>
        </View>
        <View style={styles.footer}><Button label="Cancel" variant="secondary" onPress={reset} fullWidth /></View>
      </>
    )
  } else if (step === 'confirm') {
    content = (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
        <Text style={styles.title}>Card read</Text>
      </View>
    )
  } else if (step === 'registering') {
    content = (
      <>
        <View style={styles.center}>
          <VerifyingPulse size={150} />
          <Text style={styles.title}>Linking {displayLabel || 'your card'}</Text>
          {!!statusMessage && <Text style={styles.body}>{statusMessage}</Text>}
        </View>
        <View style={styles.steps}>
          {PHASE_LABELS.map((l, i) => <StepRow key={l} done={i < phaseIndex} active={i === phaseIndex} label={l} />)}
        </View>
      </>
    )
  } else if (step === 'success') {
    content = (
      <>
        <View style={styles.center}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          <Text style={styles.title}>Card linked</Text>
          <Text style={styles.body}>{displayLabel} is registered on Stellar{agentCreated ? ' and its agent is ready' : ''}. Top it up to start tapping.</Text>
        </View>
        <View style={styles.footer}>
          <Button label="Top up card" onPress={() => { const id = tagHash; reset(); router.replace(id ? `/agent-fund/${id}` : '/(tabs)/pos') }} fullWidth />
          <TextAction label="Done" color={Colors.cream} onPress={() => { reset(); router.replace('/(tabs)/pos') }} />
        </View>
      </>
    )
  } else if (step === 'owned_other' && ownership && ownership.status !== 'free') {
    content = (
      <ErrorState
        icon="lock-closed-outline" tone="danger"
        title="This card belongs to another wallet"
        message="It’s already registered on Stellar to a different owner, so it can’t be linked here."
        primary={{ label: 'Scan a different card', icon: 'radio', onPress: reset }}
        secondary={{ label: 'View owner on explorer', color: Colors.gold, onPress: () => Linking.openURL(`https://stellar.expert/explorer/${onMainnet ? 'public' : 'testnet'}/account/${ownership.owner}`) }}
      >
        <View style={styles.kvWrap}>
          <KeyValueRow label="Owner" value={short(ownership.owner)} mono />
          <KeyValueRow label="Linked" value={formatSecs(ownership.createdAt)} last />
        </View>
      </ErrorState>
    )
  } else if (step === 'already_linked') {
    content = (
      <ErrorState icon="checkmark-circle-outline" tone="success" title="Already linked to you" message={`${displayLabel || 'This card'} is already one of your cards. Nothing to do.`}
        primary={{ label: 'View my cards', onPress: () => { reset(); router.push('/cards') } }}
        secondary={{ label: 'Scan another card', onPress: reset }} />
    )
  } else if (step === 'error') {
    const k = errorInfo.kind
    if (k === 'unfunded' && !onMainnet) {
      content = (
        <ErrorState icon={errorInfo.icon} tone="brand" title={errorInfo.title} message={`${errorInfo.body} On Testnet it’s free.`} details={errorInfo.raw}
          primary={{ label: funding ? 'Funding…' : 'Get free test XLM', loading: funding, onPress: async () => { setFunding(true); await fundWallet(); setFunding(false) } }}
          secondary={{ label: 'Try again', onPress: reset }}>
          <NetworkTag network="testnet" />
          {!!statusMessage && <Text style={styles.status}>{statusMessage}</Text>}
        </ErrorState>
      )
    } else if (k === 'unfunded') {
      content = (
        <ErrorState icon={errorInfo.icon} tone="brand" title="Add XLM to get started" message="Stellar needs at least 2 XLM in a new wallet before it can sign. Send XLM here from an exchange or another wallet." details={errorInfo.raw}
          primary={{ label: 'Copy address', icon: 'copy-outline', onPress: copyMyAddress }}
          secondary={{ label: 'Show QR code', color: Colors.cream, onPress: () => router.push('/receive') }}>
          <NetworkTag network="mainnet" />
          <View style={styles.addrBox}>
            <Text style={styles.addrLabel}>Your address</Text>
            <Text style={styles.addr} selectable>{user?.stellarPublicKey}</Text>
          </View>
          {!!statusMessage && <Text style={styles.status}>{statusMessage}</Text>}
        </ErrorState>
      )
    } else if (k === 'lowBalance') {
      content = <ErrorState icon={errorInfo.icon} tone="warning" title={errorInfo.title} message={errorInfo.body} details={errorInfo.raw} primary={{ label: 'Add XLM', onPress: () => router.push('/receive') }} secondary={{ label: 'Try again', onPress: reset }} />
    } else if (k === 'notConfigured') {
      content = <ErrorState icon={errorInfo.icon} tone="neutral" title={errorInfo.title} message={errorInfo.body} details={errorInfo.raw} primary={{ label: onMainnet ? 'Switch to Testnet' : 'Back to wallet', onPress: () => { if (onMainnet) useAppStore.getState().setNetwork('testnet'); close() } }} />
    } else {
      content = <ErrorState icon={errorInfo.icon} tone={k === 'offline' ? 'neutral' : k === 'tagRead' ? 'warning' : 'danger'} title={errorInfo.title} message={errorInfo.body} details={errorInfo.raw}
        primary={{ label: k === 'tagRead' ? 'Scan again' : 'Try again', icon: k === 'tagRead' ? 'radio' : 'refresh', onPress: reset }}
        secondary={k === 'tagRead' ? { label: 'Cancel', onPress: close, color: Colors.white } : undefined} />
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {step !== 'registering' && (
          <PressableScale onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={Colors.white} />
          </PressableScale>
        )}
      </View>
      <View style={styles.flex}>{content}</View>

      <Sheet visible={step === 'confirm'} onClose={reset} title={`Link ${displayLabel}`} subtitle="Sign once to link it. It works until you revoke it.">
        <View style={styles.sheetPanel}>
          <KeyValueRow label="Card" value={displayLabel} />
          <KeyValueRow label="Network fee" value={`~0.001 XLM · ${onMainnet ? 'Mainnet' : 'Testnet'}`} last />
        </View>
        {balanceXlm === '0' && <Text style={styles.sheetWarn}>Your wallet has no XLM yet — add some before linking.</Text>}
        <View style={styles.sheetFooter}>
          <Button
            label={funding ? 'Funding…' : balanceXlm === '0' ? 'No XLM to sign with' : 'Sign & link'}
            icon="finger-print-outline"
            onPress={handleRegister}
            disabled={balanceXlm === '0' || funding}
            fullWidth
          />
        </View>
      </Sheet>
    </SafeAreaView>
  )
}

function StepRow({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <View style={styles.stepRow} accessibilityLabel={`${label}${done ? ', done' : active ? ', in progress' : ''}`}>
      <View style={styles.stepMark}>
        {done ? <Ionicons name="checkmark" size={16} color={Colors.gold} /> : active ? <VerifyingPulse size={14} /> : <View style={styles.stepDot} />}
      </View>
      <Text style={[styles.stepLabel, !done && !active && styles.stepLabelTodo]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  flex: { flex: 1 },
  header: { height: 56, paddingHorizontal: Spacing.md, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 10 },
  title: { fontFamily: Fonts.display, fontSize: 22, color: Colors.cream, textAlign: 'center', marginTop: 12 },
  body: { fontSize: FontSize.md - 1, color: Colors.mutedWhite, textAlign: 'center', lineHeight: 22, maxWidth: 300 },
  nameLabel: { fontSize: FontSize.sm - 1, color: Colors.mutedWhite, fontWeight: FontWeight.medium, textAlign: 'center', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 999, backgroundColor: Colors.midGrey },
  chipOn: { backgroundColor: Colors.cream },
  chipText: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  chipTextOn: { color: Colors.surfaceBg },
  customInput: { marginTop: Spacing.md, marginHorizontal: 20, height: 52, paddingHorizontal: Spacing.md, borderRadius: 14, backgroundColor: Colors.midGrey, color: Colors.white, fontSize: FontSize.md, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: Spacing.md, paddingBottom: Spacing.lg, gap: 4 },
  steps: { paddingHorizontal: 28, paddingBottom: Spacing.xl, gap: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepMark: { width: 18, alignItems: 'center' },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.borderGrey },
  stepLabel: { fontSize: FontSize.md - 1, color: Colors.white, fontWeight: FontWeight.medium },
  stepLabelTodo: { color: Colors.mutedWhite },
  kvWrap: { alignSelf: 'stretch', marginTop: Spacing.sm },
  addrBox: { alignSelf: 'stretch', marginTop: Spacing.md, padding: 14, borderRadius: 14, backgroundColor: Colors.midGrey },
  addrLabel: { fontSize: FontSize.xs, color: Colors.mutedWhite },
  addr: { fontFamily: Fonts.mono, fontSize: FontSize.sm - 1, lineHeight: 20, color: Colors.white, marginTop: 4 },
  status: { fontSize: FontSize.sm - 1, color: Colors.gold, marginTop: 6 },
  sheetPanel: { marginTop: Spacing.sm },
  sheetWarn: { fontSize: FontSize.sm - 1, color: Colors.warning, textAlign: 'center', marginTop: Spacing.sm },
  sheetFooter: { marginTop: Spacing.lg },
})
