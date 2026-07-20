import { useEffect, useState } from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { PressableScale } from '@/components/brand/PressableScale'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store/useAppStore'
import { x402 } from '@/domain/x402'
import type { AgentWallet } from '@/domain/x402'
import { DesignTokens, colorWithOpacity } from '@/constants/designTokens'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts } from '@/constants/theme'
import { SignalRipple } from '@/components/brand/SignalRipple'
import { TapGlyph } from '@/components/brand/BrandGlyph'
import { StatusPill } from '@/components/StatusPill'

const NOIR_MARK = require('../../assets/noir-mark.png')

export function AgentListScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { devices } = useAppStore()
  const [agent, setAgent] = useState<AgentWallet | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadAgent = async () => {
    const a = await x402.getAgent()
    setAgent(a)
  }

  useEffect(() => { loadAgent() }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAgent()
    setRefreshing(false)
  }

  const xlmBalance = agent ? (agent.balanceStroops / 10_000_000).toFixed(2) : '—'
  const budget = agent ? (agent.spendingBudgetStroops / 10_000_000).toFixed(2) : '—'
  const spent = agent ? (agent.totalSpentStroops / 10_000_000).toFixed(2) : '—'
  const remaining = agent
    ? Math.max(0, (agent.spendingBudgetStroops - agent.totalSpentStroops) / 10_000_000).toFixed(2) : '—'
  const pct = agent && agent.spendingBudgetStroops > 0
    ? Math.round((agent.totalSpentStroops / agent.spendingBudgetStroops) * 100) : 0

  const agentExists = agent !== null

  return (
    <SafeAreaView className="flex-1 bg-surfaceBg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        <Text className="font-['Jost-SemiBold'] text-[32] text-cream tracking-[0.2] pt-4">Payment Agent</Text>
        <Text className="text-sm text-mutedWhite mt-1.5 mb-6 leading-5">
          Your x402 agent wallet signs and pays for NFC taps — no manual confirmation needed.
        </Text>

        {!agentExists && devices.length > 0 && (
          <View className="flex-row items-center justify-center gap-2 py-6">
            <ActivityIndicator size="small" color={Colors.gold} />
            <Text className="text-sm text-mutedWhite">Loading agent wallet…</Text>
          </View>
        )}

        {/* Shared Agent Wallet Card */}
        <LinearGradient
          colors={['#1a1a1a', '#101010']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          className="rounded-3xl border border-borderGrey p-6 mb-8 overflow-hidden"
          style={DesignTokens.shadows.card}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-[rgba(212,169,100,0.12)] border border-[rgba(212,169,100,0.35)] mr-4">
              <Ionicons name="flash" size={20} color={Colors.goldHi} />
            </View>
            <View className="flex-1">
              <Text className="font-['Jost-SemiBold'] text-base text-cream">x402 Agent Wallet</Text>
              {agent?.publicKey && (
                <Text className="font-mono text-xs text-mutedWhite mt-0.5">
                  {agent.publicKey.slice(0, 8)}…{agent.publicKey.slice(-6)}
                </Text>
              )}
            </View>
            {agent?.createdAt && (
              <Text className="text-xs text-mutedWhite">
                {new Date(agent.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          <Text className="text-[48px] font-['Jost-SemiBold'] text-white mb-4">{xlmBalance}<Text className="text-xl text-mutedWhite"> XLM</Text></Text>

          <View className="flex-row gap-2 mb-4">
            <View className="flex-1 bg-[#0E0E0E] rounded-xl border border-borderGrey p-2 items-center">
              <Text className="text-xs text-mutedWhite tracking-[1px] mb-0.5">SPENT</Text>
              <Text className="font-['Jost-SemiBold'] text-base text-white" style={{ fontVariant: ['tabular-nums'] }}>{spent}<Text className="text-xs text-mutedWhite"> XLM</Text></Text>
            </View>
            <View className="flex-1 bg-[#0E0E0E] rounded-xl border border-borderGrey p-2 items-center">
              <Text className="text-xs text-mutedWhite tracking-[1px] mb-0.5">REMAINING</Text>
              <Text className="font-['Jost-SemiBold'] text-base text-gold" style={{ fontVariant: ['tabular-nums'] }}>{remaining}<Text className="text-xs text-mutedWhite"> XLM</Text></Text>
            </View>
            <View className="flex-1 bg-[#0E0E0E] rounded-xl border border-borderGrey p-2 items-center">
              <Text className="text-xs text-mutedWhite tracking-[1px] mb-0.5">BUDGET</Text>
              <Text className="font-['Jost-SemiBold'] text-base text-white" style={{ fontVariant: ['tabular-nums'] }}>{budget}<Text className="text-xs text-mutedWhite"> XLM</Text></Text>
            </View>
          </View>

          {agent && agent.spendingBudgetStroops > 0 && (
            <View className="mt-1">
              <View className="h-[7px] rounded-[4px] bg-[#1B1B1B] mb-2">
                <LinearGradient
                  colors={[Colors.goldDeep, Colors.gold, Colors.goldHi]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-[7px] rounded-[4px] relative"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                >
                  <View className="absolute -right-0.5 -top-0.5 -bottom-0.5 w-[3px] rounded-[2px] bg-[#D4A964]" style={DesignTokens.shadows.goldGlow} />
                </LinearGradient>
              </View>
              <Text className="text-xs text-mutedWhite" style={{ fontVariant: ['tabular-nums'] }}>{pct}% of budget used</Text>
            </View>
          )}
        </LinearGradient>

        {/* Device List */}
        {devices.length > 0 && (
          <View className="mb-4">
            <Text className="font-['Jost-SemiBold'] text-xl text-cream mb-4">Linked Devices</Text>
            {devices.map((device) => (
              <PressableScale
                key={device.id}
                onPress={() => router.push(`/agent/${device.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${device.label}, ${device.status}`}
              >
                <LinearGradient
                  colors={['#161616', '#101010']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  className="rounded-2xl border border-borderGrey p-4 mb-2"
                >
                  <View className="flex-row items-center">
                    <View className="w-9 h-9 rounded-full items-center justify-center bg-[rgba(212,169,100,0.1)] border border-[rgba(212,169,100,0.25)] mr-4">
                      <TapGlyph size={16} color={Colors.goldHi} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-['Jost-SemiBold'] text-sm text-cream">{device.label}</Text>
                      {device.agentPublicKey && (
                        <Text className="font-mono text-xs text-mutedWhite mt-0.5">
                          {device.agentPublicKey.slice(0, 8)}…{device.agentPublicKey.slice(-6)}
                        </Text>
                      )}
                    </View>
                    <StatusPill status={device.status} />
                  </View>
                </LinearGradient>
              </PressableScale>
            ))}
          </View>
        )}

        {devices.length === 0 ? (
          <EmptyAgents onLink={() => router.push('/(tabs)/devices')} />
        ) : (
          <PressableScale
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl border-[1.5px] border-borderGrey border-dashed mt-2"
            onPress={() => router.push('/(tabs)/devices')}
          >
            <Ionicons name="add" size={20} color={Colors.gold} />
            <Text className="font-['Jost-Medium'] text-sm text-gold tracking-[0.6px] uppercase">Link Another Device</Text>
          </PressableScale>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

/** Empty state — the Cat mark inside concentric signal ripples, waiting for a tap. */
function EmptyAgents({ onLink }: { onLink: () => void }) {
  const reduced = useReducedMotion()
  const scale = useSharedValue(1)

  useEffect(() => {
    if (reduced) return
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(scale)
  }, [reduced, scale])

  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <View className="items-center pt-8">
      <View className="w-[170] h-[170] items-center justify-center mb-2">
        <View className="absolute w-[104] h-[104] rounded-full border border-[rgba(198,161,91,0.18)]" />
        <SignalRipple size={104} rings={3} color={Colors.gold} duration={2900} />
        <Animated.Image source={NOIR_MARK} style={[markStyle, { width: 82, height: 86 }]} resizeMode="contain" />
      </View>

      <Text className="font-['Jost-SemiBold'] text-xl text-white mt-1">No agents yet</Text>
      <Text className="text-sm text-silver text-center leading-[21] mt-2 max-w-[300]">
        Link an NFC device to create its payment agent — it signs your taps automatically.
      </Text>

      <View className="w-full gap-4 mt-8 mb-8">
        <StepRow n="1" text="Provision an NFC tag as your wallet key" />
        <StepRow n="2" text="An x402 agent wallet is created for that device" />
        <StepRow n="3" text="Tap to pay — the agent signs automatically" />
      </View>

      <PressableScale onPress={onLink} accessibilityRole="button" accessibilityLabel="Link a device">
        <LinearGradient
          colors={[Colors.goldHi, Colors.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="flex-row items-center justify-center gap-2 py-4 px-8 rounded-xl min-h-[52]"
          style={DesignTokens.shadows.goldGlow}
        >
          <TapGlyph size={18} color="#151107" />
          <Text className="font-['Jost-SemiBold'] text-base text-[#151107] tracking-[1px] uppercase">Link a Device</Text>
        </LinearGradient>
      </PressableScale>
    </View>
  )
}

function StepRow({ n, text }: { n: string; text: string }) {
  return (
    <View className="flex-row items-center gap-4">
      <View className="w-6 h-6 rounded-xl items-center justify-center border border-[rgba(198,161,91,0.4)] bg-[rgba(198,161,91,0.08)]">
        <Text className="font-['Jost-SemiBold'] text-xs text-gold">{n}</Text>
      </View>
      <Text className="flex-1 text-sm text-silver leading-[19]">{text}</Text>
    </View>
  )
}
