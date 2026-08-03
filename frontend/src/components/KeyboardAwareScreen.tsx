import { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/theme'

interface KeyboardAwareScreenProps {
  children: ReactNode
  /** Wrap the content in a ScrollView. Off for screens that manage their own list. */
  scroll?: boolean
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
}

/**
 * Screen shell that keeps text inputs clear of the keyboard.
 *
 * This lives in one place on purpose: keyboard avoidance was implemented in a
 * single screen out of the nine that take text input, and
 * `keyboardShouldPersistTaps` appeared three times repo-wide — so a first tap
 * on a button while the keyboard was open only dismissed the keyboard.
 */
export function KeyboardAwareScreen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
}: KeyboardAwareScreenProps) {
  const body = scroll ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </ScrollView>
  ) : (
    children
  )

  return (
    <SafeAreaView style={[styles.container, style]}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  fill: { flex: 1 },
})
