/**
 * Popups — the one look for every dialog and bottom sheet in the app.
 *
 * - <Dialog>  centred card for decisions (confirm / notice / small forms)
 * - <Sheet>   bottom sheet for richer content (wallet list, signature request)
 * - <SignSheet> bottom sheet for anything that signs a transaction — the
 *   wallet-app convention: a signature request rises from the bottom with
 *   what you're signing, never a centred dialog
 * - popup.confirm() / popup.notice() / popup.sign()  imperative API backed by <PopupHost>,
 *   usable from any screen or plain module (replaces native Alert.alert,
 *   which renders as a stock Android box outside the brand).
 *
 * Both share one plain frame: an elevated near-black card with a hairline
 * border. Sheets close by swipe-down or backdrop tap (no ✕ / Cancel).
 * See DESIGN.md → "Popups".
 */
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, Modal, Animated, Easing, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useReducedMotion } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/Button'
import { PressableScale } from '@/components/brand/PressableScale'
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Fonts, Gradient } from '@/constants/theme'
import { colorWithOpacity } from '@/constants/designTokens'

export type PopupTone = 'brand' | 'danger' | 'success' | 'warning'

const TONE: Record<PopupTone, string> = {
  brand: Colors.gold,
  danger: Colors.danger,
  success: Colors.success,
  warning: Colors.warning,
}

export interface PopupDetail {
  label: string
  value: string
  mono?: boolean
  /** Gold, Jost — for the number the user is actually agreeing to. */
  emphasis?: boolean
}

/* ─────────────────────────── shared pieces ─────────────────────────── */

/** Fade + (scale | slide) driver. Keeps the modal mounted through the exit. */
function usePresence(visible: boolean) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(visible)
  const t = useRef(new Animated.Value(visible ? 1 : 0)).current

  useEffect(() => {
    if (visible) setMounted(true)
    const anim = Animated.timing(t, {
      toValue: visible ? 1 : 0,
      duration: reduced ? 0 : visible ? 260 : 180,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
      useNativeDriver: true,
    })
    anim.start(({ finished }) => {
      if (finished && !visible) setMounted(false)
    })
    return () => anim.stop()
  }, [visible, reduced, t])

  return { mounted, t }
}

function Backdrop({ t, onPress }: { t: Animated.Value; onPress?: () => void }) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: t }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress} accessibilityLabel="Close" accessibilityRole="button" />
    </Animated.View>
  )
}

/** Plain elevated card shared by Dialog and Sheet — no gradient edge or glow. */
function Frame({ children, sheet }: { children: ReactNode; sheet?: boolean }) {
  return <View style={[styles.frame, sheet ? styles.sheetFrame : styles.dialogFrame]}>{children}</View>
}

/** Popup icon: drawn inline in its tone colour, no container. */
export function PopupIcon({ name, tone = 'brand' }: { name: keyof typeof Ionicons.glyphMap; tone?: PopupTone }) {
  return (
    <View style={styles.icon}>
      <Ionicons name={name} size={40} color={TONE[tone]} />
    </View>
  )
}

/** Recessed label/value panel — keeps long values (addresses) out of prose. */
export function PopupDetails({ rows }: { rows: PopupDetail[] }) {
  return (
    <View style={styles.details}>
      {rows.map((r, i) => (
        <View key={r.label} style={[styles.detailRow, i > 0 && styles.detailDivider]}>
          <Text style={styles.detailLabel}>{r.label}</Text>
          <Text
            style={[styles.detailValue, r.mono && styles.detailMono, r.emphasis && styles.detailEmphasis]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {r.value}
          </Text>
        </View>
      ))}
    </View>
  )
}

/* ─────────────────────────────── Dialog ─────────────────────────────── */

export interface DialogProps {
  visible: boolean
  onClose: () => void
  title: string
  message?: string
  icon?: keyof typeof Ionicons.glyphMap
  tone?: PopupTone
  details?: PopupDetail[]
  confirmLabel?: string
  /** `null` hides the secondary action (notices). */
  cancelLabel?: string | null
  onConfirm?: () => void
  confirmDisabled?: boolean
  loading?: boolean
  /** Extra content (e.g. an input) between the message and the actions. */
  children?: ReactNode
  /** Tap outside to dismiss. Ignored while loading. */
  dismissible?: boolean
}

export function Dialog({
  visible, onClose, title, message, icon, tone = 'brand', details,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, confirmDisabled, loading,
  children, dismissible = true,
}: DialogProps) {
  const { mounted, t } = usePresence(visible)

  useEffect(() => {
    if (visible && tone === 'danger') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
  }, [visible, tone])

  if (!mounted) return null
  const close = () => { if (!loading) onClose() }
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] })

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
      <KeyboardAvoidingView style={styles.center} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Backdrop t={t} onPress={dismissible ? close : undefined} />
        <Animated.View style={[styles.dialogWrap, { opacity: t, transform: [{ scale }] }]} accessibilityViewIsModal>
          <Frame>
            <View style={styles.dialogBody}>
              <Text style={styles.title} accessibilityRole="header">{title}</Text>
              {!!message && <Text style={styles.message}>{message}</Text>}
              {details && details.length > 0 && <PopupDetails rows={details} />}
              {children}
              <View style={styles.actions}>
                {onConfirm && (
                  <Button
                    label={confirmLabel}
                    variant={tone === 'danger' ? 'danger' : 'primary'}
                    onPress={onConfirm}
                    disabled={confirmDisabled}
                    loading={loading}
                    fullWidth
                  />
                )}
                {cancelLabel !== null && (
                  <PressableScale
                    style={styles.secondary}
                    onPress={close}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel={cancelLabel}
                  >
                    <Text style={styles.secondaryText}>{cancelLabel}</Text>
                  </PressableScale>
                )}
              </View>
            </View>
          </Frame>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

/* ─────────────────────────────── Sheet ──────────────────────────────── */

export interface SheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  icon?: keyof typeof Ionicons.glyphMap
  tone?: PopupTone
  children: ReactNode
  /** Pinned under the content (primary actions). */
  footer?: ReactNode
  dismissible?: boolean
}

export function Sheet({ visible, onClose, title, subtitle, icon, tone = 'brand', children, footer, dismissible = true }: SheetProps) {
  const insets = useSafeAreaInsets()
  const { mounted, t } = usePresence(visible)
  if (!mounted) return null
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [420, 0] })

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={dismissible ? onClose : () => {}}>
      <KeyboardAvoidingView style={styles.bottom} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Backdrop t={t} onPress={dismissible ? onClose : undefined} />
        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]} accessibilityViewIsModal>
          <Frame sheet>
            <View style={[styles.sheetBody, { paddingBottom: Math.max(insets.bottom, Spacing.md) + Spacing.md }]}>
              <View style={styles.handle} />
              {(!!title || !!icon) && (
                <View style={styles.sheetHeader}>
                  {icon && <PopupIcon name={icon} tone={tone} />}
                  {!!title && <Text style={styles.title} accessibilityRole="header">{title}</Text>}
                  {!!subtitle && <Text style={styles.message}>{subtitle}</Text>}
                </View>
              )}
              {children}
              {footer && <View style={styles.sheetFooter}>{footer}</View>}
            </View>
          </Frame>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

/* ───────────────────────────── SignSheet ────────────────────────────── */

export interface SignSheetProps {
  visible: boolean
  onClose: () => void
  onSign: () => void
  title: string
  message?: string
  icon?: keyof typeof Ionicons.glyphMap
  tone?: PopupTone
  details?: PopupDetail[]
  signLabel?: string
  cancelLabel?: string
  loading?: boolean
}

/** Signature request: what is being signed, then Sign / Cancel at the thumb. */
export function SignSheet({
  visible, onClose, onSign, title, message, icon = 'finger-print-outline', tone = 'brand', details,
  signLabel = 'Sign', cancelLabel = 'Cancel', loading,
}: SignSheetProps) {
  useEffect(() => {
    if (visible && tone === 'danger') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
  }, [visible, tone])
  const close = () => { if (!loading) onClose() }
  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={title}
      subtitle={message}
      icon={icon}
      tone={tone}
      dismissible={!loading}
      footer={
        <>
          <Button
            label={signLabel}
            icon="finger-print-outline"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onPress={onSign}
            loading={loading}
            fullWidth
          />
          <PressableScale style={styles.secondary} onPress={close} disabled={loading} accessibilityRole="button" accessibilityLabel={cancelLabel}>
            <Text style={styles.secondaryText}>{cancelLabel}</Text>
          </PressableScale>
        </>
      }
    >
      {details && details.length > 0 ? <PopupDetails rows={details} /> : null}
      <Text style={styles.signNote}>Signed with your wallet key on this phone.</Text>
    </Sheet>
  )
}

/* ───────────────────── imperative API + host ───────────────────── */

export interface ConfirmOptions {
  title: string
  message?: string
  icon?: keyof typeof Ionicons.glyphMap
  tone?: PopupTone
  details?: PopupDetail[]
  confirmLabel?: string
  cancelLabel?: string
}
export interface NoticeOptions {
  title: string
  message?: string
  icon?: keyof typeof Ionicons.glyphMap
  tone?: PopupTone
  details?: PopupDetail[]
  buttonLabel?: string
}

type Request =
  | { kind: 'confirm'; opts: ConfirmOptions; resolve: (ok: boolean) => void }
  | { kind: 'sign'; opts: ConfirmOptions; resolve: (ok: boolean) => void }
  | { kind: 'notice'; opts: NoticeOptions; resolve: (ok: boolean) => void }

let enqueue: ((r: Request) => void) | null = null

const DEFAULT_ICON: Record<PopupTone, keyof typeof Ionicons.glyphMap> = {
  brand: 'information-circle-outline',
  danger: 'warning-outline',
  success: 'checkmark',
  warning: 'alert-circle-outline',
}

/** App-wide popups. Resolves `false` when no host is mounted (unit tests). */
export const popup = {
  confirm(opts: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => (enqueue ? enqueue({ kind: 'confirm', opts, resolve }) : resolve(false)))
  },
  /** Confirm something that signs a transaction — shown as a bottom sheet. */
  sign(opts: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => (enqueue ? enqueue({ kind: 'sign', opts, resolve }) : resolve(false)))
  },
  notice(opts: NoticeOptions): Promise<void> {
    return new Promise((resolve) => (enqueue ? enqueue({ kind: 'notice', opts, resolve: () => resolve() }) : resolve()))
  },
}

/** Mount once at the root (app/_layout). Shows queued requests one at a time. */
export function PopupHost() {
  const [queue, setQueue] = useState<Request[]>([])
  const [visible, setVisible] = useState(false)
  const current = queue[0]

  useEffect(() => {
    enqueue = (r) => setQueue((q) => [...q, r])
    return () => { enqueue = null }
  }, [])

  useEffect(() => { if (current) setVisible(true) }, [current])

  const finish = useCallback((ok: boolean) => {
    setVisible(false)
    // Resolve after the exit animation so a follow-up popup doesn't overlap.
    setTimeout(() => {
      setQueue((q) => {
        q[0]?.resolve(ok)
        return q.slice(1)
      })
    }, 200)
  }, [])

  if (!current) return null
  if (current.kind === 'sign') {
    const so = current.opts
    return (
      <SignSheet
        visible={visible}
        onClose={() => finish(false)}
        onSign={() => finish(true)}
        title={so.title}
        message={so.message}
        icon={so.icon}
        tone={so.tone}
        details={so.details}
        signLabel={so.confirmLabel}
        cancelLabel={so.cancelLabel}
      />
    )
  }
  const o = current.opts
  const tone = o.tone ?? 'brand'
  const confirmLabel = current.kind === 'confirm'
    ? current.opts.confirmLabel ?? 'Confirm'
    : current.opts.buttonLabel ?? 'Done'
  const cancelLabel = current.kind === 'confirm' ? current.opts.cancelLabel ?? 'Cancel' : null

  return (
    <Dialog
      visible={visible}
      onClose={() => finish(false)}
      title={o.title}
      message={o.message}
      icon={o.icon ?? DEFAULT_ICON[tone]}
      tone={tone}
      details={o.details}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={() => finish(true)}
    />
  )
}

/* ─────────────────────────────── styles ─────────────────────────────── */

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.72)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  bottom: { flex: 1, justifyContent: 'flex-end' },

  frame: { backgroundColor: Gradient.elevated, borderWidth: 1, borderColor: Colors.borderGrey, overflow: 'hidden' },
  dialogFrame: { borderRadius: 20 },
  sheetFrame: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomWidth: 0 },

  dialogWrap: {
    width: '100%', maxWidth: 360,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.6, shadowRadius: 30, elevation: 16,
  },
  dialogBody: { alignItems: 'center', paddingHorizontal: 20, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },

  icon: { marginBottom: Spacing.sm },

  title: { fontFamily: Fonts.display, fontSize: FontSize.xl, color: Colors.cream, textAlign: 'center' },
  message: {
    fontSize: FontSize.sm, color: Colors.silver, textAlign: 'center', lineHeight: 21,
    marginTop: Spacing.sm, maxWidth: 300,
  },

  details: {
    alignSelf: 'stretch', marginTop: Spacing.lg, paddingHorizontal: Spacing.md,
    backgroundColor: Gradient.raised, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.borderGrey,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md, paddingVertical: 12 },
  detailDivider: { borderTopWidth: 1, borderTopColor: Gradient.panel },
  detailLabel: { fontSize: FontSize.sm, color: Colors.mutedWhite },
  detailValue: { flexShrink: 1, fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium, textAlign: 'right' },
  detailMono: { fontFamily: Fonts.mono, fontSize: FontSize.xs },
  detailEmphasis: { fontFamily: Fonts.display, fontSize: FontSize.md, color: Colors.gold, fontWeight: 'normal' },

  actions: { alignSelf: 'stretch', marginTop: Spacing.lg, gap: Spacing.xs },
  secondary: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: Fonts.displayMd, fontSize: FontSize.sm, color: Colors.mutedWhite, letterSpacing: 0.6 },

  sheetWrap: { width: '100%' },
  sheetBody: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.borderGrey, marginBottom: Spacing.md },
  sheetHeader: { alignItems: 'center', marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  sheetFooter: { marginTop: Spacing.lg, gap: Spacing.xs },
  signNote: { fontSize: FontSize.xs, color: Colors.mutedWhite, textAlign: 'center', marginTop: Spacing.md },
})
