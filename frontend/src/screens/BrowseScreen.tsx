import { ComponentType, useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, Share, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView as RNWebView, WebViewNavigation } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { PressableScale } from '@/components/brand/PressableScale'
import { NetworkPicker } from '@/components/NetworkPicker'
import { PageTitle, SectionLabel, ListRow } from '@/components/ui/List'
import { useAppStore } from '@/store/useAppStore'
import { getItem, setItem } from '@/services/storage'
import { Colors, Spacing, FontSize, Gradient } from '@/constants/theme'
import { toBrowserUrl } from '@/lib/browserUrl'

// react-native-webview 14 intersects its iOS/Android/Windows prop types, which
// collapse to `never` under our TS config. The component is fine at runtime;
// type only the props we use.
interface BrowserWebViewProps {
  source: { uri: string }
  style?: object
  onNavigationStateChange?: (e: WebViewNavigation) => void
  onLoadProgress?: (e: { nativeEvent: { progress: number } }) => void
  setSupportMultipleWindows?: boolean
  allowsBackForwardNavigationGestures?: boolean
  originWhitelist?: string[]
  ref?: React.Ref<WebViewHandle>
}
interface WebViewHandle { goBack(): void; goForward(): void; reload(): void }
const WebView = RNWebView as unknown as ComponentType<BrowserWebViewProps>

const RECENT_KEY = 'browser_recent'
const MAX_RECENT = 8

type IoniconName = keyof typeof Ionicons.glyphMap
const APPS: { name: string; url: string; testnetUrl?: string; desc: string; icon: IoniconName }[] = [
  { name: 'StellarExpert', url: 'https://stellar.expert/explorer/public', testnetUrl: 'https://stellar.expert/explorer/testnet', desc: 'Explorer', icon: 'search-outline' },
  { name: 'Stellar Lab', url: 'https://lab.stellar.org', desc: 'Developer tools', icon: 'flask-outline' },
  { name: 'Soroswap', url: 'https://app.soroswap.finance', desc: 'Swap tokens', icon: 'swap-horizontal-outline' },
  { name: 'Aquarius', url: 'https://aqua.network', desc: 'Liquidity & rewards', icon: 'water-outline' },
  { name: 'Blend', url: 'https://mainnet.blend.capital', testnetUrl: 'https://testnet.blend.capital', desc: 'Lend & borrow', icon: 'layers-outline' },
  { name: 'StellarTerm', url: 'https://stellarterm.com', desc: 'Trade', icon: 'trending-up-outline' },
]

interface Recent { url: string; title: string }


function host(url: string): string {
  try { return new URL(url).host.replace(/^www\./, '') } catch { return url }
}

/**
 * Browse tab: Stellar apps opened in an in-app browser. Browsing only — the
 * page never gets a bridge to the wallet, so websites can't see or use keys.
 */
export function BrowseScreen() {
  const network = useAppStore((s) => s.network)
  const [query, setQuery] = useState('')
  const [url, setUrl] = useState<string | null>(null)
  const [recent, setRecent] = useState<Recent[]>([])

  useEffect(() => {
    getItem<Recent[]>(RECENT_KEY).then((r) => setRecent(Array.isArray(r) ? r : [])).catch(() => {})
  }, [])

  const remember = useCallback((entry: Recent) => {
    setRecent((prev) => {
      const next = [entry, ...prev.filter((r) => r.url !== entry.url)].slice(0, MAX_RECENT)
      setItem(RECENT_KEY, next).catch(() => {})
      return next
    })
  }, [])

  const open = (target: string | null) => {
    if (!target) return
    setQuery('')
    setUrl(target)
  }

  if (url) return <BrowserView url={url} onClose={() => setUrl(null)} onVisited={remember} testnet={network !== 'mainnet'} />

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageTitle title="Browse" right={<NetworkPicker align="right" />} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={Colors.mutedWhite} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search or enter address"
            placeholderTextColor={Colors.mutedWhite}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={() => open(toBrowserUrl(query))}
            accessibilityLabel="Search or enter address"
          />
        </View>

        <SectionLabel title="Stellar apps" />
        {APPS.map((a, i) => (
          <ListRow
            key={a.name}
            icon={a.icon}
            iconColor={Colors.gold}
            title={a.name}
            subtitle={a.desc}
            chevron
            last={i === APPS.length - 1}
            onPress={() => open(network !== 'mainnet' && a.testnetUrl ? a.testnetUrl : a.url)}
          />
        ))}

        {recent.length > 0 && (
          <>
            <SectionLabel title="Recent" />
            {recent.map((r, i) => (
              <ListRow key={r.url} icon="time-outline" iconColor={Colors.mutedWhite} title={r.title || host(r.url)} subtitle={host(r.url)} chevron last={i === recent.length - 1} onPress={() => open(r.url)} />
            ))}
          </>
        )}

        <Text style={styles.note}>Websites never see your keys. Connecting Noir to a dApp comes later — this is browsing only.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function BrowserView({ url, onClose, onVisited, testnet }: { url: string; onClose: () => void; onVisited: (r: Recent) => void; testnet: boolean }) {
  const web = useRef<WebViewHandle>(null)
  const [nav, setNav] = useState<{ url: string; title: string; back: boolean; fwd: boolean }>({ url, title: '', back: false, fwd: false })
  const [progress, setProgress] = useState(0)

  const onNav = (e: WebViewNavigation) => {
    setNav({ url: e.url, title: e.title, back: e.canGoBack, fwd: e.canGoForward })
    if (!e.loading && e.url.startsWith('https://')) onVisited({ url: e.url, title: e.title })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.bar}>
        <PressableScale style={styles.tool} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close browser">
          <Ionicons name="close" size={24} color={Colors.white} />
        </PressableScale>
        <View style={styles.urlPill} accessibilityLabel={`Address ${nav.url}`}>
          <Ionicons name={nav.url.startsWith('https://') ? 'lock-closed' : 'warning-outline'} size={12} color={nav.url.startsWith('https://') ? Colors.mutedWhite : Colors.warning} />
          <Text style={styles.urlText} numberOfLines={1}>{host(nav.url)}</Text>
        </View>
        <PressableScale style={styles.tool} onPress={() => Linking.openURL(nav.url)} accessibilityRole="button" accessibilityLabel="Open in your browser">
          <Ionicons name="open-outline" size={20} color={Colors.white} />
        </PressableScale>
      </View>
      <View style={styles.progressTrack}>{progress < 1 && <View style={[styles.progressFill, { width: `${Math.max(8, progress * 100)}%` }]} />}</View>
      {testnet && (
        <View style={styles.netStrip}>
          <View style={styles.netDot} />
          <Text style={styles.netText}>You’re on Testnet · sites can’t move your funds</Text>
        </View>
      )}

      <WebView
        ref={web}
        source={{ uri: url }}
        style={styles.web}
        onNavigationStateChange={onNav}
        onLoadProgress={(e: { nativeEvent: { progress: number } }) => setProgress(e.nativeEvent.progress)}
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        originWhitelist={['https://*']}
      />

      <View style={styles.toolbar}>
        <Tool icon="chevron-back" label="Back" disabled={!nav.back} onPress={() => web.current?.goBack()} />
        <Tool icon="chevron-forward" label="Forward" disabled={!nav.fwd} onPress={() => web.current?.goForward()} />
        <Tool icon="refresh" label="Reload" onPress={() => web.current?.reload()} />
        <Tool icon="share-outline" label="Share" onPress={() => Share.share({ message: nav.url }).catch(() => {})} />
      </View>
    </SafeAreaView>
  )
}

function Tool({ icon, label, onPress, disabled }: { icon: IoniconName; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <PressableScale style={[styles.tool, disabled && styles.dim]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={22} color={Colors.white} />
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  content: { paddingHorizontal: 20, paddingBottom: Spacing.xxl },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, paddingHorizontal: 14, borderRadius: 14, backgroundColor: Colors.midGrey, marginTop: Spacing.sm },
  searchInput: { flex: 1, color: Colors.white, fontSize: FontSize.md - 1, paddingVertical: 0 },
  note: { fontSize: FontSize.xs, color: Colors.mutedWhite, lineHeight: 18, paddingTop: Spacing.lg },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  tool: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.35 },
  urlPill: { flex: 1, height: 38, borderRadius: 12, backgroundColor: Colors.midGrey, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: Spacing.md },
  urlText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '500', flexShrink: 1 },
  progressTrack: { height: 2, backgroundColor: Gradient.panel },
  progressFill: { height: 2, backgroundColor: Colors.gold },
  netStrip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 6, backgroundColor: Colors.midGrey },
  netDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.testnet },
  netText: { color: Colors.silver, fontSize: FontSize.xs },
  web: { flex: 1, backgroundColor: Colors.white },
  toolbar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 56, borderTopWidth: 1, borderTopColor: Gradient.panel },
})
